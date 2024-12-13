import type {
  Value,
  SupportedType,
  StdObject,
  MapObject,
} from '../lib/types';

import { type Option } from '../lib/option';

export type ComparisonStatus = boolean | undefined;

export type CompareFunc<T extends Value = Value> = (left: T, right: T, options: Option) => ComparisonStatus;

export interface Comparer<T extends Value> {
  compare: (left: T, right: T) => boolean;
}

export interface ComparedItem {
  typeName: SupportedType,
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
export type ComparisonResult = Partial<Comparison>;

// Types for comparison options
import type { AtLeastOne, SetToUnion } from '../lib/types';
import { validateMinimalObject } from '../lib/util';

// Types
const CMP_OPTION_HELPER_TOKENS = ['Exact', 'General', 'Structure'] as const;
const cmpOptionHelperTokens = new Set([...CMP_OPTION_HELPER_TOKENS]);
export type CompareOptionHelperToken = SetToUnion<typeof cmpOptionHelperTokens>;

const CMP_SCALAR_TOKENS = ['strict', 'abstract', 'typeOnly', 'ignore'] as const; 
const CMP_OBJECT_TOKENS = ['reference', 'valueOnly', 'typeOnly', 'ignore'] as const;
const CMP_KEYED_OBJECT_TOKENS = ['keyValueOrder', 'keyValue', 'keyOrder', 'keyOnly'] as const;
const CMP_COLLECTION_TOKENS = ['valueOnly', 'sizeOnly'] as const;
const CMP_INDEXED_OBJECT_TOKENS = ['indexValue', 'valueOrder', 'valueOnly', 'indexOnly', 'sizeOnly'] as const;

const cmpScalarTokens = new Set([...CMP_SCALAR_TOKENS]);
const cmpStdObjectTokens = new Set([...CMP_OBJECT_TOKENS, ...CMP_KEYED_OBJECT_TOKENS]);
const cmpMapTokens = new Set([...CMP_OBJECT_TOKENS, ...CMP_KEYED_OBJECT_TOKENS, ...CMP_INDEXED_OBJECT_TOKENS]);
const cmpArrayTokens = new Set([...CMP_OBJECT_TOKENS, ...CMP_COLLECTION_TOKENS, ...CMP_INDEXED_OBJECT_TOKENS]);
const cmpSetTokens = new Set([...CMP_OBJECT_TOKENS, ...CMP_COLLECTION_TOKENS]);

// Create a type that can be a token or a function
type OptionType<T extends Set<string>> = SetToUnion<T> | CompareFunc;

export type CompareScalar = OptionType<typeof cmpScalarTokens>;
export type CompareObject = OptionType<typeof cmpStdObjectTokens>;
export type CompareArray = OptionType<typeof cmpArrayTokens>;
export type CompareMap = OptionType<typeof cmpMapTokens>;
export type CompareSet = OptionType<typeof cmpSetTokens>;

const cmpOptionTokens = new Set([
  ...CMP_OPTION_HELPER_TOKENS,
  ...CMP_SCALAR_TOKENS,
  ...CMP_OBJECT_TOKENS,
  ...CMP_KEYED_OBJECT_TOKENS,
  ...CMP_COLLECTION_TOKENS,
  ...CMP_INDEXED_OBJECT_TOKENS
] as const);

export type CompareOptionToken = SetToUnion<typeof cmpOptionTokens>;

export interface CompareOptionObject {
  compareScalar: CompareScalar
  compareObject: CompareObject
  compareMap: CompareMap
  compareArray: CompareArray
  compareSet: CompareSet
}

export type MinimalCompareOptionObject = AtLeastOne<CompareOptionObject>;
export type CompareOption = CompareOptionHelperToken | MinimalCompareOptionObject | CompareFunc;

export const isCompareFunction = (v: unknown): v is CompareFunc => typeof v === 'function' && v.length >= 3;

const mkValidator = <T>(tokenSet: Set<string>) => 
  (v: unknown): v is T => isCompareFunction(v) || tokenSet.has(v as string);

// Methods
export const isCompareOptionHelperToken = (v: unknown): v is CompareOptionHelperToken =>
  cmpOptionHelperTokens.has(v as CompareOptionHelperToken);
export const isCompareScalar = mkValidator<CompareScalar>(cmpScalarTokens);
export const isCompareObject = mkValidator<CompareObject>(cmpStdObjectTokens);
export const isCompareArray = mkValidator<CompareArray>(cmpArrayTokens);
export const isCompareMap = mkValidator<CompareMap>(cmpMapTokens);
export const isCompareSet = mkValidator<CompareSet>(cmpSetTokens);
export const isCompareOptionToken = mkValidator<CompareOptionToken>(cmpOptionTokens);

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
