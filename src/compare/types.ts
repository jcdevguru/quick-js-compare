import type {
  Primitive,
  StdObjectEntry,
  MapObject,
  SetObject,
  Value
} from '../lib/types';

import { type Option } from '../lib/option';

// private type to work around self-reference restrictions

export type PrimitiveCompareFunc = CompareFunc<Primitive>;
export type StdObjectCompareFunc = CompareFunc<StdObjectEntry>;
export type MapObjectCompareFunc = CompareFunc<MapObject>;
export type SetObjectCompareFunc = CompareFunc<SetObject>;

export interface Comparison<T extends Value = Value> {
  leftOnly: T,
  left: T,
  leftSame: T,
  rightSame: T,
  right: T,
  rightOnly: T,
}

export type ComparisonResult<T extends Value = Value> = Partial<Comparison<T>>;

export interface CompareFunc<T extends Value = Value> {
  (left: T, right: T, options: Option): ComparisonResult<T>;
}

// for objects with enumerable values
export interface IndexValue {
  index: number
  value: Value
}

export interface KeyIndexValue {
  key: string
  indexValue: IndexValue
}

export interface IndexValueCompareOp {
  key: string
  leftIndexValue: IndexValue
  rightIndexValue: IndexValue
}

