import { ArrayObject } from "../../lib/types";
import { ComparisonStatus } from "../types";

export const sizeOnly = (left: ArrayObject, right: ArrayObject): ComparisonStatus => {
  return left.length === right.length;
}

export const strict = (left: ArrayObject, right: ArrayObject): ComparisonStatus => {
  // Incomplete
  return left === right;
}
