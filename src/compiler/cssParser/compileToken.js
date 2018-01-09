import { foreach } from "../../func/util";
import sort from "./sort.js";
import general from "./general";
import { trueFunc, falseFunc } from "./util";

/*
	compiles a selector to an executable function
*/

function compileRules ( rules, context ) {
	const acceptSelf = rules [ 0 ].name === "scope" && rules [ 1 ].type === "descendant";
	return rules.reduce ( ( func, rule, index ) => {
		if ( func === falseFunc ) {
			return func;
		}

		return general [ rule.type ] ( func, rule, context, acceptSelf && index === 1 );
	}, trueFunc );
}

function reduceRules ( a, b ) {
	if ( b === falseFunc || a === trueFunc ) {
		return a;
	}
	if ( a === falseFunc || b === trueFunc ) {
		return b;
	}

	return elem => {
		return a ( elem ) || b ( elem );
	};
}

export default function compileToken ( token, context ) {

    // 不查找伪类和::selection
    foreach ( token, t => {
    	foreach ( t, ( item, i ) => {
    		if ( item.type === "pseudo" || item.type === "pseudo-element" ) {
    			t.splice ( i, 1 );
    		}
    	} );
    } );
	token.forEach ( sort );

	return token
		.map ( rules => compileRules ( rules, context ) )
		.reduce ( reduceRules, falseFunc );
}