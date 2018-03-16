/* 
ply.js is a small library that crunches down data, loosely based on Hadley Wickham's dplyr for R. Here's a rundown of the API:

- `.group(...facets)` --- groups the data set based on `facets`, each full combination of which acts as a grouping facet.
- `.reduce(reducerFunctions)` --- takes an object with keys representing the variable to be created by the reducer, and the value is a function that takes all the grouped data and outputs a single value. The output is a reduced data set with all the `facets` defined by the `group` function and all the reduced values.
- `.filter(fcn)` --- filters the data set by a particular function. Works just like an Array filter.
- `.map(fcn)` --- maps the data set onto

And a single example of usage:

let a = new Dataframe(x)
a.group('c', 'd')
  .reduce({
	x: arr => arr.length,
    y: arr => arr.map(d=>d.b).reduce((a,b)=>a+b,0)
}}
  .transform()

*/

const STEPS = {
    GROUP: 'group',
    DATASET: 'dataset'
}

class Ply {

  constructor(data) {
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
    if (this.step != STEPS.DATASET) {
      throw new TypeError('cannot have a mapper on a grouped data set')
    }
    this.funcs.push((data)=>{
      return data.map(mapper)
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
        datapoint[field] = funcs[field](arr)
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
//window.Ply = Ply
export default Ply