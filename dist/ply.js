(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ply"] = factory();
	else
		root["ply"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/src.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/ply.js":
/*!********************!*\
  !*** ./src/ply.js ***!
  \********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nconst STEPS = {\n    GROUP: 'group',\n    DATASET: 'dataset'\n}\n\nclass Ply {\n\n  constructor(data) {\n    if (!Array.isArray(data)) throw new Error('data must be an array')\n    // I guess this isn't a lot of objects to try. Let's go for it.\n    data.forEach(d=>{\n      if (!(typeof d == 'object' && d.constructor == Object)) throw Error('data must be an array of objects')\n    })\n    this.data = data\n    this.step = STEPS.DATASET\n    this.funcs = []\n    this.facets = []\n  }\n\n  clear() {\n    this.funcs = []\n    this.step = STEPS.DATASET\n    return this\n  }\n  \n  group(...f) {\n    this.funcs.push((data)=>{\n      return data.reduce((o,v)=> {\n        const facet = f.map(fi=>v[fi]).join(Ply.SEPARATOR)\n        if (!o.hasOwnProperty(facet)) o[facet] = []\n        o[facet].push(v)\n        return o\n      }, {})\n    })\n    this.facets = f\n    this.step = STEPS.GROUP\n    return this\n  }\n  \n  map(mapper) {\n    const mapData = (arr) => {\n      return arr.map(mapper)\n    }\n    let step = this.step\n\n    this.funcs.push((data)=>{\n      if (step === STEPS.GROUP) {\n        Object.keys(data).forEach(facets=>{\n          data[facets] = data[facets].map(mapper)\n        })\n\n        return data\n      }\n      else return data.map(mapper)\n    })\n    this.step = STEPS.DATASET\n    return this\n  }\n\n  filter(fcn) {\n    if (this.step != STEPS.DATASET) {\n      throw TypeError('cannot filter on a grouped data set')\n    }\n    this.funcs.push((data)=>{\n      return data.filter(fcn)\n    })\n    return this\n  }\n\n  reduce(funcs) {\n    // reduce the array to a single point\n    const reduceData = (arr) => {\n      let datapoint = {}\n      Object.keys(funcs).forEach(field=>{\n        if (typeof funcs[field] === 'function') datapoint[field] = funcs[field](arr)\n        else datapoint[field] = funcs[field]\n      })\n      return datapoint\n    }\n    // a plainReducer reduces an array down to a single point w/ reduceData.\n    const plainReducer = (data) => {\n      return [reduceData(data)]\n    }\n    // a groupReducer iterates through the groups and runs plainReducer.\n    const groupReducer = (data) => {\n      let newData = []\n      Object.keys(data).forEach(gr=>{\n        let dataGrouping = data[gr]\n        let datapoint = reduceData(dataGrouping)\n        this.facets.forEach((f)=>{\n          datapoint[f] = dataGrouping[0][f]\n        })\n        newData.push(Object.assign({}, datapoint))\n      })\n      data = newData\n      return data\n    }\n  \n    let reducer = this.step === STEPS.DATASET ? plainReducer : groupReducer\n\n    this.funcs.push(reducer)\n    this.step = STEPS.DATASET\n\t  return this\n  }\n \n  transform() {\n    let newData = this.data.map(d=>Object.assign({}, d))\n    this.funcs.forEach(d=>{newData = d(newData) })\n    this.step = STEPS.DATASET\n    return newData\n  }\n}\n\nPly.SEPARATOR = '||'\n\n\n/* ---------------------------------------------------------------- */\n/* ---------------------------------------------------------------- */\n/*                         Class Methods                            */\n/* ---------------------------------------------------------------- */\n/* ---------------------------------------------------------------- */\n\nPly.sum = (field) => (arr) => {\n  if (!arr.length) return 0\n  return arr.map(d=>{\n    if (!Number.isFinite(d[field])) throw new Error('cannot reduce non-Numbers')\n    let value = d[field]\n    if (value === undefined) throw new Error(`key \"${field}\" missing from an object`)\n    return d[field]\n  }).reduce((a,b)=>a+b,0)\n}\n\nPly.mean = (field) => (arr) => {\n  let n = arr.length\n  if (!n) return NaN\n  return Ply.sum(field)(arr) / n\n}\n\nPly.variance = field => arr => {\n  const n = arr.length\n  if (n < 2) return 0\n  let M = arr[0][field]\n  if (M === undefined) throw new Error(`key \"${field}\" missing from an object`)\n  let S = 0\n  arr.forEach((d,i)=> {\n    let xi = d[field]\n    if (d[field] === undefined) throw new Error(`key \"${field}\" missing from an object`)\n    i = i+1\n    let Mp = M\n    M = Mp + (xi - Mp)/i \n    S = S + (xi - M) * (xi - Mp)\n  })\n  return S / (n-1)\n}\n\nPly.standardDeviation = field => arr => Math.sqrt(Ply.variance(field)(arr))\n\nPly.max = field => arr => {\n  if (arr===undefined || !arr.length) return -Infinity\n  return Math.max(...arr.map(d=>d[field]))\n}\nPly.min = field => arr => {\n  if (arr===undefined || !arr.length) return Infinity\n  return Math.min(...arr.map(d=>d[field]))\n}\n\nPly.quantile = (q, field) => arr => {\n  // R has 9 different ways to calculate quantile.\n  if (arr===undefined || !Array.isArray(arr)) throw new Error('data must be an array')\n  if (!arr.length) return NaN\n  let n = arr.length\n  arr.sort((a,b)=>a[field] - b[field])\n  let qToI = (qi) => {\n    if (qi <= 0) return arr[0][field]\n    if (qi >= 1) return arr[n-1][field]\n    let i = n*qi - 1\n    let out\n    if (Number.isInteger(i)) out = (arr[i][field] + arr[i+1][field]) / 2.0\n    else out = arr[Math.ceil(i)][field]\n    return out\n  }\n  return Array.isArray(q) ? q.map(qi=> qToI(qi)) : qToI(q)\n}\n\n/* quantile cases */\nPly.median = field => arr => Ply.quantile(.5, field)(arr)\n\nPly.IQR = field => arr => {\n  if (!arr.length) return NaN\n  const iqrs = Ply.quantile([.25,.75], field)(arr)\n  let [q25, q75] =  iqrs\n  \n  return q75 - q25\n}\n\nPly.mode = field => arr => {\n  if (!Array.isArray(arr)) throw new Error('data must be an Array')\n  if (!arr.length) return null\n  let counts = Object.entries(arr.reduce((acc,v)=>{\n    acc[v[field]] = acc[v[field]] + 1 || 0\n    return acc\n  }, {}))\n  let topVal = Math.max(...counts.map(c=>c[1]))\n  let modeI = counts.findIndex(c=>c[1] === topVal) // only returns the first it finds.\n  return counts[modeI][0]\n\n}\n\n/* ---------------------------------------------------------------- */\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (Ply);\n\n//# sourceURL=webpack://ply/./src/ply.js?");

/***/ }),

/***/ "./src/src.js":
/*!********************!*\
  !*** ./src/src.js ***!
  \********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _ply_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ply.js */ \"./src/ply.js\");\n\n\n//# sourceURL=webpack://ply/./src/src.js?");

/***/ })

/******/ });
});