import { shuffleArray } from '../../src/helpers/array-helpers';

describe('array_helpers', () => {
  it('isValidExternalURL', () => {
    expect(shuffleArray(['a', 'b', 'c'])).not.toEqual(['a', 'b', 'c']);
  });
});
