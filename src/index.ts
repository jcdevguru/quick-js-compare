import type { CompareItem } from './base-types';

// do nothing for now
export default (v1: CompareItem, v2: CompareItem): CompareItem => ({ left: v1, right: v2, status: true });
