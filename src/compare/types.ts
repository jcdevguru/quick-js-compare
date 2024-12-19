import type {
  AtLeastOne,
  Value,
  Scalar,
} from '../lib/types';

import {
  validateMinimalObject,
  defineUnionForType,
  validateObject,
} from '../lib/util';

import Compare from '.';

export type ComparisonStatus = boolean | undefined;

export type CompareFunction<T extends Value = Value> = (
  left: T,
  right: T,
  compareInstance: Compare,
  compositeComparisonResult: CompareResult
) => ComparisonStatus;

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

// Types
const cmpOptionHelperTokenUnion = defineUnionForType('Exact', 'Equivalent', 'General', 'Structure');
export type CompareOptionHelperToken = typeof cmpOptionHelperTokenUnion.type[number];

const CMP_GENERAL_TOKENS = ['strict', 'typeOnly', 'alwaysSame', 'alwaysDifferent', 'alwaysUndefined'] as const;

const CMP_SCALAR_TOKENS = [ ...CMP_GENERAL_TOKENS, 'abstract'] as const;
const CMP_GENERAL_COMPOSITE_TOKENS = [...CMP_GENERAL_TOKENS, 'reference'] as const;

const CMP_KEYED_OBJECT_TOKENS = [...CMP_GENERAL_COMPOSITE_TOKENS, 'keyValueOrder', 'keyValue', 'keyOrder', 'keyOnly'] as const;
const CMP_COLLECTION_TOKENS = [...CMP_GENERAL_COMPOSITE_TOKENS, 'valuesOnly', 'sizeOnly'] as const;
const CMP_ORDERED_OBJECT_TOKENS = [...CMP_GENERAL_COMPOSITE_TOKENS, 'valueOrder'] as const;

const CMP_COMPOSITE_TOKENS = [...CMP_KEYED_OBJECT_TOKENS, ...CMP_COLLECTION_TOKENS, ...CMP_ORDERED_OBJECT_TOKENS] as const;

const cmpScalarTokenUnion = defineUnionForType(...CMP_SCALAR_TOKENS);
export type CompareScalarToken = typeof cmpScalarTokenUnion.type[number];

const cmpCompositeTokenUnion = defineUnionForType(...CMP_KEYED_OBJECT_TOKENS, ...CMP_COLLECTION_TOKENS, ...CMP_ORDERED_OBJECT_TOKENS);
export type CompareCompositeToken = typeof cmpCompositeTokenUnion.type[number];

const cmpMapTokenUnion = defineUnionForType(...CMP_KEYED_OBJECT_TOKENS, ...CMP_ORDERED_OBJECT_TOKENS);
export type CompareMapToken = typeof cmpMapTokenUnion.type[number];

const cmpArrayTokenUnion = defineUnionForType(...CMP_COLLECTION_TOKENS, ...CMP_ORDERED_OBJECT_TOKENS);
export type CompareArrayToken = typeof cmpArrayTokenUnion.type[number];

const cmpSetTokenUnion = defineUnionForType(...CMP_COLLECTION_TOKENS);
export type CompareSetToken = typeof cmpSetTokenUnion.type[number];

const cmpTokenUnion = defineUnionForType(...CMP_SCALAR_TOKENS, ...CMP_COMPOSITE_TOKENS);
export type CompareOptionToken = typeof cmpTokenUnion.type[number];

// Create a type that can be a token or a function
export type CompareScalar = CompareScalarToken | CompareFunction;
export type CompareObject = CompareCompositeToken | CompareFunction;
export type CompareArray = CompareArrayToken | CompareFunction;
export type CompareMap = CompareMapToken | CompareFunction;
export type CompareSet = CompareSetToken | CompareFunction;

export interface CompareOptionObject {
  compareScalar: CompareScalar
  compareObject: CompareObject
  compareMap: CompareMap
  compareArray: CompareArray
  compareSet: CompareSet
}

export interface CompareOptionMethodObject extends CompareOptionObject {
  compareScalar: CompareFunction
  compareObject: CompareFunction
  compareMap: CompareFunction
  compareArray: CompareFunction
  compareSet: CompareFunction
}

export type MinimalCompareOptionObject = AtLeastOne<CompareOptionObject>;
export type CompareOption = CompareFunction | CompareOptionMethodObject;
export type RawCompareOption = CompareOptionHelperToken | MinimalCompareOptionObject | CompareFunction;

export const isCompareFunction = (v: unknown): v is CompareFunction => typeof v === 'function' && v.length >= 2 && v.length <= 4;
export const isCompareOptionHelperToken = (v: unknown): v is CompareOptionHelperToken => cmpOptionHelperTokenUnion.is(v as string);
export const isCompareScalarToken = (v: unknown): v is CompareScalarToken => cmpScalarTokenUnion.is(v as string);
export const isCompareObjectToken = (v: unknown): v is CompareObject => cmpCompositeTokenUnion.is(v as string);
export const isCompareArrayToken = (v: unknown): v is CompareArray => cmpArrayTokenUnion.is(v as string);
export const isCompareMapToken = (v: unknown): v is CompareMapToken => cmpMapTokenUnion.is(v as string);
export const isCompareSetToken = (v: unknown): v is CompareSetToken => cmpSetTokenUnion.is(v as string);
export const isCompareOptionToken = (v: unknown): v is CompareOptionToken => cmpTokenUnion.is(v as string);

const isCompareScalar = (v: unknown): v is CompareScalar => isCompareScalarToken(v) || isCompareFunction(v);
const isCompareObject = (v: unknown): v is CompareObject => isCompareObjectToken(v) || isCompareFunction(v);
const isCompareMap = (v: unknown): v is CompareMap => isCompareMapToken(v) || isCompareFunction(v);
const isCompareArray = (v: unknown): v is CompareArray => isCompareArrayToken(v) || isCompareFunction(v);
const isCompareSet = (v: unknown): v is CompareSet => isCompareSetToken(v) || isCompareFunction(v);

export const validateMinimalCompareOptionObject = (v: unknown): v is MinimalCompareOptionObject => validateMinimalObject(v, {
    compareScalar: isCompareScalar,
    compareObject: isCompareObject,
    compareMap: isCompareMap,
    compareArray: isCompareArray,
    compareSet: isCompareSet,
  }
);

export const validateCompareOptionMethodObject = (v: unknown): v is CompareOptionMethodObject => validateObject(v, {
  compareScalar: isCompareFunction,
  compareObject: isCompareFunction,
  compareMap: isCompareFunction,
  compareArray: isCompareFunction,
  compareSet: isCompareFunction,
}
);

export const isMinimalCompareOptionObject = (v: unknown): v is MinimalCompareOptionObject => {
  try {
    return validateMinimalCompareOptionObject(v);
  } catch {
    return false;
  }
};

export const isCompareOptionMethodObject = (v: unknown): v is CompareOptionMethodObject => {
  try {
    return validateCompareOptionMethodObject(v);
  } catch {
    return false;
  }
};

export const isRawCompareOption = (v: unknown): v is RawCompareOption =>
  isCompareOptionHelperToken(v) || isMinimalCompareOptionObject(v) || isCompareFunction(v);

export const isCompareOption = (v: unknown): v is CompareOption =>
  isCompareOptionMethodObject(v) || isCompareFunction(v);

export type ValueResultProps = {
  index?: number,
  key?: Scalar,
  comparisonResult?: CompareResult,
};

export type ValueResult = {
  typeName: string,
  value: Value,
} & ValueResultProps;

