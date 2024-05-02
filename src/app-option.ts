import { CompareAppOption, isCompareAppOption } from './compare-option';
import { RenderAppOption, isRenderAppOption } from './render-option';

import {
  isEnumMember,
  isStandardObject,
  anyToString,
  verifyObject,
  type AtLeastOne,
} from './util';

import OptionError from './error-classes/option-error';

export interface AppOptionObject {
  compare: CompareAppOption
  render: RenderAppOption
}

export enum AppOptionToken {
  Exact = 'Exact',
  General = 'General',
}

export type MinimalAppOptionObject = AtLeastOne<AppOptionObject>;

export type AppOptions = AppOptionToken | keyof typeof AppOptionToken | MinimalAppOptionObject;

export const isAppOptionToken = (v: unknown): v is AppOptionToken => isEnumMember(v, AppOptionToken);

export const isMinimalAppOptionObject = (v: unknown, errs?: Array<string>): v is MinimalAppOptionObject => verifyObject(v, {
  compare: isCompareAppOption,
  render: isRenderAppOption,
}, true, errs);

export const isAppOptions = (v: unknown): v is AppOptions => isAppOptionToken(v) || isMinimalAppOptionObject(v);

export const validateAppOption = (v: unknown): v is CompareAppOption => {
  const aType = typeof v;
  const errors: Array<string> = [];

  switch (aType) {
    case 'string':
      if (!isAppOptionToken(v)) {
        throw new OptionError('invalid token for application option', v as string);
      }
      break;

    case 'object':
      if (!isStandardObject(v)) {
        throw new OptionError('invalid object type for app option', anyToString(v));
      }
      if (!isMinimalAppOptionObject(v, errors)) {
        let s = 'app option object is not valid';
        if (errors.length) {
          s = `${s}: errors: ${errors.join(', ')}`;
        }
        throw new OptionError(s);
      }
      break;

    default:
      throw new OptionError(`invalid app option type ${aType}`);
  }
  return true;
};
