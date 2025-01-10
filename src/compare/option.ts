import {
  type CompareFunction,
  isCompareFunction
} from './types';

import {
  type CompareConfigOptions,
  type CompareOptionAlias,
  type CompareMethodConfig,
  type MinimalCompareConfigOptions,
  type CompareConfigOptionKey,
  type CompareMethodConfigKey,
  isCompareConfigToken,
  isCompareMethodConfig,
} from './types/config';

import { compareTokenToStockMethodMap } from '@compare/stock-methods';

const ExactCompareConfig: CompareConfigOptions = {
  compareScalar: 'strict',
  compareObject: 'strict',
  compareMap: 'strict',
  compareArray: 'strict',
  compareSet: 'strict',
};

export const defaultCompareConfigOptions = ExactCompareConfig;

// Map string-based comparison options to their object-based equivalents


export const optionAliasToConfigOptions = (token: CompareOptionAlias): CompareConfigOptions => {
  const aliasConfigOptionMap: Record<CompareOptionAlias, CompareConfigOptions> = {
    Exact: ExactCompareConfig,
    Equivalent: {
      compareScalar: 'strict',
      compareObject: 'keyValueOrder',
      compareMap: 'keyValueOrder',
      compareArray: 'valueOrder',
      compareSet: 'valuesOnly',
    },
    General: {
      compareScalar: 'abstract',
      compareObject: 'keyValue',
      compareMap: 'keyValue',
      compareArray: 'valuesOnly',
      compareSet: 'valuesOnly',
    },
    Structure: {
      compareScalar: 'alwaysSame',
      compareObject: 'typeOnly',
      compareMap: 'typeOnly',
      compareArray: 'typeOnly',
      compareSet: 'typeOnly',
    },
  };

  return aliasConfigOptionMap[token];
};

const compareOptionKeyToMethodObjectKey = (key: CompareConfigOptionKey): CompareMethodConfigKey => `${key}Method`;

export const compareConfigToMethodConfig = (compareConfigOptions: MinimalCompareConfigOptions): CompareMethodConfig => {
  const methodObject: CompareMethodConfig = {} as CompareMethodConfig;
  
  for (const k of Object.keys(compareTokenToStockMethodMap) as CompareConfigOptionKey[]) {
    const cfg = compareConfigOptions[k] ?? ExactCompareConfig[k];
    let compareMethod;
    if (isCompareFunction(cfg)) {
      compareMethod = cfg;
    } else if (isCompareConfigToken(cfg)) { 
      compareMethod = (compareTokenToStockMethodMap[k] as Record<string, CompareFunction>)[cfg];
    } else {
      throw new Error('Error: unexpected compare option specfication');
    }
    methodObject[compareOptionKeyToMethodObjectKey(k)] = compareMethod;
  }

  if (!methodObject.compareMapMethod) {
    methodObject.compareMapMethod = methodObject.compareObjectMethod;
  }

  if (!isCompareMethodConfig(methodObject)) {
    throw new Error('Error: compare option method object is invalid');
  }

  return methodObject;
};
