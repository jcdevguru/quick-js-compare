import { ComparisonResult } from '../compare/types';
import { type OptionObject } from '../lib/option';
import { AtLeastOne } from '../lib/types';
import { validateMinimalObject } from '../lib/util';

export interface RenderFunc {
  (result: ComparisonResult, options: OptionObject): unknown;
}

// Types for render option object
export interface RenderOptionObject {
  jsMapAsObject: boolean
  jsSetAsArray: boolean
  maxDepth: number
  includeSame: boolean
  debug: boolean
}

export type MinimalRenderOptionObject = AtLeastOne<RenderOptionObject>;

// Types for render option token
const RENDER_OPTION_TOKENS = ['StatusOnly', 'Standard'] as const;
export type RenderToken = typeof RENDER_OPTION_TOKENS[number];

export const isRenderToken = (v: unknown): v is RenderToken => 
  RENDER_OPTION_TOKENS.includes(v as RenderToken);

export const isRenderFunction = (v: unknown): v is RenderFunc => typeof v === 'function';

export type RenderOption = RenderToken | RenderOptionObject | RenderFunc;

const isBoolean = (v: unknown) : v is boolean => typeof v === 'boolean';
const isNumber = (v: unknown): v is number => typeof v === 'number';

export const validateRenderOptionObject = (v: unknown): v is MinimalRenderOptionObject => validateMinimalObject(v, {
    jsSetAsArray: isBoolean,
    maxDepth: isNumber,
    includeSame: isBoolean,
    debug: isBoolean,
  });

export const isMinimalRenderOptionObject = (v: unknown): v is MinimalRenderOptionObject => {
  try {
    return validateRenderOptionObject(v);
  } catch {
    return false;
  }
};

export const isRenderOption = (v: unknown): v is RenderOption => isRenderToken(v) || isMinimalRenderOptionObject(v) || isRenderFunction(v);