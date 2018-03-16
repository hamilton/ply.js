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

const sameArrayContents = (a,b) => {
    expect(a).toEqual(expect.arrayContaining(b))
    expect(b).toEqual(expect.arrayContaining(a))
}

describe('input error handling', ()=>{
    it('handles the case of wrong inputs', ()=>{
        expect(()=>new Ply()).toThrow()
        expect(()=>new Ply('hello')).toThrow()
        expect(()=>new Ply({})).toThrow()
    })
    it('handles the case of the correct inputs (arrays)', ()=> {
        expect(()=>new Ply(ds2)).not.toThrow()
    })
    it('handles the case of an array where not all objects are objects', ()=>{
        expect(()=>new Ply([...ds2, 10000])).toThrow()
    })
})

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
            expect(subset.map(d=>d.x).every((x)=>x === kx)).toBe(true)
            expect(subset.map(d=>d.w).every((w)=>w === kw)).toBe(true)
        })
    })
    it('expects the group value to be the pairwise set of observed grouped variables', ()=>{
        let keys = Object.keys(stringPly)
        let expected = ['a||h', 'a||i', 'b||h', 'b||i']
        sameArrayContents(keys, expected)
    })
    it('expects the subsets to have a length that matches the original data set, if filtered appropriately', ()=>{
        let lengths = Object.keys(stringPly).map(g=>stringPly[g].length)
        expect(!lengths.some(d=>d==2)).toBe(false)
    })
})

describe('group with numbers', ()=> {
    let numPly = new Ply(ds2).group('y').transform()
    it('groups the numbers as strings', ()=>{
        let stringValues = ['1', '100']
        let keys = Object.keys(numPly)
        sameArrayContents(stringValues, keys)
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

let ds3 = [
    {date: new Date('2010-01-01'), x:1},
    {date: new Date('2010-01-01'), x:1},
    {date: new Date('2010-01-02'), x:1},
    {date: new Date('2010-01-02'), x:1},
]

describe('group with Date objects', ()=> {
    let date2Ply =new Ply(ds3).group('date').transform()
    it('should group by the .toString representation of a Date object', ()=>{
        const expected = Array.from(ds3.reduce((acc,v)=> {acc.add(v.date.toString()); return acc}, new Set([])))
        const keys = Object.keys(date2Ply)
        sameArrayContents(expected,keys)
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

describe('reduce a grouped data set with object of functions', ()=> {
    let reducePly = new Ply(ds1).group('u').reduce({
        x: (arr) => arr.length,
        y: (arr) => arr.reduce((acc,v) => acc+v.z, 0)    
    }).transform()
    it('reduces a group data set to have to right number of rows', ()=>{
        expect(reducePly.length).toBe(2)
    })

    it('reduces a group data set to have only the defined variables', ()=> {
        //x is 6, y is 600.
        reducePly.forEach(d=>{
            expect(d.x).toBe(6)
            expect(d.y).toBe(600)
        })
        sameArrayContents(reducePly.map(d=>d.u), [true, false])
    })
})

describe('reduce a grouped data set with arguments that only have a value', () => {
    let reducePly = new Ply(ds1).group('u').reduce({
        x: 10,
        y: 'a'
    }).transform()
    it('passes the value if the reducer entry is not a function', ()=>{
        sameArrayContents(reducePly.map(d=>d.x), new Array(2).fill(10))
        sameArrayContents(reducePly.map(d=>d.y), new Array(2).fill('a'))
    })
})

describe('mapping an ungrouped data set', ()=>{
    let data = [{x: 'hello', y: 10000, z: 1}]
    let ungroupedMapPly = new Ply(data).map((p)=>{ return {i: p.y}}).transform()
    it('returns data that is the same length as the input', () => {
        expect(ungroupedMapPly.length).toBe(data.length)
    })
    it('expects the mapping function to return an array of mapped return values', ()=> {
        expect(ungroupedMapPly[0].i).toBe(data[0].y)
    })
})

let ds4 = [
    {x:'a', y: 1},
    {x:'a', y: 2},
    {x:'b', y:100},
    {x:'b', y:200},
]

describe('mapping a grouped data set', () => {
    let groupedMapPly = new Ply(ds4).group('x').map(d => { return d.y }).transform()
    it('contains the same number of groups as an unmapped data set', ()=> {
        let groupedNoMapPly = new Ply(ds4).group('x').transform()
        sameArrayContents(Object.keys(groupedNoMapPly), Object.keys(groupedMapPly))
    })
    it('has groups that contain the mapped contents', ()=> {
        expect(groupedMapPly).toEqual({ a: [ 1, 2 ], b: [ 100, 200 ] })
    })
})