import * as update_helpers from '../../src/helpers/update-helpers';

describe('getFerdiumVersion', () => {
  const baseVersion = '6.0.0-nightly.3';
  it(`returns ${baseVersion} for empty string`, () => {
    const result = update_helpers.getFerdiumVersion('', baseVersion);
    expect(result).toEqual(`v${baseVersion}`);
  });

  it(`returns ${baseVersion} for ${baseVersion}`, () => {
    const result = update_helpers.getFerdiumVersion('', baseVersion);
    expect(result).toEqual(`v${baseVersion}`);
  });

  it(`returns v6.0.0-beta.3`, () => {
    const result = update_helpers.getFerdiumVersion(
      '?version=6.0.0-beta.3',
      baseVersion,
    );
    expect(result).toEqual(`v6.0.0-beta.3`);
  });

  it(`returns v6.0.0`, () => {
    const result = update_helpers.getFerdiumVersion(
      '?version=6.0.0',
      baseVersion,
    );
    expect(result).toEqual(`v6.0.0`);
  });

  it(`returns ${baseVersion}`, () => {
    const result = update_helpers.getFerdiumVersion(
      'http://test/=6.0.0',
      baseVersion,
    );
    expect(result).toEqual(`v${baseVersion}`);
  });

  it(`returns ${baseVersion} for missing 'version='`, () => {
    const result = update_helpers.getFerdiumVersion(
      'http://test/',
      baseVersion,
    );
    expect(result).toEqual(`v${baseVersion}`);
  });
});

describe('updateVersionParse', () => {
  it(`returns empty string for empty string`, () => {
    const result = update_helpers.updateVersionParse('');
    expect(result).toEqual('');
  });
  it(`returns '?version=x.x for x.x`, () => {
    const result = update_helpers.updateVersionParse('6.0.0');
    expect(result).toEqual('?version=6.0.0');
  });
});
