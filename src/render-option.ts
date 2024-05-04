import type {
  RenderFunc,
} from './render-types';

import {
  isEnumMember,
  verifyObject,
  type AtLeastOne,
} from './util';

// import OptionError from './error-classes/option-error';

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

enum RenderOperation {
  StatusOnly = 'StatusOnly',
  Standard = 'Standard',
}

const isBoolean = (v: unknown) : v is boolean => typeof v === 'boolean';
const isNumber = (v: unknown): v is number => typeof v === 'number';

export type RenderToken = RenderOperation;

export type RenderAppOption = RenderToken | RenderOptionObject;

export const isRenderToken = (v: unknown): v is RenderToken => isEnumMember(v, RenderOperation);

export const isRenderFunction = (v: unknown): v is RenderFunc => typeof v === 'function';

export const isMinimalRenderOptionObject = (v: unknown, errs?: Array<string>): v is MinimalRenderOptionObject => verifyObject(v, {
  jsSetAsArray: isBoolean,
  maxDepth: isNumber,
  includeSame: isBoolean,
  debug: isBoolean,
}, true, errs);

export const isRenderAppOption = (v: unknown): v is RenderAppOption => isRenderToken(v) || isMinimalRenderOptionObject(v);

// TODO: validateRenderOption
