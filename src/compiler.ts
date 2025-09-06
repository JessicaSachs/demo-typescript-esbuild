import * as esbuild from "esbuild-wasm";
import type { CompilerOptions, CompilationResult } from "./types.js";

const WASM_URL = "https://unpkg.com/esbuild-wasm@0.25.9/esbuild.wasm";

export class TypeScriptCompiler {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await esbuild.initialize({
        wasmURL: WASM_URL,
      });
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize esbuild WASM: ${error}`);
    }
  }

  async compile(code: string, target: string = "es2020"): Promise<CompilationResult> {
    if (!this.initialized) {
      throw new Error("Compiler not initialized. Call initialize() first.");
    }

    if (!code.trim()) {
      return {
        code: "",
        success: true
      };
    }

    try {
      const options: CompilerOptions = {
        loader: "ts",
        target,
        format: "esm",
        sourcemap: false,
        minify: false,
        keepNames: true,
      };

      const result = await esbuild.transform(code, options as any);
      
      return {
        code: result.code,
        success: true
      };
    } catch (error: any) {
      return {
        code: "",
        success: false,
        error: error?.message || "Unknown compilation error"
      };
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
