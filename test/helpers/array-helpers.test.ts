import shuffleArray from '../../src/helpers/array-helpers';

describe('array_helpers', () => {
  it('isValidExternalURL', () => {
    const originalArray = ['a', 'b', 'c'];
    const shuffledArray = shuffleArray(originalArray);

    // Expect the arrays to be exactly the same
    // when both are sorted alphabetically
    // eslint-disable-next-line sonar/no-alphabetical-sort
    expect(shuffledArray.sort()).toEqual(originalArray.sort());
  });
});
