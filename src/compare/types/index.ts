import type Compare from '@compare';
import type { Value, ObjectKey } from '@lib/types';

export type ComparisonStatus = boolean | undefined;

export type CompareFunction<T extends Value = Value> = (
  left: T,
  right: T,
  instance: Compare
) => ComparisonStatus;

export const isCompareFunction = (v: unknown): v is CompareFunction =>
  typeof v === 'function' && v.length >= 2;

export type ValueResults = Array<ValueResult>;

export const comparisonKeys = ['leftOnly', 'left', 'leftSame', 'rightSame', 'right', 'rightOnly'] as const;
export type ComparisonKey = typeof comparisonKeys[number];
export type Comparison = Record<ComparisonKey, ValueResults>;

export const isComparisonKey = (key: string): key is ComparisonKey =>
  comparisonKeys.includes(key as ComparisonKey);

// Returned from .compare()
export type CompareResult = Partial<Comparison> & {
  subResult?: CompareResult,
};

export type CompareResultKey = keyof CompareResult;

export type ValueResultProps = {
  index?: number,
  key?: ObjectKey,
};

export type ValueResult = {
  typeName: string,
  value: Value,
} & ValueResultProps;
