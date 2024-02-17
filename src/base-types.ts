// TypeScript declarations for transpilations
export type Primitive = string | number | boolean | undefined | null | symbol | bigint;

export type StdObject = Record<string, unknown>;
export type MapObject = Map<unknown, unknown>;
export type ArrayObject = Array<unknown>;
export type SetObject = Set<unknown>;

// Contains multiple values, accessed via keys
export type KeyedObject = StdObject | MapObject | ArrayObject;

// Contains multiple values, can be accessed in groups
export type CollectionObject = ArrayObject | SetObject;

export type CompareItem = Primitive | StdObject | ArrayObject | MapObject | SetObject;

export type StdObjectEntry = [keyof StdObject, CompareItem];
export type StdObjectEntries = Array<StdObjectEntry>;

export interface BaseCompareFunc {
  (left: CompareItem, right: CompareItem): boolean;
}

export interface CompareFunc<T extends CompareItem> extends BaseCompareFunc {
  (left: T, right: T): boolean;
}

export type PrimitiveCompareFunc = CompareFunc<Primitive>;
export type StdObjectCompareFunc = CompareFunc<StdObjectEntry>;
export type MapObjectCompareFunc = CompareFunc<MapObject>;
export type CollectionCompareFunc = CompareFunc<CollectionObject>;

export interface CompareResult {
  left: CompareItem
  right: CompareItem
  same?: CompareItem
}
