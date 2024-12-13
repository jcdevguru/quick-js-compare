// These tests tha are for validations and functinos of
// compare options provided through the top-level function

import CoreCompare from '../compare';
import type { Option } from '../lib/option';
import { OptionError } from '../lib/error';

describe('successful construction', () => {
  const testConstructor = (testName: string, options?: unknown) => {
    test(testName, () => {
      const c = new CoreCompare(options as Option);
      expect(c).toBeInstanceOf(CoreCompare);
    });
  };

  testConstructor('no options');
});

describe('invalid constructor calls', () => {
  const testConstructor = (testName: string, options?: unknown) => {
    test(testName, () => {
      expect(() => new CoreCompare(options as Option)).toThrow(OptionError);
    });
  };

  testConstructor('empty options', {});
  testConstructor('string', 'not an option');
  testConstructor('number', 123);
  testConstructor('function', () => true);
  testConstructor('invalid compare option', { compare: 'not an option' });
  testConstructor('invalid render option', { render: 'not an option' });
});
