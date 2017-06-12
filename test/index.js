/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const _ = require('lodash');
const assert = require('assert');
const shortid = require('shortid');
const { getSchemaAST } = require('graphql-s2s');
const { extractNodes, d3Flatten, getQueryAST, compileGraphDataToD3 } = require('../index');
const schemaDef = require('./schemadef.json'); 
const resultset = require('./resultset.json');
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
} = require('../utilities');

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

const schema_dxbahT5 = `
type Paged<T> {
	data: [T]
	cursor: ID
}

@node
type User {
	id: ID!
	username: ID!
}

type UserWithRating inherits User {
	rating: UserRating
}

@node
type Post {
	id: ID!
	name: String!
	text: String

	@edge(<-['CREATED']-)
	author: User

	@edge(-['ABOUT']->)
	brand: Brand

	@edge((post)<-[(post, user) => 'RATED:' + user.rating]-(users.data))
	users(where: WhereUserInput, page: PagegInput): Paged<UserWithRating>
}

@node
type Brand {
	id: ID!
	name: String!

	@edge((brand)<-['ABOUT']-(posts.data))
	posts(where: WherePostInput, page: PagegInput): Paged<Post>
}

enum UserRating {
	LOVE
	LIKE
	NEUTRAL
	DISLIKE
	HATE
}

input PagegInput {
	first: Int
}

input WhereBrandInput {
	id: ID
}

input WherePostInput {
	rating: UserRating
}

input WhereUserInput {
	rating: UserRating
}

type Query {
	brands(where: WhereBrandInput, page: PagegInput): Paged<Brand>
}
`

describe('index', () => 
  describe('#astParse', () => 
    it("Should create an AST from any string GraphQL query.", () => {
    	const schemaAST = getSchemaAST(schema_dxbahT5);
    	const queryAST = getQueryAST(query_cajYlQ207, schemaAST);
    	assert.ok(queryAST);
    	assert.equal(queryAST.length, 1);
    	assert.equal(queryAST[0].name, 'brands');
    	assert.equal(queryAST[0].type, 'PagedBrand');
    	assert.equal(queryAST[0].isNode, false);
    	assert.ok(!queryAST[0].edge);
    	assert.ok(queryAST[0].args);
    	assert.ok(queryAST[0].args.where);
    	assert.ok(queryAST[0].args.page);
    	assert.equal(queryAST[0].args.where.id, "-KkL9EdTh9abV9xAwHUa");
    	assert.equal(queryAST[0].args.page.first, 10);
    	const brandsProps = queryAST[0].properties;
    	assert.ok(brandsProps);
    	assert.equal(brandsProps.length, 1);
    	const data = brandsProps[0];
    	assert.equal(data.name, "data");
    	assert.equal(data.type, "[Brand]");
    	assert.equal(data.isNode, true);
    	assert.ok(!data.args);
    	assert.ok(!data.edge);
    	const dataProps = data.properties;
    	assert.ok(dataProps);
    	assert.equal(dataProps.length, 3);
    	const posts = dataProps[2];
    	assert.equal(posts.name, "posts");
    	assert.equal(posts.type, "PagedPost");
    	assert.equal(posts.isNode, false);
    	assert.equal(posts.edge, "(brand)<-['ABOUT']-(posts.data)");
    	assert.ok(posts.args);
    	assert.ok(posts.args.where);
    	assert.equal(posts.args.where.rating, "LOVE");
    })));

describe('index', () => 
  describe('#extractNodes', () => 
    it("Should extract all nodes(schema types marked with the '@node' attribute) for each query. Each node should also contains their successors with their edge.", () => {
    	const schemaAST = getSchemaAST(schema_dxbahT5);
    	const queryAST = getQueryAST(query_cajYlQ207, schemaAST);
    	const queryResponse = resultset;
    	const brandsQuery = queryAST[0];
    	const brandsQueryResp = resultset.data[brandsQuery.name];
    	assert.ok(brandsQueryResp);
    	const result = extractNodes(brandsQuery, brandsQueryResp);
    	assert.ok(result);
    	assert.equal(result.length, 1);
    	assert.equal(result[0]._node, "Brand");
    	assert.equal(result[0].id, "-KkL9EdTh9abV9xAwHUa");
    	assert.equal(result[0].name, "Alineala llc");
    	assert.ok(!result[0]._edge);
    	assert.ok(result[0]._successors);
    	assert.equal(result[0]._successors.length, 50);
    	const post = result[0]._successors[0];
    	assert.equal(post._node, "Post");
    	assert.ok(post._successors);
    	assert.equal(post._successors.length, 3);
    	assert.ok(post._successors[0]._edge);
    	assert.ok(post._successors[1]._edge);
    	assert.ok(post._successors[2]._edge);
    	assert.equal(post._successors[0]._edge.name, "CREATED");
    	assert.equal(post._successors[1]._edge.name, "RATED:LOVE");
    	assert.equal(post._successors[2]._edge.name, "RATED:LOVE");
    	assert.equal(post._successors[0]._edge.direction, "<");
    	assert.equal(post._successors[1]._edge.direction, "<");
    	assert.equal(post._successors[2]._edge.direction, "<");
    	//log(JSON.stringify(result));
    })));

describe('index', () => 
  describe('#d3Flatten', () => 
    it("Should format all nodes extracted by the 'extractNodes' so they can be ingested by D3.", () => {
    	const schemaAST = getSchemaAST(schema_dxbahT5);
    	const queryAST = getQueryAST(query_cajYlQ207, schemaAST);
    	const queryResponse = resultset;
    	const brandsQuery = queryAST[0];
    	const brandsQueryResp = resultset.data[brandsQuery.name];
    	const nodes = extractNodes(brandsQuery, brandsQueryResp);
    	const d3Resp = d3Flatten(nodes);
    	assert.ok(d3Resp);
        assert.ok(d3Resp.nodes);
        assert.ok(d3Resp.edges);
        assert.equal(d3Resp.nodes.length, 159);
        assert.equal(d3Resp.edges.length, 158);
        assert.equal(d3Resp.nodes[0]._node, "Brand");
        assert.equal(d3Resp.nodes[0].id, "-KkL9EdTh9abV9xAwHUa");
        assert.equal(d3Resp.nodes[0].name, "Alineala llc");
        assert.equal(d3Resp.nodes[1]._node, "Post");
        assert.equal(d3Resp.nodes[2]._node, "User");
        assert.equal(d3Resp.edges[0].source, 1);
        assert.equal(d3Resp.edges[0].target, 0);
        assert.equal(d3Resp.edges[0].name, "ABOUT");
    }))); 

describe('index', () => 
  describe('#compileGraphDataToD3', () => 
    it("Should format all nodes extracted by the 'extractNodes' so they can be ingested by D3.", () => {
        const d3Resp_1 = compileGraphDataToD3(query_cajYlQ207, resultset, schema_dxbahT5);
        const schemaAST = getSchemaAST(schema_dxbahT5);
        const d3Resp_2 = compileGraphDataToD3(query_cajYlQ207, resultset, schemaAST);

        const validate = d3Resp => {
            assert.ok(d3Resp);
            assert.ok(d3Resp.nodes);
            assert.ok(d3Resp.edges);
            assert.equal(d3Resp.nodes.length, 159);
            assert.equal(d3Resp.edges.length, 158);
            assert.equal(d3Resp.nodes[0]._node, "Brand");
            assert.equal(d3Resp.nodes[0].id, "-KkL9EdTh9abV9xAwHUa");
            assert.equal(d3Resp.nodes[0].name, "Alineala llc");
            assert.equal(d3Resp.nodes[1]._node, "Post");
            assert.equal(d3Resp.nodes[2]._node, "User");
            assert.equal(d3Resp.edges[0].source, 1);
            assert.equal(d3Resp.edges[0].target, 0);
            assert.equal(d3Resp.edges[0].name, "ABOUT");
        };

        validate(d3Resp_1);
        validate(d3Resp_2);
    })));



