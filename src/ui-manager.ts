import type { PlaygroundElements } from "./types.js";

export class UIManager {
  private elements: PlaygroundElements;

  constructor() {
    this.elements = this.initializeElements();
  }

  getElements(): PlaygroundElements {
    return this.elements;
  }

  private initializeElements(): PlaygroundElements {
    const getElement = <T extends HTMLElement>(id: string): T => {
      const element = document.getElementById(id) as T;
      if (!element) {
        throw new Error(`Element with id '${id}' not found`);
      }
      return element;
    };

    return {
      typescriptInput: getElement<HTMLTextAreaElement>("typescript-input"),
      javascriptOutput: getElement<HTMLPreElement>("javascript-output"),
      errorOutput: getElement<HTMLDivElement>("error-output"),
      compileBtn: getElement<HTMLButtonElement>("compile-btn"),
      targetSelect: getElement<HTMLSelectElement>("target-select"),
      runBtn: getElement<HTMLButtonElement>("run-btn"),
      clearConsoleBtn: getElement<HTMLButtonElement>("clear-console-btn"),
      consoleOutput: getElement<HTMLPreElement>("console-output"),
    };
  }

  setupTabSwitching(onTabSwitch: (file: string) => void): void {
    const tabButtons = document.querySelectorAll(".tab-button");
    for (const button of tabButtons) {
      button.addEventListener("click", (e) => {
        const target = e.target as HTMLButtonElement;
        const file = target.dataset.file;
        if (file) {
          this.switchActiveTab(file);
          onTabSwitch(file);
        }
      });
    }
  }

  private switchActiveTab(file: string): void {
    const tabButtons = document.querySelectorAll(".tab-button");
    for (const button of tabButtons) {
      button.classList.remove("active");
      if (button.getAttribute("data-file") === file) {
        button.classList.add("active");
      }
    }
  }

  setupInputDebounce(callback: () => void, delay: number = 500): void {
    let debounceTimer: number;
    this.elements.typescriptInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(callback, delay);
    });
  }

  showError(error: string): void {
    this.elements.errorOutput.textContent = `Error: ${error}`;
    this.elements.errorOutput.classList.add("show");
  }

  hideError(): void {
    this.elements.errorOutput.classList.remove("show");
  }

  setCompileButtonState(disabled: boolean, text: string): void {
    this.elements.compileBtn.disabled = disabled;
    this.elements.compileBtn.textContent = text;
  }

  setRunButtonState(disabled: boolean, text: string = "Run Code"): void {
    this.elements.runBtn.disabled = disabled;
    this.elements.runBtn.textContent = text;
  }

  setInputValue(value: string): void {
    this.elements.typescriptInput.value = value;
  }

  getInputValue(): string {
    return this.elements.typescriptInput.value;
  }

  setOutputValue(value: string): void {
    this.elements.javascriptOutput.textContent = value;
  }

  getTargetValue(): string {
    return this.elements.targetSelect.value;
  }
}
