import type {
  RenderFunc,
} from './render-types';

import {
  verifyObject,
  type AtLeastOne,
} from './util';

import OptionError from './error-classes/option-error';

// Types
// Render option types
export interface RenderOptionObject {
  jsMapAsObject: boolean
  jsSetAsArray: boolean
  maxDepth: number
  includeSame: boolean
  debug: boolean
}

export type MinimalRenderOptionObject = AtLeastOne<RenderOptionObject>;

const RENDER_OPTION_TOKENS = ['StatusOnly', 'Standard'] as const;
export type RenderToken = typeof RENDER_OPTION_TOKENS[number];

export const isRenderToken = (v: unknown): v is RenderToken => 
  RENDER_OPTION_TOKENS.includes(v as RenderToken);

export const isRenderFunction = (v: unknown): v is RenderFunc => typeof v === 'function';

export type RenderAppOption = RenderToken | RenderOptionObject | RenderFunc;

const isBoolean = (v: unknown) : v is boolean => typeof v === 'boolean';
const isNumber = (v: unknown): v is number => typeof v === 'number';

export const isMinimalRenderOptionObject = (v: unknown, errs?: Array<string>): v is MinimalRenderOptionObject => verifyObject(v, {
  jsSetAsArray: isBoolean,
  maxDepth: isNumber,
  includeSame: isBoolean,
  debug: isBoolean,
}, true, errs);

export const isRenderAppOption = (v: unknown): v is RenderAppOption => isRenderToken(v) || isMinimalRenderOptionObject(v);

export const validateRenderAppOption = (v: unknown): v is RenderAppOption => {
  const errors: Array<string> = [];

  if (isRenderToken(v)) {
    return true;
  }

  if (isRenderFunction(v)) {
    return true;
  }

  if (!isMinimalRenderOptionObject(v, errors)) {
    let s = 'render option object is not valid';
    if (errors.length) {
      s = `${s}: errors: ${errors.join(', ')}`;
    }
    throw new OptionError(s);
  }

  return true;
};
