import { ComparisonResultArray } from '../compare/types';
import { type AppOptionObject } from '../app/option';

export interface RenderFunc<T extends ComparisonResultArray = ComparisonResultArray> {
  (result: T, options: AppOptionObject): unknown;
}
