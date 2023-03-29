cmake_minimum_required(VERSION 3.22)

project(tiny-brotli-dec-wasm VERSION 0.1 LANGUAGES C)

set(CMAKE_C_COMPILE_OBJECT "${CMAKE_C_COMPILE_OBJECT} -flto")

add_subdirectory(upstream EXCLUDE_FROM_ALL)

add_executable(tiny-brotli-dec-wasm src/dummy.c)
target_link_libraries(tiny-brotli-dec-wasm brotlidec brotlicommon walloc)
target_link_options(tiny-brotli-dec-wasm PRIVATE
    -Wl,--export=BrotliDecoderCreateInstance
    -Wl,--export=BrotliDecoderDestroyInstance
    -Wl,--export=BrotliDecoderDecompressStream
	-Wl,--export=malloc
	-Wl,--export=free
)

add_custom_command(TARGET tiny-brotli-dec-wasm POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy
            ${CMAKE_CURRENT_SOURCE_DIR}/src/tiny-brotli-dec-wasm.mjs
            ${CMAKE_CURRENT_BINARY_DIR}/tiny-brotli-dec-wasm.mjs
)