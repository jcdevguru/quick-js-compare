// These tests tha are for validations and functinos of
// compare options provided through the top-level function

import Compare from '../compare';
import type { RawOption } from '../lib/option';
import { OptionError } from '../lib/error';

describe('successful construction', () => {
  const testConstructor = (testName: string, options?: unknown) => {
    test(testName, () => {
      const c = new Compare(options as RawOption);
      expect(c).toBeInstanceOf(Compare);
    });
  };

  testConstructor('no options');
});

describe('invalid constructor calls', () => {
  const testConstructor = (testName: string, options?: unknown) => {
    test(testName, () => {
      expect(() => new Compare(options as RawOption)).toThrow(OptionError);
    });
  };

  testConstructor('empty options', {});
  testConstructor('string', 'not an option');
  testConstructor('number', 123);
  testConstructor('function', () => true);
  testConstructor('invalid compare option', { compare: 'not an option' });
  testConstructor('invalid render option', { render: 'not an option' });
});
