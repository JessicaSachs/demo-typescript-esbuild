import type { ConsoleMessageType, ConsoleCapture } from "./types.js";

export class ConsoleManager {
  private consoleOutput: HTMLPreElement;

  constructor(consoleElement: HTMLPreElement) {
    this.consoleOutput = consoleElement;
  }

  createConsoleCapture(): ConsoleCapture {
    const originalConsole = window.console;
    
    return {
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
  }

  appendToConsole(message: string, type: ConsoleMessageType = "log"): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = this.getMessagePrefix(type);
    
    const formattedMessage = `[${timestamp}] ${prefix} ${message}\n`;
    this.consoleOutput.textContent += formattedMessage;
    
    // Auto-scroll to bottom
    this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
  }

  clear(): void {
    this.consoleOutput.textContent = "";
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

  private getMessagePrefix(type: ConsoleMessageType): string {
    const prefixMap: Record<ConsoleMessageType, string> = {
      error: "❌",
      warn: "⚠️",
      success: "✅",
      info: "ℹ️",
      log: "📝",
      table: "📊"
    };
    
    return prefixMap[type] || "📝";
  }
}
