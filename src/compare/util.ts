import type {
  StdObject,
  ReferenceObject,
  Value,
} from '../lib/types';

import {
  typeIsReference,
  actualType,
  type Comparison,
  type StdObjectItem,
  deriveType,
  ComparedItem,
} from './types';

// Utility methods for handling comparisons at runtime
export const valIsReference = (v: unknown): v is ReferenceObject => typeIsReference(actualType(v));

export const hasDifferences = (result: Partial<Comparison>): boolean =>
  Boolean(result.leftOnly) || Boolean(result.left) || Boolean(result.right) || Boolean(result.rightOnly);

export const valueToComparedItem = (value: Value): ComparedItem => ({ typeName: deriveType(value), value});

export const stdObjectEntriesByKey = (obj: StdObject): Record<string, StdObjectItem> => 
  Object.entries(obj).reduce((acc: Record<string, StdObjectItem>, [key, value], index) => {
    acc[key] = { key, index, ...valueToComparedItem(value) };
    return acc;
  }, {});

