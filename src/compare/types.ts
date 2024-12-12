import type {
  AtLeastOne,
  Value,
  SupportedType,
  StdObject,
  MapObject,
} from '../lib/types';

import {
  validateMinimalObject,
  defineUnionForType,
} from '../lib/util';

import { type Option } from '../lib/option';

export type ComparisonStatus = boolean | undefined;

export type CompareFunc<T extends Value = Value> = (left: T, right: T, options: Option) => ComparisonStatus;

export interface Comparer<T extends Value> {
  compare: (left: T, right: T) => boolean;
}

export interface ComparedItem {
  typeName: string,
  value: Value,
  comparisonResult?: ComparisonResult,
};

export interface IndexedItem extends ComparedItem {
  index: number
};

export interface KeyedObjectItem<K> extends IndexedItem {
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
export type ComparisonResult<T extends ComparedItem = ComparedItem> = Partial<Comparison<T>>;

export interface ComparisonResultGenerator<T extends ComparedItem = ComparedItem> {
  (typeName: SupportedType, value: Value, options: Option): ComparisonResult<T>;
}

// Types
const cmpOptionHelperTokenUnion = defineUnionForType('Exact', 'General', 'Structure');
export type CompareOptionHelperToken = typeof cmpOptionHelperTokenUnion.type[number];

const CMP_COMPOSITE_TOKENS = ['reference', 'valueOnly', 'typeOnly', 'ignore'];
const CMP_KEYED_OBJECT_TOKENS = ['keyValueOrder', 'keyValue', 'keyOrder', 'keyOnly'];
const CMP_COLLECTION_TOKENS = ['valueOnly', 'sizeOnly'];
const CMP_INDEXED_OBJECT_TOKENS = ['indexValue', 'valueOrder', 'valueOnly', 'indexOnly', 'sizeOnly'];

const cmpScalarTokenUnion = defineUnionForType('strict', 'abstract', 'typeOnly', 'ignore');
export type CompareScalarToken = typeof cmpScalarTokenUnion.type[number];

const cmpCompositeTokenUnion = defineUnionForType(...CMP_COMPOSITE_TOKENS, ...CMP_KEYED_OBJECT_TOKENS);
export type CompareCompositeToken = typeof cmpCompositeTokenUnion.type[number];

const cmpMapTokenUnion = defineUnionForType(...CMP_COMPOSITE_TOKENS, ...CMP_KEYED_OBJECT_TOKENS, ...CMP_INDEXED_OBJECT_TOKENS);
export type CompareMapToken = typeof cmpMapTokenUnion.type[number];

const cmpArrayTokenUnion = defineUnionForType(...CMP_COMPOSITE_TOKENS, ...CMP_COLLECTION_TOKENS, ...CMP_INDEXED_OBJECT_TOKENS);
export type CompareArrayToken = typeof cmpArrayTokenUnion.type[number];

const cmpSetTokenUnion = defineUnionForType(...CMP_COMPOSITE_TOKENS, ...CMP_COLLECTION_TOKENS);
export type CompareSetToken = typeof cmpSetTokenUnion.type[number];

// Create a type that can be a token or a function
export type CompareScalar = CompareScalarToken | CompareFunc;
export type CompareObject = CompareCompositeToken | CompareFunc;
export type CompareArray = CompareArrayToken | CompareFunc;
export type CompareMap = CompareMapToken | CompareFunc;
export type CompareSet = CompareSetToken | CompareFunc;

export type CompareOptionToken = CompareScalarToken | CompareCompositeToken | CompareMapToken | CompareArrayToken | CompareSetToken;

export interface CompareOptionObject {
  compareScalar: CompareScalar
  compareObject: CompareObject
  compareMap: CompareMap
  compareArray: CompareArray
  compareSet: CompareSet
}

export interface CompareOptionMethodObject extends CompareOptionObject {
  compareScalar: CompareFunc
  compareObject: CompareFunc
  compareMap: CompareFunc
  compareArray: CompareFunc
  compareSet: CompareFunc
}

export type ComparerFromOptionMethodObject = (compareOptionMethodObject: CompareOptionMethodObject) => CompareFunc;

export type MinimalCompareOptionObject = AtLeastOne<CompareOptionObject>;
export type CompareOption = CompareOptionHelperToken | MinimalCompareOptionObject | CompareFunc;

export const isCompareFunction = (v: unknown): v is CompareFunc => typeof v === 'function' && v.length >= 3;
export const isCompareOptionHelperToken = (v: unknown): v is CompareOptionHelperToken => cmpOptionHelperTokenUnion.is(v as string);
export const isCompareScalarToken = (v: unknown): v is CompareScalarToken => cmpScalarTokenUnion.is(v as string);
export const isCompareObjectToken = (v: unknown): v is CompareObject => cmpCompositeTokenUnion.is(v as string);
export const isCompareArrayToken = (v: unknown): v is CompareArray => cmpArrayTokenUnion.is(v as string);
export const isCompareMapToken = (v: unknown): v is CompareMapToken => cmpMapTokenUnion.is(v as string);
export const isCompareSetToken = (v: unknown): v is CompareSetToken => cmpSetTokenUnion.is(v as string);
export const isCompareOptionToken = (v: unknown): v is CompareOptionToken => 
  isCompareScalarToken(v) || isCompareObjectToken(v) || isCompareMapToken(v) || isCompareArrayToken(v) || isCompareSetToken(v);

const isCompareScalar = (v: unknown): v is CompareScalar => isCompareScalarToken(v) || isCompareFunction(v);
const isCompareObject = (v: unknown): v is CompareObject => isCompareObjectToken(v) || isCompareFunction(v);
const isCompareMap = (v: unknown): v is CompareMap => isCompareMapToken(v) || isCompareFunction(v);
const isCompareArray = (v: unknown): v is CompareArray => isCompareArrayToken(v) || isCompareFunction(v);
const isCompareSet = (v: unknown): v is CompareSet => isCompareSetToken(v) || isCompareFunction(v);

export const validateCompareOptionObject = (v: unknown): boolean => validateMinimalObject(v, {
    compareScalar: isCompareScalar,
    compareObject: isCompareObject,
    compareMap: isCompareMap,
    compareArray: isCompareArray,
    compareSet: isCompareSet,
  }
);

export const isMinimalCompareOptionObject = (v: unknown): v is MinimalCompareOptionObject => {
  try {
    return validateCompareOptionObject(v);
  } catch {
    return false;
  }
};

export const isCompareOption = (v: unknown): v is CompareOption =>
  isCompareOptionHelperToken(v) || isMinimalCompareOptionObject(v) || isCompareFunction(v);
