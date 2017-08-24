import { type, foreach, isEmpty, noop } from "./util";
import slice from "../var/slice";
import event from "../event/core";
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
	let elem = ( context || document ) [ all ? "querySelectorAll" : "querySelector" ] ( selector );
	return all ? slice.call ( elem ) : elem;
}

/**
	appendScript ( node: DOMObject, success?: Function, error?: Function )

	Return Type:
	void

	Description:
	异步动态加载js文件

	URL doc:
	http://icejs.org/######
*/
export function appendScript ( node, success = noop, error = noop ) {
	let script 	= document.createElement ( "script" );
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
				success ( event );
			}

			script.parentNode.removeChild ( script );
		} );

		event.on ( script, "error", () => {
        	error ();
			script.parentNode.removeChild ( script );
		} );

		document.head.appendChild ( script );
	}
	else if ( node.text ) {
		script.text = node.text || "";
		document.head.appendChild ( script ).parentNode.removeChild ( script );
    	success ();
	}
}


/**
	scriptEval ( code: Array|DOMScript|String, callback?: Function )

	Return Type:
	void

	Description:
	执行javascript代码片段
	如果参数是script标签数组，则顺序执行
	如果参数是script标签或javascript代码，则直接执行

	URL doc:
	http://icejs.org/######
*/
export function scriptEval ( code, callback = noop ) {
	check ( code ).type ( "string", "array" ).or ().prior ( function () {
		this.type ( "object" ).check ( code.nodeType ).be ( 1 ).check ( code.nodeName.toLowerCase () ).be ( "script" );
	} ).ifNot ( "function scriptEval:code", "参数必须为javascript代码片段、script标签或script标签数组" ).do ();

	let tcode = type ( code );
	if ( tcode === "string" ) {

		let script 	= document.createElement ( "script" );
		script.type = "text/javascript";
		script.text = code;

		appendScript ( script, callback );
	}
	else if ( tcode === "object" && code.nodeType === 1 && code.nodeName.toLowerCase () === "script" ) {
		appendScript ( code, callback );
	}
	else if ( tcode === "array" ) {
		let scripts = code.concat (),
            length = scripts.length;
    	
    	if ( length > 0 ) {
			foreach ( code, _script => {
				// 删除数组中的当前值，以便于将剩下未执行的javascript通过回调函数传递
				scripts.splice ( 0, 1 );
			
				if ( !_script.src ) {
					appendScript ( _script, length === 0 ? callback : noop );
				}
				else {
					// 通过script的回调函数去递归执行未执行的script标签
					appendScript ( _script, length === 0 ? callback : () => {
                    	scriptEval ( scripts, callback );
                    } );

					return false;
				}
			} );
        }
	}
}

/**
	append ( context: DOMObject, node: DOMObject|DOMString|DocumentFragmentObject|String, callback?: Function )

	Return Type:
	DOMObject

	Description:
	在context元素末尾插入node
	如果node内有script元素则会在插入元素后执行包含的script

	URL doc:
	http://icejs.org/######
*/
export function append ( context, node, callback ) {
	check ( context.nodeType ).be ( 1 ).ifNot ( "fn append:context", "context必须为DOM节点" ).do ();

	let	rhtml 	= /<|&#?\w+;/,
	 	tnode	= type ( node ),
		i 		= 0,

		fragment, _elem, script,
		nodes 	= [],
        scripts = [];

	if ( tnode === "string" && !rhtml.test ( node ) ) {

		// 插入纯文本，没有标签时的处理
		nodes.push ( document.createTextNode ( node ) );
	}
	else if ( tnode === "object" ) {
		node.nodeType && nodes.push ( node );
	}
	else {
		// fragment = document.createDocumentFragment (),
		// _elem = fragment.appendChild ( document.createElement ( "div" ) );
		_elem = document.createElement ( "div" );

		// 将node字符串插入_elem中等待处理
		_elem.innerHTML = node;

		for ( ; i < _elem.childNodes.length; i ++ ) {
			nodes.push ( _elem.childNodes [ i ] );
		}

		scripts = query ( "script", _elem, true );

		// 清空_elem
		_elem.textContent = "";

		// 清空fragment并依次插入元素
		// fragment.textContent = "";
	}
	
	foreach ( nodes, node => {
		context.appendChild ( node );

		// if ( node.nodeType === 1 || node.nodeTyle === 11 ) {
        	
        	// 将所有script标签放入scripts数组内等待执行
			// scripts = query ( "script", node, true ).concat ( node.nodeName === "SCRIPT" ? [ node ] : [] );
		// }
	} );

	// scripts数组不空则顺序执行script
	if ( !isEmpty ( scripts ) ) {
    	scriptEval ( scripts, callback );
    }
	else {
    	callback ();
    }

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
	html ( context: DOMObject, node: DOMObject|DOMString|DocumentFragmentObject|String, callback?: Function )

	Return Type:
	DOMObject
	处理后的节点元素

	Description:
	使用node替换context的内容
	如果node内有script元素则会在插入元素后执行包含的script

	URL doc:
	http://icejs.org/######
*/
export function html ( context, node, callback ) {
	context = clear ( context );
	context = append ( context, node, callback );

	return context;
}

/**
	attr ( context: DOMObject, name: String, val: Object|String|null )

	Return Type:
	void

	Description:
	获取、设置（单个或批量）、移除元素属性

	URL doc:
	http://icejs.org/######
*/
export function attr ( context, name, val ) {
	correctParam ( name, val ).to ( "string", [ "string", "object" ] ).done ( function () {
		this.$1 = name;
		this.$2 = val;
	} );
  
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
        	break;
    	case "null":
        	context.removeAttribute ( name );
    }
}