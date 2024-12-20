
import { type AtLeastOne } from './types';
import { validateMinimalObject, validateObject } from './util';
import { OptionError } from './error';

import { validateCompareOption, validateCompareConfig } from '../compare/option';
import { validateRenderOption, validateRenderConfig } from '../render/option';
import { type RenderOption } from '../render/types';
import { type CompareConfig,  type CompareOption  } from '../compare/types';

export interface ConfigOptionObject {
  compare: CompareOption  
  render: RenderOption
}

export interface Config {
  compare: CompareConfig
  render: RenderOption // TODO: change to RenderConfig
}

export type ConfigOptions = AtLeastOne<ConfigOptionObject>;

export const validateOptions = (v: unknown): v is ConfigOptions => { 
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

export const validateConfig = (v: unknown): v is Config => { 
  try {
    return validateObject(v, {
      compare: validateCompareConfig,
      render: validateRenderConfig,
    }); 
  } catch (e) {
    if (e instanceof OptionError) {
      throw e;
    } else {
      throw new OptionError('Invalid option');
    }
  }
};

export const isOption = (v: unknown): v is ConfigOptions => { 
  try {
    return validateConfig(v);
  } catch {
    return false;
  }
};
