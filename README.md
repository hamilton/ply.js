# ply.js

[![Build Status](https://travis-ci.org/hamilton/ply.js.svg?branch=master)](https://travis-ci.org/hamilton/ply.js/)

`ply.js` is a small javascript library designed to to group, summarize, and manipulate tabular data sets, using an API inspired by Hadley Wickham's [dplyr](http://dplyr.tidyverse.org/) library for R. It's meant to work in browsers with the kind of tabular data you might encounter on the web - arrays of objects.

Here's an example:

```javascript
let data = [
    {u: true,  v: true,  w: 'h', x: 'a', y: 1, z: 100},
    {u: false, v: true,  w: 'h', x: 'a', y: 1, z: 100},
    {u: true,  v: true,  w: 'i', x: 'a', y: 1, z: 100},
    {u: false, v: true,  w: 'i', x: 'a', y: 1, z: 100},
	...
]

let sd = new Ply(data)
  .group('w', 'x')  // groups the data by variables w and x
  .reduce({         // describes what new variables to create with our grouping
    ySum: (arr) => arr.reduce((acc,v)=>acc+v.y,0),
    yLength: (arr) => arr.length                        
  })
  .transform()      // returns the results

```

### group a small data set and sum / count the values.

```javascript
let data = [
    {date: '2010-01-02', color: 'green', x: 100},
    {date: '2010-01-02', color: 'green', x: 120},
    {date: '2010-01-03', color: 'green', x: 142},
    {date: '2010-01-03', color: 'green', x: 130},
    {date: '2010-01-02', color: 'red', x: 70},
    {date: '2010-01-02', color: 'red', x: 87},
    {date: '2010-01-03', color: 'red', x: 95},
    {date: '2010-01-03', color: 'red', x: 99}
]

// 1. group by color and date
// 2. get length of groups, as well as sum of x per grouping
let byColorAndDate = new Ply(data)
    .group('date', 'color') 
    .reduce({
      xSum:    arr => arr.reduce((acc,v)=>acc+v.x, 0),
      xLength: arr => arr.length
     })
    .transform()

```

### get mean, median, and standard deviation of groups

Here, we use some [reducer helper functions](#reducer-helper-functions) to get summary statistics of our group.

```javascript
let data = [
    {date: '2018-01-02', color: 'green', x: 100},
    {date: '2018-01-02', color: 'green', x: 120},
    {date: '2018-01-03', color: 'green', x: 142},
    {date: '2018-01-03', color: 'green', x: 130},
    {date: '2018-01-02', color: 'red', x: 70},
    {date: '2018-01-02', color: 'red', x: 87},
    {date: '2018-01-03', color: 'red', x: 95},
    {date: '2018-01-03', color: 'red', x: 99},
    ... // let's say 1,000 more rows
]

let summary = new Ply(data)
  .group('date', 'color')
  .reduce({
    mean: Ply.mean('x'),
    median: Ply.median('x'),
    stdev: Ply.standardDeviation('x'),
    IQR: Ply.IQR('x'),
    q75: Ply.quantile(.75, 'x')
  })
  .transform()
```

## API

### basic features

- __`new Ply(data)`__ Creates a new Ply object with data.
- __`.group(...facets)`__ Creates a new grouped data set based on the facet keys. The resulting object has keys based on the facet combinations, and values which are the row elements that contain those facets.
- __`.reduce({...newVariableFunctions})`__ - reduces a group data set and outputs new variables based on the argument passed.
- __`.map(mapFunction)`__ - functions just like the array `map` function, but works on both grouped and ungrouped Plys.
- __`.select(fieldsOrSelectFunction)`__ - selects columns from a Ply object.

### reducer helper functions

All the reducer helper functions return a _function_ that takes an array, pulls out all the data associated with `key`, then returns the output of that function.

Here's how they look in practice:

```javascript
let data = [
	{facet: 'a', x: 10},
    {facet: 'b', x: 15},
    ...
]

const ply = new Ply(data)
let out = ply
  .group('facet')
  .reduce({
    avg: Ply.mean('x'),
    sd: Ply.standardDeviation('x')
  })
  .transform()
```

Alternatively, you can just use them directly.

```javascript
let mean = Ply.mean('x')(data)
```

#### functions

- __`Ply.sum(key)`__ returns a sum.
- __`Ply.mean(key)`__ returns the mean.
- __`Ply.variance(key)`__ returns the variance, calculated via Welford's method.
- __`Ply.standardDeviation(key)`__ returns the standard deviation.
- __`Ply.covariance(key1, key2)`__ returns the covariance.
- __`Ply.correlation(key1, key2)`__ returns the correlation.
- __`Ply.spearman(key1, key2)`__ returns the [spearman correlation coefficient](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient).
- __`Ply.quantile(q, key)`__ returns the value at quantile `q`.
- __`Ply.median(key)`__ shorthand for `Ply.quantile(.5, key)`.
- __`Ply.IQR(key)`__ returns the inter-quartile range.
- __`Ply.mode(key)`__ returns the mode.

