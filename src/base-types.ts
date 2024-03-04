// TypeScript declarations for transpilations

// private type to work around self-reference restrictions
type ValueBase = NonNullable<unknown>;

export type Primitive = ValueBase & (string | number | boolean | undefined | symbol | bigint);

export type StdObject = Record<string, ValueBase>;
export type MapObject = Map<unknown, ValueBase>;
export type ArrayObject = Array<ValueBase>;
export type SetObject = Set<ValueBase>;

// Contains multiple values, accessed via keys
export type KeyedObject = StdObject | MapObject | ArrayObject;

// Contains multiple values, can be accessed in groups
export type CollectionObject = ArrayObject | SetObject;

export type ReferenceObject = KeyedObject | CollectionObject;

export type Value = ValueBase & (Primitive | ReferenceObject);

export type StdObjectEntry = [keyof StdObject, Value];

export type Status = boolean | undefined;

export interface CompareFunc<T extends Value = Value> {
  (left: T, right: T): Status;
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

export interface ValuePair<T extends Value = Value> {
  left: T,
  right: T
}

export type ComparisonData = Value;
export type Result = TupleOf<ComparisonData, 4>;

export interface Comparison {
  result: Result,
  status: Status,
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
