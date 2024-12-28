// These tests that are for validations and functinos of
// compare options provided through the top-level function

import Compare from '../compare';
import { type MinimalConfigOptions } from '../lib/option';
import { type Value } from '../lib/types';
import { compareTestLabel } from './util';

describe('compare - basic operations', () => {
  const testMatch = (testName: string, left: Value, right: Value, options?: MinimalConfigOptions) => {
    test(compareTestLabel(testName, options), () => {
      const c = new Compare(options);
      expect(c.compare(left, right).result).toStrictEqual({
        leftSame: [expect.objectContaining({value: left})],
        rightSame: [expect.objectContaining({value: right})]
      });
    });
  };
  
  const testMismatch = (testName: string, left: Value, right: Value, options?: MinimalConfigOptions) => {
    test(compareTestLabel(testName, options), () => {
      const c = new Compare(options);
      expect(c.compare(left, right).result).toStrictEqual({
        left: [expect.objectContaining({value: left})],
        right: [expect.objectContaining({value: right})]
      });
    });
  };

  testMatch('exact matching strings', 'test-string1', 'test-string1');
  testMatch('exact matching numbers', 1, 1);
  testMatch('exact matching booleans', true, true);

  testMatch('abstract matching scalars', 0, false, { compare: 'General' });
  testMatch('abstract matching scalars', '', 0, { compare: 'General' });

  testMismatch('mismatching strings', 'test-string1', 'test-string2');
  testMismatch('mismatching numbers', 1, 2);
  testMismatch('mismatching booleans', true, false);
  testMismatch('scalars and composites - always mismatch', 'mismatch-me', ['mismatch-me']);

  testMismatch('mismatching types', 1, '1');
});
