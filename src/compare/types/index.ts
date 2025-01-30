import type Compare from '@compare';
import {
  type Value,
  type ObjectKey,
  type AtLeastOne,
  type EmptyObject,
  type Xor,
  isEmptyObject
} from '@lib/types';

export type ComparisonStatus = boolean | undefined;

export type CompareFunction<T extends Value = Value> = (
  left: T,
  right: T,
  instance: Compare
) => ComparisonStatus;

export const isCompareFunction = (v: unknown): v is CompareFunction =>
  typeof v === 'function' && v.length >= 2;

export type ValueResults = Array<ValueResult>;

export const comparisonKeys = ['left', 'leftSame', 'rightSame', 'right', 'same'] as const;
export const comparisonDetailKeys = ['leftOnly', ...comparisonKeys, 'rightOnly'] as const;
export const comparisonValueKeys = comparisonDetailKeys;
export const comparisonResultKeys = [...comparisonKeys, 'details'] as const;

let comparisonKeySet: Set<ComparisonKey>;
let comparisonResultKeySet: Set<ComparisonResultKey>;
let comparisonDetailKeySet: Set<ComparisonDetailKey>;

export type ComparisonKey = typeof comparisonKeys[number];
export type ComparisonDetailKey = typeof comparisonDetailKeys[number];
export type ComparisonResultKey = typeof comparisonResultKeys[number];
export type ComparisonValueKey = typeof comparisonValueKeys[number];

export const isComparisonKey = (key: unknown): key is ComparisonKey => {
  comparisonKeySet = comparisonKeySet ?? new Set<ComparisonKey>(comparisonKeys);
  return comparisonKeySet.has(key as ComparisonKey);
};

export const isComparisonDetailKey = (key: unknown): key is ComparisonDetailKey => {
  comparisonDetailKeySet = comparisonDetailKeySet ?? new Set<ComparisonDetailKey>(comparisonDetailKeys);
  return comparisonDetailKeySet.has(key as ComparisonDetailKey);
};

export const isComparisonResultKey = (key: unknown): key is ComparisonResultKey => {
  comparisonResultKeySet = comparisonResultKeySet ?? new Set<ComparisonResultKey>(comparisonResultKeys);
  return comparisonResultKeySet.has(key as ComparisonResultKey);
};

export type ValueResultProps = {
  index?: number,
  key?: ObjectKey,
};

export type ValueResult = {
  typeName: string,
  value: Value,
} & ValueResultProps;

type DetailDiffering = {
  left: Array<Value>,
  right: Array<Value>
}

type DetailSame = Xor<[
  { same: Array<Value> },
  {
    leftSame: Array<Value>
    rightSame: Array<Value>
    same?: Array<Value>
  }
]>;

type DetailOnly = {
  leftOnly: Array<Value>
  rightOnly: Array<Value>
}

export type ComparisonDetails = Xor<[
  Xor<[
    DetailSame,
    DetailDiffering,
    DetailSame & DetailDiffering
  ]> & Partial<DetailOnly>,
  AtLeastOne<DetailOnly>
]>;

export type ComparisonResult = EmptyObject | (
  Xor<[{ 
      left: Value,
      right: Value
    }, {
      same: Value
    }, {
      leftSame: Value,
      rightSame: Value
    }]> & { details?: ComparisonDetails }
  );

export const isValueResult = (v: unknown): v is ValueResult => 
  typeof v === 'object' && v !== null && 
  'typeName' in v && 'value' in v;

export const isValueResults = (v: unknown): v is ValueResults =>
  Array.isArray(v) && v.every(isValueResult);

const isComparisonResultBase = (v: object, verifyResultProp: (pv: unknown) => boolean): boolean => {
  let samePair = 0;
  let same = 0;
  let diff = 0;

  // Check for illegal combinations of same and diff
  for (const key in v) {
    switch (key) {
      case 'left':
      case 'right':
        if (same || samePair) {
          return false;
        }
        diff += 1;
        break;

      case 'same':
        if (diff || samePair) {
          return false;
        }
        same += 1;
        break;
        
      case 'leftSame':
      case 'rightSame':
        if (diff || same) {
          return false;
        }
        samePair += 1;
        break;
      }
  }

  if ((diff && diff !== 2) || (samePair && samePair !== 2)) {
    return false;
  }

  return comparisonKeys.every((key) => (!(key in v) || verifyResultProp((v as Record<string, unknown>)[key])));
};

export const isComparisonDetail = (v: unknown): v is ComparisonDetails => {
  if (v && typeof v === 'object') {
    if (!isComparisonResultBase(v, isValueResults)) {
      return false;
    }
  } else {
    return false;
  }
  return ['leftOnly', 'rightOnly'].every(key => (!(key in v) || isValueResults((v as Record<string, unknown>)[key])));
}

export const isComparisonResult = (v: unknown): v is ComparisonResult => {
  if (v && typeof v== 'object') {
    if (isEmptyObject(v)) {
      return true;
    }
    if (!isComparisonResultBase(v, isValueResult)) {
      return false;
    }
  } else {
    return false;
  }

  if ('details' in v) {
    return isComparisonDetail(v.details);
  }

  return true;
};
