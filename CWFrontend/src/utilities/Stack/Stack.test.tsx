import { Stack } from '_utilities/Stack/index';

describe('Stack (CAV-003 coverage gate, tier 1: utilities)', () => {
  it('Push grows the stack and Size reports the number of items', () => {
    // Arrange
    const stack = new Stack<number>();

    // Act
    stack.Push(1);
    stack.Push(2);

    // Assert
    expect(stack.Size()).toBe(2);
  });

  it('Push throws when the stack has reached its capacity', () => {
    // Arrange
    const stack = new Stack<number>(1);
    stack.Push(1);

    // Act + Assert
    expect(() => stack.Push(2)).toThrow('Stack has reached max capacity, you cannot add more items');
  });

  it('Pop removes and returns the most recently pushed item (LIFO)', () => {
    // Arrange
    const stack = new Stack<number>();
    stack.Push(1);
    stack.Push(2);

    // Act
    const popped = stack.Pop();

    // Assert
    expect(popped).toBe(2);
    expect(stack.Size()).toBe(1);
  });

  it('Pop returns undefined when the stack is empty', () => {
    // Arrange
    const stack = new Stack<number>();

    // Act + Assert
    expect(stack.Pop()).toBeUndefined();
  });

  it('Peek returns the top item without removing it', () => {
    // Arrange
    const stack = new Stack<number>();
    stack.Push(1);
    stack.Push(2);

    // Act
    const top = stack.Peek();

    // Assert
    expect(top).toBe(2);
    expect(stack.Size()).toBe(2);
  });

  it('Peek returns undefined when the stack is empty', () => {
    // Arrange
    const stack = new Stack<number>();

    // Act + Assert
    expect(stack.Peek()).toBeUndefined();
  });

  it('Size is zero for a newly created stack', () => {
    // Arrange + Act
    const stack = new Stack<number>();

    // Assert
    expect(stack.Size()).toBe(0);
  });
});
