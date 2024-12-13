import { OptionError } from '../lib/error';
import { type Value } from '../lib/types';

import {
  type CompareOption,
  type CompareOptionObject,
  type CompareOptionHelperToken,
  type CompareFunc,
  type CompareOptionMethodObject,
  type MinimalCompareOptionObject,
  type ComparisonStatus,
  isMinimalCompareOptionObject,
  isCompareFunction,
  isCompareOptionHelperToken,
  isCompareOptionToken,
  validateCompareOptionObject,
} from './types';

import { optionTokenToStockMethodMap } from './stock-methods';

export const validateCompareOption = (v: unknown): v is CompareOption => {  
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
        if (!validateCompareOptionObject(v)) {
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
    compareArray: 'indexValue',
    compareSet: 'valueOnly',
  },
  General: {
    compareScalar: 'abstract',
    compareObject: 'keyValue',
    compareMap: 'keyValue',
    compareArray: 'valueOnly',
    compareSet: 'valueOnly',
  },
  Structure: {
    compareScalar: 'ignore',
    compareObject: 'typeOnly',
    compareMap: 'typeOnly',
    compareArray: 'typeOnly',
    compareSet: 'typeOnly',
  },
};

const defaultComparisonObject = ExactComparisonObject;

export const compareOptionObjectToMethodObject = (compareOptionObject: MinimalCompareOptionObject): CompareOptionMethodObject => {
  const result = compareOptionObject as CompareOptionMethodObject;
  for (const k of Object.keys(optionTokenToStockMethodMap) as (keyof MinimalCompareOptionObject)[]) {
    const spec = compareOptionObject[k] ?? defaultComparisonObject[k];
    if (isCompareOptionToken(spec)) {
      result[k] = optionTokenToStockMethodMap[k][spec] as CompareFunc;
    }
  }
  return result;
};

export const compareOptionToFunction = (option: CompareOption): CompareFunc => {
  if (isCompareFunction(option)) {
    return option;
  }

  let optionObject: MinimalCompareOptionObject;

  if (isMinimalCompareOptionObject(option)) {
    optionObject = option;
  } else if (isCompareOptionHelperToken(option)) {
    optionObject = helperTokenObjectMap[option];
  } else {
    throw new Error('Internal error: unhandled compare option');
  }

  const methodObject = compareOptionObjectToMethodObject(optionObject);

  // incomplete
  return (left: Value, right: Value, option = { compare: methodObject }): ComparisonStatus =>
    methodObject.compareScalar(left, right, option);
};


