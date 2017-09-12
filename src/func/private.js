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
<<<<<<< HEAD
	buildHashURL ( path: String )
		
	Return Type:
	String
    构建完成后的新url
		
	Description:
	使用path与当前hash构建新的hash pathname
    构建规则与普通跳转的构建相同，当新path以“/”开头时则从原url的根目录开始替换，当新path不以“/”老头时，以原url最后一个“/”开始替换

	URL doc:
	http://icejs.org/######
*/
export default function buildHashURL ( path ) {
	return ( window.location.hash || "#/" ).replace ( path.substr ( 0, 1 ) === "/" ? /#(.*)$/ : /(?:\/)([^\/]*)?$/, ( match, rep ) => {
		return match.replace ( rep, "" ) + path;
	} );
}

/**
	getPathname ( path?: String )
=======
	getPathname ()
>>>>>>> origin/master

	Return Type:
	String
	pathname

	Description:
	hash兼容模式下获取pathname

	URL doc:
	http://icejs.org/######
*/
export function getPathname ( path ) {
	let pathname;

	// 获取当前路径的pathname
	if ( !path ) {
		pathname = ( window.location.hash.match ( /#([^?]*)$/ ) || [ "", "" ] ) [ 1 ];

		if ( !pathname ) {
			pathname = window.location.pathname;
		}
	}

	// 获取使用path构造后的路径pathname
	else {
		if ( path.substr ( 0, 1 ) === "/" ) {
			pathname = path;
		}
		else {
			buildHashURL ( path );

			// const pathAnchor = document.createElement ( "a" );
			// pathAnchor.href = path;
			// path = pathAnchor.pathname;
		}
	}

	return pathname;
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