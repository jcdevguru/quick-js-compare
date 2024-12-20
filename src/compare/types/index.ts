import type {
  Value,
  Scalar,
} from '../../lib/types';

import Compare from '../../compare';

export type ComparisonStatus = boolean | undefined;

export type CompareFunction<T extends Value = Value> = (
  left: T,
  right: T,
  compareInstance: Compare,
  compositeComparisonResult: CompareResult
) => ComparisonStatus;

export const isCompareFunction = (v: unknown): v is CompareFunction => typeof v === 'function' && v.length >= 2 && v.length <= 4;

export interface Comparison {
  leftOnly: Array<ValueResult>,
  left: Array<ValueResult>,
  leftSame: Array<ValueResult>,
  rightSame: Array<ValueResult>,
  right: Array<ValueResult>,
  rightOnly: Array<ValueResult>,
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

