import { ComparisonResultArray } from '../compare/types';
import { type OptionObject } from '../lib/option';

export interface RenderFunc<T extends ComparisonResultArray = ComparisonResultArray> {
  (result: T, options: OptionObject): unknown;
}
