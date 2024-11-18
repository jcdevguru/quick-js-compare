
import { OptionError } from '../lib/error';
import { type AtLeastOne } from '../lib/types';
import { validateMinimalObject } from '../lib/util';
import { type RenderFunc } from './types';

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

export type RenderOption = RenderToken | RenderOptionObject | RenderFunc;

const isBoolean = (v: unknown) : v is boolean => typeof v === 'boolean';
const isNumber = (v: unknown): v is number => typeof v === 'number';

const validateRenderOptionObject = (v: unknown): v is MinimalRenderOptionObject => validateMinimalObject(v, {
    jsSetAsArray: isBoolean,
    maxDepth: isNumber,
    includeSame: isBoolean,
    debug: isBoolean,
  });

const isMinimalRenderOption = (v: unknown): v is MinimalRenderOptionObject => {
  try {
    return validateRenderOptionObject(v);
  } catch {
    return false;
  }
};

export const isRenderOption = (v: unknown): v is RenderOption => isRenderToken(v) || isMinimalRenderOption(v) || isRenderFunction(v);

export const validateRenderOption = (v: unknown): v is RenderOption => {
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
