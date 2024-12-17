
import { type AtLeastOne } from './types';
import { validateMinimalObject, validateObject } from './util';
import { OptionError } from './error';

import { validateCompareOption, validateRawCompareOption } from '../compare/option';
import { validateRawRenderOption, validateRenderOption } from '../render/option';
import { type RawRenderOption } from '../render/types';
import { type CompareOption,  type RawCompareOption  } from '../compare/types';

export interface RawOptionObject {
  compare: RawCompareOption
  render: RawRenderOption
}

export interface Option {
  compare: CompareOption
  render: RawRenderOption // TODO: change to RenderOption
}

export type RawOption = AtLeastOne<RawOptionObject>;

export const validateRawOption = (v: unknown): v is RawOption => { 
  try {
    return validateMinimalObject(v, {
      compare: validateRawCompareOption,
      render: validateRawRenderOption,
    }); 
  } catch (e) {
    if (e instanceof OptionError) {
      throw e;
    } else {
      throw new OptionError('Invalid option');
    }
  }
};

export const validateOption = (v: unknown): v is Option => { 
  try {
    return validateObject(v, {
      compare: validateCompareOption,
      render: validateRenderOption,
    }); 
  } catch (e) {
    if (e instanceof OptionError) {
      throw e;
    } else {
      throw new OptionError('Invalid option');
    }
  }
};

export const isOption = (v: unknown): v is RawOption => { 
  try {
    return validateOption(v);
  } catch {
    return false;
  }
};
