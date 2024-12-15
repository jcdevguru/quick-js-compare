import type { Value } from './lib/types';

// do nothing for now
export default (v1: Value, v2: Value): Value => ({ left: v1, right: v2 });

export { default as Compare } from './compare';
// Only export what you want public
export type { CompareResult, CompareFunction } from './compare/types';
export type { Option } from './lib/option';
