import { foreach } from "../../func/util";
import parseSelector from "./parseSelector";
import compileToken from "./compileToken";

function findNode ( test, targetChildren ) {
	let result = [];
	foreach ( targetChildren, child => {
		if ( child.nodeType !== 1 ) {
			return true;
		}
		if ( test ( child ) ) {
			result.push ( child );
		}

		if ( child.children.length > 0 ) {
			result = result.concat ( findNode ( test, child.children ) );
		}
	} );

	return result;
}

export default function ( selector, context ) {
    const testFunc = compileToken ( 
    	parseSelector ( selector ),
    	context
    );
	return findNode ( testFunc, context.children );
}