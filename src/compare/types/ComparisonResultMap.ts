import { isEmptyObject } from '@lib/types';
import {
  type ComparisonDetails,
  type ComparisonResult,
  type ComparisonValueKey,
  type ValueResult,
  comparisonDetailKeys,
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

  public pushResultLevel() {
    if (!this.currentResult) {
      throw new Error('Internal error: current result is null');
    }
    this.resultLevel++;
    this.leftKeyManager.pushLevel();
    this.rightKeyManager.pushLevel();
    this.currentResult = null;
  }

  public popResultLevel() {
    if (this.resultLevel === 0) {
      throw new Error('Internal error: result level is 0');
    }
    this.resultLevel--;
    this.leftKeyManager.popLevel();
    this.rightKeyManager.popLevel();
    this.currentResult = this.resultList[this.resultLevel];
  }

  public updateResult(key: MapKey, resultMap: Partial<ResultMap>) {
    if (!this.currentResult) {
      // just starting
      this.currentResult = {};
      this.resultList.push(this.currentResult);
    }
    this.currentResult = mergeResultToCompositeMap(this.currentResult, key, resultMap);
  }

  public addResult(comparisonResult: ComparisonResult) {
    if (isEmptyObject(comparisonResult)) {
      return;
    }
    // Cycle through 'same', 'leftSame', 'rightSame', ...
    for (const comparisonResultKey of comparisonKeys) {
      if (!(comparisonResultKey in comparisonResult)) {
        continue;
      }

      const comparedValue = comparisonResult[comparisonResultKey];
      
      // e.g., 'left' -> 'd', 'same' -> 's'
      const mappedResultKey = ComparisonResultMap.resultKeyMap[comparisonResultKey];

      // e.g., 'left' -> ['L'], 'same' -> ['L', 'R']
      const leftRightKeys = ComparisonResultMap.valueKeyMap[comparisonResultKey];

      const valueResult = valueToValueResult(comparedValue);
      for (const leftRightKey of leftRightKeys) {
        const mapKey = this.valueKeyManagerMap[leftRightKey].nextKey();
        this.valueResultDictionary[mapKey] = valueResult;
        this.updateResult(this.valueKeyManagerMap[leftRightKey].getParentKey(), { [mappedResultKey]: [mapKey] });
      };
    }
  }

  public addResultDetail(comparisonDetails: ComparisonDetails) {
    // Cycle through 'leftOnly', 'rightOnly', 'same', 'leftSame', 'rightSame', ...
    for (const comparisonDetailKey of comparisonDetailKeys) {
      if (!(comparisonDetailKey in comparisonDetails)) {
        continue;
      }

      const comparedValues = comparisonDetails[comparisonDetailKey as keyof ComparisonDetails];
      if (!comparedValues) {
        continue;
      }

      // e.g., 'left' -> 'd', 'same' -> 's'   
      const mappedResultKey = ComparisonResultMap.resultKeyMap[comparisonDetailKey];

      // e.g., 'left' -> ['L'], 'same' -> ['L', 'R']
      const leftRightKeys = ComparisonResultMap.valueKeyMap[comparisonDetailKey];

      const valueResults = comparedValues.map(v => valueToValueResult(v));
      for (const leftRightKey of leftRightKeys) {
        for (const valueResult of valueResults) {
          const mapKey = this.valueKeyManagerMap[leftRightKey].nextKey();
          this.valueResultDictionary[mapKey] = valueResult;
          this.updateResult(this.valueKeyManagerMap[leftRightKey].getParentKey(), { [mappedResultKey]: [mapKey] });
        }
      }
    }
  }

  get resultMaps() {
    return this.resultList;
  }
}
