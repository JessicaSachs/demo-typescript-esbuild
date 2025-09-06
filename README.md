# TypeScript ESBuild WASM Playground

A browser-based TypeScript playground that compiles TypeScript to JavaScript using ESBuild WASM.

## Features

- **In-browser compilation**: Compiles TypeScript directly in the browser using ESBuild WASM
- **Multiple ES targets**: Support for ES5, ES6, ES2017-ES2020
- **Live preview**: Auto-compile on input with debouncing
- **Code execution**: Run compiled JavaScript with console output capture
- **Sample files**: Pre-loaded examples showcasing TypeScript features

## Getting Started

```bash
pnpm install
pnpm dev
```

## Usage

1. Select a sample file or write custom TypeScript code
2. Choose your target ES version
3. Code compiles automatically as you type
4. Click "Run Code" to execute the compiled JavaScript
5. View output in the console section

## Dependencies

- **esbuild-wasm**: TypeScript/JavaScript compiler running in WebAssembly
- **vite**: Development server and build tool
- **typescript**: TypeScript language support
