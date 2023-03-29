include(FetchContent)

set(BROTLI_DISABLE_TESTS ON)

FetchContent_Declare(brotli
  URL https://github.com/google/brotli/archive/ed1995b6bda19244070ab5d331111f16f67c8054.zip
  DOWNLOAD_EXTRACT_TIMESTAMP FALSE
)
FetchContent_Declare(walloc
  URL https://github.com/wingo/walloc/archive/a93409f5ebd49c875514c5fee30d3b151f7b0882.zip
  PATCH_COMMAND patch -p1 -i ${CMAKE_CURRENT_SOURCE_DIR}/walloc.patch
  DOWNLOAD_EXTRACT_TIMESTAMP FALSE
)

FetchContent_MakeAvailable(brotli walloc)
FetchContent_GetProperties(walloc)

add_library(walloc OBJECT ${walloc_SOURCE_DIR}/walloc.c)
target_link_options(walloc INTERFACE -Wl,--allow-undefined)