# takes NMPI_ROOT and NLC_ROOT from environment
set(CMAKE_SYSTEM_NAME Wasm32)

set(CMAKE_C_COMPILER clang CACHE FILEPATH "C compiler")
set(CMAKE_LINKER clang CACHE FILEPATH "Linker")

set(CMAKE_CROSSCOMPILING TRUE)
set(CMAKE_C_COMPILER_ID_RUN TRUE)
set(CMAKE_C_STANDARD_COMPUTED_DEFAULT 11)

SET(CMAKE_C_FLAGS "--target=wasm32 -ffreestanding -nostdlib -Oz -mbulk-memory" CACHE STRING "" FORCE)
SET(CMAKE_EXE_LINKER_FLAGS "--target=wasm32 -ffreestanding -nostdlib -Oz -mbulk-memory -Wl,--lto-O3 -Wl,--no-entry")

include_directories(BEFORE SYSTEM ${CMAKE_CURRENT_SOURCE_DIR}/sysroot/include)

SET(CMAKE_INSTALL_LIBDIR ${CMAKE_BINARY_DIR})

set(CMAKE_EXECUTABLE_SUFFIX ".wasm" CACHE STRING "Executable extension")
set(CMAKE_EXECUTABLE_SUFFIX_C ".wasm" CACHE STRING "C executable extension")