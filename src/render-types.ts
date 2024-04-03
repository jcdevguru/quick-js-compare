import { Result } from './compare-types';
import { type AppOptions } from './option';

export interface RenderFunc<T extends Result = Result> {
  (result: T, options: AppOptions): unknown;
}
