export interface IQueue<T> {
  Enqueue(item: T): void;
  Dequeue(): T | undefined;
  Peek(): T | undefined;
  Size(): number;
}