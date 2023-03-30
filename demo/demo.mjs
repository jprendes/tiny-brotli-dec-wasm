import BrotliDecompressStream from "../build/tiny-brotli-dec-wasm.mjs"
import Deno from "./denoify.mjs"

await BrotliDecompressStream.init(Deno.readFile);

async function run_test(input, stdout = null) {
    const brotli = await BrotliDecompressStream.create();
    let offset = 0;
    while (offset < input.byteLength) {
        let chunk = input.subarray(offset, offset + 1000);
        offset += chunk.byteLength;
        while (chunk.byteLength > 0 || brotli.result() === 3) {
            const out = brotli.dec(chunk, 1000);
            chunk = chunk.subarray(brotli.lastInputOffset());
            await stdout?.write(out);
        }
    }
    brotli.free();
    await stdout?.write(new Uint8Array([10]));
}

const input = await Deno.readFile(new URL("./romeo_juliet.txt.br", import.meta.url));
const should_print = ["--print", "-p"].includes(Deno.args[0]);

const num_iterations = 1000;
await run_test(input); // warm up
const start = performance.now();
for (let i = 0; i < num_iterations; ++i) await run_test(input);
const end = performance.now();
if (should_print) await run_test(input, Deno.stdout); // print
const iteration_time = (end - start) / num_iterations;
console.error(`Ran ${num_iterations} iterations. Time per iteration: ${iteration_time.toFixed(4)} ms`);
