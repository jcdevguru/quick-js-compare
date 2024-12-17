
import { OptionError } from '../lib/error';
import { isRenderToken, isRenderFunction, validateMinimalRenderOptionObject, type RawRenderOption, RenderOption, validateRenderOptionObject } from './types';

export const validateRawRenderOption = (v: unknown): v is RawRenderOption => {
  try {
    switch (typeof v) {
      case 'string':
        if (!isRenderToken(v)) {
          throw new OptionError('String is not a valid render option');
        }
        break;

      case 'function':
        if (!isRenderFunction(v)) {
          throw new OptionError('Function is invalid render option', v.toString());
        }
        break;

      default:
        if (!validateMinimalRenderOptionObject(v)) {
          throw new OptionError('Invalid render option');
        }
    } 
  } catch (e) {
    if (e instanceof OptionError) {
      throw e;
    }
    throw new OptionError(e as string);
  }
  return true;
};

export const validateRenderOption = (v: unknown): v is RenderOption => {
  try {
    switch (typeof v) {
      case 'function':
        if (!isRenderFunction(v)) {
          throw new OptionError('Function is invalid render option', v.toString());
        }
        break;

      default:
        if (!validateRenderOptionObject(v)) {
          throw new OptionError('Invalid render option');
        }
    } 
  } catch (e) {
    if (e instanceof OptionError) {
      throw e;
    }
    throw new OptionError(e as string);
  }
  return true;
};