import { foreach, type } from "./util";

/**
	urlTransform ( str: String, mode: Boolean )

	Return Type:
	String

	Description:
	将url中的"/"和"."做调换，此方法用于设置请求路径与模块定义时的依赖注入。
	当mode不传或传入null、false时表示false，即字符串将.替换为/
	当mode有值时表示true，即字符串将/替换为.

	URL doc:
	http://icejs.org/######
*/
export function urlTransform ( str, mode ) {
	mode = !!mode;

	let rpoint = /\./g,
		rsep = /\//g,
		point = ".",
		separation = "/";

	return mode ? str.replace( rsep, point) : str.replace ( rpoint, separation );
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
export function matchFnArgs ( fn ) {
	let fnStr = fn.toString ();

	return type ( fn ) === "function" ? 
			( ( 
				/^function(?:\s+\w+)?\s*\((.*)\)\s*/.exec ( fnStr ) || /^\(?(.*?)\)?\s*=>/.exec ( fnStr ) || /^\S+\s*\((.*?)\)/.exec ( fnStr ) || [] ) [ 1 ]
				|| "" )
			.split ( "," ).filter ( item => !!item ).map ( item => item.trim () )
    		: [];
}

/**
	getSearch ()

	Return Type:
	String
	search

	Description:
	hash兼容模式下获取search

	URL doc:
	http://icejs.org/######
*/
export function getSearch () {

	let search = ( window.location.hash.match ( /\?(.*)$/ ) || [] ) [ 1 ];

	if ( !search ) {
		search = window.location.search.substr ( 1 );
	}

	return search;
}