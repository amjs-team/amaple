import { foreach } from "../../func/util";
import procedure from "./procedure.js";


/*
	sort the parts of the passed selector,
	as there is potential for optimization
	(some types of selectors are faster than others)
*/

const attributes = {
	exists : 10,
	equals : 8,
	not : 7,
	start : 6,
	end : 6,
	any : 5,
	hyphen : 4,
	element : 4
};

function getProcedure ( token ) {
	let proc = procedure [ token.type ];

	if ( proc === procedure.attribute ) {
		proc = attributes [ token.action ];

		if ( proc === attributes.equals && token.name === "id" ) {

			//prefer ID selectors (eg. #ID)
			proc = 9;
		}

		if ( token.ignoreCase ) {

			//ignoreCase adds some overhead, prefer "normal" token
			//this is a binary operation, to ensure it's still an int
			proc >>= 1;		// eslint-disable-line
		}
	}

	return proc;
}

export default function sort ( arr ) {
	const procs = arr.map ( getProcedure );
	for ( let i = 1; i < arr.length; i++ ) {
		const procNew = procs [ i ];
		if ( procNew < 0 ) {
			continue;
		}

		for ( let j = i - 1; j >= 0 && procNew < procs [ j ]; j-- ) {
			let token = arr [ j + 1 ];
			arr [ j + 1 ] = arr [ j ];
			arr [ j ] = token;
			procs [ j + 1 ] = procs [ j ];
			procs [ j ] = procNew;
		}
	}
}