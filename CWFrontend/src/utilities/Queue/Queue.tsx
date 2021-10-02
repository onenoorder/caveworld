import { IQueue } from '.';

export class Queue<T> implements IQueue<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  Enqueue(item: T): void {
    if (this.Size() === this.capacity) {
      throw Error("Stack has reached max capacity, you cannot add more items");
    }
    this.storage.push(item);
  }

  Dequeue(): T | undefined {
    return this.storage.shift();
  }

  Peek(): T | undefined {
    return this.Size() > 0 ? this.storage[0] : undefined;
  }

  Size(): number {
    return this.storage.length;
  }
}