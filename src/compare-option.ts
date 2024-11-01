import type {
  CompareFunc,
} from './compare-types';

import {
  verifyObject,
  type AtLeastOne,
} from './util';

import OptionError from './error-classes/option-error';

// Types

const COMPARE_OPTION_TOKENS = ['Exact', 'General', 'ExactStructure', 'GeneralStructure'] as const;
export type CompareOptionToken = typeof COMPARE_OPTION_TOKENS[number];

const CMP_PRIMITIVE_TOKENS = ['strict', 'abstract', 'typeOnly', 'ignore'] as const;
export type CmpPrimitiveToken = typeof CMP_PRIMITIVE_TOKENS[number];

const CMP_OBJECT_TOKENS = ['reference', 'valueOnly', 'ignore'] as const;
export type CmpObjectToken = typeof CMP_OBJECT_TOKENS[number];

const CMP_KEYED_OBJECT_TOKENS = ['keyValueOrder', 'keyValue', 'keyOrder', 'keyOnly'] as const;
export type CmpKeyedObjectToken = typeof CMP_KEYED_OBJECT_TOKENS[number];

const CMP_COLLECTION_TOKENS = ['valueOrder', 'valueOnly', 'sizeOnly'] as const;
export type CmpCollectionToken = typeof CMP_COLLECTION_TOKENS[number];

export type CompareValueSpec = CmpPrimitiveToken;
export type CompareObjectSpec = CmpObjectToken | CmpKeyedObjectToken;
export type CompareCollectionSpec = CmpObjectToken | CmpCollectionToken;

export interface CompareOptionObject {
  compareValue: CompareValueSpec
  compareObject: CompareObjectSpec
  compareMap: CompareObjectSpec
  compareArray: CompareCollectionSpec
  compareSet: CompareCollectionSpec
}

export type MinimalCompareOptionObject = AtLeastOne<CompareOptionObject>;

export type CompareAppOption = CompareOptionToken | MinimalCompareOptionObject | CompareFunc;

// Methods
export const isCompareOptionToken = (v: unknown): v is CompareOptionToken => COMPARE_OPTION_TOKENS.includes(v as CompareOptionToken);

export const isComparePrimitiveSpec = (v: unknown): v is CompareValueSpec => CMP_PRIMITIVE_TOKENS.includes(v as CmpPrimitiveToken);

export const isCompareObjectSpec = (v: unknown): v is CompareObjectSpec => (
  CMP_OBJECT_TOKENS.includes(v as CmpObjectToken) || CMP_KEYED_OBJECT_TOKENS.includes(v as CmpKeyedObjectToken)
);

export const isCompareCollectionSpec = (v: unknown): v is CompareCollectionSpec => (
  CMP_OBJECT_TOKENS.includes(v as CmpObjectToken) || CMP_COLLECTION_TOKENS.includes(v as CmpCollectionToken)
);

export const isCompareFunction = (v: unknown): v is CompareFunc => typeof v === 'function' && v.length >= 3;

export const isMinimalCompareOptionObject = (v: unknown, errs?: Array<string>): v is MinimalCompareOptionObject => verifyObject(v, {
  compareValue: isComparePrimitiveSpec,
  compareObject: isCompareObjectSpec,
  compareMap: isCompareObjectSpec,
  compareArray: isCompareCollectionSpec,
  compareSet: isCompareCollectionSpec,
}, true, errs);

export const isCompareAppOption = (v: unknown): v is CompareAppOption => (
  isCompareOptionToken(v) || isMinimalCompareOptionObject(v) || isCompareFunction(v)
);

export const validateCompareAppOption = (v: unknown): v is CompareAppOption => {
  const errors: Array<string> = [];

  if (isCompareOptionToken(v)) {
    return true;
  }

  if (isCompareFunction(v)) {
    return true;
  }

  if (!isMinimalCompareOptionObject(v, errors)) {
    let s = 'compare option object is not valid';
    if (errors.length) {
      s = `${s}: errors: ${errors.join(', ')}`;
    }
    throw new OptionError(s);
  }

  return true;
};
