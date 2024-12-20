import type { AtLeastOne } from '../../lib/types';
import { OptionError } from '../../lib/error';

import {
  validateMinimalObject,
  defineUnionForType,
  validateObject,
} from '../../lib/util';  

import { 
  type CompareFunction,
  isCompareFunction,
} from '.';

const cmpOptionAliasUnion = defineUnionForType('Exact', 'Equivalent', 'General', 'Structure');
export type CompareOptionAlias = typeof cmpOptionAliasUnion.type[number];

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

export interface CompareConfigOptions {
  compareScalar: CompareScalar
  compareObject: CompareObject
  compareMap: CompareMap
  compareArray: CompareArray
  compareSet: CompareSet
}

export interface CompareMethodConfig {
  compareScalarMethod: CompareFunction
  compareObjectMethod: CompareFunction
  compareMapMethod: CompareFunction
  compareArrayMethod: CompareFunction
  compareSetMethod: CompareFunction
}

export type MinimalCompareConfigOptions = AtLeastOne<CompareConfigOptions>;
export type CompareConfig = CompareFunction | CompareMethodConfig;
export type CompareOptions = CompareOptionAlias | MinimalCompareConfigOptions | CompareFunction;

export const isCompareOptionAlias = (v: unknown): v is CompareOptionAlias => cmpOptionAliasUnion.is(v as string);
export const isCompareScalarToken = (v: unknown): v is CompareScalarToken => cmpScalarTokenUnion.is(v as string);
export const isCompareObjectToken = (v: unknown): v is CompareObject => cmpCompositeTokenUnion.is(v as string);
export const isCompareArrayToken = (v: unknown): v is CompareArray => cmpArrayTokenUnion.is(v as string);
export const isCompareMapToken = (v: unknown): v is CompareMapToken => cmpMapTokenUnion.is(v as string);
export const isCompareSetToken = (v: unknown): v is CompareSetToken => cmpSetTokenUnion.is(v as string);
export const isCompareConfigToken = (v: unknown): v is CompareOptionToken => cmpTokenUnion.is(v as string);

const isCompareScalar = (v: unknown): v is CompareScalar => isCompareScalarToken(v) || isCompareFunction(v);
const isCompareObject = (v: unknown): v is CompareObject => isCompareObjectToken(v) || isCompareFunction(v);
const isCompareMap = (v: unknown): v is CompareMap => isCompareMapToken(v) || isCompareFunction(v);
const isCompareArray = (v: unknown): v is CompareArray => isCompareArrayToken(v) || isCompareFunction(v);
const isCompareSet = (v: unknown): v is CompareSet => isCompareSetToken(v) || isCompareFunction(v);

export const validateMinimalCompareConfigOptions = (v: unknown): v is MinimalCompareConfigOptions => validateMinimalObject(v, {
    compareScalar: isCompareScalar,
    compareObject: isCompareObject,
    compareMap: isCompareMap,
    compareArray: isCompareArray,
    compareSet: isCompareSet,
  }
);

export const validateCompareMethodConfig = (v: unknown): v is CompareMethodConfig => validateObject(v, {
  compareScalarMethod: isCompareFunction,
  compareObjectMethod: isCompareFunction,
  compareMapMethod: isCompareFunction,
  compareArrayMethod: isCompareFunction,
  compareSetMethod: isCompareFunction,
}
);

export const isMinimalCompareConfigOption = (v: unknown): v is MinimalCompareConfigOptions => {
  try {
    return validateMinimalCompareConfigOptions(v);
  } catch {
    return false;
  }
};

export const isCompareMethodConfig = (v: unknown): v is CompareMethodConfig => {
  try {
    return validateCompareMethodConfig(v);
  } catch {
    return false;
  }
};

export const isCompareOption = (v: unknown): v is CompareOptions =>
  isCompareOptionAlias(v) || isMinimalCompareConfigOption(v) || isCompareFunction(v);

export const isCompareConfig = (v: unknown): v is CompareConfig =>
  isCompareMethodConfig(v) || isCompareFunction(v);


export const validateCompareOption = (v: unknown): v is CompareOptions => {  
  switch (typeof v) {
    case 'string':
      if (!isCompareOptionAlias(v)) {
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
        if (!isCompareMethodConfig(v)) {
          throw new OptionError('Invalid compare option');
        }
      } catch (e) {
        throw new OptionError(e as string);
      }
  }
  return true;
};

export const validateCompareConfig = (v: unknown): v is CompareConfig => {
  switch (typeof v) {
    case 'function':
      if (!isCompareFunction(v)) {
        throw new OptionError('Function is invalid compare option', v.toString());
      }
      break;

    default:
      try {
        if (!isCompareMethodConfig(v)) {
          throw new OptionError('Invalid compare option');
        }
      } catch (e) {
        throw new OptionError(e as string);
      }
  }
  return true;  
};

