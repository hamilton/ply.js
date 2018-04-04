export default class Dataframe {
  // CONSTRUCTOR
  constructor(...args) {
    this.DF$columns = []
    this.DF$columnNames = []
    this.DF$rowNames = []
    if (args.length && !(typeof args[0] === 'object' && args[0].constructor === Object)) {
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
      this.DF$rowNames = arg.rowNames ||
        (this.DF$columns.length ? this.DF$columns[0].map((r, j) => j) : [])
    }
  }

  // STATIC METHODS
  // static fromArrayOfObjects() {}
  // static parseCSV() {}

  // INTERATORS
  // eachColumn(){}
  // eachRow(){}

  // CBIND

  appendRow(row, rowName) {
    row.forEach((val, i) => {
      this.DF$columns[i].push(val)
    })
    this.DF$rowNames.push(rowName)
    return this
  }
  // appendColumn(){}

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
    return this
  }
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
