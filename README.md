# tiny-brotli-dec-wasm

A Brotli streaming decoder for the web in 70.6 KiB of gzipped files.

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
