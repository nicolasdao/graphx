const _ = require('lodash');
const shortid = require('shortid');
const { escapeGraphQlSchema, chain, throwError, isScalarType, getEdge, log, set } = require('./utilities');

const getQueryFields = (query, schemaDef) => hackedQueryFields;

/**
 * Extracts the nodes located in the root porperties of the 'fieldValue' param. Each node will also contain
 * their immediate related children (that means that non-continuous relations are ignored).
 * 
 * @param  {Object} fieldDef          [description]
 * @param  {Object} fieldValue        [description]
 * @param  {Object} predecessorEdge [description]
 * @return {[type]}                   [description]
 */
const extractNodes = (fieldDef, fieldValue, predecessorEdge = {}, predecessor) => 
	(!fieldDef || !fieldValue || typeof(fieldValue) != "object") ? [] :
	fieldValue.length != undefined
		? 	_.flatten(fieldValue.map(fv => extractNodes(fieldDef, fv, predecessorEdge)))
		: 	chain(_(fieldDef.properties).reduce((a, p) => 
				isScalarType(p.type) ? chain(a.scalarTypes.push(p)).next(v => a).val() :
				p.edge ? chain(a.nonScalarTypesWithEdges.push(p)).next(v => a).val() :
				chain(a.nonScalarTypes.push(p)).next(v => a).val(), // I'm storing the props with edges, but so far, I don't see any usage for it. Maybe later.
				{ scalarTypes: [], nonScalarTypes: [], nonScalarTypesWithEdges: []}))
		  	.next(props =>
				//e.g. "p": posts, "fieldValue[p.name]": { data:[...], cursor: ... }, "getEdge(p.edge)": { leftnode: "default", rightnode: "data",edge: { label: 'ABOUT', direction: '<' } }
				chain(_.flatten(_.toArray(_(props.nonScalarTypesWithEdges).map(p => chain(getEdge(p.edge)).next(edge => 
					edge.rightnode == "default"
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
							{ a[p.name] = fieldValue[p.name]; return a; }, 
							{ 
								_node: fieldDef.type.replace(/(\[|\])/g,''), // Describe the type of node
								uuid: shortid.generate(), // uniquely identify that node
								successors: successors, // Array of all successor nodes
								edge: predecessorEdge && predecessorEdge.relation // relation between this node and its predecessor
									? { name: predecessorEdge.relation.generate(predecessor, fieldValue, null), direction: predecessorEdge.relation.direction }
									: null 
							})]
					// If the current field is not a node, then keep looking for some under the other properties
					: 	_.flatten(_.toArray(_(props.nonScalarTypes).map(p => extractNodes(p, fieldValue[p.name]))))
				)
				//.next(node => log(node, "NODE"))
				.val())
		  	.val();

const flattenNodes = (graphqlnodes, predecessor, seedCounter = 0) => _(graphqlnodes).reduce((acc, n) => 
		chain(Object.assign({ _position: acc.counter }, n))
		.next(node => {
			if (predecessor)
				acc.links.push({ predecessor: predecessor._position, successor: node._position, direction: (node.edge || {}).direction, name: (node.edge || {}).name });
			return node;
		})
		.next(node => node.successors && node.successors.length > 0 
			// process predecessors.
			? flattenNodes(node.successors, node, ++acc.counter) 
			// no predecessors, concatenate the result and then move to the next node.
			: { counter: ++acc.counter, nodes: [node], links: [] })
		.next(newResult => set(acc, ['counter', 'nodes', 'links'], [newResult.counter, acc.nodes.concat(newResult.nodes), acc.links.concat(newResult.links)]))
		.val()
		, { counter: seedCounter, nodes: predecessor ? [predecessor] : [], links: [] })

const d3Flatten = graphqlnodes => chain(flattenNodes(graphqlnodes))
	.next(v => ({ 
		nodes: _.toArray(_(v.nodes).sortBy(x => x._position)), 
		edges: _.toArray(_(v.links).sortBy(x => x.predecessor).map(x => ({ 
			source: x.direction == ">" ? x.predecessor : x.successor,
			target: x.direction == ">" ? x.successor : x.predecessor,
			name: x.name
		}))) 
	}))
	.val();

const compileGraphData = (query = '', schemaDef = [], resultSet = {}) => { 
	const queryFields = getQueryFields(query, schemadef);
	_(queryFields).map(f => getGraphData(f, resultSet.data))
}

//compileGraphData(query, schemaDef, resultset);

module.exports = {
	extractNodes,
	d3Flatten
}







