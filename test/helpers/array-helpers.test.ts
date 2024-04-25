import shuffleArray from '../../src/helpers/array-helpers';

describe('array_helpers', () => {
  it('isValidExternalURL', () => {
    const originalArray = ['a', 'b', 'c'];
    const shuffledArray = shuffleArray(originalArray);

    // Expect the arrays to be exactly the same
    // when both are sorted alphabetically
    expect(shuffledArray.toSorted((a, b) => a.localeCompare(b))).toEqual(
      originalArray.toSorted((a, b) => a.localeCompare(b)),
    );
  });
});
