// These tests that are for validations and functinos of
// compare options provided through the top-level function

import Compare from '../compare';
import { type MinimalConfigOptions } from '../lib/option';
import { type Value } from '../lib/types';
import { compareTestLabel } from './util';

describe('successful compare', () => {
  
  const testMismatchingSet = (testName: string, left: Value, right: Value, options?: MinimalConfigOptions) => {
    test(compareTestLabel(testName, options), () => {
      const c = new Compare(options);
      expect(c.compare(left, right).result).toStrictEqual({
        left: [expect.objectContaining({value: left})],
        right: [expect.objectContaining({value: right})]
      });
    });
  };

  const testMatchingSet = (testName: string, left: Value, right: Value, options?: MinimalConfigOptions) => {
    test(compareTestLabel(testName, options), () => {
      const c = new Compare(options);
      expect(c.compare(left, right).result).toStrictEqual({
        leftSame: [expect.objectContaining({value: left})],
        rightSame: [expect.objectContaining({value: right})]
      });
    });
  };

  testMismatchingSet('mismatching sets', new Set([1, 2, 3]), new Set([1, 2, 4]), { compare: { compareSet: 'valuesOnly' } });
  testMatchingSet('matching sets', new Set([1, 2, 3]), new Set([1, 2, 3]), { compare: { compareSet: 'valuesOnly' } });
});
