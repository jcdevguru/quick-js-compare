import type Compare from '@compare';
import { type Value, type ObjectKey, type AtLeastOne, type EmptyObject, isEmptyObject } from '@lib/types';

export type ComparisonStatus = boolean | undefined;

export type ComparisonDetailSetter = () => ComparisonDetails;

export type CompareFunction<T extends Value = Value> = (
  left: T,
  right: T,
  instance: Compare,
  detailSetter?: ComparisonDetailSetter
) => ComparisonStatus;

export const isCompareFunction = (v: unknown): v is CompareFunction =>
  typeof v === 'function' && v.length >= 2;

export type ValueResults = Array<ValueResult>;

export const comparisonKeys = ['left', 'leftSame', 'rightSame', 'right', 'same'] as const;
export const comparisonDetailKeys = ['leftOnly', ...comparisonKeys, 'rightOnly'] as const;
export const comparisonResultKeys = [...comparisonKeys, 'details'] as const;

let comparisonResultKeySet: Set<ComparisonResultKey>;
let comparisonDetailKeySet: Set<ComparisonDetailKey>;

export type ComparisonKey = typeof comparisonKeys[number];
export type ComparisonDetailKey = typeof comparisonDetailKeys[number];
export type ComparisonResultKey = typeof comparisonResultKeys[number];

export const isComparisonDetailKey = (key: unknown): key is ComparisonDetailKey => {
  comparisonDetailKeySet = comparisonDetailKeySet ?? new Set<ComparisonDetailKey>(comparisonDetailKeys);
  return comparisonDetailKeySet.has(key as ComparisonDetailKey);
};

export const isComparisonResultKey = (key: unknown): key is ComparisonResultKey => {
  comparisonDetailKeySet = comparisonDetailKeySet ?? new Set<ComparisonDetailKey>(comparisonDetailKeys);
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

type ComparisonBase = { 
  left: ValueResult,
  right: ValueResult
} | {
  same: ValueResult
} | {
  leftSame: ValueResult,
  rightSame: ValueResult
};

type IComparisonDetail = AtLeastOne<{
  leftOnly: ValueResults,
  rightOnly: ValueResults
}>;

interface IComparisonEquivalentDetail extends Omit<IComparisonDetail, never> {
  leftSame: ValueResults,
  rightSame: ValueResults
}

interface IComparisonDifferingDetail extends Omit<IComparisonDetail, never> {
  left: ValueResults,
  right: ValueResults
}

interface IComparisonSameDetail extends Omit<IComparisonDetail, never> {
  same: ValueResults
}

type ComparisonDetails = IComparisonDetail | IComparisonEquivalentDetail | IComparisonSameDetail | IComparisonDifferingDetail;

export type ComparisonResult = EmptyObject | 
  (ComparisonBase & { details?: ComparisonDetails });

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
