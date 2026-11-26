import { Queue } from '_utilities/Queue/index';

describe('Queue (CAV-003 coverage gate, tier 1: utilities)', () => {
  it('Enqueue grows the queue and Size reports the number of items', () => {
    // Arrange
    const queue = new Queue<number>();

    // Act
    queue.Enqueue(1);
    queue.Enqueue(2);

    // Assert
    expect(queue.Size()).toBe(2);
  });

  it('Enqueue throws when the queue has reached its capacity', () => {
    // Arrange
    const queue = new Queue<number>(1);
    queue.Enqueue(1);

    // Act + Assert — the error text says "Stack"; Queue reuses it verbatim.
    expect(() => queue.Enqueue(2)).toThrow('Stack has reached max capacity, you cannot add more items');
  });

  it('Dequeue removes and returns the oldest item (FIFO)', () => {
    // Arrange
    const queue = new Queue<number>();
    queue.Enqueue(1);
    queue.Enqueue(2);

    // Act
    const dequeued = queue.Dequeue();

    // Assert
    expect(dequeued).toBe(1);
    expect(queue.Size()).toBe(1);
  });

  it('Dequeue returns undefined when the queue is empty', () => {
    // Arrange
    const queue = new Queue<number>();

    // Act + Assert
    expect(queue.Dequeue()).toBeUndefined();
  });

  it('Peek returns the front item without removing it', () => {
    // Arrange
    const queue = new Queue<number>();
    queue.Enqueue(1);
    queue.Enqueue(2);

    // Act
    const front = queue.Peek();

    // Assert
    expect(front).toBe(1);
    expect(queue.Size()).toBe(2);
  });

  it('Peek returns undefined when the queue is empty', () => {
    // Arrange
    const queue = new Queue<number>();

    // Act + Assert
    expect(queue.Peek()).toBeUndefined();
  });

  it('Size is zero for a newly created queue', () => {
    // Arrange + Act
    const queue = new Queue<number>();

    // Assert
    expect(queue.Size()).toBe(0);
  });
});
