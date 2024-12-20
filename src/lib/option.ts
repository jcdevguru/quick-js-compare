
import { OptionError } from './error';
import type { AtLeastOne } from './types';
import { validateMinimalObject, validateObject } from './util';

import { validateRenderOption, validateRenderConfig } from '../render/option';
import type { RenderOption } from '../render/types';
import {
  type CompareConfig,
  type CompareOptions,
  validateCompareOption,
  validateCompareConfig,
} from '../compare/types/config';

export interface ConfigOptions {
  compare: CompareOptions
  render: RenderOption
}

export interface Config {
  compare: CompareConfig
  render: RenderOption // TODO: change to RenderConfig
}

export type MinimalConfigOptions = AtLeastOne<ConfigOptions>;

export const validateOptions = (v: unknown): v is MinimalConfigOptions => { 
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

export const isOption = (v: unknown): v is MinimalConfigOptions => { 
  try {
    return validateConfig(v);
  } catch {
    return false;
  }
};
