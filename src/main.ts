import "./style.css";
import * as esbuild from "esbuild-wasm";

// Sample TypeScript files
const SAMPLE_FILES = {
  example1: `// Basic TypeScript example
interface User {
  name: string;
  age: number;
  email?: string;
}

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(\`Added user: \${user.name}\`);
  }

  getUsers(): User[] {
    return this.users;
  }

  findUserByName(name: string): User | undefined {
    return this.users.find(user => user.name === name);
  }
}

// Usage
const manager = new UserManager();
manager.addUser({ name: "Alice", age: 30, email: "alice@example.com" });
manager.addUser({ name: "Bob", age: 25 });

const alice = manager.findUserByName("Alice");
console.log(alice);`,

  example2: `// Advanced TypeScript features
type Status = 'pending' | 'completed' | 'failed';

interface Task<T = any> {
  id: string;
  status: Status;
  data: T;
  createdAt: Date;
}

class TaskProcessor<T> {
  private tasks = new Map<string, Task<T>>();

  async processTask(id: string, processor: (data: T) => Promise<T>): Promise<void> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(\`Task \${id} not found\`);
    }

    try {
      task.status = 'pending';
      const result = await processor(task.data);
      task.data = result;
      task.status = 'completed';
    } catch (error) {
      task.status = 'failed';
      console.error(\`Task \${id} failed:\`, error);
    }
  }

  createTask<U>(id: string, data: U): Task<U> {
    const task: Task<U> = {
      id,
      status: 'pending',
      data,
      createdAt: new Date()
    };
    
    this.tasks.set(id, task as Task<T>);
    return task;
  }
}

// Generic utility types
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Usage with generics
const processor = new TaskProcessor<{ message: string; count: number }>();
const task = processor.createTask('task-1', { message: 'Hello', count: 42 });`,

  custom: `// Write your own TypeScript code here!
interface Example {
  message: string;
}

const greeting: Example = {
  message: "Hello, TypeScript!"
};

console.log(greeting.message);`,
};

class TypeScriptPlayground {
  private currentFile = "example1";
  private typescriptInput!: HTMLTextAreaElement;
  private javascriptOutput!: HTMLPreElement;
  private errorOutput!: HTMLDivElement;
  private compileBtn!: HTMLButtonElement;
  private targetSelect!: HTMLSelectElement;
  private runBtn!: HTMLButtonElement;
  private clearConsoleBtn!: HTMLButtonElement;
  private consoleOutput!: HTMLPreElement;
  private wasmInitialized = false;
  private compiledCode = "";

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.initializeWasm();
  }

  private async initializeWasm(): Promise<void> {
    try {
      this.compileBtn.disabled = true;
      this.compileBtn.textContent = "Initializing WASM...";

      await esbuild.initialize({
        wasmURL: "https://unpkg.com/esbuild-wasm@0.25.9/esbuild.wasm",
      });

      this.wasmInitialized = true;
      this.compileBtn.disabled = false;
      this.compileBtn.textContent = "Compile";
      this.runBtn.disabled = true; // Initially disabled until code is compiled

      // Load the initial sample file after WASM is ready
      this.loadSampleFile(this.currentFile);
    } catch (error) {
      this.showError(`Failed to initialize esbuild WASM: ${error}`);
      this.compileBtn.textContent = "WASM Failed";
    }
  }

  private initializeElements(): void {
    this.typescriptInput = document.getElementById(
      "typescript-input"
    ) as HTMLTextAreaElement;
    this.javascriptOutput = document.getElementById(
      "javascript-output"
    ) as HTMLPreElement;
    this.errorOutput = document.getElementById(
      "error-output"
    ) as HTMLDivElement;
    this.compileBtn = document.getElementById(
      "compile-btn"
    ) as HTMLButtonElement;
    this.targetSelect = document.getElementById(
      "target-select"
    ) as HTMLSelectElement;
    this.runBtn = document.getElementById("run-btn") as HTMLButtonElement;
    this.clearConsoleBtn = document.getElementById(
      "clear-console-btn"
    ) as HTMLButtonElement;
    this.consoleOutput = document.getElementById(
      "console-output"
    ) as HTMLPreElement;
  }

  private setupEventListeners(): void {
    // Tab switching
    const tabButtons = document.querySelectorAll(".tab-button");
    for (const button of tabButtons) {
      button.addEventListener("click", (e) => {
        const target = e.target as HTMLButtonElement;
        const file = target.dataset.file;
        if (file) {
          this.switchTab(file);
        }
      });
    }

    // Compile button
    this.compileBtn.addEventListener("click", () => {
      this.compileTypeScript();
    });

    // Auto-compile on input (with debounce)
    let debounceTimer: number;
    this.typescriptInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        this.compileTypeScript();
      }, 500);
    });

    // Compile on target change
    this.targetSelect.addEventListener("change", () => {
      this.compileTypeScript();
    });

    // Run button
    this.runBtn.addEventListener("click", () => {
      this.runCompiledCode();
    });

    // Clear console button
    this.clearConsoleBtn.addEventListener("click", () => {
      this.clearConsole();
    });
  }

  private switchTab(file: string): void {
    // Update active tab
    const tabButtons = document.querySelectorAll(".tab-button");
    for (const button of tabButtons) {
      button.classList.remove("active");
      if (button.getAttribute("data-file") === file) {
        button.classList.add("active");
      }
    }

    this.currentFile = file;
    this.loadSampleFile(file);
  }

  private loadSampleFile(file: string): void {
    const content = SAMPLE_FILES[file as keyof typeof SAMPLE_FILES];
    if (content) {
      this.typescriptInput.value = content;
      if (this.wasmInitialized) {
        this.compileTypeScript();
      }
    }
  }

  private async compileTypeScript(): Promise<void> {
    if (!this.wasmInitialized) {
      this.showError("WASM not initialized yet. Please wait...");
      return;
    }

    const tsCode = this.typescriptInput.value.trim();
    if (!tsCode) {
      this.javascriptOutput.textContent = "";
      this.compiledCode = "";
      this.runBtn.disabled = true;
      this.hideError();
      return;
    }

    this.compileBtn.disabled = true;
    this.compileBtn.textContent = "Compiling...";

    try {
      const result = await esbuild.transform(tsCode, {
        loader: "ts",
        target: this.targetSelect.value as any,
        format: "esm",
        sourcemap: false,
        minify: false,
        keepNames: true,
      });

      this.javascriptOutput.textContent = result.code;
      this.compiledCode = result.code;
      this.runBtn.disabled = false;
      this.hideError();
    } catch (error) {
      this.showError(error);
      this.javascriptOutput.textContent =
        "// Compilation failed. See error below.";
      this.compiledCode = "";
      this.runBtn.disabled = true;
    }

    this.compileBtn.disabled = false;
    this.compileBtn.textContent = "Compile";
  }

  private showError(error: any): void {
    let errorMessage = "Unknown error occurred";

    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    this.errorOutput.textContent = `Error: ${errorMessage}`;
    this.errorOutput.classList.add("show");
  }

  private hideError(): void {
    this.errorOutput.classList.remove("show");
  }

  private runCompiledCode(): void {
    if (!this.compiledCode.trim()) {
      this.appendToConsole("❌ No compiled code to run", "error");
      return;
    }

    this.runBtn.disabled = true;
    this.runBtn.textContent = "Running...";

    try {
      // Create a custom console object to capture output
      const originalConsole = window.console;
      const consoleCapture: any = {
        log: (...args: any[]) => {
          this.appendToConsole(args.map(this.formatValue).join(" "), "log");
          originalConsole.log(...args);
        },
        error: (...args: any[]) => {
          this.appendToConsole(args.map(this.formatValue).join(" "), "error");
          originalConsole.error(...args);
        },
        warn: (...args: any[]) => {
          this.appendToConsole(args.map(this.formatValue).join(" "), "warn");
          originalConsole.warn(...args);
        },
        info: (...args: any[]) => {
          this.appendToConsole(args.map(this.formatValue).join(" "), "info");
          originalConsole.info(...args);
        },
        table: (...args: any[]) => {
          this.appendToConsole(args.map(this.formatValue).join(" "), "table");
          originalConsole.table(...args);
        },
      };

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

      this.appendToConsole("✅ Code executed successfully", "success");
    } catch (error: any) {
      this.appendToConsole(`❌ Runtime Error: ${error.message}`, "error");
    }

    this.runBtn.disabled = false;
    this.runBtn.textContent = "Run Code";
  }

  private formatValue(value: any): string {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  private appendToConsole(message: string, type: "log" | "error" | "warn" | "info" | "success" | "table" = "log"): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === "error" ? "❌" : type === "warn" ? "⚠️" : type === "success" ? "✅" : type === "info" ? "ℹ️" : "📝";
    
    const formattedMessage = `[${timestamp}] ${prefix} ${message}\n`;
    this.consoleOutput.textContent += formattedMessage;
    
    // Auto-scroll to bottom
    this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
  }

  private clearConsole(): void {
    this.consoleOutput.textContent = "";
  }
}

// Initialize the playground when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TypeScriptPlayground();
});
