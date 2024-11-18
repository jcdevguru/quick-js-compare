import { type CompareFunc } from './types';
import { type AtLeastOne } from '../lib/types';
import { validateMinimalObject } from '../lib/util';
import { OptionError } from '../lib/error';

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

export type MinimalCompareOption = AtLeastOne<CompareOptionObject>;

export type CompareOption = CompareOptionToken | MinimalCompareOption | CompareFunc;

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

export const validateCompareOptionObject = (v: unknown): boolean => validateMinimalObject(v, {
    compareValue: isComparePrimitiveSpec,
    compareObject: isCompareObjectSpec,
    compareMap: isCompareObjectSpec,
    compareArray: isCompareCollectionSpec,
    compareSet: isCompareCollectionSpec,
  }
);

export const isMinimalCompareOptionObject = (v: unknown): v is MinimalCompareOption => {
  try {
    return validateCompareOptionObject(v);
  } catch {
    return false;
  }
};

export const isCompareOption = (v: unknown): v is CompareOption => (
  isCompareOptionToken(v) || isMinimalCompareOptionObject(v) || isCompareFunction(v)
);

export const validateCompareOption = (v: unknown): v is CompareOption => {  
  switch (typeof v) {
    case 'string':
      if (!isCompareOptionToken(v)) {
        throw new OptionError('String is not a valid render option', v);
      }
      break;

    case 'function':
      if (!isCompareFunction(v)) {
        throw new OptionError('Function is invalid compare option', v.toString());
      }
      break;

    default:
      try {
        if (!validateCompareOptionObject(v)) {
          throw new OptionError('Invalid compare option');
        }
      } catch (e) {
        throw new OptionError(e as string);
      }
  }
  return true;
};
