import Ply from '../src/ply'
import { rank } from '../src/reducers'
import { ds1, sameArrayContents } from './test-data'

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

