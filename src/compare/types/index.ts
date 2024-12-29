import type {
  Value,
  Scalar,
  NonEmptyArray,
} from '../../lib/types';

import type Compare from '../../compare';

export type ComparisonStatus = boolean | undefined;

export type CompareFunction<T extends Value = Value> = (
  left: T,
  right: T,
  compareInstance: Compare
) => ComparisonStatus;

export const isCompareFunction = (v: unknown): v is CompareFunction =>
  typeof v === 'function' && v.length >= 2;

export interface Comparison {
  leftOnly: NonEmptyArray<ValueResult>,
  left: NonEmptyArray<ValueResult>,
  leftSame: NonEmptyArray<ValueResult>,
  rightSame: NonEmptyArray<ValueResult>,
  right: NonEmptyArray<ValueResult>,
  rightOnly: NonEmptyArray<ValueResult>,
};

// Returned from .compare()
export type CompareResult = Partial<Comparison>;

export type ValueResultProps = {
  index?: number,
  key?: Scalar,
  comparisonResult?: CompareResult,
};

export type ValueResult = {
  typeName: string,
  value: Value,
} & ValueResultProps;

