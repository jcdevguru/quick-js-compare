import Compare from './src/compare';
// import type { Value, StdObjectEntry } from './src/lib/types';

const cmp = new Compare();

// const asString = (o: any) => {
//   let v;
//   try {
//     v = JSON.stringify(o);
//   } catch (err) {
//     v = '(circ)'
//   }

//   return v;
// }

// const showIt = (left: unknown, right: unknown, result: unknown, ...sargs: unknown[]) => {
//   const jsons = [left, right].map(v => JSON.stringify(v, ...sargs as any[]));
//   console.log(`${jsons[0]}\n${jsons[1]} =>`);
//   const r = result as Record<string, unknown>;
//   console.log(JSON.stringify(r, ...sargs as any[]));
// }

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

const value1 = {
  a: 10,
  b: { v: 'a', x: 11, y: 12, z: 114 },
  c: 20,
  e: 1,
};

const value2 = {
  a: 10,
  c: 20,
  b: { v: 'a', x: 21, y: 22 },
  d: 30,
  e: { c: 'yes', d: 'no' }
}

const r3 = cmp.compare(value1, value2);
console.log(JSON.stringify(r3, null, 2));
// const result3 = r3.result.map((a) => sparseEntriesToStdObject(a as Array<StdObjectEntry|undefined>));
// showIt(value1, value2, result3, null, 2);
// // now mess with them.
// // no results should exist from left.a.e
// left.a.e = left.a;

// const r3 = cmp.compare(left, right);
// showIt('left', right, r3);

// // ok to reference between objects
// left.a.e = right.a;

// const r4 = cmp.compare(left, right);
// console.log(JSON.stringify(r4, null, 2));