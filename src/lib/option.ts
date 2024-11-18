import { CompareOption, validateCompareOption } from '../compare/option';
import { RenderOption, validateRenderOption } from '../render/option';
import { OptionError } from './error';

import { type AtLeastOne } from './types';

import { validateMinimalObject } from './util';

export interface OptionObject {
  compare: CompareOption
  render: RenderOption
}

export type Option = AtLeastOne<OptionObject>;

export const validateOption = (v: unknown): v is Option => { 
  try {
    return validateMinimalObject(v, {
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

export const isOption = (v: unknown): v is Option => { 
  try {
    return validateOption(v);
  } catch {
    return false;
  }
};
