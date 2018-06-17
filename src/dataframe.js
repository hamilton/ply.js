function isPlainObject(obj) {
  return typeof obj === 'object' && obj.constructor === Object
}

const STEPS = {
  GROUP: 'group',
  DATASET: 'dataset',
}

export default class Dataframe {
  // CONSTRUCTOR
  constructor(...args) {
    // for ply operations.
    this.DF$funcs = []
    this.DF$facets = []
    this.DF$step = STEPS.DATASET
    // /
    this.DF$columns = []
    this.DF$columnNames = []

    // NEED TESTS HERE. JESUS.
    this.rowProxyHandler = {
      get: (target, columnName) => {
        if (typeof columnName === 'string') return target[this.getColumnMap(columnName)]
        return target[columnName]
      },
    }
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
      this.DF$columnNames = arg.columnNames || this.DF$columns.map(() => {
        const ki = `x${this.DF$usedColumnNames}`
        this.DF$usedColumnNames += 1
        return ki
      })

      if (this.DF$columnNames.length !== this.DF$columns.length) {
        throw Error('columnNames must be same length as columns')
      }

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

  forEach(fcn) {
    if (fcn && {}.toString.call(fcn) === '[object Function]') {
      for (let i = 0; i < this.height; i++) {
        fcn(this.get(i))
      }
    } else {
      throw Error('argument is not a function')
    }
  }

  forEachRow(fcn) {
    if (fcn && {}.toString.call(fcn) === '[object Function]') {
      for (let i = 0; i < this.height; i++) {
        fcn(this.getRow(i), i)
      }
    } else {
      throw Error('argument is not a function')
    }
  }

  forEachColumn(fcn) {
    this.DF$columnNames.forEach((c) => {
      fcn(this.getColumn(c))
    })
  }

  // * rows() {
  //   for (let i = 0; i < this.height; i++) {
  //     yield this.get(i)
  //   }
  // }

  // CBIND
  appendRow(row, rowName) {
    if (!Array.isArray(row) && !isPlainObject(row)) { throw Error('appendRow must be an array or object') }
    if (Array.isArray(row)) {
      if (row.length === this.width) {
        row.forEach((val, i) => {
          this.DF$columns[i].push(val)
        })
      } else {
        throw Error(`row (length ${row.length}) must be same width as data frame (${this.width})`)
      }
    } else if (isPlainObject(row)) {
      Object.keys(row).forEach((k) => {
        const v = row[k]
        if (this.DF$columnNames.includes(k)) {
          const index = this.getColumnMap(k)
          this.DF$columns[index].push(v)
        }
      })
      // make sure to append undefined values for keys that aren't there.
      this.DF$columnNames
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
    if (!Array.isArray(column)) { throw Error('appendColumn first arg must be an array') }
    if (column.length !== this.height) {
      throw Error(`new column length (${column.length}) not same as dataframe height (${this.height})`)
    }
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
  // this is getRow but not the pure version, returns an object.
  get(i) {
    if (i >= this.height || i < 0) throw Error('get index is out of bounds')
    if (!Number.isInteger(i)) throw Error('get index is not an Integer')
    return this.DF$columnNames
      .map(n => [n, this.DF$columns[this.getColumnMap(n)][i]])
      .reduce((acc, v) => {
        const [k, vi] = v
        acc[k] = vi
        return acc
      }, {})
  }

  // is this how it works?
  * rows() {
    for (let i = 0; i < this.height; i++) {
      yield this.getRow(i)
    }
  }

  getRow(i) {
    return new Proxy(
      this.DF$columnNames.map(n => this.DF$columns[this.getColumnMap(n)][i]),
      this.rowProxyHandler,
    )
    // return this.DF$columnNames.map(n => this.DF$columns[this.getColumnMap(n)][i])
  }

  getColumn(name) {
    let column
    if (typeof name === 'string') {
      const colIndex = this.getColumnMap(name)
      if (colIndex === undefined) { throw Error('getColumn name not defined') }
      column = this.DF$columns[colIndex]
    } else {
      throw Error('getColumn only takes a string representing a column name')
    }
    return column
  }

  // NEEDS TESTS.
  head(n) {
    const out = []
    for (let i = 0; i < n; i++) {
      out.push(this.get(i))
    }
    return out
  }
  // tail(n) {}

  // MANIPULATION STEPS
  group(...f) {
    f.forEach((fi) => {
      if (!this.DF$columnNames.includes(fi)) throw Error(`facet ${fi} not in columns`)
    })
    const gr = {}
    this.forEachRow((v, i) => {
      const facet = f.map(fi => v[fi]).join(Dataframe.SEPARATOR)
      if (!(facet in gr)) gr[facet] = []
      gr[facet].push(i)
    })
    this.DF$grouping = gr
    this.DF$facets = f
    this.DF$step = STEPS.GROUP
    return this
  }

  summarize(fcns) {
    // for each chunk of a data set, create the thing, and then run all the functions over it
    // to get a new row of data. gross.
    const columnNames = Object.keys(fcns)
    const outColumns = [...columnNames, 'facets']
    const newDF = new Dataframe({
      columns: outColumns.map(() => []),
      columnNames: outColumns,
    })
    Object.keys(this.DF$grouping).forEach((gr) => {
      const subset = this.DF$grouping[gr].map(i => this.getRow(i))
      newDF.appendRow([...columnNames.map(cn => fcns[cn](subset)), gr])
    })
    return newDF
  }

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

Dataframe.SEPARATOR = '||'

Dataframe.fromObjects = (arrayOfObjects) => {
  const columnNames = Object.keys(arrayOfObjects[0])
  const df = new Dataframe({ columnNames, columns: columnNames.map(() => []) })
  arrayOfObjects.forEach((r) => {
    df.appendRow(columnNames.map(c => r[c]))
  })
  return df
}
