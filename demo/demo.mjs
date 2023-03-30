import BrotliDecompressStream, { Result } from "../build/tiny-brotli-dec-wasm.mjs"
import Deno from "./denoify.mjs"

// Do the initial asynchronous initialization.
await BrotliDecompressStream.init(Deno.readFile);

async function decompress(chunks) {
    // After the async initialization the decoder can be created synchronously.
    const brotli = BrotliDecompressStream.create();
    
    // Collect output as text
    const text = [];
    const decoder = new TextDecoder();
    
    for await (let chunk of chunks) {
        while (true) {
            // Set max output buffer size as 1024
            const output = brotli.dec(chunk, 1024);
            const result = brotli.result();
            
            // Remove from the buffer all the input that has already been consumed
            chunk = chunk.subarray(brotli.lastInputOffset());
    
            // Do something with the output
            text.push(decoder.decode(output, { stream: true }));
    
            if (result === Result.NeedsMoreInput) {
                // The whole `chunk` has been consumed and should be empty.
                // Wait for a new chunk.
                break;
            } else if (result === Result.NeedsMoreOutput) {
                // The `chunk` may or may nor be entirely consumed, but the
                // decoder can still produce more output.
                // Keep decoding.
                continue;
            } if (result === Result.Success) {
                // We are done!
                break;
            } else if (resul === Result.Error) {
                // Something went wrong
                throw new Error("Error decompressing file");
            }
        }
    }
    
    // Release the decoder
    brotli.free();
    
    // Print the decompressed output
    return text.join("");
}

// CLI "parsing"
const should_print = ["--print", "-p"].includes(Deno.args[0]);

// Generate input chunks.
// We generate several small chunks to simulate data arriving in chunks.
// In practice you would feed all the available input as one chunk.
const input = await Deno.readFile(new URL("./romeo_juliet.txt.br", import.meta.url));
const chunk_size = 1000;
const chunks = [];
for (let i = 0; i < input.byteLength; i += chunk_size) {
    chunks.push(input.subarray(i, i + chunk_size));
}

// Initla warm-up
await decompress(chunks);

// Run several iterations and show times
const num_iterations = 1000;
const start = performance.now();
for (let i = 0; i < num_iterations; ++i) await decompress(chunks);
const end = performance.now();

// Maybe print the decompressed text
if (should_print) console.log(await decompress(chunks));

// Print iteration times
const iteration_time = (end - start) / num_iterations;
console.error(`Ran ${num_iterations} iterations. Time per iteration: ${iteration_time.toFixed(4)} ms`);
