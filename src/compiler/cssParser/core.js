import { foreach } from "../../func/util";
import parseSelector from "./parseSelector";
import compileToken from "./compileToken";

function findNode ( test, targetChildren, isWatchCond ) {
	let result = [];
	foreach ( targetChildren, child => {
		if ( child.nodeType === 1 && test ( child ) ) {
			result.push ( child );
		}

		if ( child.conditionElems && child.conditionElems.length > 0 && isWatchCond !== false ) {

			// 复制一份数组并移除当前vnode
			const 
				walkElems = child.conditionElems.concat (),
				index = walkElems.indexOf ( child );
			if ( index > -1 ) {
				walkElems.splice ( index, 1 );
			}
			result = result.concat ( findNode ( test, walkElems, false ) );
		}
		if ( child.nodeType === 1 && child.children.length > 0 ) {
			result = result.concat ( findNode ( test, child.children ) );
		}
	} );

	return result;
}

export default function query ( selector, context ) {
	if ( /^:\w+|::selection$/i.test ( selector ) ) {
		selector = `*${ selector }`;
	}

    const testFunc = compileToken (
    	parseSelector ( selector ),
    	context
    );
	
	return ( context.nodeType === 1 && testFunc ( context ) ? [ context ] : [] )
	.concat ( findNode ( testFunc, context.children ) );
}