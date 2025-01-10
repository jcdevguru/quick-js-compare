// These tests are for basic operations of the compare function

import { type MinimalConfigOptions } from '@lib/option';
import { type Value } from '@lib/types';
import { verifyCompare, compareTestLabel } from '@test/util';

describe('compare - basic operations', () => {
  const testMatch = (testName: string, left: Value, right: Value, options: MinimalConfigOptions) => {
    test(compareTestLabel(testName, options), () => {
      verifyCompare(left, right, options, true);
    });
  };
  
  const testMismatch = (testName: string, left: Value, right: Value, options: MinimalConfigOptions) => {
    test(compareTestLabel(testName, options), () => {
      verifyCompare(left, right, options, false);
    });
  };

  const exactOptions: MinimalConfigOptions = { compare: 'Exact' };

  testMatch('exact matching strings', 'test-string1', 'test-string1', exactOptions);
  testMatch('exact matching numbers', 1, 1, exactOptions);
  testMatch('exact matching booleans', true, true, exactOptions);

  testMismatch('mismatching strings', 'test-string1', 'test-string2', exactOptions);
  testMismatch('mismatching numbers', 1, 2, exactOptions);
  testMismatch('mismatching booleans', true, false, exactOptions);

  testMatch('abstract matching scalars 1', 0, false, { compare: 'General' });
  testMatch('abstract matching scalars 2', '', 0, { compare: 'General' });

  testMatch('scalar type only', 1, 91, { compare: { compareScalar: 'typeOnly' } });
  testMatch('array type only', [1, 2, 3], ['abc'], { compare: { compareArray: 'typeOnly' } });

  testMismatch('scalars and composites - always mismatch', 'mismatch-me', ['mismatch-me'], exactOptions);
  testMismatch('mismatching scalar types', 1, '1', exactOptions);
});
