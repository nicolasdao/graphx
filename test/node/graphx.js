/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const env = process.env.MOCHA_ENV;
const _ = require('lodash');
const { assert, expect } = require('chai');
//const { getSchemaAST } = require('graphql-s2s').graphqls2s;
//const { extractNodes, d3Flatten, getQueryAST, compileGraphDataToD3 } = require('../../lib/graphx.min').graphx;
const graphqls2s = require('graphql-s2s').graphqls2s;
const graphx = env == 'dev' ? require('../../src/graphx').graphx : require('../../lib/graphx.min').graphx;
const { runtest } = require('../browser/graphx');

runtest(graphx, graphqls2s, assert, expect);
