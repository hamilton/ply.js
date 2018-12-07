import {
  sum,
  mean,
  variance,
  standardDeviation,
  covariance,
  correlation,
  spearman,
  max,
  min,
  quantile,
  median,
  IQR,
  mode,
} from './reducers'

const STEPS = {
  GROUP: 'group',
  DATASET: 'dataset',
}

class Ply {
  constructor(data) {
    if (!Array.isArray(data)) throw new Error('data must be an array')
    data.forEach((d) => {
      if (!(typeof d === 'object' && d.constructor === Object)) throw Error('data must be an array of objects')
    })
    this.data = data
    this.step = STEPS.DATASET
    this.funcs = []
    this.facets = []
  }

  clear() {
    this.funcs = []
    this.step = STEPS.DATASET
    return this
  }

  select(...fields) {
    if (!fields.length) throw Error('must add at least one field to select')
    this.funcs.push((data) => {
      fields.forEach((f) => {
        if (typeof f !== 'function' && typeof f !== 'string' && typeof f !== 'number') throw Error(`field type must be string or number, but found ${typeof f}`)
      })
      const filterField = fields.length === 1 && typeof fields[0] === 'function' ?
        df => fields[0](df)
        : df => fields.includes(df)
      return data.map(d => Object.keys(d)
        .filter(filterField)
        .reduce((acc, f) => {
          acc[f] = d[f]
          return acc
        }, {}))
    })
    return this
  }

  group(...f) {
    this.funcs.push(data => data.reduce((o, v) => {
      const facet = f.map(fi => v[fi]).join(Ply.SEPARATOR)
      if (!(facet in o)) o[facet] = []
      o[facet].push(v)
      return o
    }, {}))
    this.facets = f
    this.step = STEPS.GROUP
    return this
  }

  map(mapper) {
    const { step } = this

    this.funcs.push((data) => {
      if (step === STEPS.GROUP) {
        Object.keys(data).forEach((facets) => {
          data[facets] = data[facets].map(mapper)
        })
        return data
      }
      return data.map(mapper)
    })
    this.step = STEPS.DATASET
    return this
  }

  filter(fcn) {
    if (this.step !== STEPS.DATASET) {
      throw TypeError('cannot filter on a grouped data set')
    }
    this.funcs.push(data => data.filter(fcn))
    return this
  }

  reduce(funcs) {
    // reduce the array to a single point
    const reduceData = (arr) => {
      const datapoint = {}
      Object.keys(funcs).forEach((field) => {
        if (typeof funcs[field] === 'function') datapoint[field] = funcs[field](arr)
        else datapoint[field] = funcs[field]
      })
      return datapoint
    }
    // a plainReducer reduces an array down to a single point w/ reduceData.
    const plainReducer = data => [reduceData(data)]
    // a groupReducer iterates through the groups and runs plainReducer.
    const groupReducer = (data) => {
      const newData = []
      Object.keys(data).forEach((gr) => {
        const dataGrouping = data[gr]
        const datapoint = reduceData(dataGrouping)
        this.facets.forEach((f) => {
          datapoint[f] = dataGrouping[0][f]
        })
        newData.push(Object.assign({}, datapoint))
      })
      data = newData
      return data
    }

    const reducer = this.step === STEPS.DATASET ? plainReducer : groupReducer

    this.funcs.push(reducer)
    this.step = STEPS.DATASET
    return this
  }

  transform() {
    let newData = this.data.map(d => Object.assign({}, d))
    this.funcs.forEach((d) => { newData = d(newData) })
    this.step = STEPS.DATASET
    return newData
  }
}

Ply.SEPARATOR = '||'

Ply.sum = sum
Ply.mean = mean
Ply.variance = variance
Ply.standardDeviation = standardDeviation
Ply.covariance = covariance
Ply.correlation = correlation
Ply.spearman = spearman
Ply.max = max
Ply.min = min
Ply.quantile = quantile
Ply.median = median
Ply.IQR = IQR
Ply.mode = mode

export default Ply
