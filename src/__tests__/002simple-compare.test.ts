// These tests that are for validations and functinos of
// compare options provided through the top-level function

import Compare from '../compare';
import { type RawOption } from '../lib/option';
import { type Value } from '../lib/types';

describe('successful compare', () => {
  const testLabel = (testName: string, options?: RawOption) => {
    if (!options) {
      return `${testName} (no options)`;
    }
    const optionString = typeof options.compare == 'string' ? options.compare : JSON.stringify(options.compare);

    return `${testName} (compare options: ${optionString})`;
  };

  const testMatchingCompare = (testName: string, left: Value, right: Value, options?: RawOption) => {
    test(testLabel(testName, options), () => {
      const c = new Compare(options);
      const r = c.compare(left, right).result;
      expect(r).toBeInstanceOf(Object);
      expect(r?.leftSame?.[0]?.value).toEqual(left);
      expect(r?.rightSame?.[0]?.value).toEqual(right);
      expect(r?.left).toBeUndefined();
      expect(r?.right).toBeUndefined();
      expect(r?.leftOnly).toBeUndefined();
      expect(r?.rightOnly).toBeUndefined();
    });
  };

  const testMismatchingCompare = (testName: string, left: Value, right: Value, options?: RawOption) => {
    test(testLabel(testName, options), () => {
      const c = new Compare(options);
      const r = c.compare(left, right).result;
      expect(r).toBeInstanceOf(Object);
      expect(r?.leftSame).toBeUndefined();
      expect(r?.rightSame).toBeUndefined();
      expect(r?.left?.[0].value).toEqual(left);
      expect(r?.right?.[0].value).toEqual(right);
      expect(r?.leftOnly).toBeUndefined();
      expect(r?.rightOnly).toBeUndefined();
    });
  };

  testMatchingCompare('exact matching strings', 'test-string1', 'test-string1');
  testMatchingCompare('exact matching numbers', 1, 1);
  testMatchingCompare('exact matching booleans', true, true);

  testMatchingCompare('abstract matching scalars', 0, false, { compare: 'General' });
  testMatchingCompare('abstract matching scalars', 0, false, { compare: 'General' });

  testMismatchingCompare('mismatching strings', 'test-string1', 'test-string2');
  testMismatchingCompare('mismatching numbers', 1, 2);
  testMismatchingCompare('mismatching booleans', true, false);

  testMismatchingCompare('mismatching types', 1, '1');
});
