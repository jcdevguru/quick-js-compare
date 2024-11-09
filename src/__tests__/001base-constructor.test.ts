// These tests tha are for validations and functinos of
// compare options provided through the top-level function

import QuickCompare from '../compare';
import type { AppOptions } from '../app/option';
import OptionError from '../error-classes/option-error';

describe('successful construction', () => {
  const testConstructor = (testName: string, options?: unknown) => {
    test(testName, () => {
      const qc = new QuickCompare(options as AppOptions);
      expect(qc).toBeInstanceOf(QuickCompare);
    });
  };

  testConstructor('constructor, no options');
  testConstructor('constructor, General', 'General');
  testConstructor('constructor, Exact', 'Exact');
});

describe('invalid constructor calls', () => {
  const testConstructor = (testName: string, options?: unknown) => {
    test(testName, () => {
      expect(() => new QuickCompare(options as AppOptions)).toThrow(OptionError);
    });
  };

  testConstructor('constructor, empty options', {});
  testConstructor('constructor, unknown string', 'not an option');
  testConstructor('constructor, not object, string, or function', 123);
  testConstructor('constructor, function', () => true);
});
