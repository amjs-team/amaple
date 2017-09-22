import { foreach, type } from "./util";
import { attr } from "./node";
import { componentErr } from "../error";
import slice from "../var/slice";


// 转换存取器属性
export function defineReactiveProperty ( key, getter, setter, target ) {
	Object.defineProperty ( target, key, {
		enumerable : true,
		configurable : true,
		get : getter,
		set : setter
	} );
}

/**
	matchFnArgs ( fn: Function )

	Return Type:
	Array
	方法参数数组

	Description:
	获取方法中传入的参数
	以数组形式返回
	可匹配以下四种方法的参数：
	① function xxx (a,b,c) { // ... }
	② function (a,b,c) { // ... }
	③ (a,b,c) => { // ... }
	④ xxx (a,b,c) { // ... }

	URL doc:
	http://icejs.org/######
*/
// export function matchFnArgs ( fn ) {
// 	let fnStr = fn.toString ();

// 	return type ( fn ) === "function" ? 
// 			( ( 
// 				/^function(?:\s+\w+)?\s*\((.*)\)\s*/.exec ( fnStr ) || /^\(?(.*?)\)?\s*=>/.exec ( fnStr ) || /^\S+\s*\((.*?)\)/.exec ( fnStr ) || [] ) [ 1 ]
// 				|| "" )
// 			.split ( "," ).filter ( item => !!item ).map ( item => item.trim () )
//     		: [];
// }

/**
	parseGetQuery ( getString: String )

	Return Type:
	Object
	解析后的get参数对象

	Description:
	将形如“?a=1&b=2”的get参数解析为参数对象

	URL doc:
	http://icejs.org/######
*/
export function parseGetQuery ( getString ) {
	const getObject = {};
	if ( getString ) {
		let kv;
		foreach ( ( getString.substr( 0, 1 ) === "?" ? getString.substr( 1 ) : getString ).split ( "&" ), getObjectItem => {
	    	kv = getObjectItem.split ( "=" );
	    	getObject [ kv [ 0 ] ] = kv [ 1 ] || "";
	    } );
	}

	return getObject;
}

export function transformCompName ( compName ) {
	return compName.toLowerCase ().replace ( /^([a-z])|-(.)/g, ( match, rep1, rep2 ) => ( rep1 || rep2 ).toUpperCase () );
}