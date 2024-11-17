import { CompareOption, isCompareOption } from '../compare/option';
import { RenderOption, isRenderOption } from '../render/option';

import { type AtLeastOne } from './types';

import { verifyObject } from './util';

export interface OptionObject {
  compare: CompareOption
  render: RenderOption
}

// Predefined tokens
const OPTION_TOKENS = ['Exact', 'General'] as const;
export type OptionToken = typeof OPTION_TOKENS[number];
export const isOptionToken = (v: unknown): v is OptionToken => 
  OPTION_TOKENS.includes(v as OptionToken);

export type MinimalOptionObject = AtLeastOne<OptionObject>;

export const isMinimalOptionObject = (v: unknown, errs?: Array<string>): v is MinimalOptionObject => verifyObject(v, {
  compare: isCompareOption,
  render: isRenderOption,
}, true, errs);

export type Option = OptionToken | MinimalOptionObject;
export const isOption = (v: unknown, errors?: Array<string>): v is Option =>
  isOptionToken(v) || isMinimalOptionObject(v, errors);
