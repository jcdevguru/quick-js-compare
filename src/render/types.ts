import { Result } from '../compare/types';
import { type AppOptionObject } from '../app/option';

export interface RenderFunc<T extends Result = Result> {
  (result: T, options: AppOptionObject): unknown;
}
