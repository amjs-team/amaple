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
	unmountWatchers ( vnode: Object, isWatchCond: Boolean )

	Return Type:
	void

	Description:
	watcher卸载函数遍历调用

	URL doc:
	http://icejs.org/######
*/
export function unmountWatchers ( vnode, isWatchCond ) {

	do {
		foreach ( vnode.watcherUnmounts || [], watcherUnmount => {
			watcherUnmount ();
		} );

		// 被“:if”绑定的元素有些不在vdom树上，需通过此方法解除绑定
		if ( ( vnode.conditionElems || vnode.mainVNode ) && isWatchCond !== false ) {
			const conditionElems = vnode.conditionElems || vnode.mainVNode.conditionElems;
			foreach ( conditionElems, conditionElem => {
				if ( conditionElem !== vnode ) {
					unmountWatchers ( conditionElem, false );
				}
			} );
		}

		if ( vnode.children && vnode.children [ 0 ] ) {
			unmountWatchers ( vnode.children [ 0 ] );
		}
	} while ( vnode = vnode.nextSibling () );
}