// These tests are for basic operations of the compare function

import { type MinimalConfigOptions } from '@lib/option';
import { verifyCompare, compareTestLabel } from '@test/util';

describe('compare - basic operations', () => {
  const exactOptions: MinimalConfigOptions = { compare: 'Exact' };

  test.only(compareTestLabel('exact matching strings', exactOptions), () => {
    verifyCompare('test-string1', 'test-string1', exactOptions, true);
  });

  test(compareTestLabel('exact matching numbers', exactOptions), () => {
    verifyCompare(1, 1, exactOptions, true);
  });

  test(compareTestLabel('exact matching booleans', exactOptions), () => {
    verifyCompare(true, true, exactOptions, true);
  });

  test(compareTestLabel('mismatching strings', exactOptions), () => {
    verifyCompare('test-string1', 'test-string2', exactOptions, false);
  });

  test(compareTestLabel('mismatching numbers', exactOptions), () => {
    verifyCompare(1, 2, exactOptions, false);
  });

  test(compareTestLabel('mismatching booleans', exactOptions), () => {
    verifyCompare(true, false, exactOptions, false);
  });

  test(compareTestLabel('abstract matching scalars 1', { compare: 'General' }), () => {
    verifyCompare(0, false, { compare: 'General' }, true);
  });

  test(compareTestLabel('abstract matching scalars 2', { compare: 'General' }), () => {
    verifyCompare('', 0, { compare: 'General' }, true);
  });

  test(compareTestLabel('scalar type only', { compare: { compareScalar: 'typeOnly' } }), () => {
    verifyCompare(1, 91, { compare: { compareScalar: 'typeOnly' } }, true);
  });

  test(compareTestLabel('array type only', { compare: { compareArray: 'typeOnly' } }), () => {
    verifyCompare([1, 2, 3], ['abc'], { compare: { compareArray: 'typeOnly' } }, true);
  });

  test(compareTestLabel('scalars and composites - always mismatch', exactOptions), () => {
    verifyCompare('mismatch-me', ['mismatch-me'], exactOptions, false);
  });

  test(compareTestLabel('mismatching scalar types', exactOptions), () => {
    verifyCompare(1, '1', exactOptions, false);
  });
});
