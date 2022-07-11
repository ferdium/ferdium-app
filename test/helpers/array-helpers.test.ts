import shuffleArray from '../../src/helpers/array-helpers';

describe('array_helpers', () => {
  it('isValidExternalURL', () => {
    const originalArray = ['a', 'b', 'c'];
    const shuffledArray = shuffleArray(originalArray);

    // Expect the arrays to be exactly the same
    // when both are sorted alphabetically
    expect(shuffledArray.sort()).toEqual(originalArray.sort());
  });
});
