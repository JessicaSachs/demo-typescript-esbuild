import "./style.css";
import { TypeScriptCompiler } from "./compiler.js";
import { ConsoleManager } from "./console-manager.js";
import { UIManager } from "./ui-manager.js";
import { getSampleFile } from "./samples.js";

class TypeScriptPlayground {
  private currentFile = "example1";
  private compiler: TypeScriptCompiler;
  private consoleManager: ConsoleManager;
  private uiManager: UIManager;
  private compiledCode = "";

  constructor() {
    this.uiManager = new UIManager();
    this.consoleManager = new ConsoleManager(this.uiManager.getElements().consoleOutput);
    this.compiler = new TypeScriptCompiler();
    
    this.setupEventListeners();
    this.initializeCompiler();
  }

  private async initializeCompiler(): Promise<void> {
    try {
      this.uiManager.setCompileButtonState(true, "Initializing WASM...");

      await this.compiler.initialize();

      this.uiManager.setCompileButtonState(false, "Compile");
      this.uiManager.setRunButtonState(true); // Initially disabled until code is compiled

      // Load the initial sample file after WASM is ready
      this.loadSampleFile(this.currentFile);
    } catch (error: any) {
      this.uiManager.showError(error.message);
      this.uiManager.setCompileButtonState(true, "WASM Failed");
    }
  }


  private setupEventListeners(): void {
    const elements = this.uiManager.getElements();

    // Tab switching
    this.uiManager.setupTabSwitching((file) => {
      this.switchTab(file);
    });

    // Compile button
    elements.compileBtn.addEventListener("click", () => {
      this.compileTypeScript();
    });

    // Auto-compile on input (with debounce)
    this.uiManager.setupInputDebounce(() => {
      this.compileTypeScript();
    });

    // Compile on target change
    elements.targetSelect.addEventListener("change", () => {
      this.compileTypeScript();
    });

    // Run button
    elements.runBtn.addEventListener("click", () => {
      this.runCompiledCode();
    });

    // Clear console button
    elements.clearConsoleBtn.addEventListener("click", () => {
      this.consoleManager.clear();
    });
  }

  private switchTab(file: string): void {
    this.currentFile = file;
    this.loadSampleFile(file);
  }

  private loadSampleFile(file: string): void {
    const content = getSampleFile(file);
    if (content) {
      this.uiManager.setInputValue(content);
      if (this.compiler.isInitialized()) {
        this.compileTypeScript();
      }
    }
  }

  private async compileTypeScript(): Promise<void> {
    if (!this.compiler.isInitialized()) {
      this.uiManager.showError("WASM not initialized yet. Please wait...");
      return;
    }

    const tsCode = this.uiManager.getInputValue().trim();
    if (!tsCode) {
      this.uiManager.setOutputValue("");
      this.compiledCode = "";
      this.uiManager.setRunButtonState(true);
      this.uiManager.hideError();
      return;
    }

    this.uiManager.setCompileButtonState(true, "Compiling...");

    const result = await this.compiler.compile(tsCode, this.uiManager.getTargetValue());

    if (result.success) {
      this.uiManager.setOutputValue(result.code);
      this.compiledCode = result.code;
      this.uiManager.setRunButtonState(false);
      this.uiManager.hideError();
    } else {
      this.uiManager.showError(result.error || "Unknown compilation error");
      this.uiManager.setOutputValue("// Compilation failed. See error below.");
      this.compiledCode = "";
      this.uiManager.setRunButtonState(true);
    }

    this.uiManager.setCompileButtonState(false, "Compile");
  }


  private runCompiledCode(): void {
    if (!this.compiledCode.trim()) {
      this.consoleManager.appendToConsole("❌ No compiled code to run", "error");
      return;
    }

    this.uiManager.setRunButtonState(true, "Running...");

    try {
      // Create a custom console object to capture output
      const consoleCapture = this.consoleManager.createConsoleCapture();

      // Execute the code with captured console
      const wrappedCode = `
        (function() {
          const console = arguments[0];
          try {
            ${this.compiledCode}
          } catch (error) {
            console.error("Runtime Error:", error.message);
            throw error;
          }
        })
      `;

      const func = eval(wrappedCode);
      func(consoleCapture);

      this.consoleManager.appendToConsole("✅ Code executed successfully", "success");
    } catch (error: any) {
      this.consoleManager.appendToConsole(`❌ Runtime Error: ${error.message}`, "error");
    }

    this.uiManager.setRunButtonState(false);
  }

}

// Initialize the playground when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TypeScriptPlayground();
});
