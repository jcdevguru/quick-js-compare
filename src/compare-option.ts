import type {
  CompareFunc,
  Value,
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

enum CompareOperation {
  Strict = 'Strict',
  General = 'General',
  StructureOnly = 'StructureOnly',
}

enum CmpPrimitiveValue {
  strict = 'strict',
  abstract = 'abstract',
  ignore = 'ignore',
}

enum CmpReferenceValue {
  reference = 'reference',
  valueOnly = 'valueOnly',
  ignore = 'ignore',
}

enum CmpKeyedObject {
  keyValueOrder = 'keyValueOrder',
  keyValue = 'keyValue',
  keyOrder = 'keyOrder',
  keyOnly = 'keyOnly',
}

enum CmpCollectionObject {
  valueOrder = 'valueOrder',
  valueOnly = 'valueOnly',
  sizeOnly = 'sizeOnly',
}

export type CompareValueToken = CmpPrimitiveValue;
export type CompareObjectToken = CmpReferenceValue | CmpKeyedObject;
export type CompareCollectionToken = CmpReferenceValue | CmpCollectionObject;

export interface CompareOptionObject {
  compareValue: CompareValueToken
  compareObject: CompareObjectToken
  compareCollection: CompareCollectionToken
}

export type MinimalCompareOptionObject = AtLeastOne<CompareOptionObject>;

export type CompareToken = CompareOperation;
export type CompareAppOption = CompareToken | MinimalCompareOptionObject | CompareFunc<Value>;

// Methods
export const isCompareToken = (v: unknown): v is CompareToken => isEnumMember(v, CompareOperation);

export const isCompareValueToken = (v: unknown): v is CompareValueToken => isEnumMember(v, CmpPrimitiveValue);

export const isCompareObjectToken = (v: unknown): v is CompareObjectToken => (
  isEnumMember(v, CmpReferenceValue) || isEnumMember(v, CmpKeyedObject)
);

export const isCompareCollectionToken = (v: unknown): v is CompareCollectionToken => (
  isEnumMember(v, CmpReferenceValue) || isEnumMember(v, CmpCollectionObject)
);

export const isCompareFunction = (v: unknown): v is CompareFunc<Value> => typeof v === 'function';

export const isMinimalCompareOptionObject = (v: unknown, errs?: Array<string>): v is MinimalCompareOptionObject => verifyObject(v, {
  compareValue: isCompareValueToken,
  compareObject: isCompareObjectToken,
  compareCollection: isCompareCollectionToken,
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
