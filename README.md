# ply.js

[![Build Status](https://travis-ci.org/hamilton/ply.js.svg?branch=master)](https://travis-ci.org/hamilton/ply.js/)

`ply.js` is a lightweight library designed to help with basic data analysis tasks in javascript. It is modelled after the `dplyr` library by Hadley Wickham, designed for R.

[View the docs here.](https://hamilton.github.io/ply.js/)

## v0.2 roadmap

We're hoping to get across the v0.2 with the following features:

- [ ] __Support a columnar view__ the data world has approached a usable data format - columnar in-memory data frames. [Apache Arrow](https://hamilton.github.io/ply.js/) is a project that defines this view. We think ply.js should natively support this api, and perhaps even focus on it. This will require a fairly big rewrite of the library to support a columnar view, which will be a pain in the short run, but will save it from obsolescence in the medium-run.
- [ ] __Support for gather / spread__ `tidyr` supports these two functions, which allows users to pivot / unpivot variables in a data frame.
- [ ] __Support for grouping based on a function__ 
