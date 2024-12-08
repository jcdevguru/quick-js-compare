import { OptionError } from '../lib/error';
import {
  isCompareFunction,
  isCompareOptionHelperToken,
  validateCompareOptionObject,
  type CompareOption,
  type CompareOptionObject,
  type CompareOptionHelperToken,
} from './types';


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

// Map string-based comparison options to their object-based equivalents
const helperTokenObjectMap: Record<CompareOptionHelperToken, CompareOptionObject> = {
  Exact: {
    compareScalar: 'strict',
    compareObject: 'keyValueOrder',
    compareMap: 'keyValueOrder',
    compareArray: 'valueOrder',
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

export const helperTokenToObjectMap = (token: CompareOptionHelperToken): CompareOptionObject => helperTokenObjectMap[token];