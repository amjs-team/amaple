import { foreach, type, isEmpty, guid } from "./util";
import { attr } from "./node";
import { identifierPrefix, amAttr } from "../var/const";
import VElement from "../core/vnode/VElement";
import VTextNode from "../core/vnode/VTextNode";
import VFragment from "../core/vnode/VFragment";
import parseHTML from "../compiler/htmlParser/parseHTML";
import query from "../compiler/cssParser/core";
import cache from "../cache/core";


/**
	defineReactiveProperty ( key: String, getter: Function, setter: Function, target: Object )

	Return Type:
	void

	Description:
	转换存取器属性

	URL doc:
	http://amaple.org/######
*/
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
	http://amaple.org/######
*/
export function parseGetQuery ( getString ) {
	const getObject = {};
	if ( getString ) {
		let kv;
		foreach ( ( getString.substr ( 0, 1 ) === "?" ? getString.substr ( 1 ) : getString ).split ( "&" ), getObjectItem => {
	    	kv = getObjectItem.split ( "=" );
	    	getObject [ kv [ 0 ] ] = kv [ 1 ] || "";
	    } );
	}

	return getObject;
}

/**
	getFunctionName ( fn: Function )

	Return Type:
	String
	方法名称

	Description:
	es5兼容模式获取方法名称
	es6下可通过name属性获取类名

	URL doc:
	http://amaple.org/######
*/
export function getFunctionName ( fn ) {
	return type ( fn ) === "function" 
	? fn.name || ( ( fn.toString ().match ( /^function\s+([\w_]+)/ ) || [] ) [ 1 ] )
	: "";
}

/**
	transformCompName ( compName: String, mode?: Boolean )

	Return Type:
	驼峰式或中划线式的组件名

	Description:
	mode不为true时，将中划线风格的组件名转换为驼峰式的组件名
	mode为true时，将驼峰式风格的组件名转换为中划线的组件名

	URL doc:
	http://amaple.org/######
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
	http://amaple.org/######
*/
export function walkVDOM ( vdom, callback, ...extra ) {
	let vnode = vdom;
	do {
		callback.apply ( null, [ vnode ].concat ( extra ) );

		if ( vnode.children && vnode.children [ 0 ] ) {
			walkVDOM ( vnode.children [ 0 ], callback );
		}

	} while ( vnode = vnode.nextSibling () );
}

/**
	queryModuleNode ( moduleAttr: String, moduleName: String, context?: DOMObject )

	Return Type:
	DOMObject

	Description:
	遍历节点及子节点查询对应名称的节点

	URL doc:
	http://amaple.org/######
*/
export function queryModuleNode ( moduleName, context ) {
	let node = context || document.body,
		targetNode;

	do {
		if ( node.nodeType === 1 && attr ( node, amAttr.module ) === moduleName ) {
			targetNode = node;

			break;
		}

		if ( node.firstChild ) {
			if ( targetNode = queryModuleNode ( moduleName, node.firstChild ) ) {
				break;
			}
		}
	} while ( node = node.nextSibling );

	return targetNode;
}

/**
	getReference ( references: Object, refName: String )

	Return Type:
	DOMObject|Object
	被引用的组件行为对象或元素

	Description:
	获取被引用的组件行为对象或元素
	当组件不可见时返回undefined

	URL doc:
	http://amaple.org/######
*/
export function getReference ( references, refName ) {
	let reference = references [ refName ];
	if ( type ( reference ) === "array" ) {
		const _ref = [];
		foreach ( reference, refItem => {
			if ( refItem.parent ) {
				_ref.push ( refItem.isComponent ? refItem.component.action : refItem.node );
			}
		} );
		reference = isEmpty ( _ref ) 
					? undefined 
					: _ref.length === 1 ? _ref [ 0 ] : _ref;
	}
	else {
		reference = reference && reference.parent
			? reference.isComponent ? reference.component.action : reference.node
			: undefined;
	}
	return reference;
}

export function stringToScopedVNode ( htmlString, styles ) {
	const vstyle = VElement ( "style" );

	let vf = parseHTML ( htmlString ),
		styleString = styles;
	vf = vf.nodeType === 11 ? vf : VFragment ( [ vf ] );
	if ( type ( styles ) === "array" ) {
		styleString = "";

		const scopedCssIdentifier = identifierPrefix + guid ();
		foreach ( styles, styleItem => {
			if ( styleItem.selector.substr ( 0, 1 ) !== "@" ) {

				// 为范围样式添加范围属性限制
				foreach ( query ( styleItem.selector, vf ), velem => {
					velem.attr ( scopedCssIdentifier, "" );
				} );

				// 为css选择器添加范围属性限制
				let selectorArray = [];
				foreach ( styleItem.selector.split ( "," ), selector => {
					const pseudoMatch = selector.match ( /:[\w-()\s]+|::selection/i );
					if ( pseudoMatch ) {
						selectorArray.push ( selector.replace ( pseudoMatch [ 0 ], `[${ scopedCssIdentifier }]${ pseudoMatch [ 0 ] }` ) );
					}
					else {
						selectorArray.push ( `${ selector.trim () }[${ scopedCssIdentifier }]` );
					}
				} );
				styleItem.selector = selectorArray.join ( "," );
			}

			styleString += `${ styleItem.selector }{${ styleItem.content }}`;
		} );

		vstyle.attr ( "scoped", "" );
	}

	vstyle.appendChild ( VTextNode ( styleString ) );
	vf.appendChild ( vstyle );

	return vf;
}

/**
	buildPlugin ( pluginDef: Object, context: Object )

	Return Type:
	void

	Description:
	构建插件对象并保存到缓存中

	URL doc:
	http://amaple.org/######
*/
export function buildPlugin ( pluginDef, context, deps ) {
	deps = cache.getDependentPlugin ( deps || pluginDef.build );
	cache.pushPlugin ( pluginDef.name, pluginDef.build.apply ( context, deps ) );
}