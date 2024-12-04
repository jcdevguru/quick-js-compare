import { OptionError } from '../lib/error';

import {
  isCompareFunction,
  isCompareOptionHelperToken,
  validateCompareOptionObject,
  type CompareOption
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
