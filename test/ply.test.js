import Ply, { rank } from '../src/ply'

const ds1 = [
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

const ds2 = [
  { w: 'h', x: 'a', y: 1 },
  { w: 'h', x: 'a', y: 1 },
  { w: 'i', x: 'a', y: 1 },
  { w: 'i', x: 'a', y: 1 },
  { w: 'h', x: 'b', y: 100 },
  { w: 'h', x: 'b', y: 100 },
  { w: 'i', x: 'b', y: 100 },
  { w: 'i', x: 'b', y: 100 },
]

const sameArrayContents = (a, b) => {
  expect(a).toEqual(expect.arrayContaining(b))
  expect(b).toEqual(expect.arrayContaining(a))
}

describe('input error handling', () => {
  it('handles the case of wrong inputs', () => {
    expect(() => new Ply()).toThrow()
    expect(() => new Ply('hello')).toThrow()
    expect(() => new Ply({})).toThrow()
  })
  it('handles the case of the correct inputs (arrays)', () => {
    expect(() => new Ply(ds2)).not.toThrow()
  })
  it('handles the case of an array where not all objects are objects', () => {
    expect(() => new Ply([...ds2, 10000])).toThrow()
  })
})

describe('basic group tests', () => {
  const stringPly = new Ply(ds2).group('x', 'w').transform()
  it('returns an an object of arrays', () => {
    expect(typeof stringPly).toBe('object')
    expect(Array.isArray(stringPly)).toBe(false)
    Object.keys(stringPly).forEach((k) => {
      expect(Array.isArray(stringPly[k])).toBe(true)
    })
  })
  it('expects the grouped values to be in the subsets', () => {
    Object.keys(stringPly).forEach((k) => {
      const [kx, kw] = k.split('||')
      const subset = stringPly[k]
      expect(subset.map(d => d.x).every(x => x === kx)).toBe(true)
      expect(subset.map(d => d.w).every(w => w === kw)).toBe(true)
    })
  })
  it('expects the group value to be the pairwise set of observed grouped variables', () => {
    const keys = Object.keys(stringPly)
    const expected = ['a||h', 'a||i', 'b||h', 'b||i']
    sameArrayContents(keys, expected)
  })
  it('expects the subsets to have a length that matches the original data set, if filtered appropriately', () => {
    const lengths = Object.keys(stringPly).map(g => stringPly[g].length)
    expect(!lengths.some(d => d === 2)).toBe(false)
  })
})

describe('group with numbers', () => {
  const numPly = new Ply(ds2).group('y').transform()
  it('groups the numbers as strings', () => {
    const stringValues = ['1', '100']
    const keys = Object.keys(numPly)
    sameArrayContents(stringValues, keys)
  })
  it('has subsets that matches the lengths of the original filtered version of the dataset', () => {
    expect(Object.keys(numPly).map(k => numPly[k]).every(ds => ds.length === 4)).toBe(true)
  })
})

describe('group with booleans', () => {
  const bool2Ply = new Ply(ds1).group('u', 'v').transform()
  it('groups booleans like strings', () => {
    const keys = Object.keys(bool2Ply)
    const expected = ['true||true', 'true||false', 'false||false', 'true||true']
    const union = [...new Set([...keys, ...expected])]
    expect(union.length - expected.length).toBe(0)
  })
})

const ds3 = [
  { date: new Date('2010-01-01'), x: 1 },
  { date: new Date('2010-01-01'), x: 1 },
  { date: new Date('2010-01-02'), x: 1 },
  { date: new Date('2010-01-02'), x: 1 },
]

describe('group with Date objects', () => {
  const date2Ply = new Ply(ds3).group('date').transform()
  it('should group by the .toString representation of a Date object', () => {
    const expected = Array.from(ds3.reduce((acc, v) => {
      acc.add(v.date.toString()); return acc
    }, new Set([])))
    const keys = Object.keys(date2Ply)
    sameArrayContents(expected, keys)
  })
})

// reduce on its own narrows down to one row.

describe('reduce without group', () => {
  const reducers = {
    b: arr => arr.length,
  }
  const p = new Ply(ds1).reduce(reducers).transform()
  it('reduces down to one row when used on its own', () => {
    expect(p.length).toBe(1)
  })
  it('has its fields reduced to two entries', () => {
    expect(Object.keys(p[0]).length).toBe(Object.keys(reducers).length)
  })
  it('has fields that match the reducer field', () => {
    expect(p[0].b).toBe(ds1.length)
  })
  it('is a single object in an array', () => {
    expect(typeof p[0]).toBe('object')
  })
})

describe('reduce a grouped data set with object of functions', () => {
  const reducePly = new Ply(ds1).group('u').reduce({
    x: arr => arr.length,
    y: arr => arr.reduce((acc, v) => acc + v.z, 0),
  }).transform()
  it('reduces a group data set to have to right number of rows', () => {
    expect(reducePly.length).toBe(2)
  })

  it('reduces a group data set to have only the defined variables', () => {
    // x is 6, y is 600.
    reducePly.forEach((d) => {
      expect(d.x).toBe(6)
      expect(d.y).toBe(600)
    })
    sameArrayContents(reducePly.map(d => d.u), [true, false])
  })
})

describe('reduce a grouped data set with arguments that only have a value', () => {
  const reducePly = new Ply(ds1).group('u').reduce({
    x: 10,
    y: 'a',
  }).transform()
  it('passes the value if the reducer entry is not a function', () => {
    sameArrayContents(reducePly.map(d => d.x), new Array(2).fill(10))
    sameArrayContents(reducePly.map(d => d.y), new Array(2).fill('a'))
  })
})

describe('mapping an ungrouped data set', () => {
  const data = [{ x: 'hello', y: 10000, z: 1 }]
  const ungroupedMapPly = new Ply(data).map(p => ({ i: p.y })).transform()
  it('returns data that is the same length as the input', () => {
    expect(ungroupedMapPly.length).toBe(data.length)
  })
  it('expects the mapping function to return an array of mapped return values', () => {
    expect(ungroupedMapPly[0].i).toBe(data[0].y)
  })
})

const ds4 = [
  { x: 'a', y: 1 },
  { x: 'a', y: 2 },
  { x: 'b', y: 100 },
  { x: 'b', y: 200 },
]

describe('mapping a grouped data set', () => {
  const groupedMapPly = new Ply(ds4).group('x').map(d => d.y).transform()
  it('contains the same number of groups as an unmapped data set', () => {
    const groupedNoMapPly = new Ply(ds4).group('x').transform()
    sameArrayContents(Object.keys(groupedNoMapPly), Object.keys(groupedMapPly))
  })
  it('has groups that contain the mapped contents', () => {
    expect(groupedMapPly).toEqual({ a: [1, 2], b: [100, 200] })
  })
})

describe('clearing a Ply object', () => {
  const test = new Ply(ds1).group('x').map(d => d.y)
  const out1 = test.transform()
  const out2 = test.clear().reduce({ x: arr => arr.length }).transform()
  const out3 = test.clear().reduce({ x: arr => arr.length }).transform()
  const out4 = test.clear().reduce({ y: arr => arr.length }).transform()
  it('clears the Ply object by setting funcs=[] and step=STEPS.DATASET', () => {
    expect(out1).not.toEqual(out2)
    expect(out2).toEqual(out3)
    expect(out2).not.toEqual(out4)
  })
})


/* ---------------------------------------------------------------- */
/* ---------------------------------------------------------------- */
/*                         Class Methods                            */
/* ---------------------------------------------------------------- */
/* ---------------------------------------------------------------- */

describe('Ply.sum', () => {
  const simplePly = new Ply(ds1).reduce({ y: Ply.sum('y') }).transform()
  const sumStr = [
    { x: 'a', y: 1 },
    { x: 'a', y: 1 },
    { x: 'b', y: 2 },
    { x: 'b', y: 2 },
  ]
  it('sums numbers based on the accessor you pass in', () => {
    expect(simplePly[0].y).toBe(ds1.map(d => d.y).reduce((a, b) => a + b, 0))
  })
  it('throws an error if the reduction is done against non-numbers', () => {
    expect(() => {
      new Ply(sumStr).group('y').reduce({
        x: Ply.sum('x'),
      }).transform()
    }).toThrow()
  })
  it('throws an error if one the objects do not contain the key', () => {
    expect(() => { Ply.sum('z')(sumStr) }).toThrow()
  })
  it('returns 0 if the array passed in has length 0', () => {
    expect(Ply.sum('x')([])).toBe(0)
  })
})
const toDS = vals => vals.map(d => ({ x: d }))
describe('Ply.mean', () => {
  it('returns NaN when array is empty', () => {
    expect(Ply.mean('x')([])).toBe(NaN)
  })
  it('throws an error if any of the objects in array do not have the key', () => {
    expect(() => {
      Ply.mean('x')([{ a: 10 }])
    }).toThrow()
  })
  it('throws an error if any of the objects in the array do not contain Number entries for given key', () => {
    expect(() => {
      Ply.mean('x')([{ x: 'test' }])
    }).toThrow()
  })
  it('computes the mean appropriately', () => {
    expect(Ply.mean('x')(toDS([5, 5, 5, 6, 4, 2, 15]))).toBeCloseTo(6)
    expect(Ply.mean('x')(toDS([100, 40, 3, 1, 2]))).toBeCloseTo(29.2)
    expect(Ply.mean('x')(toDS([643.234, 4545.21, 100.4, 174.43, 532.53, 164.73, 8436.53])))
      .toBeCloseTo(2085.295)
  })
  // todo = more numerical tests.
})
describe('Ply.variance', () => {
  it('returns 0 if data.length < 2', () => {
    expect(Ply.variance('x')(toDS([10]))).toBe(0)
  })
  it('calculates the variance', () => {
    const num = toDS([100, 40, 3, 1, 2])
    expect(Ply.variance('x')(num)).toBeCloseTo(1837.7)
  })
})

describe('Ply.standardDeviation', () => {
  it('calculates the standard deviation', () => {
    expect(Ply.standardDeviation('x')(toDS([100, 40, 3, 1, 2]))).toBeCloseTo(42.8684)
  })
})
describe('Ply.max', () => {
  it('calculates the max using Math.max', () => {
    expect(Ply.max('x')(toDS([0, 10, 100]))).toBe(100)
  })
  it('returns exactly what Math.max would return on an empty argument list', () => {
    expect(Ply.max('x')()).toBe(-Infinity)
  })
})
describe('Ply.min', () => {
  it('calculates the max using Math.min', () => {
    expect(Ply.min('x')(toDS([0, 10, 100]))).toBe(0)
  })
  it('returns exactly what Math.min would return on an empty argument list', () => {
    expect(Ply.min('x')()).toBe(Infinity)
  })
})


const xCov = [
  { x: 5.5, y: 6.7 },
  { x: 4.4, y: 15.3 },
  { x: 9.0, y: 3.3 },
  { x: 25.3, y: 59.6 },
  { x: 22.4, y: 15.0 },
]
const cov = Ply.covariance('x', 'y')
describe('Ply.covariance', () => {
  it('returns 0 if data.length < 2', () => {
    expect(cov(toDS([10]))).toBe(0)
  })
  it('calculates the covariance', () => {
    expect(cov(xCov)).toBeCloseTo(161.7705)
  })
})

const cor = Ply.correlation('x', 'y')
describe('Ply.correlation', () => {
  it('returns NaN if length < 2', () => {
    expect(cor(xCov.slice(0, 1))).toBe(NaN)
  })
  it('calculates the correlation coefficient', () => {
    expect(cor(xCov)).toBeCloseTo(0.724355)
  })
})

const xRank = [
  { x: 5.5, y: 10.10 }, // 2
  { x: 5.5, y: 12.53 }, // 3
  { x: 9.2, y: 9.5 }, // 4
  { x: 3.5, y: 20.43 }, // 1
  { x: 20.20, y: 1.4 }, // 5
]

const rx = rank('x')
describe('{rank}', () => {
  it('does the rank', () => {
    expect(rx(xRank)).toEqual([2, 3, 4, 1, 5])
  })
})
const spearman = Ply.spearman('x', 'y')
describe('Ply.spearman', () => {
  it('computes rho', () => {
    expect(spearman(xCov)).toBeCloseTo(0.3)
  })
})

const xs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const ys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
describe('Ply.quantile', () => {
  it('returns NaN if passed array is empty', () => {
    expect(Ply.quantile(0.5, 'x')([])).toBe(NaN)
  })
  it('throws an error if argument is not array', () => {
    expect(() => Ply.quantile(0.5, 'x')('hello')).toThrow()
  })
  it('calculates the quantile if passed in only a single value', () => {
    const x1 = toDS(xs)
    const x2 = toDS(ys)
    expect(Ply.quantile(0.5, 'x')(x2)).toBeCloseTo(5.5)
    expect(Ply.quantile(0, 'x')(x2)).toBeCloseTo(1)
    expect(Ply.quantile(1.5, 'x')(x2)).toBeCloseTo(10)
    expect(Ply.quantile(3 / 10, 'x')(x2)).toBeCloseTo(3.5)
    expect(Ply.quantile(0.5, 'x')(x1)).toBeCloseTo(6)
    expect(Ply.quantile(0, 'x')(x1)).toBeCloseTo(1)
    expect(Ply.quantile(1.5, 'x')(x1)).toBeCloseTo(11)
    expect(Ply.quantile(3 / 10, 'x')(x1)).toBeCloseTo(4)
  })
  it('calculates the quantiles if passed q is an array of proportions', () => {
    const x1 = toDS(xs)
    const x2 = toDS(ys)
    sameArrayContents(Ply.quantile([0, 0.25, 0.5, 0.75, 1], 'x')(x2), [1, 3, 5.5, 8, 10])
    sameArrayContents(Ply.quantile([0, 0.25, 0.5, 0.75, 1], 'x')(x1), [1, 3, 6, 9, 11])
  })
})
describe('Ply.median', () => {
  const med1 = toDS(xs)
  const med2 = toDS(ys)
  it('returns NaN if passed array is empty', () => {
    expect(Ply.median('x')([])).toBe(NaN)
  })
  it('throws an error if argument is not array', () => {
    expect(() => Ply.median('x')('hello')).toThrow()
  })
  it('calculates the median using Ply.quantile', () => {
    expect(Ply.median('x')(med1)).toBeCloseTo(6)
    expect(Ply.median('x')(med2)).toBeCloseTo(5.5)
  })
})
describe('Ply.IQR', () => {
  const med1 = toDS(xs)
  const med2 = toDS(ys)
  it('returns NaN if passed array is empty', () => {
    expect(Ply.IQR('x')([])).toBe(NaN)
  })
  it('throws an error if argument is not array', () => {
    expect(() => Ply.IQR('x')('hello')).toThrow()
  })
  it('calculates the IQR', () => {
    expect(Ply.IQR('x')(med1)).toBeCloseTo(6)
    expect(Ply.IQR('x')(med2)).toBeCloseTo(5)
  })
})

describe('Ply.mode', () => {
  const mode1 = toDS(['a', 'a', 'a', 'a', 'a', 'c', 'b', 'b', 'b'])
  const mode2 = toDS(['a', 'b'])
  it('returns null if passed array is empty', () => {
    expect(Ply.mode('x')([])).toBe(null)
  })
  it('throws if non-array is passed', () => {
    expect(() => Ply.mode('x')({})).toThrow()
  })
  it('calculates the mode when the case is clear', () => {
    expect(Ply.mode('x')(mode1)).toBe('a')
    // this one feels wrong. It should probably return 'a' and 'b'. hmm.
    expect(Ply.mode('x')(mode2)).toBe('a')
  })
})
