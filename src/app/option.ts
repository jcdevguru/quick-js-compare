import { CompareAppOption, isCompareAppOption } from '../compare/option';
import { RenderAppOption, isRenderAppOption } from '../render/option';

import {
  verifyObject,
  type AtLeastOne,
} from '../util';

import OptionError from '../error-classes/option-error';

export interface AppOptionObject {
  compare: CompareAppOption
  render: RenderAppOption
}

// Predefined tokens
const APP_OPTION_TOKENS = ['Exact', 'General'] as const;
export type AppOptionToken = typeof APP_OPTION_TOKENS[number];
export const isAppOptionToken = (v: unknown): v is AppOptionToken => 
  APP_OPTION_TOKENS.includes(v as AppOptionToken);

export type MinimalAppOptionObject = AtLeastOne<AppOptionObject>;

export const isMinimalAppOptionObject = (v: unknown, errs?: Array<string>): v is MinimalAppOptionObject => verifyObject(v, {
  compare: isCompareAppOption,
  render: isRenderAppOption,
}, true, errs);

export type AppOptions = AppOptionToken | MinimalAppOptionObject;
export const isAppOptions = (v: unknown): v is AppOptions => isAppOptionToken(v) || isMinimalAppOptionObject(v);

export const validateAppOptions = (v: unknown): v is CompareAppOption => {
  const errors: Array<string> = [];

  if (isAppOptionToken(v)) {
    return true;
  }

  if (!isMinimalAppOptionObject(v, errors)) {
    let s = 'app option object is not valid';
    if (errors.length) {
      s = `${s}: errors: ${errors.join(', ')}`;
    }
    throw new OptionError(s);
  }

  return true;
};
