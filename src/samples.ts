import type { SampleFiles } from "./types.js";

export const SAMPLE_FILES: SampleFiles = {
  javascriptDependency: `// Example of importing a library
import leftPad from 'left-pad';

console.log(leftPad('foo', 10)); // => '     foo'
`,
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

export function getSampleFile(key: string): string | undefined {
  return SAMPLE_FILES[key];
}

export function getSampleFileKeys(): string[] {
  return Object.keys(SAMPLE_FILES);
}
