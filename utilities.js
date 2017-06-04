/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const CR = '_cr_';
const T = '_t_';
const escapeGraphQlSchema = schema => schema.replace(/[\n\r]+/g, CR).replace(/[\t\r]+/g, T);
const chain = value => ({ next: fn => chain(fn(value)), val: () => value });
const throwError = (v, msg) => v ? (() => {throw new Error(msg)})() : true;
const isScalarType = type => type == 'Int' || type == 'Int!' || type == 'String' || type == 'String!' || type == 'Boolean' || type == 'Boolean!' || 
	type == 'ID' || type == 'ID!' || type == 'Float' || type == 'Float!' || type == 'Enum' || type == 'Enum!';

const getLinks = (edge) => chain(throwError(!edge, `Error in method 'getLinks': Argument 'edge' must exist.`))
	.next(v => edge.trim())
	.next(edge => ({ edge, firstChar: edge.trim().charAt(0), lastChar: edge.trim().charAt(edge.length-1) }))
	.next(v => ({
		leftnode: v.firstChar != '(' 
			? 'default' 
			: chain((v.edge.match(/\((.*?)\)/) || [null, ''])[1].trim()).next(x => x.indexOf('.') > 0 ? x.split('.')[1] : 'default').val(),
		rightnode: v.lastChar != ')' 
			? 'default' 
			: chain((v.edge.split('').reverse().join('').match(/\)(.*?)\(/) || [null, ''])[1].split('').reverse().join('').trim()).next(x => x.indexOf('.') > 0 ? x.split('.')[1] : 'default').val(),
		link: chain(v.edge.match(/(<-|-)\[(.*?)\](->|-)/) || [null, '', '', ''])
			.next(v => ({ 
				label: chain(v[2].trim()).next(v => v ? v : throwError(true, `Error in method 'getLinks': Failed to extract the link from edge '${v.edge}'`)).val(), 
				direction: chain({ v1: v[1].trim(), v3: v[3].trim() }).next(v => 
						(v.v1 == '<-' && v.v3 == '-') ? '<' :
						(v.v1 == '-' && v.v3 == '->') ? '>' :
						throwError(true, `Error in method 'getLinks': Failed to extract the link's direction from edge '${v.edge}'`)
					).val()

			}))
			.val()
	}))
	.val();

module.exports = {
	escapeGraphQlSchema,
	chain,
	throwError,
	isScalarType,
	getLinks
}