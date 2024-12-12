import {
  isComposite,
  actualType,
  type StdObject,
  type Composite,
  type Value,
} from '../lib/types';

import type {
  Comparison,
  StdObjectItem,
  ComparedItem,
  ComparisonResult,
  CompareFunc,
} from './types';

import { Option } from '../lib/option';
// Utility methods for handling comparisons at runtime
export const valIsReference = (v: unknown): v is Reference => isReference(actualType(v));

export const hasDifferences = (result: Partial<Comparison>): boolean =>
  Boolean(result.leftOnly) || Boolean(result.left) || Boolean(result.right) || Boolean(result.rightOnly);

export const valueToComparedItem = (value: Value): ComparedItem => ({ typeName: actualType(value), value});

export const stdObjectEntriesByKey = (obj: StdObject): Record<string, StdObjectItem> => 
  Object.entries(obj).reduce((acc: Record<string, StdObjectItem>, [key, value], index) => {
    acc[key] = { key, index, ...valueToComparedItem(value) };
    return acc;
  }, {});

// incomplete
export const wrapComparer = (comparer: CompareFunc) => <T extends ComparisonResult>(left: Value, right: Value, options: Option): T => {
  const comparisonStatus = comparer(left, right, options);
  const result: T = {} as T;

  switch (comparisonStatus) {
    case true:
      result.leftSame = [];
      result.rightSame = [];
      break;
    case false:
      result.left = [];
      result.right = [];
      break;
  }
  return result;
};
