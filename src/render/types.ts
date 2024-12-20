import { CompareResult } from '../compare/types';
import { AtLeastOne } from '../lib/types';
import { validateMinimalObject } from '../lib/util';
import Compare from '../compare';
export interface RenderFunction {
  (result: CompareResult, compareInstance: Compare): unknown;
}

// Types for render option object
export interface RenderConfigOption {
  jsMapAsObject: boolean
  jsSetAsArray: boolean
  maxDepth: number
  includeSame: boolean
  debug: boolean
}

export type MinimalRenderConfigOption = AtLeastOne<RenderConfigOption>;

// Types for render option token
const RENDER_OPTION_TOKENS = ['StatusOnly', 'Standard'] as const;
export type RenderToken = typeof RENDER_OPTION_TOKENS[number];

export const isRenderToken = (v: unknown): v is RenderToken => 
  RENDER_OPTION_TOKENS.includes(v as RenderToken);

export const isRenderFunction = (v: unknown): v is RenderFunction => typeof v === 'function';

export type RenderConfig = RenderConfigOption | RenderFunction;
export type RenderOption = RenderToken | MinimalRenderConfigOption | RenderFunction;

const isBoolean = (v: unknown) : v is boolean => typeof v === 'boolean';
const isNumber = (v: unknown): v is number => typeof v === 'number';

const validationProperties = {
  jsSetAsArray: isBoolean,
  maxDepth: isNumber,
  includeSame: isBoolean,
  debug: isBoolean,
} as const;

export const validateMinimalRenderConfigOption = (v: unknown): v is MinimalRenderConfigOption =>
  validateMinimalObject(v, validationProperties);

export const validateRenderOptionObject = (v: unknown): v is RenderConfigOption =>
  validateMinimalObject(v, validationProperties);

export const isMinimalRenderConfigOption = (v: unknown): v is MinimalRenderConfigOption => {
  try {
    return validateMinimalRenderConfigOption(v);
  } catch {
    return false;
  }
};

export const isRenderConfigOption = (v: unknown): v is RenderConfigOption => {
  try {
    return validateMinimalRenderConfigOption(v);
  } catch {
    return false;
  }
};

export const isRenderOption = (v: unknown): v is RenderOption => 
  isRenderToken(v) || isMinimalRenderConfigOption(v) || isRenderFunction(v);

export const isRenderConfig = (v: unknown): v is RenderConfig => isRenderConfigOption(v) || isRenderFunction(v);