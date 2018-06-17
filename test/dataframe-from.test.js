import Dataframe from '../src/dataframe'

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

describe('fromObjects', () => {
  it('creates a Dataframe from an array of objects', () => {
    const data = Dataframe.fromObjects(ds2)
    expect(data.DF$columns).toEqual([
      ['h', 'h', 'i', 'i', 'h', 'h', 'i', 'i'],
      ['a', 'a', 'a', 'a', 'b', 'b', 'b', 'b'],
      [1, 1, 1, 1, 100, 100, 100, 100],
    ])
    expect(data.DF$columnNames).toEqual(['w', 'x', 'y'])
    expect(data.height).toBe(8)
    expect(data.width).toBe(3)
  })
})
