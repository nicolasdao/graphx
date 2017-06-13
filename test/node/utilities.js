/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const _ = require('lodash');
const assert = require('assert');
const {
  chain,
  throwError,
  isScalarType,
  getEdge,
  log,
  set,
  newShortId,
  removeMultiSpaces,
  escapeGraphQlSchema,
  astParse,
  cleanAndFormatQuery,
  escapeArguments,
  jsonify,
  escapeEnumValues,
  blockify,
  getBlockProperties,
  getEscapedProperties,
  replaceBlocksAndArgs,
  getEdgeDesc,
  isNodeType,
  flattenNodes,
  getQueryFields
} = require('../../src/utilities');

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should extract relations info from edges like <-['CREATED']-", () => {
      const edge = getEdge("<-['CREATED']-");
      assert.ok(edge);
      assert.equal(edge.leftnode, 'default');
      assert.equal(edge.rightnode, 'default');
      assert.ok(edge.relation);
      assert.equal(edge.relation.label, "'CREATED'");
      assert.equal(edge.relation.direction, "<");
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should extract relations info from edges like (brand)<-['ABOUT']-(posts.data)", () => {
      const edge = getEdge("(brand)<-['ABOUT']-(posts.data)");
      assert.ok(edge);
      assert.equal(edge.leftnode, 'default');
      assert.equal(edge.rightnode, 'data');
      assert.ok(edge.relation);
      assert.equal(edge.relation.label, "'ABOUT'");
      assert.equal(edge.relation.direction, "<");
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should extract relations info from relations like (brand)<-['ABOUT']-(posts.data)", () => {
      const edge = getEdge("<-['ABOUT']-(posts.data)");
      assert.ok(edge);
      assert.equal(edge.leftnode, 'default');
      assert.equal(edge.rightnode, 'data');
      assert.ok(edge.relation);
      assert.equal(edge.relation.label, "'ABOUT'");
      assert.equal(edge.relation.direction, "<");
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should extract relations info from edges like (post)<-[(post, user) => 'RATED:' + user.rating]-(users.data)", () => {
      const edge = getEdge("(post)<-[(post, user) => 'RATED:' + user.rating]-(users.data)");
      assert.ok(edge);
      assert.equal(edge.leftnode, 'default');
      assert.equal(edge.rightnode, 'data');
      assert.ok(edge.relation);
      assert.equal(edge.relation.label, "(post, user) => 'RATED:' + user.rating");
      assert.equal(edge.relation.direction, "<");
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should throw an error if the relation's direction is badly formatted.", () => {
      assert.throws(() => getEdge("(post)-[(post, user) => 'RATED:' + user.rating]-(users.data)"), /Failed to extract the relation's direction/);
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should throw an error if the relation is badly formatted.", () => {
      assert.throws(() => getEdge("(post)<-[(post, user) => 'RATED:' + user.rating-(users.data)"), /Failed to extract the relation/);
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should generate a dynamic relation for edges like <-['CREATED']-", () => {
      const edge = getEdge("<-['CREATED']-");
      assert.ok(edge);
      assert.ok(edge.relation);
      assert.equal(edge.relation.generate(null, { rating:'love' }), "CREATED");
    })));

describe('utilities', () => 
  describe('#getEdge', () => 
    it("Should generate a dynamic relation for edges like (post)<-[(post, user) => 'RATED:' + user.rating-(users.data)", () => {
      const edge = getEdge("(post)<-[(post, user) => 'RATED:' + user.rating]-(users.data)");
      assert.ok(edge);
      assert.ok(edge.relation);
      assert.equal(edge.relation.generate(null, { rating:'love' }), "RATED:love");
    })));

describe('utilities', () => 
  describe('#set', () => 
    it("Should set a specific property of an object to a specific value (e.g. set(a, 'name', 'Peter'))", () => {
      const a = {};
      const b = set(a, 'name', 'Peter');
      assert.equal(b.name, "Peter");
    })));

describe('utilities', () => 
  describe('#set', () => 
    it("Should set a specific properties of an object to a set of specific values (e.g. set(a, ['name', 'age'], ['Peter', 3]))", () => {
      const a = {};
      const b = set(a, ['name', 'age'], ['Peter', 3]);
      assert.equal(b.name, "Peter");
      assert.equal(b.age, 3);
    })));

describe('utilities', () => 
  describe('#set', () => 
    it("Should mutate an object if a mutate function is passed as the 4th argument", () => {
      const a = { array:[] };
      const b = set(a, ['name', 'age'], ['Peter', 3], x => x.array.push(2));
      assert.equal(b.name, "Peter");
      assert.equal(b.age, 3);
      assert.equal(a.array.length, 1);
      assert.equal(a.array[0], 2);
    })));

const query_47298dn = `
query {
  brands(where: {id: 1}){ 
    data {
      id
      name
    }
  }
}`

const query_debuqc6e32 = `
query {
  brands {
    name
  }
}`

const query_47328dewiu = `
{
  brands {
    name
  }
}`

describe('utilities', () => 
  describe('#cleanAndFormatQuery', () => 
    it("Should validate that the request is a legit query and not a mutation.", () => {
      const q = cleanAndFormatQuery(query_debuqc6e32);
      assert.equal((q.match(/^{/) || [])[0], "{");
      const q2 = cleanAndFormatQuery(query_debuqc6e32);
      assert.equal((q2.match(/^{/) || [])[0], "{");
    })));

const query_3782db = `
mutation {
  brands {
    name
  }
}`

describe('utilities', () => 
  describe('#cleanAndFormatQuery', () => 
    it("Should throw an error if the request is a mutation.", () => {
      assert.throws(() => cleanAndFormatQuery(query_3782db), /Error in method 'cleanAndFormatQuery': Cannot process mutations./);
    })));

describe('utilities', () => 
  describe('#getEscapedProperties', () => 
    it("Should extract each block's properties from an escaped block line.", () => {
      const v = _.toArray(_(getEscapedProperties('id name posts--643289--__r1tul89vzb__ posts __HJPdlL5Pzb__ firstname')).sortBy(x => x));
      assert.equal(v.length, 5);
      assert.equal(v[0], 'firstname');
      assert.equal(v[1], 'id');
      assert.equal(v[2], 'name');
      assert.equal(v[3], 'posts __HJPdlL5Pzb__');
      assert.equal(v[4], 'posts--643289--__r1tul89vzb__');
      const v2 = _.toArray(_(getEscapedProperties('id name')).sortBy(x => x));
      assert.equal(v2.length, 2);
      assert.equal(v2[0], 'id');
      assert.equal(v2[1], 'name');
      const v3 = _.toArray(_(getEscapedProperties('')).sortBy(x => x));
      assert.equal(v3.length, 0);
      const v4 = _.toArray(_(getEscapedProperties('where:__r1tul89vzb__ page: __HJPdlL5Pzb__')).sortBy(x => x));
      assert.equal(v4.length, 2);
      assert.equal(v4[0], 'page: __HJPdlL5Pzb__');
      assert.equal(v4[1], 'where:__r1tul89vzb__');
    })));

const query_cwkjbTL31Y = `
query {
  brands(where: {id: 1}){ 
    data {
      id
      name
    }
  }
}`

describe('utilities', () => 
  describe('#escapeArguments', () => 
    it("Should escape all argument blocks from the GraphQL query.", () => {
      const result = escapeArguments(cleanAndFormatQuery(query_cwkjbTL31Y));
      assert.ok(result);
      assert.ok(result.query);
      assert.ok(result.argBlocks);
      assert.equal(result.argBlocks.length, 1);
      assert.ok(result.argBlocks[0].alias);
      assert.ok(result.argBlocks[0].value);
      const m = result.query.match(/{ brands(.*?){ data { id name } } }/);
      assert.ok(m);
      assert.equal(m[1], result.argBlocks[0].alias);
      assert.equal(JSON.stringify(result.argBlocks[0].value), '{"where":{"id":1}}')
    })));

describe('utilities', () => 
  describe('#escapeEnumValues', () => 
    it("Should wrap GraphQL enum values between double-quotes so we can parse them as a JSON object.", () => {
      const result = escapeEnumValues("{ where :   {id: 1 voted:  SUCK page  :1} nickname: 'Ella' page : {first: 10} rating:LOVE}");
      assert.equal(result, '{ where :   {id: 1 voted:"SUCK" page  :1} nickname: \'Ella\' page : {first: 10} rating:"LOVE"}');
    })));

describe('utilities', () => 
  describe('#jsonify', () => 
    it("Should parse a non-conventional JSON string into a JSON object", () => {
      const result = jsonify('( where :   {id:  "-KkL9EdTh9abV: 9xAwHUa" page  :1} nickname: "Ella" page : {first: 10})');
      assert.ok(result);
      assert.ok(result.where);
      assert.ok(result.page);
      assert.equal(result.nickname, "Ella");
      assert.equal(result.where.id, "-KkL9EdTh9abV: 9xAwHUa");
      assert.equal(result.where.page, 1);
      assert.equal(result.page.first, 10);
    })));

const query_cajYlQ207 = `
query {
  brands(
    # some comments to make things harder to parse
    where:{id: '-KkL9EdTh9abV9xAwHUa'}, 
    page:{first:10}) { # { some comments to make things harder to parse
    data {
      id
      name
      # some comments to make things harder to parse
      posts(where:{rating:LOVE}){
        data {
          author {
            username
          }
          users(have:{id: "-TiL9Eddwd&9abV9xAwHUa", rated:LOVE}){
            data {
              rating
              username
            }
          }
        }
      }
    }
  }
}`

describe('utilities', () => 
  describe('#astParse', () => 
    it("Should create an AST from any string GraphQL query.", () => {
      const ast = astParse(query_cajYlQ207);
      assert.ok(ast);
      assert.equal(ast.length, 1);
      const prop1 = ast[0];
      assert.equal(prop1.name, "brands");
      assert.ok(prop1.args.where);
      assert.ok(prop1.args.page);
      assert.equal(prop1.args.where.id,"-KkL9EdTh9abV9xAwHUa");
      assert.equal(prop1.args.page.first, 10);
      assert.ok(prop1.properties);
      assert.equal(prop1.properties.length, 1);
      const prop1_0 = prop1.properties[0];
      assert.equal(prop1_0.name, "data");
      assert.ok(prop1_0.properties);
      assert.equal(prop1_0.properties.length, 3);
      assert.equal(prop1_0.properties[0].name, "id");
      assert.equal(prop1_0.properties[1].name, "name");
      assert.equal(prop1_0.properties[2].name, "posts");
      assert.ok(prop1_0.properties[2].args);
      assert.ok(prop1_0.properties[2].args.where);
      assert.equal(prop1_0.properties[2].args.where.rating, "LOVE");
      assert.equal(prop1_0.properties[2].properties[0].properties[1].name, "users");
      assert.equal(prop1_0.properties[2].properties[0].properties[1].args.have.id, "-TiL9Eddwd&9abV9xAwHUa");
    })));

const schemaAST_4dnedu6 = [{
        "type": "TYPE",
        "name": "User",
        "metadata": {
            "name": "node",
            "body": "",
            "schemaType": "TYPE",
            "schemaName": "User",
            "parent": null
        },
    }, {
        "type": "TYPE",
        "name": "PagedBrand",
        "metadata": null,
        "genericType": "T"
    }]

describe('utilities', () => 
  describe('#isNodeType', () => 
    it("Should create an AST from any string GraphQL query.", () => {
      assert.equal(isNodeType('ID', schemaAST_4dnedu6), false);
      assert.equal(isNodeType('ID!', schemaAST_4dnedu6), false);
      assert.equal(isNodeType('String', schemaAST_4dnedu6), false);
      assert.equal(isNodeType('String!', schemaAST_4dnedu6), false);
      assert.equal(isNodeType('Float', schemaAST_4dnedu6), false);
      assert.equal(isNodeType('Float!', schemaAST_4dnedu6), false);
      assert.equal(isNodeType('Int', schemaAST_4dnedu6), false);
      assert.equal(isNodeType('Int!', schemaAST_4dnedu6), false);
      assert.equal(isNodeType('User', schemaAST_4dnedu6), true);
      assert.equal(isNodeType('[User]', schemaAST_4dnedu6), true);
      assert.equal(isNodeType('PagedBrand', schemaAST_4dnedu6), false);
      assert.throws(() => isNodeType('Hello', schemaAST_4dnedu6), /Type 'Hello' does not exist in the GraphQL schema/);
    })));

