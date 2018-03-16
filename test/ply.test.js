import Ply from '../src/ply'

let ds1 = [
    {u: true,  v: true,  w: 'h', x: 'a', y: 1, z: 100},
    {u: false, v: true,  w: 'h', x: 'a', y: 1, z: 100},
    {u: true,  v: true,  w: 'i', x: 'a', y: 1, z: 100},
    {u: false, v: true,  w: 'i', x: 'a', y: 1, z: 100},
    {u: true,  v: true,  w: 'h', x: 'b', y: 1, z: 100},
    {u: false, v: true,  w: 'h', x: 'b', y: 1, z: 100},
    {u: true,  v: false, w: 'i', x: 'b', y: 1, z: 100},
    {u: false, v: false, w: 'i', x: 'b', y: 1, z: 100},
    {u: true,  v: false, w: 'h', x: 'c', y: 1, z: 100},
    {u: false, v: false, w: 'h', x: 'c', y: 1, z: 100},
    {u: true,  v: false, w: 'i', x: 'c', y: 1, z: 100},
    {u: false, v: false, w: 'i', x: 'c', y: 1, z: 100},
]

let ds2 = [
    {w: 'h', x:'a', y: 1},
    {w: 'h', x:'a', y: 1},
    {w: 'i', x:'a', y: 1},
    {w: 'i', x:'a', y: 1},
    {w: 'h', x:'b', y: 100},
    {w: 'h', x:'b', y: 100},
    {w: 'i', x:'b', y: 100},
    {w: 'i', x:'b', y: 100},
]

describe(`basic group tests`, ()=>{
    let stringPly = new Ply(ds2).group('x', 'w').transform()
    it('returns an an object of arrays', ()=>{
        expect(typeof stringPly).toBe('object')
        expect(Array.isArray(stringPly)).toBe(false)
        Object.keys(stringPly).forEach(k=>{
            expect(Array.isArray(stringPly[k])).toBe(true)
        })
    })
    it('expects the grouped values to be in the subsets', ()=>{
        Object.keys(stringPly).forEach((k)=> {
            let [kx, kw] = k.split('||')
            let subset = stringPly[k]
            // check all kx to see if they match
            // check all kw to see if they match
            expect(subset.map(d=>d.x).every((x)=>x === kx)).toBe(true)
            expect(subset.map(d=>d.w).every((w)=>w === kw)).toBe(true)
        })
    })
    it('expects the group value to be the pairwise set of observed grouped variables', ()=>{
        let keys = Object.keys(stringPly)
        let expected = ['a||h', 'a||i', 'b||h', 'b||i', 'c||h', 'c||i']
        const union = [...new Set([...keys, ...expected])]
        expect(union.length - expected.length).toBe(0)
    })
    it('expects the subsets to have a length that matches the original data set, if filtered appropriately', ()=>{
        // todo - rewrite test to match the description.
        let lengths = Object.keys(stringPly).map(g=>stringPly[g].length)
        expect(!lengths.some(d=>d==2)).toBe(false)
    })
})

describe('group with numbers', ()=> {
    let numPly = new Ply(ds2).group('y').transform()
    it('groups the numbers as strings', ()=>{
        // there should be two keys.
        // they should be string versions of the numbers.
        let stringValues = ['1', '100']
        let keys = Object.keys(numPly)
        const union = [...new Set([...stringValues, ...keys])]
        expect(union.length - keys.length).toBe(0)
    })
    it('has subsets that matches the lengths of the original filtered version of the dataset', ()=> {
        expect(Object.keys(numPly).map(k=>numPly[k]).every((ds)=>ds.length==4)).toBe(true)
    })
})

describe('group with booleans', ()=>{
    let bool2Ply = new Ply(ds1).group('u', 'v').transform()
    it('groups booleans like strings', ()=> {
        let keys = Object.keys(bool2Ply)
        let expected = ['true||true', 'true||false', 'false||false', 'true||true']
        const union = [...new Set([...keys, ...expected])]
        expect(union.length - expected.length).toBe(0)
    })
})

// reduce on its own narrows down to one row.

describe('reduce without group', ()=> {
    let reducers = {
        a: (arr) => null,
        b: (arr) => arr.length
    }
    let p = new Ply(ds1).reduce(reducers).transform()
    it('reduces down to one row when used on its own', ()=>{
        expect(p.length).toBe(1)
    })
    it('has its fields reduced to two entries', ()=>{
        expect(Object.keys(p[0]).length).toBe(Object.keys(reducers).length)
    })
    it('has fields that match the reducer fields', ()=>{
        expect(p[0].a).toBe(null)
        expect(p[0].b).toBe(ds1.length)
    })
    it('is a single object in an array', ()=> {
        expect(typeof p[0]).toBe('object')
    })
})

describe('reduce accurately crunches', ()=> {
    let reducePly = new Ply(ds1).group('u')
})

/* 
tests to write:
x - group: strings
x - group: non-strings
- group: numbers
- group: grouping functions
    {facet: (dp) => returnSomeValueToGroup(dp)}, etc.

- reduce: basic reduce without group
- reduce: basic reduce with group

- map: from dataset
- map: from group

Ply built-in reducer methods

*/