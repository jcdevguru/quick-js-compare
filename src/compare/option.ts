import { OptionError } from '../lib/error';

import {
  type RawCompareOption,
  type CompareOptionObject,
  type CompareOptionHelperToken,
  type CompareFunction,
  type CompareOptionMethodObject,
  type MinimalCompareOptionObject,
  isCompareFunction,
  isCompareOptionHelperToken,
  isCompareOptionToken,
  validateCompareOptionMethodObject,
  CompareOption,
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
        if (!validateCompareOptionMethodObject(v)) {
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
        if (!validateCompareOptionMethodObject(v)) {
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

export const helperTokenToMethodObjectMap = (token: CompareOptionHelperToken): CompareOptionObject =>
  helperTokenObjectMap[token];

export const compareOptionObjectToMethodObject = (compareOptionObject: MinimalCompareOptionObject): CompareOptionMethodObject => {
  // Use compareObject settings for compareMap if compareMap not set explicitly
  const methodObject = {
    ...{ compareMap: compareOptionObject.compareObject },
    ...compareOptionObject
  } as CompareOptionMethodObject;
  
  for (const k of Object.keys(optionTokenToStockMethodMap) as (keyof MinimalCompareOptionObject)[]) {
    const spec = compareOptionObject[k] ?? ExactComparisonObject[k];
    if (isCompareOptionToken(spec)) {
      methodObject[k] = optionTokenToStockMethodMap[k][spec] as CompareFunction;
    }
  }

  return methodObject;
};
