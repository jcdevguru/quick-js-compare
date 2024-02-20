import type {
  CompareFunc,
  CompareItem,
} from './base-types';

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
  compare: 'Strict' | 'Equivalent' | CompareOptions | CompareFunc<CompareItem>
  render: 'StatusOnly' | 'Standard' | RenderOptions
}
