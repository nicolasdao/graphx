const _ = require('lodash');
const shortid = require('shortid');
const { escapeGraphQlSchema, chain, throwError, isScalarType, getLink, log } = require('./utilities');

const getQueryFields = (query, schemaDef) => hackedQueryFields;

/**
 * Extracts the nodes located in the root porperties of 'fieldValue'. Each node will also contain
 * their immediate related children (that means that non-continuous relations are ignored).
 * 
 * @param  {Object} fieldDef          [description]
 * @param  {Object} fieldValue        [description]
 * @param  {Object} edgeWithPredecessor [description]
 * @return {[type]}                   [description]
 */
const extractNodes = (fieldDef, fieldValue, edgeWithPredecessor = {}) => 
	(!fieldDef || !fieldValue || typeof(fieldValue) != "object") ? [] :
	fieldValue.length != undefined
		? 	_.flatten(fieldValue.map(fv => extractNodes(fieldDef, fv, edgeWithPredecessor)))
		: 	chain(_(fieldDef.properties).reduce((a, p) => 
				isScalarType(p.type) ? chain(a.scalarTypes.push(p)).next(v => a).val() :
				p.edge ? chain(a.nonScalarTypesWithEdges.push(p)).next(v => a).val() :
				chain(a.nonScalarTypes.push(p)).next(v => a).val(), // I'm storing the props with edges, but so far, I don't see any usage for it. Maybe later.
				{ scalarTypes: [], nonScalarTypes: [], nonScalarTypesWithEdges: []}))
		  	.next(props =>
				//e.g. "p": posts, "fieldValue[p.name]": { data:[...], cursor: ... }, "getLink(p.edge)": { leftnode: "default", rightnode: "data",link: { label: 'ABOUT', direction: '<' } }
				chain(_.flatten(_.toArray(_(props.nonScalarTypesWithEdges).map(p => chain(getLink(p.edge)).next(link => 
					link.rightnode == "default"
					// that means that the current property 'p' is supposed to be the successor
					?	extractNodes(p, fieldValue[p.name], link.link)
					// that means that the current property 'p' is not the immediate successor, but instead a property of 'p'
					: 	chain({ nodeProp: _(p.properties).find(x => x.name == link.rightnode), nodeValue: (fieldValue[p.name] ? fieldValue[p.name][link.rightnode] : null) })
						.next(v => extractNodes(v.nodeProp, v.nodeValue, link.link))
						.val()

				).val()))))
				.next(successors => 
					fieldDef.isNode
					?	[_(props.scalarTypes).reduce((a, p) => 
							{ a[p.name] = fieldValue[p.name]; return a; }, 
							{ _node: fieldDef.type.replace(/(\[|\])/g,''), uuid: shortid.generate(), successors: successors, egde: edgeWithPredecessor })]
					// If the current field is not a node, then keep looking for some under the other properties
					: 	_.flatten(_.toArray(_(props.nonScalarTypes).map(p => extractNodes(p, fieldValue[p.name]))))
				)
				//.next(node => log(node, "NODE"))
				.val())
		  	.val();



const getGraphData = (fieldDef = {}, resultSet = {}) => 
	resultSet.length != undefined
		? _.toArray(_.flatten(resultSet.map(r => getGraphData(fieldDef, r))))
		: chain(resultSet[fieldDef.name])
			.next(fieldValue => fieldValue
				? fieldDef.isNode ? extractNodes(fieldDef, fieldValue) :
				  (fieldDef.properties && fieldDef.properties.length > 0) ? _.toArray(_.flatten(fieldDef.properties.map(p => getGraphData(p, fieldValue[p.name])))) :
				  []
				: [])
			.val();

const compileGraphData = (query = '', schemaDef = [], resultSet = {}) => { 
	const queryFields = getQueryFields(query, schemadef);
	_(queryFields).map(f => getGraphData(f, resultSet.data))
}

//compileGraphData(query, schemaDef, resultset);

module.exports = {
	extractNodes
}







