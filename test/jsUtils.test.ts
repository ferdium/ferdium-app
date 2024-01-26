import * as jsUtils from '../src/jsUtils';

describe('jsUtils', () => {
  describe('ifUndefined<string>', () => {
    it('returns the default value for undefined input', () => {
      const result = jsUtils.ifUndefined<string>(undefined, 'abc');
      expect(result).toEqual('abc');
    });

    it('returns the default value for null input', () => {
      const result = jsUtils.ifUndefined<string>(null, 'abc');
      expect(result).toEqual('abc');
    });

    it('returns the non-default input value for regular string input', () => {
      const result = jsUtils.ifUndefined<string>('some random string', 'abc');
      expect(result).toEqual('some random string');
    });
  });

  describe('ifUndefined<boolean>', () => {
    it('returns the default value for undefined input', () => {
      const result = jsUtils.ifUndefined<boolean>(undefined, false);
      expect(result).toEqual(false);
    });

    it('returns the default value for null input', () => {
      const result = jsUtils.ifUndefined<boolean>(null, true);
      expect(result).toEqual(true);
    });

    it('returns the non-default input value for regular boolean input', () => {
      const result = jsUtils.ifUndefined<boolean>(true, false);
      expect(result).toEqual(true);
    });
  });

  describe('ifUndefined<number>', () => {
    it('returns the default value for undefined input', () => {
      const result = jsUtils.ifUndefined<number>(undefined, 123);
      expect(result).toEqual(123);
    });

    it('returns the default value for null input', () => {
      const result = jsUtils.ifUndefined<number>(null, 234);
      expect(result).toEqual(234);
    });

    it('returns the non-default input value for regular Number input', () => {
      const result = jsUtils.ifUndefined<number>(1234, 5678);
      expect(result).toEqual(1234);
    });
  });

  describe('convertToJSON', () => {
    it('returns undefined for undefined input', () => {
      const result = jsUtils.convertToJSON();
      expect(result).toEqual(undefined);
    });

    it('returns null for null input', () => {
      const result = jsUtils.convertToJSON(null);
      expect(result).toEqual(null);
    });

    it('returns the object for the object input', () => {
      const result = jsUtils.convertToJSON(['a', 'b']);
      expect(result).toEqual(['a', 'b']);
    });

    it('returns the parsed JSON for the string input', () => {
      const result1 = jsUtils.convertToJSON('{"a":"b","c":"d"}');
      expect(result1).toEqual({ a: 'b', c: 'd' });

      const result2 = jsUtils.convertToJSON('[{"a":"b"},{"c":"d"}]');
      expect(result2).toEqual([{ a: 'b' }, { c: 'd' }]);
    });
  });

  describe('cleanseJSObject', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('throws error for undefined input', () => {
      const result = jsUtils.cleanseJSObject();
      expect(result).toThrow();
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('throws error for null input', () => {
      const result = jsUtils.cleanseJSObject(null);
      expect(result).toThrow();
    });

    it('returns cloned object for valid input', () => {
      const result = jsUtils.cleanseJSObject([{ a: 'b' }, { c: 'd' }]);
      expect(result).toEqual([{ a: 'b' }, { c: 'd' }]);
    });
  });

  describe('isEscKeyPress', () => {
    it('returns true if the key number is 27', () => {
      const result = jsUtils.isEscKeyPress(27);
      expect(result).toEqual(true);
    });

    it('returns false if the key number is 27', () => {
      const result = jsUtils.isEscKeyPress(28);
      expect(result).toEqual(false);
    });
  });

  describe('safeParseInt', () => {
    it('returns zero for undefined', () => {
      expect(jsUtils.safeParseInt()).toEqual(0);
    });

    it('returns zero for null', () => {
      expect(jsUtils.safeParseInt(null)).toEqual(0);
    });

    it('parses integer number correctly in beginning of string input', () => {
      expect(jsUtils.safeParseInt('47.45G')).toEqual(47);
    });

    it('returns 0 for string input whose starting characters are non-numeric', () => {
      expect(jsUtils.safeParseInt('G47.45')).toEqual(0);
    });

    it('parses integer number correctly', () => {
      expect(jsUtils.safeParseInt(47.45)).toEqual(47);
    });
  });

  describe('acceleratorString', () => {
    it('handles without prefix and suffix', () => {
      expect(jsUtils.acceleratorString(5, 'abc')).toEqual('(abc+5)');
    });

    it('handles index = 0', () => {
      expect(jsUtils.acceleratorString(0, 'abc')).toEqual('(abc+0)');
    });

    it('handles index = 1', () => {
      expect(jsUtils.acceleratorString(1, 'abc')).toEqual('(abc+1)');
    });

    it('handles index = 10', () => {
      expect(jsUtils.acceleratorString(10, 'abc')).toEqual('(abc+0)');
    });

    it('handles index = 11', () => {
      expect(jsUtils.acceleratorString(11, 'abc')).toEqual('');
    });
  });

  describe('removeNewLines', () => {
    it('handles unix style new lines', () => {
      expect(jsUtils.removeNewLines('abc def\nghi')).toEqual('abc defghi');
    });

    it('handles windows style new lines', () => {
      expect(jsUtils.removeNewLines('abc def\r\nghi')).toEqual('abc defghi');
    });

    it('handles new lines in the beginning, middle and ending of the string', () => {
      expect(jsUtils.removeNewLines('\nabc def\r\nghi\n')).toEqual(
        'abc defghi',
      );
    });
  });
});
