import Dataframe from '../src/dataframe'

describe('Dataframe constructor', () => {
  it('handles the case of wrong inputs', () => {
    expect(() => new Dataframe('hello')).toThrow()
    expect(() => new Dataframe(1)).toThrow()
    expect(() => new Dataframe([])).toThrow()
    expect(() => new Dataframe(new Date())).toThrow()
  })
  it('handles the case of an empty dataset', () => {
    const empty = new Dataframe()
    expect(empty.columnNames.length).toBe(0)
    expect(empty.rowNames.length).toBe(0)
    expect(empty.columnNames).toEqual([])
    expect(empty.rowNames).toEqual([])
    const emptyObj = new Dataframe({})
    expect(emptyObj.columnNames.length).toBe(0)
    expect(emptyObj.rowNames.length).toBe(0)
    expect(emptyObj.columnNames).toEqual([])
    expect(emptyObj.rowNames).toEqual([])
  })
  it('handles an object of values - columns', () => {
    const data = {
      columns: [[1, 2, 3, 4], ['a', 'b', 'c', 'd']],
    }
    const col1 = new Dataframe(data)
    expect(col1.columnNames.length).toBe(data.columns.length)
    expect(col1.rowNames.length).toBe(data.columns[0].length)
    expect(col1.rowNames).toEqual([0, 1, 2, 3])
    expect(col1.columnNames).toEqual(['x1', 'x2'])
  })
  it('handles an object of values - columns, column names, and row names', () => {
    const data = {
      columns: [[1, 2, 3, 4], ['a', 'b', 'c', 'd']],
      rowNames: ['A1', 'A2', 'A3', 'A4'],
      columnNames: ['count', 'label'],
    }
    const col2 = new Dataframe(data)
    expect(col2.columnNames.length).toBe(data.columns.length)
    expect(col2.rowNames.length).toBe(data.columns[0].length)
    expect(col2.rowNames).toEqual(data.rowNames)
    expect(col2.columnNames).toEqual(data.columnNames)
  })
  it('throws if columns are not set but anything else is', () => {
    expect(() => new Dataframe({ rowNames: ['A1', 'A2', 'A3', 'A4'] })).toThrow()
    expect(() => new Dataframe({ columnNames: ['count', 'label'] })).toThrow()
  })
})

describe('getters and setters', () => {
  const data = {
    columns: [[1, 2, 3, 4], ['a', 'b', 'c', 'd']],
  }
  it('throws error if rowName provided is not of same length or is not an array', () => {
    const rowNames1 = ['a', 'b', 'c']
    const rowNames2 = { a: 10, b: 20, c: 30 }
    const rowNames3 = new Date()
    const rowNames4 = 'string'

    expect(() => { const df = new Dataframe(data); df.rowNames = rowNames1 }).toThrow()
    expect(() => { const df = new Dataframe(data); df.rowNames = rowNames2 }).toThrow()
    expect(() => { const df = new Dataframe(data); df.rowNames = rowNames3 }).toThrow()
    expect(() => { const df = new Dataframe(data); df.rowNames = rowNames4 }).toThrow()
  })

  it('gets and sets rowNames', () => {
    const rowNames = ['a', 'b', 'c', 'd']
    const df1 = new Dataframe(data)
    df1.rowNames = rowNames.map(r => r) // try doing full on copy
    expect(df1.rowNames).toEqual(rowNames)
  })

  it('throws error if columnName provided is not of same length or is not an array', () => {
    const colNames1 = ['a', 'b', 'c']
    const colNames2 = { a: 10, b: 20, c: 30 }
    const colNames3 = new Date()
    const colNames4 = 'string'

    expect(() => { const df = new Dataframe(data); df.columnNames = colNames1 }).toThrow()
    expect(() => { const df = new Dataframe(data); df.columnNames = colNames2 }).toThrow()
    expect(() => { const df = new Dataframe(data); df.columnNames = colNames3 }).toThrow()
    expect(() => { const df = new Dataframe(data); df.columnNames = colNames4 }).toThrow()
  })

  it('gets and sets columnNames', () => {
    const columnNames = ['X', 'Y']
    const df1 = new Dataframe(data)
    df1.columnNames = columnNames.map(r => r) // try doing full on copy
    expect(df1.columnNames).toEqual(columnNames)
  })
  it('gets the dim, width, and length accurately', () => {
    const df = new Dataframe(data)
    expect(df.width).toBe(2)
    expect(df.height).toBe(4)
    expect(df.dim).toEqual([2, 4])
  })
})

describe('appendRow', () => {
  let data

  function resetData() {
    data = {
      columns: [[1, 2], ['a', 'b']],
      rowNames: ['A', 'B'],
    }
  }

  beforeEach(() => {
    resetData()
  })

  it('throws an error if the row type is not accepted', () => {
    const df = new Dataframe(data)
    expect(() => { df.appendRow() }).toThrow()
    expect(() => { df.appendRow('asodifn') }).toThrow()
    expect(() => { df.appendRow(new Date()) }).toThrow()
  })
  it('appends an array row even without the presence of a label', () => {
    const df = new Dataframe(data)
    df.appendRow([3, 'c'])
    expect(df.rowNames).toEqual(['A', 'B', undefined])
  })
  it('appends a row with a label', () => {
    const df = new Dataframe(data)
    df.appendRow([3, 'c'], 'Z')
    expect(df.rowNames).toEqual(['A', 'B', 'Z'])
    expect(df.DF$columns[0]).toEqual([1, 2, 3])
    expect(df.DF$columns[1]).toEqual(['a', 'b', 'c'])
  })
  it('appends a row if we pass in an object', () => {
    const df = new Dataframe(data)
    df.appendRow({ A: 100, B: 'c' }, 'Z')
    expect(df.rowNames).toEqual(['A', 'B', 'Z'])
  })
})

describe('appendColumn', () => {
  let data

  function resetData() {
    data = {
      columns: [[1, 2], ['a', 'b']],
      rowNames: ['A', 'B'],
      columnNames: ['X', 'Y'],
    }
  }

  beforeEach(() => {
    resetData()
  })

  it('throws an error if the row type is not accepted', () => {
    const df = new Dataframe(data)
    expect(() => { df.appendColumn() }).toThrow()
    expect(() => { df.appendColumn('asodifn') }).toThrow()
    expect(() => { df.appendColumn(new Date()) }).toThrow()
    expect(() => { df.appendColumn({ A: 10, B: 10000 }) }).toThrow()
  })
  it('appends a new column and makes up a new variable if not named', () => {
    const df = new Dataframe(data)
    df.appendColumn([100, 200])
    expect(df.columnNames).toEqual(['X', 'Y', 'x1'])
    expect(df.DF$columns[df.DF$columns.length - 1]).toEqual([100, 200])
  })
  it('appends a column with a label', () => {
    const df = new Dataframe(data)
    df.appendColumn([100, 200], 'Z')
    expect(df.columnNames).toEqual(['X', 'Y', 'Z'])
    expect(df.DF$columns[df.DF$columns.length - 1]).toEqual([100, 200])
  })
})

describe('get', () => {
  const data = {
    columns: [[1, 2], ['a', 'b']],
    rowNames: ['A', 'B'],
    columnNames: ['X', 'Y'],
  }
  const df = new Dataframe(data)
  it('returns an error if out of bounds', () => {
    expect(() => { df.get(100) }).toThrow()
    expect(() => { df.get(2) }).toThrow()
    expect(() => { df.get(-1) }).toThrow()
  })
  it('returns an error if a non-Number is passed in', () => {
    expect(() => { df.get('a') }).toThrow()
    expect(() => { df.get(new Date()) }).toThrow()
  })
  it('gets the index correctly', () => {
    const row1 = df.get(0)
    const row2 = df.get(1)
    expect(row1).toEqual({ X: 1, Y: 'a' })
    expect(row2).toEqual({ X: 2, Y: 'b' })
  })
  it('operates as expected when added columns and rows', () => {
    df.appendRow({ X: 3, Y: 'c' })
    df.appendColumn(['aa', 'bb', 'cc'], 'Z')
    const row1 = df.get(0)
    const row2 = df.get(1)
    const row3 = df.get(2)
    expect(row1).toEqual({ X: 1, Y: 'a', Z: 'aa' })
    expect(row2).toEqual({ X: 2, Y: 'b', Z: 'bb' })
    expect(row3).toEqual({ X: 3, Y: 'c', Z: 'cc' })
  })
})
