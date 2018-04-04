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
    expect(col1.columnNames).toEqual([0, 1])
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
  const data = {
    columns: [[1, 2], ['a', 'b']],
    rowNames: ['A', 'B'],
  }
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

  it('appends a row with a label', () => {})
})
