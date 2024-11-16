import type {
  RenderFunc,
} from './types';

import {
  verifyObject,
  type AtLeastOne,
} from '../lib/util';

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

export const isRenderOption = (v: unknown): v is RenderOption => isRenderToken(v) || isMinimalRenderOptionObject(v);
