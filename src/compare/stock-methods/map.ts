import type { MapObject } from "../../lib/types";
import type { ComparisonStatus } from "../types";

export const sizeOnly = (left: MapObject, right: MapObject): ComparisonStatus => {
  return left.size === right.size;
}

export const strict = (left: MapObject, right: MapObject): ComparisonStatus => {
  // Incomplete
  return left === right;
}
