import { ComparisonResult } from '../compare/types';
import { type OptionObject } from '../lib/option';

export interface RenderFunc {
  (result: ComparisonResult, options: OptionObject): unknown;
}
