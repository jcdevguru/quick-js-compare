import { type BaseCompareFunc } from './base-types';

export interface CompareOptions {
  compareValue: 'strict' | 'abstract' | 'ignore'
  compareObject: 'reference' | 'keyValueOrder' | 'keyValue' | 'keyOrder' | 'keyOnly' | 'valueOnly' | 'ignore'
  compareCollection: 'reference' | 'valueOrder' | 'valueOnly' | 'sizeOnly' | 'ignore'
}

export interface RenderOptions {
  jsMapAsObject: boolean
  jsSetAsArray: boolean
  maxDepth: number
  includeSame: boolean
  debug: boolean
}

export interface AppOptions {
  compare: 'Strict' | 'Equivalent' | Partial<CompareOptions> | BaseCompareFunc
  render: 'StatusOnly' | 'Standard' | Partial<RenderOptions>
}
