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
const { getSchemaParts } = require('graphql-s2s');
const { extractNodes, d3Flatten } = require('../index');
const { chain, log, set, throwError } = require('../utilities');
const schemaDef = require('./schemadef.json'); 
const resultset = require('./resultset.json');

const schema = `
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

const newShortId = () => shortid.generate().replace(/-/g, 'r').replace(/_/g, '9');
const removeMultiSpaces = s => s.replace(/ +(?= )/g,'')
const escapeGraphQlSchema = (sch, cr, t) => sch.replace(/[\n\r]+/g, '_cr_').replace(/[\t\r]+/g, ' ')

const astParse = (query = '') => chain(escapeArguments(cleanAndFormatQuery(query))).next(({ query, argBlocks }) => 
		chain(blockify(query)).next(({ query, blockAliases }) => query
			? chain(_(blockAliases).find(x => x.alias == query)).next(v => v 
					? getBlockProperties(v.block, blockAliases, argBlocks)
					: []
				).val()
			: []
		).val()
	).val()

/**
 * Removes any comments, carriage returns, tabs, commas, and also make sure that there is max. one space between each word.
 * 
 * @param  {String} query Original GraphQL query
 * @return {String}       New escaped and well formatted query.
 */
const cleanAndFormatQuery = (query = '') => 
	chain(removeMultiSpaces(escapeGraphQlSchema(query).replace(/#(.*?)_cr_/g, '').replace(/(_cr_|,)/g, ' ')).trim()).next(q => 
		q.indexOf("query {") == 0 ? q.replace(/query /, '') :
		q.indexOf("mutation {") == 0 ? throwError(true, `Error in method 'cleanAndFormatQuery': Cannot process mutations.`) :
		q
	).val()

/**
 * Escape all arguments from the CLEANED & WELL FORMATTED GraphQL query
 * 
 * @param  {String} query 				CLEANED & WELL FORMATTED GraphQL query(e.g. '{ brands(where:{id:1}){ id name }}')
 * @return {Object} result      		e.g. { query: 'brands--deWcsd4T--{ id name }' argBlocks: [{where: }]}
 * @return {String} result.query      	e.g. 'brands--deWcsd4T--{ id name }'
 * @return {Array} 	result.argBlocks    e.g. Array of OBJECTS (not strings) [ { alias: '--deWcsd4T--', value: {"where": {"id": 1}} ]
 */
const escapeArguments = (query = '') => chain((query || '').match(/\((.*?)\)/g)).next(m => m 
	? m.reduce((q, arg) => 
		chain(`--${newShortId()}--`)
		.next(alias => 
			chain(jsonify(arg)) // parse the arg into a JSON obj
			.next(argObj => q.argBlocks.push({ alias, value: argObj }))  	// store that new JSON obj
			.next(v => set(q, 'query', q.query.replace(arg, alias))).val()) // Replace the arg with an alias
		.val(), 
		{ query, argBlocks: [] })
	: { query, argBlocks: null })
.val()

/**
 * Parse a non-conventionnal JSON string into a conventional JSON string.
 * 
 * @param  {String} arg e.g. '( where :   {id:  "-KkL9EdTh9abV: 9xAwHUa" page  :1} nickname: "Alla" page : {first: 10})'
 * @return {Object}     
 */
const jsonify = arg => !arg ? arg : chain((arg || '').replace(/^\(/g, '{').replace(/\)$/g, '}')) // Remove wrapping
	.next(arg => chain(arg.match(/:(\s*?)"(.*?)"/g)).next(strValues => strValues // Escapes prop value wrapper in ""
		? strValues.reduce((a,v) => 
			chain({ alias: `--${newShortId()}--`, value: v.replace(/^:/, '') })
			.next(({ alias, value }) => set(a, 'arg', a.arg.replace(value, alias), x => x.valueAliases.push({ alias, value: value.trim() }))).val(),
			{ arg, valueAliases:[] })
		: { arg, valueAliases: null }).val()) 
	.next(({ arg, valueAliases }) => chain(arg.match(/:(\s*?)'(.*?)'/g)).next(strValues => strValues // Escapes prop value wrapper in ''
		? strValues.reduce((a,v) => 
			chain({ alias: `--${newShortId()}--`, value: v.replace(/^:/, '') })
			.next(({ alias, value }) => set(a, 'arg', a.arg.replace(value, alias), x => x.valueAliases.push({ alias, value: value.trim() }))).val(),
			{ arg, valueAliases: (valueAliases || [])  })
		: { arg, valueAliases }).val()) 
	.next(({ arg, valueAliases }) => ({ arg: escapeEnumValues(arg), valueAliases })) // Makes sure that GraphQL enum values are wrapped between "".
	.next(({ arg, valueAliases }) => ({ arg: arg.replace(/(\s*?):/g, ':'), valueAliases})) // Remove any space between property name and :
	.next(({ arg, valueAliases }) => ({ arg: arg.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": '), valueAliases})) // Make sure all props are wrapped between "" to comply to JSON
	.next(({ arg, valueAliases }) => ({ arg: removeMultiSpaces(arg).replace(/{ "/g, "{\"").replace(/, "/g, ",\""), valueAliases})) // Removes useless spaces.
	.next(({ arg, valueAliases }) => ({ arg, props: arg.match(/[^{,](\s*?)"([^"\s]*?)"(\s*?):/g), valueAliases})) // Match the props that need to be prepended with a comma.
	.next(({ arg, props, valueAliases }) => props 
		? 	chain(props.map(prop => prop.split(' ').reverse()[0]).reduce((a, prop) => 
				chain(`--${newShortId()}--`) // we have to use this intermediate step to ensure that we can deal with duplicate 'prop'
				.next(alias => set(a, 'arg', a.arg.replace(prop, `, ${alias}`), x => x.propAliases.push({ alias, value: prop }))).val(), 
				{ arg, propAliases: [] }))
			.next(({ arg, propAliases }) => propAliases.reduce((a,p) => a.replace(p.alias, p.value), arg))
			.next(arg => ({ arg, valueAliases }))
			.val()
		: 	{ arg, valueAliases })
	.next(({ arg, valueAliases }) => valueAliases 
		? valueAliases.reduce((a,v) => a.replace(v.alias, v.value.replace(/'/g, "\"")), arg)
		: arg)
	.next(arg => JSON.parse(arg))
	.val()

/**
 * Wraps double-quotes around GraphQL enum values.
 * 
 * @param  {String} pseudoJsonStr e.g. 
 * @return {String}               e.g. 
 */
const escapeEnumValues = pseudoJsonStr => !pseudoJsonStr ? pseudoJsonStr : chain(pseudoJsonStr || '').next(str => 
		str.split(':').map(x => 
			chain(x.replace(/^(\s*)/, ''))
			.next(y => ({ origin: x, trimmed: y, isPotentiallyEnum: (y.match(/^[^{]/) && y.match(/^[^"]/) && y.match(/^[^']/) && !y.match(/^--(.*?)--/)) ? true : false }))
			.next(y => y.isPotentiallyEnum 
				? chain(y.trimmed.match(/(.*?)(\s|})/)).next(m => m 
					? m[1].match(/^[a-zA-Z]+$/) 
						? { origin: y.origin, trimmed: y.trimmed, isEnum: true, enum: m[1] }
						: { origin: y.origin, trimmed: y.trimmed, isEnum: false }
					: { origin: y.origin, trimmed: y.trimmed, isEnum: false }).val()
				: { origin: y.origin, trimmed: y.trimmed, isEnum: false })
			.val())
		.map(x => x.isEnum ? x.trimmed.replace(x.enum, `"${x.enum}"`) : x.origin)
		.join(":")
	).val()

/**
 * Breaks down the CLEANED & WELL FORMATTED GraphQL query into blocks where a block is a piece of query wrapped between { and }.
 * 
 * Each block is contained inside the 
 * @param  {String} query        		CLEANED & WELL FORMATTED one line GraphQL query
 * @param  {Array}  blockAliases 		Array of block aliases
 * @return {Object} result             
 * @return {String} result.query        Alias representing the main root block (e.g. '__HynueUcvMr__'. The real block associated to that alias can be found in the 'blockAliases' array)    
 * @return {Array} 	result.blockAliases Array of objects { alias: String, block: String } (e.g. alias: '__HynueUcvMr__', block: 'id name')
 */
const blockify = (query = '', blockAliases = []) => chain(query.match(/{([^{]*?)}/g)).next(blocks => blocks
		? 	chain(blocks.reduce((q, block) => 
				chain(`__${newShortId()}__`)
				.next(alias => {
					q.blockAliases.push({ alias, block: block.replace(/({|})/g, '').trim() });
					q.query = q.query.replace(block, alias);
					return q;
				})
				.val(), { query, blockAliases: blockAliases }))
			.next(v => blockify(v.query, v.blockAliases))
			.val()
		: 	{ query, blockAliases }
	).val()

/**
 * Returns an AST array from a single blockified lines. Typically used after the GraphQL query has been blockified by the 'blockify' function.
 * 
 * @param  {String} blockifiedLine (e.g. 'brands(where:{id:1})__HynueUcvMr__ posts: __IyetUc34Pa__')
 * @param  {Array}  blockAliases   List of all the blocks and there aliases (e.g. { alias: __HynueUcvMr__, block: 'id name' })
 * @param  {Array}  argBlocks      List of all the args and there aliases (e.g. { alias: --BJFUUpwMr--, arg: 'id: 1' })
 * @return {Array}                 Array of AST. Using the exmaple above: 
 *                                    [{ 
 *                                    		name: 'brands', 
 *                                    		args: {
 *											    "where": {
 *											        "id": 1
 *											    }
 *											}, 
 *                                    		properties: [ ... ] 
 *                                    }, { 
 *                                    		name: 'posts', ... }]
 */
const getBlockProperties = (blockifiedLine = '', blockAliases = [], argBlocks = []) => 
	getEscapedProperties(blockifiedLine).map(p => 
		p.indexOf('__') > 0 || p.indexOf('--') > 0
		? 	chain(replaceBlocksAndArgs(p, blockAliases, argBlocks)).next(x => ({ 
		 		name: x.name, 
		 		args: x.args,
		 		properties: _.flatten(_.toArray(_(x.properties).map(y => getBlockProperties(y, blockAliases, argBlocks))))
		 	})).val()
		: 	{ name: p, args: null, properties: null })

/**
 * Separate all properties contained inside the one liner block 'line'
 * 
 * @param  {String} line e.g. 'id name posts--643289--__r1tul89vzb__'
 * @return {Array}       e.g. ['id' 'name' 'posts--643289--__r1tul89vzb__']
 */
const getEscapedProperties = (line = '') => 
	// 1. Extract any properties that contains arguments(i.e. smth like '--643289--') or a block(i.e. smth like '__r1tul89vzb__')
	// A store those into an array called 'props'. In the example above, 'props' will be ['posts--643289--__r1tul89vzb__']
	chain(((line || '').match(/(.*?)__(.*?)__/g) || []).map(l => 
		chain(l.split(' ').reverse()).next(props => 
			props[0].match(/^__/)
				? props[1].match(/^--/) 
					? `${props[2]} ${props[1]} ${props[0]}`
					: `${props[1]} ${props[0]}`
				: props[0].match(/^--/)
					? `${props[1]} ${props[0]}`
					: props[0]
		).val()))
	// 2. If there was props with argumenst or block found, then remove them, split by space, and then re-add them.
	.next(props => props && props.length > 0
		? _.toArray(_(props.reduce((l, prop) => l.replace(prop, ''), line).split(' ').concat(props)).filter(x => x).sortBy(x => x))
		: _.toArray(_((line || '').split(' ')).filter(x => x).sortBy(x => x)))
	.val()

/**
 * [description]
 * @param  {String} prop         e.g. 'posts--643289--__r1tul89vzb__'
 * @param  {Array} blockAliases  e.g. [{ alias: '__r1tul89vzb__', block: 'id name' }, { alias: '__427ytFr3e__', block: 'id: 1' }]
 * @param  {Array} argBlocks     e.g. [{ alias: '--643289--', value: {"where": {"id": 1}} }]
 * @return {Object}              e.g. { name: 'posts' args: {"where": {"id": 1}}, properties: ['id', 'name'] }
 */
const replaceBlocksAndArgs = (prop = '', blockAliases, argBlocks) => 
	chain({ argsID: (prop.match(/--(.*?)--/) || [null])[0], blockID: (prop.match(/__(.*?)__/) || [null])[0] })
	.next(v => !v.argsID && !v.blockID ? { name: prop.trim(), args: null, properties: null } :
		chain(v.argsID ? _(argBlocks).find(x => x.alias == v.argsID) : null)
		.next(args => v.blockID ? { args, block: _(blockAliases).find(x => x.alias == v.blockID) } : { args, block: null })
		.next(x => ({ args: x.args, block: x.block, name: x.args ? prop.replace(x.args.alias, '') : prop  }))
		.next(x => ({ args: (x.args || {}).value, properties: (x.block || {}).block, name: x.block ? removeMultiSpaces(x.name.replace(x.block.alias, '')).trim() : x.name.trim() }))
		.next(x => ({ name: x.name, args: x.args, properties: getEscapedProperties(x.properties) }))
		.val())
	.val()

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

describe('index', () => 
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

describe('index', () => 
  describe('#cleanAndFormatQuery', () => 
    it("Should throw an error if the request is a mutation.", () => {
    	assert.throws(() => cleanAndFormatQuery(query_3782db), /Error in method 'cleanAndFormatQuery': Cannot process mutations./);
    })));

describe('index', () => 
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

describe('index', () => 
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

describe('index', () => 
  describe('#escapeEnumValues', () => 
    it("Should wrap GraphQL enum values between double-quotes so we can parse them as a JSON object.", () => {
    	const result = escapeEnumValues("{ where :   {id: 1 voted:  SUCK page  :1} nickname: 'Ella' page : {first: 10} rating:LOVE}");
    	assert.equal(result, '{ where :   {id: 1 voted:"SUCK" page  :1} nickname: \'Ella\' page : {first: 10} rating:"LOVE"}');
    })));

describe('index', () => 
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
  posts {
  	data {
  		name
  	}
  }
}`

describe('index', () => 
  describe('#astParse', () => 
    it("Should create an AST from any string GraphQL query.", () => {
    	const ast = astParse(query_cajYlQ207);
    	assert.ok(ast);
    	assert.equal(ast.length, 2);
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




