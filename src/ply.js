const STEPS = {
    GROUP: 'group',
    DATASET: 'dataset'
}

class Ply {

  constructor(data) {
    if (!Array.isArray(data)) throw new Error('data must be an array')
    // I guess this isn't a lot of objects to try. Let's go for it.
    data.forEach(d=>{
      if (!(typeof d == 'object' && d.constructor == Object)) throw Error('data must be an array of objects')
    })
    this.data = data
    this.step = STEPS.DATASET
    this.funcs = []
    this.facets = []
  }

  reset() {
    this.funcs = []
    this.step = STEPS.DATASET
    return this
  }
  
  group(...f) {
    this.funcs.push((data)=>{
      return data.reduce((o,v)=> {
        const facet = f.map(fi=>v[fi]).join(Ply.SEPARATOR)
        if (!o.hasOwnProperty(facet)) o[facet] = []
        o[facet].push(v)
        return o
      }, {})
    })
    this.facets = f
    this.step = STEPS.GROUP
    return this
  }
  
  map(mapper) {
    const mapData = (arr) => {
      return arr.map(mapper)
    }
    let step = this.step

    this.funcs.push((data)=>{
      if (step === STEPS.GROUP) {
        Object.keys(data).forEach(facets=>{
          data[facets] = data[facets].map(mapper)
        })

        return data
      }
      else return data.map(mapper)
    })
    this.step = STEPS.DATASET
    return this
  }

  filter(fcn) {
    if (this.step != STEPS.DATASET) {
      throw TypeError('cannot filter on a grouped data set')
    }
    this.funcs.push((data)=>{
      return data.filter(fcn)
    })
    return this
  }

  reduce(funcs) {
    // reduce the array to a single point
    const reduceData = (arr) => {
      let datapoint = {}
      Object.keys(funcs).forEach(field=>{
        if (typeof funcs[field] === 'function') datapoint[field] = funcs[field](arr)
        else datapoint[field] = funcs[field]
      })
      return datapoint
    }
    // a plainReducer reduces an array down to a single point w/ reduceData.
    const plainReducer = (data) => {
      return [reduceData(data)]
    }
    // a groupReducer iterates through the groups and runs plainReducer.
    const groupReducer = (data) => {
      let newData = []
      Object.keys(data).forEach(gr=>{
        let dataGrouping = data[gr]
        let datapoint = reduceData(dataGrouping)
        this.facets.forEach((f)=>{
          datapoint[f] = dataGrouping[0][f]
        })
        newData.push(Object.assign({}, datapoint))
      })
      data = newData
      return data
    }
  
    let reducer = this.step === STEPS.DATASET ? plainReducer : groupReducer

    this.funcs.push(reducer)
    this.step = STEPS.DATASET
	  return this
  }
 
  transform() {
    let newData = this.data.map(d=>Object.assign({}, d))
    this.funcs.forEach(d=>{newData = d(newData) })
    this.step = STEPS.DATASET
    return newData
  }
}

Ply.SEPARATOR = '||'

Ply.sum = (field) => (arr) => {
  if (!arr.length) return 0
  return arr.map(d=>{
    if (!Number.isFinite(d[field])) throw new Error('cannot reduce non-Numbers')
    let value = d[field]
    if (value === undefined) throw new Error(`key "${field}" missing from an object`)
    return d[field]
  }).reduce((a,b)=>a+b,0)
}

Ply.mean = (field) => (arr) => {
  let n = arr.length
  if (!n) return NaN
  return Ply.sum(field)(arr) / n
}

Ply.variance = field => arr => {
  const n = arr.length
  if (n < 2) return 0
  let M = arr[0][field]
  if (M === undefined) throw new Error(`key "${field}" missing from an object`)
  let S = 0
  arr.forEach((d,i)=> {
    let xi = d[field]
    if (d[field] === undefined) throw new Error(`key "${field}" missing from an object`)
    i = i+1
    let Mp = M
    M = Mp + (xi - Mp)/i 
    S = S + (xi - M) * (xi - Mp)
  })
  return S / (n-1)
}

Ply.standardDeviation = field => arr => Math.sqrt(Ply.variance(field)(arr))

Ply.max = field => arr => {
  if (arr===undefined || !arr.length) return -Infinity
  return Math.max(...arr.map(d=>d[field]))
}
Ply.min = field => arr => {
  if (arr===undefined || !arr.length) return Infinity
  return Math.min(...arr.map(d=>d[field]))
}

Ply.quantile = (q, field) => arr => {
  // R has 9 different ways to calculate quantile.
  if (arr===undefined || !Array.isArray(arr)) throw new Error('data must be an array')
  if (!arr.length) return NaN
  let n = arr.length
  arr.sort((a,b)=>a[field] - b[field])
  let qToI = (qi) => {
    if (qi <= 0) return arr[0][field]
    if (qi >= 1) return arr[n-1][field]
    let i = n*qi - 1
    let out
    if (Number.isInteger(i)) out = (arr[i][field] + arr[i+1][field]) / 2.0
    else out = arr[Math.ceil(i)][field]
    return out
  }
  return Array.isArray(q) ? q.map(qi=> qToI(qi)) : qToI(q)
}

/* quantile cases */
Ply.median = field => arr => Ply.quantile(.5, field)(arr)

Ply.IQR = field => arr => {
  if (!arr.length) return NaN
  const iqrs = Ply.quantile([.25,.75], field)(arr)
  let [q25, q75] =  iqrs
  
  return q75 - q25
}

export default Ply