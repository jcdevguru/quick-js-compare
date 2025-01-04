import type { MapObject, ObjectKey } from "../../lib/types";
import type { CompareResult, ComparisonStatus, ValueResults } from "../types";
import { commonSetElements } from '../../lib/util';
import { valueToValueResult } from "../util";

import { type Compare } from "../..";

export const sizeOnly = (left: MapObject, right: MapObject): ComparisonStatus => {
  return left.size === right.size;
}

export const strict = (left: MapObject, right: MapObject): ComparisonStatus => {
  // Incomplete
  return left === right;
}

export const keysOnly = (left: MapObject, right: MapObject, cmp: Compare): ComparisonStatus => {
  let status: ComparisonStatus = undefined;
  const leftKeys = new Set(left.keys());
  const rightKeys = new Set(right.keys());

  const sameKeySet = commonSetElements(leftKeys, rightKeys, true) as Set<ObjectKey>;
  const sameKeys = Array.from(sameKeySet).map(key => valueToValueResult(key)) as ValueResults;

  const subResult: CompareResult = {};

  if (sameKeys.length > 0) {
    subResult.leftSame = sameKeys;
    subResult.rightSame = sameKeys;
  }

  if (leftKeys.size === rightKeys.size && !leftKeys.size) {
    status = true;
  } else {
    subResult.left = Array.from(leftKeys).map(key => valueToValueResult(key)) as ValueResults;
    subResult.right = Array.from(rightKeys).map(key => valueToValueResult(key)) as ValueResults;
    status = false;
  }

  cmp.setSubResult = subResult;

  return status;
}
