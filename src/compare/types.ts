import type {
  Scalar,
  Value,
  SupportedType,
  StdObject,
  MapObject,
} from '../lib/types';

import { type Option } from '../lib/option';

export interface CompareFunc {
  (left: Value, right: Value, options: Option): ComparisonResult;
};

export interface ComparedItem {
  typeName: SupportedType,
  value: Value,
  comparisonResult?: ComparisonResult,
};

export interface IndexedItem extends ComparedItem {
  index: number
};

export interface KeyedObjectItem<K extends Scalar> extends IndexedItem {
  key: K
};

export type StdObjectItem = KeyedObjectItem<keyof StdObject>;
export type MapObjectItem = KeyedObjectItem<keyof MapObject>;
export type ArrayObjectItem = IndexedItem;

export interface Comparison<T extends ComparedItem = ComparedItem> {
  leftOnly: Array<T>,
  left: Array<T>,
  leftSame: Array<T>,
  rightSame: Array<T>,
  right: Array<T>,
  rightOnly: Array<T>,
};

// Returned from .compare()
export type ComparisonResult = Partial<Comparison>;