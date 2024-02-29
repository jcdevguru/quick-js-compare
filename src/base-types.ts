// TypeScript declarations for transpilations

// private type to work around self-reference restrictions to CompareItem
type CompareItemBase = NonNullable<unknown>;

export type Primitive = CompareItemBase & (string | number | boolean | undefined | symbol | bigint);

export type StdObject = Record<string, CompareItemBase>;
export type MapObject = Map<unknown, CompareItemBase>;
export type ArrayObject = Array<CompareItemBase>;
export type SetObject = Set<CompareItemBase>;

// Contains multiple values, accessed via keys
export type KeyedObject = StdObject | MapObject | ArrayObject;

// Contains multiple values, can be accessed in groups
export type CollectionObject = ArrayObject | SetObject;

export type ReferenceObject = KeyedObject | CollectionObject;

export type CompareItem = CompareItemBase & (Primitive | ReferenceObject);

export type StdObjectEntry = [keyof StdObject, CompareItem];

export type ComparisonStatus = boolean | undefined;

export interface CompareFunc<T extends CompareItem = CompareItem> {
  (left: T, right: T): ComparisonStatus;
}

export type PrimitiveCompareFunc = CompareFunc<Primitive>;
export type StdObjectCompareFunc = CompareFunc<StdObjectEntry>;
export type MapObjectCompareFunc = CompareFunc<MapObject>;
export type SetObjectCompareFunc = CompareFunc<SetObject>;

type TupleOf<T, N extends number, A extends unknown[] = []> = A extends { length: N } ? A : TupleOf<T, N, [...A, T]>;

export enum ComparisonDataIndex {
  Left = 0,
  LeftSame = 1,
  RightSame = 2,
  Right = 3,
}

export interface CompareItemPair {
  left: CompareItem,
  right: CompareItem
}

export type ComparisonData = Array<CompareItem>;
export type ComparisonResult = TupleOf<ComparisonData, 4>;

export interface Comparison {
  result: ComparisonResult,
  status: ComparisonStatus,
}

// for objects with enumerable values
export interface IndexValue {
  index: number
  value: CompareItem
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
