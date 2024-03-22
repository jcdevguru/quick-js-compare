// Types
import type {
  CompareFunc,
  Value,
} from './compare-types';

import {
  isEnumMember,
  isStandardObject,
  anyToString,
  type AtLeastOne,
} from './util';

import OptionError from './error-classes/option-error';

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

type CompareOptionObjectKey = keyof CompareOptionObject;

export type MinimalCompareOptionObject = AtLeastOne<CompareOptionObject>;

export interface RenderOptionObject {
  jsMapAsObject: boolean
  jsSetAsArray: boolean
  maxDepth: number
  includeSame: boolean
  debug: boolean
}

enum CompareOperation {
  Strict = 'Strict',
  General = 'General',
}

enum RenderOperation {
  StatusOnly = 'StatusOnly',
  Standard = 'Standard',
}

export type CompareToken = CompareOperation;
export type RenderToken = RenderOperation;

export type CompareAppOption = CompareToken | MinimalCompareOptionObject | CompareFunc<Value>;
export type RenderAppOption = RenderToken | RenderOptionObject;

export interface AppOptions {
  compare: CompareAppOption
  render: RenderAppOption
}

// Methods

const compareOptionKeySet = new Set<string>(
  ['compareValue', 'compareObject', 'compareCollection'],
);

export const isCompareToken = (v: unknown): v is CompareToken => isEnumMember(v, CompareOperation);

export const isCompareValueToken = (v: unknown): v is CompareValueToken => isEnumMember(v, CmpPrimitiveValue);

export const isCompareObjectToken = (v: unknown): v is CompareObjectToken => (
  isEnumMember(v, CmpReferenceValue) || isEnumMember(v, CmpKeyedObject)
);

export const isCompareCollectionToken = (v: unknown): v is CompareCollectionToken => (
  isEnumMember(v, CmpReferenceValue) || isEnumMember(v, CmpCollectionObject)
);

export const isCompareFunction = (v: unknown): v is CompareFunc<Value> => typeof v === 'function';

export const isCompareOptionObjectKey = (v: unknown): v is CompareOptionObjectKey => compareOptionKeySet.has(v as string);

export const isMinimalCompareOptionObject = (v: unknown, errs?: Array<string>): v is MinimalCompareOptionObject => {
  if (!isStandardObject(v)) {
    return false;
  }
  const objKeys = Object.keys(v);
  const unknownKeys = objKeys.filter((k) => !isCompareOptionObjectKey(k));

  if (unknownKeys.length) {
    errs?.push(...unknownKeys.map((k) => `property ${k} unknown`));
    return false;
  }

  if (!objKeys.length) {
    errs?.push('need at least one of compareValue, compareObject, or compareCollection');
    return false;
  }

  const invalidSettings = ([
    ['compareValue', isCompareValueToken],
    ['compareObject', isCompareObjectToken],
    ['compareCollection', isCompareCollectionToken],
  ] as Array<[string, (a: unknown) => boolean]>).filter(
    ([setting, check]) => (setting && !check((v as Record<string, unknown>)[setting])),
  ).map(([s]) => s);

  if (invalidSettings.length) {
    errs?.push(...invalidSettings.map((s) => `field ${s} has invalid value`));
    return false;
  }

  return true;
};

export const isCompareAppOption = (v: unknown): v is CompareAppOption => (
  isCompareToken(v) || isMinimalCompareOptionObject(v) || isCompareFunction(v)
);

export const validateCompareAppOption = (v: unknown): boolean => {
  const aType = typeof v;

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
      if (!isMinimalCompareOptionObject(v)) {
        throw new OptionError('option object is not valid', anyToString(v));
      }
      break;

    default:
      if (aType !== 'function') {
        throw new OptionError('invalid type for compare option', anyToString(v));
      }
      if (!isCompareFunction(v)) {
        throw new OptionError('option function is not valid', anyToString(v));
      }
      throw new OptionError(`unhandled option type ${aType}`);
  }
  return true;
};
