import { IStack } from '.';

export class Stack<T> implements IStack<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  Push(item: T): void {
    if (this.Size() === this.capacity) {
      throw Error("Stack has reached max capacity, you cannot add more items");
    }
    this.storage.push(item);
  }

  Pop(): T | undefined {
    return this.storage.pop();
  }

  Peek(): T | undefined {
    return this.storage[this.Size() - 1];
  }

  Size(): number {
    return this.storage.length;
  }
}