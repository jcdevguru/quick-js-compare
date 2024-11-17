
import { type AtLeastOne } from '../lib/types';
import { verifyObject } from '../lib/util';
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

export type MinimalRenderOption = AtLeastOne<RenderOptionObject>;

const RENDER_OPTION_TOKENS = ['StatusOnly', 'Standard'] as const;
export type RenderToken = typeof RENDER_OPTION_TOKENS[number];

export const isRenderToken = (v: unknown): v is RenderToken => 
  RENDER_OPTION_TOKENS.includes(v as RenderToken);

export const isRenderFunction = (v: unknown): v is RenderFunc => typeof v === 'function';

export type RenderOption = RenderToken | RenderOptionObject | RenderFunc;

const isBoolean = (v: unknown) : v is boolean => typeof v === 'boolean';
const isNumber = (v: unknown): v is number => typeof v === 'number';

export const isMinimalRenderOption = (v: unknown, errs?: Array<string>): v is MinimalRenderOption => verifyObject(v, {
  jsSetAsArray: isBoolean,
  maxDepth: isNumber,
  includeSame: isBoolean,
  debug: isBoolean,
}, true, errs);

export const isRenderOption = (v: unknown): v is RenderOption => isRenderToken(v) || isMinimalRenderOption(v);
