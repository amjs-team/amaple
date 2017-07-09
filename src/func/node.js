import { type, foreach, isEmpty } from "./util";
import event from "../event/event";
import check from "../check";
import correctParam from "../correctParam";

/**
	query ( selector: String, context?: Object, all?: Boolean )

	Return Type:
	符合表达式与获取范围的元素( Object | Array )

	Description:
	获取元素对象#!/usr/bin/env 

	URL doc:
	http://icejs.org/######
*/
export function query ( selector, context, all ) {
	var elem = ( context || document )[ all ? "querySelectorAll" : "querySelector" ] ( selector );
	return elem.length ? Array.prototype.slice.call ( elem ) : elem;
}

/**
	appendScript ( node: DOMObject, success: Function, error: Function )

	Return Type:
	void

	Description:
	异步动态加载js文件

	URL doc:
	http://icejs.org/######
*/
export function appendScript ( node, success, error ) {
	var script 	= document.createElement ( "script" );
	script.type = "text/javascript";

	// 将node的所有属性转移到将要解析的script节点上
	foreach ( node.attributes, attr => {
		if ( attr.nodeType === 2 ) {
			script.setAttribute ( attr.nodeName, attr.nodeValue );
		}
	} );

	if ( node.src ) {
		script.async = true;

		// 绑定加载事件，加载完成后移除此元素
		event.on ( script, "load readystatechange", function ( event ) {
			if ( !this.readyState || this.readyState === "loaded" || this.raeadyState === "complete" ) {
				success && success ( event );
			}

			script.parentNode.removeChild ( script );
		} );

		event.on ( script, "error", () => {
			script.parentNode.removeChild ( script );
		} );

		document.head.appendChild ( script );
	}
	else if ( node.text ) {
		script.text = node.text || "";
		document.head.appendChild ( script ).parentNode.removeChild ( script );
	}
}


/**
	scriptEval ( code: Array|DOMScript|String )

	Return Type:
	void

	Description:
	执行javascript代码片段
	如果参数是script标签数组，则顺序执行
	如果参数是script标签或javascript代码，则直接执行

	URL doc:
	http://icejs.org/######
*/
export function scriptEval ( code ) {
	check ( code ).type ( "string", "array" ).or().prior ( function () {
		this.type ( "object" ).check ( code.nodeType ).be ( 1 ).check ( code.nodeName.toLowerCase () ).be ( "script" );
	} ).ifNot ( "function scriptEval:code", "参数必须为javascript代码片段、script标签或script标签数组" ).do ();

	var tcode = type ( code );
	if ( tcode === "string" ) {

		var script 	= document.createElement ( "script" );
		script.type = "text/javascript";
		script.text = code;

		appendScript ( script );
	}
	else if ( tcode === "object" && code.nodeType === 1 && code.nodeName.toLowerCase () === "script" ) {
		appendScript ( code );
	}
	else if ( tcode === "array" ) {
		var scripts = code.slice ( 0 );
		foreach ( code, _script => {
			//删除数组中的当前值，以便于将剩下未执行的javascript通过回调函数传递
			Array.prototype.splice.call ( scripts, 0, 1 );
			
			if ( !_script.src ) {
				 appendScript ( _script );
			}
			else {
				// 通过script的回调函数去递归执行未执行的script标签
				appendScript ( _script, () => {
					scripts.length > 0 && scriptEval ( scripts );
				});

				return false;
			}
		});
	}
}

/**
	append ( context: DOMObject, node: DOMObject|DOMString|String )

	Return Type:
	DOMObject

	Description:
	在context元素末尾插入node
	如果node内有script元素则会在插入元素后执行包含的script

	URL doc:
	http://icejs.org/######
*/
export function append ( context, node ) {
	check ( context.nodeType ).toBe ( 1 ).ifNot ( "fn append:context", "context必须为DOM节点" ).do ();

	var	rhtml 	= /<|&#?\w+;/,
	 	telem	= type ( node ),
		i 		= 0,

		fragment, _elem, script,
		nodes 	= [],
		scripts = [];

	if ( telem === "string" && !rhtml.test ( node ) ) {

		// 插入纯文本，没有标签时的处理
		nodes.push ( document.createTextNode ( node ) );
	}
	else if ( telem === "object" ) {
		node.nodeType && nodes.push ( node );
	}
	else {
		fragment = document.createDocumentFragment (),
		_elem = fragment.appendChild ( document.createElement ( "div" ) );

		// 将node字符串插入_elem中等待处理
		_elem.innerHTML = node;

		for ( ; i < _elem.childNodes.length; i ++ ) {
			nodes.push ( _elem.childNodes [ i ] );
		}

		// 清空_elem
		_elem.textContent = "";

		// 清空fragment并依次插入元素
		fragment.textContent = "";
	}
	
	foreach ( nodes, node => {
		context.appendChild ( node );

		if ( node.nodeType === 1 ) {
			_elem = query ( "script", node, true ).concat ( node.nodeName === "SCRIPT" ? [ node ] : [] );

			i = 0;
			while ( script = _elem [ i++ ] ) {
				// 将所有script标签放入scripts数组内等待执行
				scripts.push ( script );
			}
		}
	} );

	// scripts数组不空则顺序执行script
	isEmpty ( scripts ) || scriptEval ( scripts );

	// 需控制新添加的html内容。。。。。。

	return context;
}

/**
	clear ( context: DOMObject )

	Return Type:
	DOMObject
	清空后的节点元素

	Description:
	清空节点元素内的所有内容

	URL doc:
	http://icejs.org/######
*/
export function clear ( context ) {
	
	check ( context.nodeType ).be ( 1 ).ifNot ( "function clear:context", "元素类型必须是dom节点" ).do ();

	// 防止内存泄漏，需删除context节点内的其他内容
	// add...

	// 删除此元素所有内容
	context.textContent = "";

	return context;
}

/**
	html ( context: DOMObject, node: DOMObject|DOMString|String )

	Return Type:
	DOMObject
	处理后的节点元素

	Description:
	使用node替换context的内容
	如果node内有script元素则会在插入元素后执行包含的script

	URL doc:
	http://icejs.org/######
*/
export function html ( context, node ) {
	context = clear ( context );
	context = append ( context, node );

	return context;
}

/**
	attr ( context: DOMObject, name: String, val: Object|String )

	Return Type:
	void

	Description:
	使用node替换context的内容
	如果node内有script元素则会在插入元素后执行包含的script

	URL doc:
	http://icejs.org/######
*/
export function attr ( context, name, val ) {
	let args = correctParam ( name, val ).to ( "string", [ "string", "object" ] );
	name = args [ 0 ];
	val = arg [ 1 ];
  
	switch ( type ( val ) ) {
    	case "string":
        	context.setAttribute ( name, val );
        	break;
    	case "undefined":
        	return context.getAttribute ( name );
    	case "object":
        	foreach ( val, ( k, v ) => {
            	context.setAttribute ( k, v );
            } );
    }
}