import { foreach, type } from "./util";
import { attr } from "./node";
import { componentErr } from "../error";
import slice from "../var/slice";
import iceAttr from "../single/iceAttr";


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

/**
	transformCompName ( compName: String, mode?: Boolean )

	Return Type:
	驼峰式或中划线式的组件名

	Description:
	mode不为true时，将中划线风格的组件名转换为驼峰式的组件名
	mode为true时，将驼峰式风格的组件名转换为中划线的组件名

	URL doc:
	http://icejs.org/######
*/
export function transformCompName ( compName, mode ) {
	return ( mode !== true ? 
		compName.toLowerCase ().replace ( /^([a-z])|-(.)/g, ( match, rep1, rep2 ) => ( rep1 || rep2 ).toUpperCase () ) 
		: 
		compName.replace ( /([A-Z])/g, ( match, rep, i ) => ( i > 0 ? "-" : "" ) + rep.toLowerCase () ) 
	);
}

/**
	walkDOM ( vdom: Object, callback: Function, ...extra: Any )

	Return Type:
	void

	Description:
	遍历虚拟节点及子节点
	extra为额外的参数，传入的额外参数将会在第一个遍历项中传入，但不会传入之后遍历的子项中

	URL doc:
	http://icejs.org/######
*/
export function walkVDOM ( vdom, callback, ...extra ) {
	let vnode = vdom;
	do {
		callback.apply ( null, [ vnode ].concat ( extra ) );

		if ( vnode.children && vnode.children [ 0 ] ) {
			walkVDOM ( vnode.children [ 0 ], callback );
		}

	} while ( vnode = vnode.nextSibling () )
}

/**
	queryModuleNode ( moduleAttr: String, moduleName: String, context?: DOMObject )

	Return Type:
	DOMObject

	Description:
	遍历节点及子节点查询对应名称的节点

	URL doc:
	http://icejs.org/######
*/
export function queryModuleNode ( moduleName, context ) {
	let node = context || document.body,
		targetNode;

	do {
		if ( node.nodeType === 1 && attr ( node, iceAttr.module ) === moduleName ) {
			targetNode = node;

			break;
		}

		if ( node.firstChild ) {
			if ( targetNode = queryModuleNode ( moduleName, node.firstChild ) ) {
				break;
			}
		}
	} while ( node = node.nextSibling )

	return targetNode
}