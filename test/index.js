/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const _ = require('lodash');
const assert = require('assert');
const { extractNodes } = require('../index');
const { log } = require('../utilities');
const schemaDef = require('./schemadef.json'); 
const resultset = require('./resultset.json');

const query = `
{
  brands(
    where:{id: "-KkL9EdTh9abV9xAwHUa"}, 
    page:{first:10}) {
    data {
      id
      name
      posts(where:{rating:LOVE}){
        data {
          author {
            username
          }
          users(have:{rated:LOVE}){
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

const hackedQueryFields = [{
	name: "brands",
	type: "PagedBrand",
	isNode: false,
	edge: null,
	args: "{ where:{id: \"-KkL9EdTh9abV9xAwHUa\"}, page:{first:10} }",
	properties: [{
		name: "data",
		type: "[Brand]",
		isNode: true,
		edge: null,
		args: null,
		properties: [{
			name: "id",
			type: "Int",
			isNode: false,
			edge: null,
			args: null,
			properties: null
		},{
			name: "name",
			type: "String",
			isNode: false,
			edge: null,
			args: null,
			properties: null
		},{
			name: "posts",
			type: "PagedPost",
			isNode: false,
			edge: "(brand)<-['ABOUT']-(posts.data)",
			args: "{where:{rating:LOVE}}",
			properties: [{
				name: "data",
				type: "[Post]",
				isNode: true,
				edge: null,
				args: null,
				properties: [{
					name: "author",
					type: "User",
					isNode: true,
					edge: "<-['CREATED']-", // (post, author) => '<-[CREATED]-'
					args: null,
					properties: [{
						name: "username",
						type: "String",
						isNode: false,
						edge: null,
						args: null,
						properties: null
					}]
				},{
					name: "users",
					type: "PagedUser",
					isNode: false,
					edge: "(post)<-[(post, user) => 'RATED:' + user.rating]-(users.data)",
					args: "{have:{rated:LOVE}}",
					properties: [{
						name: "data",
						type: "[User]",
						isNode: true,
						edge: null,
						args: null,
						properties: [{
							name: "rating",
							type: "PostRating",
							isNode: false,
							edge: null,
							args: null,
							properties: null
						},{
							name: "username",
							type: "String",
							isNode: false,
							edge: null,
							args: null,
							properties: null
						}]
					}]
				}]
			}]
		}]
	}]
}]



describe('index', () => 
  describe('#extractNodes', () => 
    it("Should extract do something", () => {
    	const nodes = extractNodes(hackedQueryFields[0], resultset.data.brands);
    	log(nodes[0].successors[0].successors);
    })));












