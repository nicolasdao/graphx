/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const _ = require('lodash');
const shortid = require('shortid');
const CR = '_cr_';
const T = '_t_';
//const escapeGraphQlSchema = schema => schema.replace(/[\n\r]+/g, CR).replace(/[\t\r]+/g, T);
const chain = value => ({ next: fn => chain(fn(value)), val: () => value });
const set = (obj, prop, value, mutateFn) => 
	!obj || !prop ? obj :
	chain(typeof(prop) != "string" && prop.length > 0).next(isPropArray => isPropArray
		? prop.reduce((acc, p, idx) => { obj[p] = value[idx]; return obj; }, obj)
		: (() => { obj[prop] = value; return obj; })())
	.next(updatedObj => {
		if (mutateFn) mutateFn(updatedObj);
		return updatedObj;
	})
	.val();
const throwError = (v, msg) => v ? (() => {throw new Error(msg)})() : true;
const isScalarType = type => type == 'Int' || type == 'Int!' || type == 'String' || type == 'String!' || type == 'Boolean' || type == 'Boolean!' || 
	type == 'ID' || type == 'ID!' || type == 'Float' || type == 'Float!' || type == 'Enum' || type == 'Enum!';

const getEdge = (edge) => chain(throwError(!edge, `Error in method 'getEdge': Argument 'edge' must exist.`))
	.next(v => edge.trim())
	.next(edge => ({ edge, firstChar: edge.trim().charAt(0), lastChar: edge.trim().charAt(edge.length-1) }))
	.next(v => ({
		leftnode: v.firstChar != '(' 
			? 'default' 
			: chain((v.edge.match(/\((.*?)\)/) || [null, ''])[1].trim()).next(x => x.indexOf('.') > 0 ? x.split('.')[1] : 'default').val(),
		rightnode: v.lastChar != ')' 
			? 'default' 
			: chain((v.edge.split('').reverse().join('').match(/\)(.*?)\(/) || [null, ''])[1].split('').reverse().join('').trim()).next(x => x.indexOf('.') > 0 ? x.split('.')[1] : 'default').val(),
		relation: chain(v.edge.match(/(<-|-)\[(.*?)\](->|-)/) || [null, '', '', ''])
				.next(v => ({ 
					label: chain(v[2].trim()).next(v => v ? v : throwError(true, `Error in method 'getEdge': Failed to extract the relation from edge '${v.edge}'`)).val(), 
					direction: chain({ v1: v[1].trim(), v3: v[3].trim() }).next(v => 
							(v.v1 == '<-' && v.v3 == '-') ? '<' :
							(v.v1 == '-' && v.v3 == '->') ? '>' :
							throwError(true, `Error in method 'getEdge': Failed to extract the relation's direction from edge '${v.edge}'`)
						).val()

				}))
				.next(v => ({ direction: v.direction, label: v.label, generate: compileRelationDef(v.label) }))
				.val()
	}))
	.val();

const compileRelationDef = (relation = '') => chain(relation.match(/([^']+?)=>/) 
		// this relation is explicitely expressed as a string arrow function
		? eval(relation) 
		// this relation is not explicitly expressed as a string arrow function
		: eval(`x => ${relation}`))
	.next(fn => (leftnode, rightnode, args) => fn(leftnode, rightnode, args))
	.val();

const log = (msg, name, transformFn) => chain(name ? `${name}: ${typeof(msg) != "object" ? msg : JSON.stringify(msg)}` : msg)
	.next(v => transformFn ? console.log(chain(transformFn(msg)).next(v => name ? `${name}: ${v}` : v).val()) : console.log(v))
	.next(v => msg)
	.val()

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

/**
 * If the schemaAST's metadata is of type 'edge', it extracts its body.
 * 
 * @param  {Object} metadata SchemaAST's metadata 
 * @return {String}          SchemaAST's metadata's body
 */
const getEdgeDesc = metadata => (!metadata || metadata.name != "edge") ? null : metadata.body.replace(/(^\(|\)$)/g, '')

/**
 * Check whether or not the 'type' that is defined in the 'schemaAST' is of type node.
 * 
 * @param  {String}	  type      Type name
 * @param  {Array} 	  schemaAST Array of schema objects
 * @return {Boolean}           	Result
 */
const GRAPHQLSCALARTYPES = { "ID": true, "String": true, "Float": true, "Int": true  };
const isNodeType = (type, schemaAST) => 
	chain(throwError(!type, `Error in method 'isNodeType': Argument 'type' is required.`))
	.next(v => type.replace(/!$/, ''))
	.next(type => (type.match(/^\[(.*?)\]$/) || [null, type])[1])
	.next(type => GRAPHQLSCALARTYPES[type] 
		? false 
		: 	chain({ type, typeAST: schemaAST.find(x => x.name == type)})
			.next(({type, typeAST}) => !typeAST 
				? throwError(true, `Error in method 'isNodeType': Type '${type}' does not exist in the GraphQL schema.`)
				: (typeAST.type == "TYPE" && typeAST.metadata && typeAST.metadata.name == "node") ? true : false)
			.val())
	.val()

const flattenNodes = (graphqlnodes, predecessor, seedCounter = 0) => _(graphqlnodes).reduce((acc, n) => 
		chain(Object.assign({ _position: acc.counter }, n))
		.next(node => {
			if (predecessor)
				acc.links.push({ predecessor: predecessor._position, successor: node._position, direction: (node._edge || {}).direction, name: (node._edge || {}).name });
			return node;
		})
		.next(node => node._successors && node._successors.length > 0 
			// process predecessors.
			? flattenNodes(node._successors, node, ++acc.counter) 
			// no predecessors, concatenate the result and then move to the next node.
			: { counter: ++acc.counter, nodes: [node], links: [] })
		.next(newResult => set(acc, ['counter', 'nodes', 'links'], [newResult.counter, acc.nodes.concat(newResult.nodes), acc.links.concat(newResult.links)]))
		.val()
		, { counter: seedCounter, nodes: predecessor ? [predecessor] : [], links: [] })

/**
 * [description]
 * 
 * @param  {Object} queryProp     	Property object from the QueryAST
 * @param  {Object} parentTypeAST 	Schema type object from the SchemaAST that is assumed to contain the queryProp
 * @param  {Array}  schemaAST     	Entire SchemaAST
 * @return {Object}               	Query prop's AST enriched with all metadata from the schemaAST
 */
const getQueryFields = (queryProp, parentTypeAST, schemaAST) => 
	chain(parentTypeAST.blockProps.find(x => x.details.name == queryProp.name))
	.next(schemaProp => !schemaProp 
		? 	throwError(true, `Error in method 'getQueryFields': Query function '${queryProp.name}' is not defined in the GraphQL schema (specifically in the 'parentTypeAST' argument).`)
		: 	{ 
				name: queryProp.name, 
				type: schemaProp.details.result.name, 
				isNode: isNodeType(schemaProp.details.result.name, schemaAST),
				edge: getEdgeDesc(schemaProp.details.metadata), 
				args: queryProp.args,
				properties: queryProp.properties && queryProp.properties.length > 0
					? 	chain(schemaProp.details.result.name)
						.next(typename => (typename.match(/^\[(.*?)\]$/) || [null, typename])[1])
						.next(typename => schemaAST.find(x => x.type == "TYPE" && x.name == typename))
						.next(parentTypeAST => parentTypeAST 
							? queryProp.properties.map(queryProp => getQueryFields(queryProp, parentTypeAST, schemaAST))
							: throwError(true, `Error in method 'getQueryFields': Cannot find type '${schemaProp.details.result.name}' in the GraphQL Schema.`))
						.val()
					: 	null
			})
	.val()

module.exports = {
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
}