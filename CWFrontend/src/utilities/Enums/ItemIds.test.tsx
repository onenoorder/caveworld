import { ItemIds } from '_utilities/Enums';

// CAV-022 test design suite E (ENM-01): provisional item id enum members —
// the architecture D4 taxonomy (Wood, Stone, Steel, Tool, Cogwheel, Food,
// Charcoal, Water, Crystal).
describe('ItemIds provisional taxonomy (CAV-022 ENM-01)', () => {
  it('defines exactly the nine provisional members as distinct numeric ids', () => {
    // Arrange
    const members = ['Wood', 'Stone', 'Steel', 'Tool', 'Cogwheel', 'Food', 'Charcoal', 'Water', 'Crystal'];

    // Act
    const ids = members.map(member => (ItemIds as any)[member]);

    // Assert — every member exists, is numeric, and unique (enum semantics).
    for (const id of ids) {
      expect(typeof id).toBe('number');
    }
    expect(new Set(ids).size).toBe(9);
  });
});
