import type { Value } from './compare-types';

// do nothing for now
export default (v1: Value, v2: Value): Value => ({ left: v1, right: v2, status: true });
