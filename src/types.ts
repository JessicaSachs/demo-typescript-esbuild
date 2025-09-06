export interface SampleFiles {
  [key: string]: string;
}

export interface PlaygroundElements {
  typescriptInput: HTMLTextAreaElement;
  javascriptOutput: HTMLPreElement;
  errorOutput: HTMLDivElement;
  compileBtn: HTMLButtonElement;
  targetSelect: HTMLSelectElement;
  runBtn: HTMLButtonElement;
  clearConsoleBtn: HTMLButtonElement;
  consoleOutput: HTMLPreElement;
}

export type ConsoleMessageType = "log" | "error" | "warn" | "info" | "success" | "table";

export interface ConsoleCapture {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  info: (...args: any[]) => void;
  table: (...args: any[]) => void;
}

export interface CompilerOptions {
  loader: string;
  target: string;
  format: string;
  sourcemap: boolean;
  minify: boolean;
  keepNames: boolean;
}

export interface CompilationResult {
  code: string;
  success: boolean;
  error?: string;
}
