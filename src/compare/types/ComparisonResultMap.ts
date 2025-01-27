import { isEmptyObject } from '@lib/types';
import {
  type ComparisonResult,
  type ComparisonValueKey,
  type ValueResult,
  comparisonKeys,
} from '.';

import {
  type KeyPrefix,
  type MapKey,
  MapKeyManager,
} from './MapKey';

import { valueToValueResult } from '@compare/util';

const resultKeys = ['d', 's', 'o'] as const;
export type ResultKey = typeof resultKeys[number];

export type ResultMap = Partial<{
  [key in ResultKey]: Array<MapKey>;
}>;

export type CompositeMap = Record<MapKey, ResultMap>;

const mergeToResultMap = (destResultMap: ResultMap, srcResultMap: ResultMap): ResultMap => 
  resultKeys.reduce((acc, key) => ({
    ...acc, [key]: [...(destResultMap[key] || []), ...(srcResultMap[key] || [])]
  }), destResultMap || {});

const mergeResultToCompositeMap = (destCompositeMap: CompositeMap, key: MapKey, srcResultMap: ResultMap): CompositeMap => ({
  ...destCompositeMap,
  [key]: mergeToResultMap(destCompositeMap[key], srcResultMap)
});

export class ComparisonResultMap {
  private resultList: Array<CompositeMap>;
  private valueResultDictionary: Record<MapKey, ValueResult>;

  private currentResult: CompositeMap | null = null;
  private resultLevel: number = 0;
  private valueKeyManagerMap: Record<KeyPrefix, MapKeyManager>;

  private leftKeyManager: MapKeyManager;
  private rightKeyManager: MapKeyManager;

  private leftParentMapKey: MapKey | null = null;
  private rightParentMapKey: MapKey | null = null;

  private static resultKeyMap: Record<ComparisonValueKey, ResultKey> = {
    left: 'd',
    leftSame: 's',
    rightSame: 's',
    right: 'd',
    same: 's',
    rightOnly: 'o',
    leftOnly: 'o'
  };

  private static valueKeyMap: Record<ComparisonValueKey, Array<KeyPrefix>> = {
    left: ['L'],
    right: ['R'],
    leftSame: ['L'],
    rightSame: ['R'],
    same: ['L', 'R'],
    rightOnly: ['R'],
    leftOnly: ['L']
  };

  constructor() {
    this.resultList = [];
    this.valueResultDictionary = {};
    this.leftKeyManager = new MapKeyManager('L');
    this.rightKeyManager = new MapKeyManager('R');
    this.valueKeyManagerMap = {
      L: this.leftKeyManager,
      R: this.rightKeyManager
    };
    this.leftParentMapKey = this.leftKeyManager.getKey();  // L$
    this.rightParentMapKey = this.rightKeyManager.getKey(); // R$
  }

  public incrementResultLevel() {
    if (!this.currentResult) {
      throw new Error('Internal error: current result is null');
    }
    this.resultLevel++;
    this.leftKeyManager.pushLevel();
    this.rightKeyManager.pushLevel();
    this.currentResult = null;
  }

  public updateResult(key: MapKey, resultMap: Partial<ResultMap>) {
    this.currentResult = mergeResultToCompositeMap(this.currentResult || {}, key, resultMap);
    if (this.resultLevel === this.resultList.length) {
      this.resultList.push(this.currentResult);
    }
  }

  public addResult(comparisonResult: ComparisonResult) {
    if (isEmptyObject(comparisonResult)) {
      return;
    }
    comparisonKeys.forEach((key) => {
      if (!(key in comparisonResult)) {
        return;
      }

      const resultKey = ComparisonResultMap.resultKeyMap[key];
      if (!resultKey) {
        throw new Error(`Internal error: result key not found for ${key}`);
      }
      const valueKeys = ComparisonResultMap.valueKeyMap[key];
      if (!valueKeys) {
        throw new Error(`Internal error: value key not found for ${key}`);
      }
      const valueResult = valueToValueResult(comparisonResult[key]);
      valueKeys.forEach((valueKey) => {
        const mapKey = this.valueKeyManagerMap[valueKey].nextKey();
        this.valueResultDictionary[mapKey] = valueResult;
        this.updateResult(this.valueKeyManagerMap[valueKey].getParentKey(), { [resultKey]: [mapKey] });
      });
    });
  }

  get resultMaps() {
    return this.resultList;
  }
}
