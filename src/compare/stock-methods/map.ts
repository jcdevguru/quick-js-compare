import type { MapObject } from "../../lib/types";
import type { ComparisonStatus } from "../types";
import { commonSetElements } from '../../lib/util';
import { keys } from './util';

export const sizeOnly = (left: MapObject, right: MapObject): ComparisonStatus => {
  return left.size === right.size;
}

export const strict = (left: MapObject, right: MapObject): ComparisonStatus => {
  // Incomplete
  return left === right;
}

export const keysOnly = (left: MapObject, right: MapObject): ComparisonStatus => {
  let status: ComparisonStatus = undefined;
  const leftKeys = new Set(keys(left));
  const rightKeys = new Set(keys(right));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sameKeys = commonSetElements(leftKeys, rightKeys, true);

  if (leftKeys.size === rightKeys.size && !leftKeys.size) {
    status = true;
  } else {
    status = false;
  }
  // TODO: implement
  return status;
}
