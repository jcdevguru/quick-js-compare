import { StdObjectCompare } from './src/std-object-compare';
import type { CompareItem, StdObjectEntry } from './src/base-types';
import { sparseEntriesToStdObject } from './src/util';

const cmp = new StdObjectCompare();

const asString = (o: any) => {
  let v;
  try {
    v = JSON.stringify(o);
  } catch (err) {
    v = '(circ)'
  }

  return v;
}

const showIt = (left: unknown, right: unknown, result: unknown) => {
  const jsons = [left, right].map(v => JSON.stringify(v));
  console.log(`${jsons[0]}\n${jsons[1]} =>`);
  const r = result as Record<string, unknown>;
  Object.keys(r).forEach(k => { console.log(` ${k} : ${asString(r[k])}`) });
}

// const ops = [{ b: 5, d: 'r', a: 2 }, { a: 2, c: 'bird', b: 5, d: 'q' }];
// const r1 = cmp.compare(ops[0], ops[1]);
// showIt(ops[0], ops[1], r1);

// circular nonsense
const left = { a: { c: 1, e: {}, d: { a: 1 }}};
// should be ok - reference at same level
// left.a.e = left.a.d; 
const right = { a: { c: 2, d: { a: 3 }, e: { a: 4  }}};

const r2 = cmp.compare(left, right);
const result = r2.result.map((a) => sparseEntriesToStdObject(a as Array<StdObjectEntry|undefined>));
showIt(left, right, result);


// // now mess with them.
// // no results should exist from left.a.e
// left.a.e = left.a;

// const r3 = cmp.compare(left, right);
// showIt('left', right, r3);

// // ok to reference between objects
// left.a.e = right.a;

// const r4 = cmp.compare(left, right);
// console.log(JSON.stringify(r4, null, 2));