import type {
  CompareFunc,
} from './compare-types';

import {
  isEnumMember,
  isStandardObject,
  anyToString,
  verifyObject,
  type AtLeastOne,
} from './util';

import OptionError from './error-classes/option-error';

// Types

enum CompareToken {
  Exact = 'Exact',
  General = 'General',
  ExactStructure = 'ExactStructure',
  GeneralStructure = 'GeneralStructure',
}

enum CmpPrimitiveToken {
  strict = 'strict',
  abstract = 'abstract',
  typeOnly = 'typeOnly',
  ignore = 'ignore',
}

enum CmpObjectToken {
  reference = 'reference',
  valueOnly = 'valueOnly',
  ignore = 'ignore',
}

enum CmpKeyedObjectToken {
  keyValueOrder = 'keyValueOrder',
  keyValue = 'keyValue',
  keyOrder = 'keyOrder',
  keyOnly = 'keyOnly',
}

enum CmpCollectionToken {
  valueOrder = 'valueOrder',
  valueOnly = 'valueOnly',
  sizeOnly = 'sizeOnly',
}

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

export type CompareAppOption = CompareToken | MinimalCompareOptionObject | CompareFunc;

// Methods
export const isCompareToken = (v: unknown): v is CompareToken => isEnumMember(v, CompareToken);

export const isComparePrimitiveSpec = (v: unknown): v is CompareValueSpec => isEnumMember(v, CmpPrimitiveToken);

export const isCompareObjectSpec = (v: unknown): v is CompareObjectSpec => (
  isEnumMember(v, CmpObjectToken) || isEnumMember(v, CmpKeyedObjectToken)
);

export const isCompareCollectionSpec = (v: unknown): v is CompareCollectionSpec => (
  isEnumMember(v, CmpObjectToken) || isEnumMember(v, CmpCollectionToken)
);

export const isCompareFunction = (v: unknown): v is CompareFunc => typeof v === 'function';

export const isMinimalCompareOptionObject = (v: unknown, errs?: Array<string>): v is MinimalCompareOptionObject => verifyObject(v, {
  compareValue: isComparePrimitiveSpec,
  compareObject: isCompareObjectSpec,
  compareMap: isCompareObjectSpec,
  compareArray: isCompareCollectionSpec,
  compareSet: isCompareCollectionSpec,
}, errs);

export const isCompareAppOption = (v: unknown): v is CompareAppOption => (
  isCompareToken(v) || isMinimalCompareOptionObject(v) || isCompareFunction(v)
);

export const validateCompareAppOption = (v: unknown): v is CompareAppOption => {
  const aType = typeof v;
  const errors: Array<string> = [];

  switch (aType) {
    case 'string':
      if (!isCompareToken(v)) {
        throw new OptionError('invalid token for compare option', v as string);
      }
      break;

    case 'object':
      if (!isStandardObject(v)) {
        throw new OptionError('invalid object type for compare option', anyToString(v));
      }
      if (!isMinimalCompareOptionObject(v, errors)) {
        let s = 'option object is not valid';
        if (errors.length) {
          s = `: errors: ${errors.join(', ')}`;
        }
        throw new OptionError(s);
      }
      break;

    default:
      if (aType !== 'function') {
        throw new OptionError('invalid type for compare option', anyToString(v));
      } else if (!isCompareFunction(v)) {
        throw new OptionError('option function is not valid', anyToString(v));
      }
      throw new OptionError(`unhandled option type ${aType}`);
  }
  return true;
};
