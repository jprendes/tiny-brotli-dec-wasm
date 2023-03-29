export default class BrotliDecompressStream {
    #mem8 = null;
    #mem32 = null;
    #wasm = null;

    #state = 0;
    #available_in_ptr = 0;
    #available_out_ptr = 0;
    #next_in_ptr = 0;
    #next_out_ptr = 0;
    #next_in_ptr_ptr = 0;
    #next_out_ptr_ptr = 0;

    static #module = null;

    static async prepare() {
        if (this.#module) return;

        const url = new URL("./tiny-brotli-dec-wasm.wasm", import.meta.url);

        if (globalThis.process) {
            const fs = await import("fs/promises");
            const bytes = await fs.readFile(url);
            this.#module = new WebAssembly.Module(bytes);
        } else {
            this.#module = await WebAssembly.compileStreaming(fetch(url));
        }
    }

    static create() {
        if (!this.#module) {
            return this.prepare().then(() => this.create());
        }
        return new BrotliDecompressStream(this.#module);
    }

    constructor(module = null) {
        if (!module) {
            const url = new URL("./build/tiny-wasm-brotli-dec.wasm", import.meta.url);
            const bytes = fs.readFileSync(url);
            module = new WebAssembly.Module(bytes);
        }
        const env = { memory_grown: this.#reattach_buffers.bind(this) };
        const instance = new WebAssembly.Instance(module, { env });
        this.#wasm = instance.exports;
        this.#reattach_buffers();
        this.#init();
    }

    #reattach_buffers() {
        const mem = this.#wasm.memory.buffer;
        this.#mem8 = new Uint8Array(mem);
        this.#mem32 = new Uint32Array(mem);
    }

    #init() {
        this.#state = this.#wasm.BrotliDecoderCreateInstance(0, 0, 0);
        this.#available_in_ptr = this.#wasm.malloc(4);
        this.#available_out_ptr = this.#wasm.malloc(4);
        this.#next_in_ptr_ptr = this.#wasm.malloc(4);
        this.#next_out_ptr_ptr = this.#wasm.malloc(4);
    }

    #in_size = 0;
    #setup_in(size) {
        if (size > this.#in_size) {
            this.#in_size = size;
            this.#wasm.free(this.#next_in_ptr);
            this.#next_in_ptr = this.#wasm.malloc(size);
        }

        this.#mem32[this.#available_in_ptr >> 2] = size;
        this.#mem32[this.#next_in_ptr_ptr >> 2] = this.#next_in_ptr;
    }

    #out_size = 0;
    #setup_out(size) {
        if (size > this.#out_size) {
            this.#out_size = size;
            this.#wasm.free(this.#next_out_ptr);
            this.#next_out_ptr = this.#wasm.malloc(size);
        }

        this.#mem32[this.#available_out_ptr >> 2] = size;
        this.#mem32[this.#next_out_ptr_ptr >> 2] = this.#next_out_ptr;
    }

    #lastInputOffset = 0;
    lastInputOffset() { return this.#lastInputOffset; }

    #result = 0;
    result() { return this.#result; }

    dec(input, output_size) {
        this.#setup_in(input.byteLength);
        this.#setup_out(output_size);

        this.#mem8.set(input, this.#next_in_ptr);

        this.#result = this.#wasm.BrotliDecoderDecompressStream(
            this.#state,
            this.#available_in_ptr,
            this.#next_in_ptr_ptr,
            this.#available_out_ptr,
            this.#next_out_ptr_ptr,
            0
        );

        const used_input = input.byteLength - this.#mem32[this.#available_in_ptr >> 2];
        const used_output = output_size - this.#mem32[this.#available_out_ptr >> 2];

        this.#lastInputOffset = used_input;
        const output = this.#mem8.slice(this.#next_out_ptr, this.#next_out_ptr + used_output);

        return output;
    }

    free() {
        this.#wasm.free(this.#available_in_ptr);
        this.#wasm.free(this.#available_out_ptr);
        this.#wasm.free(this.#next_in_ptr_ptr);
        this.#wasm.free(this.#next_out_ptr_ptr);
        this.#wasm.free(this.#next_in_ptr);
        this.#wasm.free(this.#next_out_ptr);
        this.#wasm.BrotliDecoderDestroyInstance(this.#state);
    }
};
