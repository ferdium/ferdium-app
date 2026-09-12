import enUS from '../../src/i18n/locales/en-US.json';
import vietnamese from '../../src/i18n/locales/vi.json';

describe('Vietnamese locale', () => {
  it('translates every English application message', () => {
    const missingKeys = Object.keys(enUS).filter((key) => !(key in vietnamese));

    expect(missingKeys).toEqual([]);
  });
});
