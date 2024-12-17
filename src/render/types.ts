import { CompareResult } from '../compare/types';
import { AtLeastOne } from '../lib/types';
import { validateMinimalObject } from '../lib/util';
import Compare from '../compare';
export interface RenderFunction {
  (result: CompareResult, compareInstance: Compare): unknown;
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

export const isRenderFunction = (v: unknown): v is RenderFunction => typeof v === 'function';

export type RenderOption = RenderOptionObject | RenderFunction;
export type RawRenderOption = RenderToken | MinimalRenderOptionObject | RenderFunction;

const isBoolean = (v: unknown) : v is boolean => typeof v === 'boolean';
const isNumber = (v: unknown): v is number => typeof v === 'number';

const validationProperties = {
  jsSetAsArray: isBoolean,
  maxDepth: isNumber,
  includeSame: isBoolean,
  debug: isBoolean,
} as const;

export const validateMinimalRenderOptionObject = (v: unknown): v is MinimalRenderOptionObject =>
  validateMinimalObject(v, validationProperties);

export const validateRenderOptionObject = (v: unknown): v is RenderOptionObject =>
  validateMinimalObject(v, validationProperties);

export const isMinimalRenderOptionObject = (v: unknown): v is MinimalRenderOptionObject => {
  try {
    return validateMinimalRenderOptionObject(v);
  } catch {
    return false;
  }
};

export const isRenderOptionObject = (v: unknown): v is RenderOptionObject => {
  try {
    return validateMinimalRenderOptionObject(v);
  } catch {
    return false;
  }
};

export const isRawRenderOption = (v: unknown): v is RawRenderOption => 
  isRenderToken(v) || isMinimalRenderOptionObject(v) || isRenderFunction(v);

export const isRenderOption = (v: unknown): v is RenderOption => isRenderOptionObject(v) || isRenderFunction(v);