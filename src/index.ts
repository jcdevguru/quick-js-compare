import type { CompareResult } from './types';

// do nothing for now
export default (v1: unknown, v2: unknown): CompareResult => ({ left: v1, right: v2, status: true });
