/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const _ = require('lodash')
const shortid = require('shortid')
const { getSchemaAST } = require('graphql-s2s').graphqls2s
const {
	chain,
	throwError,
	isScalarType,
	getEdge,
	log,
	astParse,
	flattenNodes,
	getQueryFields
} = require('./utilities')

/**
 * Parses a string GraphQL query to an AST enriched with metadata from the GraphQL Schema AST.
 *  
 * @param  {String}  query     	Raw string GraphQL query.
 * @param  {Array}   schemaAST 	Array of schema objects. Use 'graphql-s2s' npm package('getSchemaParts' method) to get that AST.
 * @return {Array}            	Query AST.
 */
const getQueryAST = (query, schemaAST) => 
	chain(throwError(!query, 'Error in method \'getQueryAST\': Parameter \'query\' is required.'))
	.next(() => _(schemaAST))
	.next(schemaAST => 
		chain(schemaAST.find(x => x.type == 'TYPE' && x.name == 'Query'))
		.next(queryType => !queryType
			? throwError(log(!queryType, 'QUERY TYPE'), 'Error in method \'getQueryAST\': The GraphQL schema does not define a \'Query\' type.')
			: chain(astParse(query)).next(ast => ast
				? ast.map(prop => getQueryFields(prop, queryType, schemaAST))
				: []).val())
		.val())
	.val()

/**
 * Extracts the nodes located in the root properties of the 'fieldValue' param. Each node will also contain
 * their immediate related children (that means that non-continuous relations are ignored).
 * 
 * @param  {Object} fieldDef        [description]
 * @param  {Object} fieldValue      [description]
 * @param  {Object} predecessorEdge [description]
 * @return {[type]}                	[description]
 */
const extractNodes = (fieldDef, fieldValue, predecessorEdge = {}, predecessor) => 
	(!fieldDef || !fieldValue || typeof(fieldValue) != 'object') ? [] :
	fieldValue.length != undefined
		? 	_.flatten(fieldValue.map(fv => extractNodes(fieldDef, fv, predecessorEdge)))
		: 	chain(_(fieldDef.properties).reduce((a, p) => 
				isScalarType(p.type) ? chain(a.scalarTypes.push(p)).next(() => a).val() :
				p.edge ? chain(a.nonScalarTypesWithEdges.push(p)).next(() => a).val() :
				chain(a.nonScalarTypes.push(p)).next(() => a).val(), // I'm storing the props with edges, but so far, I don't see any usage for it. Maybe later.
				{ scalarTypes: [], nonScalarTypes: [], nonScalarTypesWithEdges: []}))
			.next(props =>
				//e.g. "p": posts, "fieldValue[p.name]": { data:[...], cursor: ... }, "getEdge(p.edge)": { leftnode: "default", rightnode: "data",edge: { label: 'ABOUT', direction: '<' } }
				chain(_.flatten(_.toArray(_(props.nonScalarTypesWithEdges).map(p => chain(getEdge(p.edge)).next(edge => 
					edge.rightnode == 'default'
					// that means that the current property 'p' is supposed to be the successor
					?	extractNodes(p, fieldValue[p.name], edge, fieldValue)
					// that means that the current property 'p' is not the immediate successor, but instead a property of 'p'
					: 	chain({ nodeProp: _(p.properties).find(x => x.name == edge.rightnode), nodeValue: (fieldValue[p.name] ? fieldValue[p.name][edge.rightnode] : null) })
						.next(v => extractNodes(v.nodeProp, v.nodeValue, edge, fieldValue))
						.val()
				).val()))))
				.next(successors => 
					fieldDef.isNode
					// CREATE NODE
					?	[_(props.scalarTypes).reduce((a, p) => 
							{ a[p.name] = fieldValue[p.name]; return a }, 
							{ 
								_node: fieldDef.type.replace(/(\[|\])/g,''), // Describe the type of node
								_uuid: shortid.generate(), // uniquely identify that node
								_successors: successors, // Array of all successor nodes
								_edge: predecessorEdge && predecessorEdge.relation // relation between this node and its predecessor
									? { name: predecessorEdge.relation.generate(predecessor, fieldValue, null), direction: predecessorEdge.relation.direction }
									: null 
							})]
					// If the current field is not a node, then keep looking for some under the other properties
					: 	_.flatten(_.toArray(_(props.nonScalarTypes).map(p => extractNodes(p, fieldValue[p.name]))))
				)
				//.next(node => log(node, "NODE"))
				.val())
			.val()

/**
 * Formats the ouput of the nodes extracted from the method 'extractNodes' into a D3 array.
 * 
 * @param  {Array} 	graphqlnodes 	Nodes from 'extractNodes'
 * @return {Object} result      
 * @return {Array} 	result.nodes    Array of all nodes.
 * @return {Array} 	result.edges    Array of all edges between 'nodes'.  
 */
const d3Flatten = graphqlnodes => chain(flattenNodes(graphqlnodes))
	.next(v => ({ 
		nodes: _.toArray(_(v.nodes).sortBy(x => x._position).map(x => { 
			delete x._successors
			delete x._edge 
			return x 
		})), 
		edges: _.toArray(_(v.links).sortBy(x => x.predecessor).map(x => ({ 
			source: x.direction == '>' ? x.predecessor : x.successor,
			target: x.direction == '>' ? x.successor : x.predecessor,
			name: x.name
		}))) 
	}))
	.val()

/**
 * Format & enrich the GraphQL response so it contains relations that can be visualized in a D3 app.
 *  
 * @param  {String} 		query       	Raw GraphQL query.
 * @param  {Object} 		resp 			GraphQL response
 * @param  {String|Array} 	schemaAST   	Either the raw GraphQL schema or the AST version faster performance(use 'graphql-s2s' npm package)
 * @return {Object} 		result      
 * @return {Array} 			result.nodes    Array of all nodes.
 * @return {Array} 			result.edges    Array of all edges between 'nodes'. 
 */
const compileGraphDataToD3 = (query = '', resp, schemaAST) => 
	chain(throwError(!schemaAST, 'Error in method \'compileGraphDataToD3\': Parameter \'schemaAST\' is required.'))
	.next(() => throwError(!resp, 'Error in method \'compileGraphDataToD3\': Parameter \'resp\' is required.'))
	.next(() => throwError(!resp.data, 'Error in method \'compileGraphDataToD3\': Parameter \'resp.data\' is required.'))
	.next(() => throwError(!query, 'Error in method \'compileGraphDataToD3\': Parameter \'query\' is required.'))
	.next(() => typeof(schemaAST) == 'string' ? getSchemaAST(schemaAST) : schemaAST)
	.next(schemaAST => getQueryAST(query, schemaAST))
	.next(queryAST => queryAST && queryAST.length > 0 
		? 	chain(_.flatten(_.toArray(_(queryAST)
				.map(request => ({ request, response: resp.data[request.name] }))
				.filter(x => x.response)
				.map(x => extractNodes(x.request, x.response)))))
			.next(nodes => nodes && nodes.length > 0 ? d3Flatten(nodes) : { nodes:[], edges:[] })
			.val()
		: 	throwError(true, `Error in method 'compileGraphDataToD3': Query '${query}' failed to be parsed to a valid AST.`))
	.val()

const graphx = {
	extractNodes,
	d3Flatten,
	getQueryAST,
	compileGraphDataToD3
}

if (typeof window != 'undefined')  
	window.graphx = graphx

module.exports.graphx = graphx







