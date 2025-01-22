import {
  type Value,
  actualType,
} from '@lib/types';

import {
  type ValueResult,
  type ComparisonResult,
  type ValueResultProps,
  type ComparisonKey,
  isComparisonKey,
} from '@compare/types';

export const resultHasDifferences = (result: ComparisonResult): boolean =>
  Boolean(result.leftOnly) || Boolean(result.rightOnly) || Boolean(result.left) && Boolean(result.right);

export const resultHasSame = (result: ComparisonResult): boolean =>
  Boolean(result.leftSame) && Boolean(result.rightSame);

export const resultIsUndefined = (result: ComparisonResult): boolean =>
  !resultHasDifferences(result) && !resultHasSame(result);

export const resultIsValid = (result: ComparisonResult): boolean =>
  +resultIsUndefined(result) + +resultHasDifferences(result) + +resultHasSame(result) === 1;

export const valueToValueResult = (value: Value, props: ValueResultProps = {}): ValueResult =>
  ({ typeName: actualType(value), value, ...props });

export const mergeCompareResults = (target: ComparisonResult, source: ComparisonResult): ComparisonResult => {
  const sourceKeys: ComparisonKey[] = Object.keys(source).filter(isComparisonKey);

  sourceKeys.forEach(key => {
    target[key] = [...(target[key] ?? []), ...source[key]!];
  });

  if (source.subResult) {
    target.subResult = mergeCompareResults(target.subResult ?? {}, source.subResult);
  }

  return target;
};

