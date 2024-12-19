import { OptionError } from '../lib/error';

import {
  type RawCompareOption,
  type CompareOption,
  type CompareOptionObject,
  type CompareOptionHelperToken,
  type CompareOptionMethodObject,
  type MinimalCompareOptionObject,
  isCompareFunction,
  isCompareOptionHelperToken,
  isCompareOptionToken,
  isCompareOptionMethodObject,
} from './types';

import { optionTokenToStockMethodMap } from './stock-methods';

export const validateRawCompareOption = (v: unknown): v is RawCompareOption => {  
  switch (typeof v) {
    case 'string':
      if (!isCompareOptionHelperToken(v)) {
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
        if (!isCompareOptionMethodObject(v)) {
          throw new OptionError('Invalid compare option');
        }
      } catch (e) {
        throw new OptionError(e as string);
      }
  }
  return true;
};

export const validateCompareOption = (v: unknown): v is CompareOption => {
  switch (typeof v) {
    case 'function':
      if (!isCompareFunction(v)) {
        throw new OptionError('Function is invalid compare option', v.toString());
      }
      break;

    default:
      try {
        if (!isCompareOptionMethodObject(v)) {
          throw new OptionError('Invalid compare option');
        }
      } catch (e) {
        throw new OptionError(e as string);
      }
  }
  return true;  
};

const ExactComparisonObject: CompareOptionObject = {
  compareScalar: 'strict',
  compareObject: 'strict',
  compareMap: 'strict',
  compareArray: 'strict',
  compareSet: 'strict',
};

// Map string-based comparison options to their object-based equivalents


export const helperTokenToMethodObjectMap = (token: CompareOptionHelperToken): CompareOptionObject => {
  const helperTokenObjectMap: Record<CompareOptionHelperToken, CompareOptionObject> = {
    Exact: ExactComparisonObject,
    Equivalent: {
      compareScalar: 'strict',
      compareObject: 'keyValueOrder',
      compareMap: 'keyValueOrder',
      compareArray: 'valueOrder',
      compareSet: 'valuesOnly',
    },
    General: {
      compareScalar: 'abstract',
      compareObject: 'keyValue',
      compareMap: 'keyValue',
      compareArray: 'valuesOnly',
      compareSet: 'valuesOnly',
    },
    Structure: {
      compareScalar: 'alwaysSame',
      compareObject: 'typeOnly',
      compareMap: 'typeOnly',
      compareArray: 'typeOnly',
      compareSet: 'typeOnly',
    },
  };

  return helperTokenObjectMap[token];
};

const rawCompareOptionKeyToMethodObjectKey = (key: keyof MinimalCompareOptionObject) =>
   `${key}Method` as keyof CompareOptionMethodObject;

export const compareOptionObjectToMethodObject = (compareOptionObject: MinimalCompareOptionObject): CompareOptionMethodObject => {
  const methodObject: CompareOptionMethodObject = {} as CompareOptionMethodObject;
  
  for (const k of Object.keys(optionTokenToStockMethodMap) as (keyof MinimalCompareOptionObject)[]) {
    const spec = compareOptionObject[k] ?? ExactComparisonObject[k];
    let compareMethod;
    if (isCompareFunction(spec)) {
      compareMethod = spec;
    } else if (isCompareOptionToken(spec)) { 
      compareMethod = optionTokenToStockMethodMap[k][spec];
    } else {
      throw new Error('Error: unexpected compare option specfication');
    }
    methodObject[rawCompareOptionKeyToMethodObjectKey(k)] = compareMethod;
  }

  if (!methodObject.compareMapMethod) {
    methodObject.compareMapMethod = methodObject.compareObjectMethod;
  }

  if (!isCompareOptionMethodObject(methodObject)) {
    throw new Error('Error: compare option method object is invalid');
  }

  return methodObject;
};
