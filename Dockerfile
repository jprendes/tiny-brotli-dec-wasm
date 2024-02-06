FROM alpine:3.19.1 AS build

RUN apk add gcompat binutils cmake patch ninja zopfli

# get a bleeding edge copy of clang and lld
COPY --from=emscripten/emsdk:3.1.53 /emsdk/upstream /usr

RUN --mount=type=bind,target=/src \
    cmake -DCMAKE_TOOLCHAIN_FILE=wasm-toolchain.cmake -G Ninja -S /src -B /build && \
    cmake --build /build -- tiny-brotli-dec-wasm

RUN zopfli --gzip --i50 /build/tiny-brotli-dec-wasm.*

FROM scratch as dist

COPY --from=build /build/tiny-brotli-dec-wasm.* /

