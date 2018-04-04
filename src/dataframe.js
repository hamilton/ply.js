function isPlainObject(obj) {
  return typeof obj === 'object' && obj.constructor === Object
}

export default class Dataframe {
  // CONSTRUCTOR
  constructor(...args) {
    this.DF$columns = []
    this.DF$columnNames = []
    this.DF$rowNames = []
    this.DF$columnMap = {}
    this.DF$usedColumnNames = 1
    if (args.length && !(isPlainObject(args[0]))) {
      throw Error('Dataframe requires an object')
    }
    if (args.length === 1) {
      const arg = args[0]
      this.DF$columns = arg.columns || []
      if (!this.DF$columns.length &&
        ((arg.rowNames && arg.rowNames.length) ||
        (arg.columnNames && arg.columnNames.length))) {
        throw Error('Cannot have rowNames or columnNames without columns')
      }
      this.DF$columnNames = arg.columnNames || this.DF$columns.map((c, i) => i)
      this.setColumnMap()
      this.DF$rowNames = arg.rowNames ||
        (this.DF$columns.length ? this.DF$columns[0].map((r, j) => j) : [])
    }
  }

  // ////////////// PRIVATE-ISH METHODS used for internal logic. //////////////////
  // NOTE: we better test these.
  setColumnMap() {
    this.DF$columnNames.forEach((c, i) => { this.DF$columnMap[c] = i })
  }

  getColumnMap(columnName) {
    return this.DF$columnMap[columnName]
  }

  // //////////////////////////////////////////////////////////////////////////////

  // STATIC METHODS
  // static fromArrayOfObjects() {}
  // static parseCSV() {}

  // INTERATORS
  // eachColumn(){}
  // forEachRow(){}

  // CBIND

  appendRow(row, rowName) {
    if (!Array.isArray(row) && !isPlainObject(row)) { throw Error('appendRow must be an array or object') }
    if (Array.isArray(row)) {
      row.forEach((val, i) => {
        this.DF$columns[i].push(val)
      })
    } else if (isPlainObject(row)) {
      Object.keys(row).forEach((k) => {
        const v = row[k]
        if (k in this.DF$columnNames) {
          const index = this.getColumnMap(k)
          this.DF$columns[index].push(v)
        }
      })
      // make sure to append undefined values for keys that aren't there.
      Object.keys(this.DF$columnNames)
        .filter(col => !Object.keys(row).includes(col))
        .forEach((col) => {
          const index = this.getColumnMap(col)
          this.DF$columns[index].push(undefined)
        })
    }
    this.DF$rowNames.push(rowName)
    return this
  }

  appendColumn(column, columnName) {
    if (!Array.isArray(column)) { throw Error('appendRow must be an array') }
    if (column.length !== this.height) { throw Error(`new column length (${column.length}) not same as dataframe height (${this.height}) `) }
    this.DF$columns.push(column)
    let newColumnName = columnName
    if (columnName === undefined) {
      newColumnName = `x${this.DF$usedColumnNames}`
      this.DF$usedColumnNames += 1
    }
    this.DF$columnNames.push(newColumnName)
    this.setColumnMap()
    return this
  }

  // GETTERS / SETTERS

  get width() {
    return this.DF$columns.length
  }

  get height() {
    return this.DF$columns[0].length
  }

  get dim() {
    return [this.width, this.height]
  }

  get rowNames() {
    return this.DF$rowNames
  }

  set rowNames(names) {
    if (!Array.isArray(names)) { throw Error('row names must be an array') }
    if (this.DF$rowNames.length !== names.length) { throw Error('row names must be same length') }
    this.DF$rowNames = names
    return this
  }

  get columnNames() {
    return this.DF$columnNames
  }

  set columnNames(names) {
    if (!Array.isArray(names)) { throw Error('column names must be an array') }
    if (this.DF$columnNames.length !== names.length) { throw Error('column names must be same length') }
    this.DF$columnNames = names
    this.DF$columnNameMap = {}
    this.setColumnMap()
    return this
  }


  // REPRESENTATION / TO STRING TYPE FUNCTIONS

  // INDEXING / ITERATION

  // BASIC getRow / getColumn functionality
  // get(i) {}
  // head(n) {}
  // tail(n) {}

  // MANIPULATION STEPS
  // group(...args) {}
  // summarize(...args) {}
  // filter(){}
  // gather(){}
  // spread(){}
  // mapRows(...args) {}
  // mapColumns(...args) {}

  // COMBINING STEPS
  // join(dataset, key){}

  // COPYING DATAFRAME
  copy() {
    const columns = this.DF$columns.slice(0)
    const rowNames = this.DF$rowNames.slice(0)
    const columnNames = this.DF$columnNames.slice(0)
    return new Dataframe({ columns, rowNames, columnNames })
  }
}
