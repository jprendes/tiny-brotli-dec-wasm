# tiny-brotli-dec-wasm

A tiny Brotli streaming decoder in 70.6 KiB of gzipped files with no runtime dependencies.

# Quick start

Install the library
```sh
npm install tiny-brotli-dec-wasm
```

Use the decoder to decompress Romeo and Juliet
```javascript
import BrotliDecompressStream, { Result } from "tiny-brotli-dec-wasm"

// Do the initial asynchronous initialization.
// After the async initialization the decoder can be created synchronously.
await BrotliDecompressStream.init();
const brotli = BrotliDecompressStream.create();

// Fetch the data
const url = "http://github.com/jprendes/tiny-brotli-dec-wasm/raw/main/demo/romeo_juliet.txt.br";
const response = await fetch(url);

// Collect output as text
const text = [];
const decoder = new TextDecoder();

for await (let chunk of response.body) {
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
        } else if (result === Result.Error) {
            // Something went wrong
            throw new Error("Error decompressing file");
        }
    }
}

// Release the decoder
brotli.free();

// Print the decompressed output
console.log(text.join(""));
```

# Alternatives

This library was inspired and borrows ideas from
* [brotli-dec-wasm](https://www.npmjs.com/package/brotli-dec-wasm): Similar library using Brotli's Rust binding and `wasm-pack`. Provides a function for one-shot decompressing. Generates larger binary files.
* [cedric-h/brotli](https://github.com/cedric-h/brotli): Proof of concept building the Brotli compressor with a minimal C runtime. Provides no decompression and no JS library.

# Development

## Using Docker

The easiest way to build the project is using docker.
Just run:
```sh
docker build --output=build .
```

Otherwise, follow the instructions below.

## Requirements

To build this project you will need:
* `clang >=15`
* `cmake >=3.22`

Optionally, you will also need:
* `zopfli` or `gzip` to compress the output files. Using `zopfli` results in smaller files.
* `node >=18`, or `deno >=1.31`, to run the demo.

In all cases, things might also work with earlier versions, but it's not tested.

## Build

The build is driven by `cmake`:

```sh
cmake -DCMAKE_TOOLCHAIN_FILE=wasm-toolchain.cmake -G Ninja -S . -B build
cmake --build build -- tiny-brotli-dec-wasm
```

To compress the output files run
```sh
zopfli --gzip build/tiny-brotli-dec-wasm.*
# gzip --keep -9 build/tiny-brotli-dec-wasm.*
```

## Run demo

The demo decompresses Romeo and Juliet 1000 times, and prints the run time per iteration.
Passing the `-p` or `--print` argument does an extra run and prints the result to `stdout`.

To run the demo  run
```sh
node demo/demo.mjs -p
# deno run --allow-read demo/demo.mjs -p
```
