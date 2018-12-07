
export const sameArrayContents = (a, b) => {
  expect(a).toEqual(expect.arrayContaining(b))
  expect(b).toEqual(expect.arrayContaining(a))
}

export const ds1 = [
  {
    u: true, v: true, w: 'h', x: 'a', y: 1, z: 100,
  },
  {
    u: false, v: true, w: 'h', x: 'a', y: 1, z: 100,
  },
  {
    u: true, v: true, w: 'i', x: 'a', y: 1, z: 100,
  },
  {
    u: false, v: true, w: 'i', x: 'a', y: 1, z: 100,
  },
  {
    u: true, v: true, w: 'h', x: 'b', y: 1, z: 100,
  },
  {
    u: false, v: true, w: 'h', x: 'b', y: 1, z: 100,
  },
  {
    u: true, v: false, w: 'i', x: 'b', y: 1, z: 100,
  },
  {
    u: false, v: false, w: 'i', x: 'b', y: 1, z: 100,
  },
  {
    u: true, v: false, w: 'h', x: 'c', y: 1, z: 100,
  },
  {
    u: false, v: false, w: 'h', x: 'c', y: 1, z: 100,
  },
  {
    u: true, v: false, w: 'i', x: 'c', y: 1, z: 100,
  },
  {
    u: false, v: false, w: 'i', x: 'c', y: 1, z: 100,
  },
]

export const ds2 = [
  { w: 'h', x: 'a', y: 1 },
  { w: 'h', x: 'a', y: 1 },
  { w: 'i', x: 'a', y: 1 },
  { w: 'i', x: 'a', y: 1 },
  { w: 'h', x: 'b', y: 100 },
  { w: 'h', x: 'b', y: 100 },
  { w: 'i', x: 'b', y: 100 },
  { w: 'i', x: 'b', y: 100 },
]

export const ds3 = [
  { date: new Date('2010-01-01'), x: 1 },
  { date: new Date('2010-01-01'), x: 1 },
  { date: new Date('2010-01-02'), x: 1 },
  { date: new Date('2010-01-02'), x: 1 },
]

export const ds4 = [
  { x: 'a', y: 1 },
  { x: 'a', y: 2 },
  { x: 'b', y: 100 },
  { x: 'b', y: 200 },
]

export const ds5 = [
  { x: 'a', z: 10 },
  { x: 'c', z: 101 },
  { x: 'b', z: 20 },
  { x: 'd', z: 100 },
]
