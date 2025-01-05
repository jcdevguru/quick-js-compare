import {
  type Value,
  actualType,
} from '../lib/types';

import type {
  ValueResult,
  CompareResult,
  ValueResultProps,
  ComparisonKey,
} from './types';

export const resultHasDifferences = (result: CompareResult): boolean =>
  Boolean(result.leftOnly) || Boolean(result.rightOnly) || Boolean(result.left) && Boolean(result.right);

export const resultHasSame = (result: CompareResult): boolean =>
  Boolean(result.leftSame) && Boolean(result.rightSame);

export const resultIsUndefined = (result: CompareResult): boolean =>
  !resultHasDifferences(result) && !resultHasSame(result);

export const resultIsValid = (result: CompareResult): boolean =>
  +resultIsUndefined(result) + +resultHasDifferences(result) + +resultHasSame(result) === 1;

export const valueToValueResult = (value: Value, props: ValueResultProps = {}): ValueResult =>
  ({ typeName: actualType(value), value, ...props });

export const mergeCompareResults = (target: CompareResult, source: CompareResult): void => {
  const keys: ComparisonKey[] = Object.keys(target) as ComparisonKey[];

  keys.forEach(key => {
    if (source[key]) {
      target[key] = [...(target[key] ?? []), ...source[key]!];
    }
  });

  if (source.subResult) {
    mergeCompareResults(target.subResult ?? {}, source.subResult);
  }
};

