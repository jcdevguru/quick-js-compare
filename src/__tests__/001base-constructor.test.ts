// These tests tha are for validations and functinos of
// compare options provided through the top-level function

import CoreCompare from '../compare';
import type { AppOptions } from '../lib/option';
import OptionError from '../error-classes/option-error';

describe('successful construction', () => {
  const testConstructor = (testName: string, options?: unknown) => {
    test(testName, () => {
      const c = new CoreCompare(options as AppOptions);
      expect(c).toBeInstanceOf(CoreCompare);
    });
  };

  testConstructor('constructor, no options');
  testConstructor('constructor, General', 'General');
  testConstructor('constructor, Exact', 'Exact');
});

describe('invalid constructor calls', () => {
  const testConstructor = (testName: string, options?: unknown) => {
    test(testName, () => {
      expect(() => new CoreCompare(options as AppOptions)).toThrow(OptionError);
    });
  };

  testConstructor('constructor, empty options', {});
  testConstructor('constructor, unknown string', 'not an option');
  testConstructor('constructor, not object, string, or function', 123);
  testConstructor('constructor, function', () => true);
});
