import type Compare from '@compare';
import type { Value, NonEmptyArray, ObjectKey } from '@lib/types';

export type ComparisonStatus = boolean | undefined;

export type CompareFunction<T extends Value = Value> = (
  left: T,
  right: T,
  compareInstance: Compare
) => ComparisonStatus;

export const isCompareFunction = (v: unknown): v is CompareFunction =>
  typeof v === 'function' && v.length >= 2;

export type ValueResults = NonEmptyArray<ValueResult>;

export interface Comparison {
  leftOnly: ValueResults,
  left: ValueResults,
  leftSame: ValueResults,
  rightSame: ValueResults,
  right: ValueResults,
  rightOnly: ValueResults,
};

// Returned from .compare()
export type CompareResult = Partial<Comparison> & {
  subResult?: CompareResult,
};

export type ComparisonKey = keyof Comparison;
export type CompareResultKey = keyof CompareResult;

export type ValueResultProps = {
  index?: number,
  key?: ObjectKey,
};

export type ValueResult = {
  typeName: string,
  value: Value,
} & ValueResultProps;
