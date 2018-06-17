import Dataframe from '../src/dataframe'

const dfContents = {
  columns: [
    ['x', 'y', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y', 'x', 'y'],
    ['a', 'a', 'b', 'b', 'a', 'a', 'b', 'b', 'a', 'a', 'b', 'b'],
    [1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1],
  ],
  columnNames: ['z', 'd', 'v'],
}

const transforms = {
  length: subset => subset.length,
  sum: subset => subset.reduce((acc, row) => acc + row.v, 0),
}

describe('group', () => {
  const ds = new Dataframe(dfContents)
  it('groups', () => {
    ds.group('z')
    expect(ds.DF$grouping).toEqual({ x: [0, 2, 4, 6, 8, 10], y: [1, 3, 5, 7, 9, 11] })
    ds.group('z', 'd')
    expect(ds.DF$grouping).toEqual({
      'x||a': [0, 4, 8], 'x||b': [2, 6, 10], 'y||a': [1, 5, 9], 'y||b': [3, 7, 11],
    })
    // ds.group() // reset
  })
  it('rejects incorrect groupings if they do not exist', () => {
    expect(() => ds.group('w')).toThrow()
  })
})

describe('summarize', () => {
  const ds = new Dataframe(dfContents)
  it('summarizes', () => {
    const output1 = ds.group('z').summarize(transforms)
    expect(output1.DF$columns).toEqual([[6, 6], [0, 0], ['x', 'y']])
    const output2 = ds.group('z', 'd').summarize(transforms)
    expect(output2.DF$columns).toEqual([[3, 3, 3, 3], [1, 1, -1, -1], ['x||a', 'y||a', 'x||b', 'y||b']])
  })
  it('rejects invalid summary functions or values', () => {

  })
})
