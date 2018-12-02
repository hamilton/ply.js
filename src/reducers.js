export const sum = field => (arr) => {
  if (!arr.length) return 0
  return arr.map((d) => {
    if (!Number.isFinite(d[field])) throw new Error('cannot reduce non-Numbers')
    const value = d[field]
    if (value === undefined) throw new Error(`key "${field}" missing from an object`)
    return d[field]
  }).reduce((a, b) => a + b, 0)
}

export const mean = field => (arr) => {
  const n = arr.length
  if (!n) return NaN
  return sum(field)(arr) / n
}

export const variance = field => (arr) => {
  // Welford's online algorithm
  const n = arr.length
  if (n < 2) return 0
  let M = arr[0][field]
  if (M === undefined) throw new Error(`key "${field}" missing from an object`)
  let S = 0
  arr.forEach((d, i) => {
    const xi = d[field]
    if (d[field] === undefined) throw new Error(`key "${field}" missing from an object`)
    i += 1
    const Mp = M
    M = Mp + ((xi - Mp) / i)
    S += (xi - M) * (xi - Mp)
  })
  return S / (n - 1)
}

export const standardDeviation = field => arr => Math.sqrt(variance(field)(arr))

export const covariance = (fieldX, fieldY) => (arr) => {
  let meanX = 0
  let meanY = 0
  let C = 0
  const N = arr.length
  if (N < 2) return 0
  arr.forEach((d, i) => {
    const n = i + 1
    const x = d[fieldX]
    const y = d[fieldY]
    const dx = x - meanX
    meanX += dx / n
    meanY += (y - meanY) / n
    C += dx * (y - meanY)
  })
  return C / (N - 1)
}

export const correlation = (fieldX, fieldY) => (arr) => {
  if (arr.length <= 1) return NaN
  const covXY = covariance(fieldX, fieldY)(arr)
  const sX = standardDeviation(fieldX)(arr)
  const sY = standardDeviation(fieldY)(arr)
  return covXY / (sX * sY)
}

export const rank = field => (arr) => {
  let rankIndex = arr.slice().map((d, i) => [d[field], i])
  rankIndex.sort((a, b) => a[0] - b[0])
  rankIndex = rankIndex.reduceRight((a, x, ind) => {
    a[x[1]] = ind + 1
    return a
  }, {})
  return arr.map((_, i) => rankIndex[i])
}

export const spearman = (fieldX, fieldY) => (arr) => {
  const rX = rank(fieldX)(arr)
  const rY = rank(fieldY)(arr)
  const newArr = rX.map((d, i) => ({ x: d, y: rY[i] }))
  return correlation('x', 'y')(newArr)
}

export const max = field => (arr) => {
  if (arr === undefined || !arr.length) return -Infinity
  return Math.max(...arr.map(d => d[field]))
}
export const min = field => (arr) => {
  if (arr === undefined || !arr.length) return Infinity
  return Math.min(...arr.map(d => d[field]))
}

export const quantile = (q, field) => (arr) => {
  // R has 9 different ways to calculate quantile.
  if (arr === undefined || !Array.isArray(arr)) throw new Error('data must be an array')
  if (!arr.length) return NaN
  const n = arr.length
  arr.sort((a, b) => a[field] - b[field])
  const qToI = (qi) => {
    if (qi <= 0) return arr[0][field]
    if (qi >= 1) return arr[n - 1][field]
    const i = (n * qi) - 1
    let out
    if (Number.isInteger(i)) out = (arr[i][field] + arr[i + 1][field]) / 2.0
    else out = arr[Math.ceil(i)][field]
    return out
  }
  return Array.isArray(q) ? q.map(qi => qToI(qi)) : qToI(q)
}

/* quantile cases */
export const median = field => arr => quantile(0.5, field)(arr)

export const IQR = field => (arr) => {
  if (!arr.length) return NaN
  const iqrs = quantile([0.25, 0.75], field)(arr)
  const [q25, q75] = iqrs

  return q75 - q25
}

export const mode = field => (arr) => {
  if (!Array.isArray(arr)) throw new Error('data must be an Array')
  if (!arr.length) return null
  const counts = Object.entries(arr.reduce((acc, v) => {
    acc[v[field]] = acc[v[field]] + 1 || 0
    return acc
  }, {}))
  const topVal = Math.max(...counts.map(c => c[1]))
  const modeI = counts.findIndex(c => c[1] === topVal) // only returns the first it finds.
  return counts[modeI][0]
}

