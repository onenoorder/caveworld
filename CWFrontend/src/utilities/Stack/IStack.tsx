export interface IStack<T> {
  Push(item: T): void;
  Pop(): T | undefined;
  Peek(): T | undefined;
  Size(): number;
}