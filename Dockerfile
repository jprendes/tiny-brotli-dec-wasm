FROM alpine:3.19.1 AS build

RUN apk add clang lld cmake patch ninja zopfli

RUN --mount=type=bind,target=/src \
    cmake -DCMAKE_TOOLCHAIN_FILE=wasm-toolchain.cmake -G Ninja -S /src -B /build && \
    cmake --build /build -- tiny-brotli-dec-wasm

RUN zopfli --gzip --i50 /build/tiny-brotli-dec-wasm.*

FROM scratch as dist

COPY --from=build /build/tiny-brotli-dec-wasm.* /

