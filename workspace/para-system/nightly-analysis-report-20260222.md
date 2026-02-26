# 夜间深度分析报告
生成时间: 2026-02-22 02:30

## 1. 本周活动摘要

- 本周日志文件:        5 个

## 2. QMD 索引状态
QMD Status

Index: /Users/hsieh/.cache/qmd/index.sqlite
Size:  3.2 MB
MCP:   running (PID 23907)

Documents
  Total:    7 files indexed
  Vectors:  10 embedded
  Updated:  2d ago

Collections
  memory (qmd://memory/)
    Pattern:  **/*.md
    Files:    0 (updated never)
  workspace (qmd://workspace/)
    Pattern:  **/*.md
    Files:    7 (updated 2d ago)

Examples
  # List files in a collection
  qmd ls memory
  # Get a document
  qmd get qmd://memory/path/to/file.md
  # Search within a collection
  qmd search "query" -c memory

Models
  Embedding:   https://huggingface.co/ggml-org/embeddinggemma-300M-GGUF
  Reranking:   https://huggingface.co/ggml-org/Qwen3-Reranker-0.6B-Q8_0-GGUF
  Generation:  https://huggingface.co/tobil/qmd-query-expansion-1.7B-gguf
[node-llama-cpp] A prebuilt binary was not found, falling back to building from source
Not searching for unused variables given on the command line.
-- The C compiler identification is AppleClang 17.0.0.17000013
-- The CXX compiler identification is AppleClang 17.0.0.17000013
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Check for working C compiler: /Library/Developer/CommandLineTools/usr/bin/cc - skipped
-- Detecting C compile features
-- Detecting C compile features - done
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Check for working CXX compiler: /Library/Developer/CommandLineTools/usr/bin/c++ - skipped
-- Detecting CXX compile features
-- Detecting CXX compile features - done
CMAKE_BUILD_TYPE=Release
-- Found Git: /usr/bin/git (found version "2.39.5 (Apple Git-154)")
-- The ASM compiler identification is AppleClang
-- Found assembler: /Library/Developer/CommandLineTools/usr/bin/cc
-- Performing Test CMAKE_HAVE_LIBC_PTHREAD
-- Performing Test CMAKE_HAVE_LIBC_PTHREAD - Success
-- Found Threads: TRUE
-- CMAKE_SYSTEM_PROCESSOR: x86_64
-- GGML_SYSTEM_ARCH: x86
-- Including CPU backend
-- Accelerate framework found
-- Could NOT find OpenMP_C (missing: OpenMP_C_FLAGS OpenMP_C_LIB_NAMES) 
-- Could NOT find OpenMP_CXX (missing: OpenMP_CXX_FLAGS OpenMP_CXX_LIB_NAMES) 
-- Could NOT find OpenMP (missing: OpenMP_C_FOUND OpenMP_CXX_FOUND) 
-- x86 detected
CMake Warning at llama.cpp/ggml/src/ggml-cpu/CMakeLists.txt:84 (message):
  OpenMP not found
Call Stack (most recent call first):
  llama.cpp/ggml/src/CMakeLists.txt:445 (ggml_add_cpu_backend_variant_impl)


-- Adding CPU backend variant ggml-cpu: -march=native 
-- Looking for dgemm_
-- Looking for dgemm_ - found
-- Found BLAS: /Library/Developer/CommandLineTools/SDKs/MacOSX15.5.sdk/System/Library/Frameworks/Accelerate.framework
-- BLAS found, Libraries: /Library/Developer/CommandLineTools/SDKs/MacOSX15.5.sdk/System/Library/Frameworks/Accelerate.framework
-- BLAS found, Includes: 
-- Including BLAS backend
-- Could not find nvcc, please set CUDAToolkit_ROOT.
CMake Error at llama.cpp/ggml/src/ggml-cuda/CMakeLists.txt:258 (message):
  CUDA Toolkit not found


-- Configuring incomplete, errors occurred!
Not searching for unused variables given on the command line.
-- The C compiler identification is AppleClang 17.0.0.17000013
-- The CXX compiler identification is AppleClang 17.0.0.17000013
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Check for working C compiler: /Library/Developer/CommandLineTools/usr/bin/cc - skipped
-- Detecting C compile features
-- Detecting C compile features - done
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Check for working CXX compiler: /Library/Developer/CommandLineTools/usr/bin/c++ - skipped
-- Detecting CXX compile features
-- Detecting CXX compile features - done
CMAKE_BUILD_TYPE=Release
-- Found Git: /usr/bin/git (found version "2.39.5 (Apple Git-154)")
-- The ASM compiler identification is AppleClang
-- Found assembler: /Library/Developer/CommandLineTools/usr/bin/cc
-- Performing Test CMAKE_HAVE_LIBC_PTHREAD
-- Performing Test CMAKE_HAVE_LIBC_PTHREAD - Success
-- Found Threads: TRUE
-- CMAKE_SYSTEM_PROCESSOR: x86_64
-- GGML_SYSTEM_ARCH: x86
-- Including CPU backend
-- Accelerate framework found
-- Could NOT find OpenMP_C (missing: OpenMP_C_FLAGS OpenMP_C_LIB_NAMES) 
-- Could NOT find OpenMP_CXX (missing: OpenMP_CXX_FLAGS OpenMP_CXX_LIB_NAMES) 
-- Could NOT find OpenMP (missing: OpenMP_C_FOUND OpenMP_CXX_FOUND) 
CMake Warning at llama.cpp/ggml/src/ggml-cpu/CMakeLists.txt:84 (message):
  OpenMP not found
Call Stack (most recent call first):
  llama.cpp/ggml/src/CMakeLists.txt:445 (ggml_add_cpu_backend_variant_impl)


-- x86 detected
-- Adding CPU backend variant ggml-cpu: -march=native 
-- Looking for dgemm_
-- Looking for dgemm_ - found
-- Found BLAS: /Library/Developer/CommandLineTools/SDKs/MacOSX15.5.sdk/System/Library/Frameworks/Accelerate.framework
-- BLAS found, Libraries: /Library/Developer/CommandLineTools/SDKs/MacOSX15.5.sdk/System/Library/Frameworks/Accelerate.framework
-- BLAS found, Includes: 
-- Including BLAS backend
-- Could not find nvcc, please set CUDAToolkit_ROOT.
CMake Error at llama.cpp/ggml/src/ggml-cuda/CMakeLists.txt:258 (message):
  CUDA Toolkit not found


-- Configuring incomplete, errors occurred!
ERROR OMG Process terminated: 1

[node-llama-cpp] To resolve errors related to CUDA compilation, see the CUDA guide: https://node-llama-cpp.withcat.ai/guide/CUDA
[node-llama-cpp] Failed to build llama.cpp with CUDA support. Error: SpawnError: Command npm run -s cmake-js-llama -- compile --log-level warn --config Release --arch=x64 --out localBuilds/mac-x64-cuda --runtime-version=22.22.0 --parallel=4 --cmake-path /usr/local/lib/node_modules/@tobilu/qmd/node_modules/node-llama-cpp/llama/xpack/xpacks/@xpack-dev-tools/cmake/.content/bin/cmake --CDGGML_BUILD_NUMBER=1 --CDCMAKE_CONFIGURATION_TYPES=Release --CDNLC_CURRENT_PLATFORM=mac-x64 --CDNLC_TARGET_PLATFORM=mac-x64 --CDNLC_VARIANT=cuda.b8095 --CDGGML_METAL=OFF --CDGGML_CUDA=1 --CDGGML_CCACHE=OFF --CDLLAMA_CURL=OFF --CDLLAMA_HTTPLIB=OFF --CDLLAMA_BUILD_BORINGSSL=OFF --CDLLAMA_OPENSSL=OFF exited with code 1
    at createError (file:///usr/local/lib/node_modules/@tobilu/qmd/node_modules/node-llama-cpp/dist/utils/spawnCommand.js:34:20)
    at ChildProcess.<anonymous> (file:///usr/local/lib/node_modules/@tobilu/qmd/node_modules/node-llama-cpp/dist/utils/spawnCommand.js:47:24)
    at ChildProcess.emit (node:events:519:28)
    at ChildProcess._handle.onexit (node:internal/child_process:293:12)
QMD Warning: cuda reported available but failed to initialize. Falling back to CPU.
QMD Warning: no GPU acceleration, running on CPU (slow). Run 'qmd status' for details.

Device
  GPU:      none (running on CPU — models will be slow)
  Tip: Install CUDA, Vulkan, or Metal support for GPU acceleration.
  CPU:      4 math cores

## 3. 记忆健康检查
- MEMORY.md 大小:      435 字节

## 4. 完成项目
- 深度分析完成
