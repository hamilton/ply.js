import Ply from '../src/ply'
import { ds1, ds2, ds3, ds4, ds5, sameArrayContents } from './test-data'


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

describe('select', () => {
  it('throws for weird or bad values', () => {
    expect(() => new Ply(ds1).select().transform()).toThrow()
    expect(() => new Ply(ds1).select([1, 2, 3, 4, 5]).transform()).toThrow()
  })
  it('gracefully removes vars from a df by collection of strings', () => {
    const test = new Ply(ds1).select('u', 'v', 'z').transform()
    expect(test.length).toBe(ds1.length)
    test.forEach((d, i) => {
      expect(Object.keys(d).length).toBe(3)
      Object.keys(d).forEach((f) => {
        expect(d[f]).toBe(ds1[i][f])
      })
    })
  })
  it('removes vars from a df by a function operating on fields returning truthy or falsy values', () => {
    const test = new Ply(ds1).select(field => field.toLowerCase() > 'v').transform()
    expect(Object.keys(test[0]).length).toBe(4)
  })
})

describe('sort', () => {
  it('throws if you pass a non-function', () => {
    expect(() => new Ply(ds5).sort('whatever!').transform()).toThrow()
  })
  it('sorts', () => {
    const test = new Ply(ds5).sort((a, b) => a.x > b.x).transform()
    expect(test.length).toBe(ds5.length)
    expect(test[0]).toEqual({ x: 'a', z: 10 })
    expect(test[1]).toEqual({ x: 'b', z: 20 })
    expect(test[2]).toEqual({ x: 'c', z: 101 })
    expect(test[3]).toEqual({ x: 'd', z: 100 })
  })
})
