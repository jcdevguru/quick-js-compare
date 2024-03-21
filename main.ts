import { StdObjectCompare } from './src/std-object-compare';
import type { Value, StdObjectEntry } from './src/compare-types';
import { sparseEntriesToStdObject } from './src/compare-util';

const cmp = new StdObjectCompare();

// const asString = (o: any) => {
//   let v;
//   try {
//     v = JSON.stringify(o);
//   } catch (err) {
//     v = '(circ)'
//   }

//   return v;
// }

const showIt = (left: unknown, right: unknown, result: unknown, ...sargs: unknown[]) => {
  const jsons = [left, right].map(v => JSON.stringify(v, ...sargs as any[]));
  console.log(`${jsons[0]}\n${jsons[1]} =>`);
  const r = result as Record<string, unknown>;
  console.log(JSON.stringify(r, ...sargs as any[]));
}

// const ops = [{ b: 5, d: 'r', a: 2 }, { a: 2, c: 'bird', b: 5, d: 'q' }];
// const r1 = cmp.compare(ops[0], ops[1]);
// showIt(ops[0], ops[1], r1);

// circular nonsense
// const left = { q: 'uniq', a: { c: 1, e: {}, d: { a: 1 }}, f: 'matcher'};
// // should be ok - reference at same level
// // left.a.e = left.a.d; 
// const right = { a: { c: 2, d: { a: 3 }, e: { a: 4  }}, f: 'matcher', x: 'sole'};

// const r2 = cmp.compare(left, right);
// let result = r2.result.map((a) => sparseEntriesToStdObject(a as Array<StdObjectEntry|undefined>));
// showIt(left, right, result);

const value1 = { a: 1, b: 'abc', x: 5, c: 'def', details: { title: 'Shopping list', cost: 2.14 }};
const value2 = { b: 'abc', a: 2, c: 'def', details: { title: 'Shopping list', cost: 2.9 }};

const r3 = cmp.compare(value1, value2);
const result3 = r3.result.map((a) => sparseEntriesToStdObject(a as Array<StdObjectEntry|undefined>));
showIt(value1, value2, result3, null, 2);
// // now mess with them.
// // no results should exist from left.a.e
// left.a.e = left.a;

// const r3 = cmp.compare(left, right);
// showIt('left', right, r3);

// // ok to reference between objects
// left.a.e = right.a;

// const r4 = cmp.compare(left, right);
// console.log(JSON.stringify(r4, null, 2));