import {
  actualType,
  type Value,
} from '../lib/types';

import type {
  ValueResult,
  CompareResult,
  ValueResultProps,
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

export const mergeComparisonResults = (
  mergeTo: CompareResult, 
  from: CompareResult, 
  keys?: Array<keyof CompareResult>
): CompareResult => {
  if (!keys) {
    keys = Object.keys(from) as Array<keyof CompareResult>;
  }
  keys.forEach((key) => {
    mergeTo[key] = [...(mergeTo[key] ?? []), ...(from[key] ?? [])];
  });
  
  return mergeTo;
};
