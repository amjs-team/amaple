/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Ice.js                                                         *
 * Version: 0.1.0                                                  *
 * Site: http://icejs.org                                          *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * The states like ice                                             *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * @describe
 * 
 * ice.js是一个基于状态的web单页面框架，通过ice，你可以快速构建华丽的web单页应用，并且它可以记住每个页面的操作状态如打开某组件后的状态、已经输入好信息的状态等，当你将此界面分享给你的好友时，你的操作状态也可以一并被你的好友所看到
 *
 * @author   JOU丶San <huzhen555@qq.com>
 * @time     2016-07-19 12:48:36
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

(function(window, undefined) {
'use strict';


/* 声明此文件在jshint检测时的变量不报 variable is defined but never used */
/* exported iceError */

/**
 * 错误类型生成器，你可以使用此函数生成一个特定类型的错误生成器，在抛出错误异常时使用特定生成的错误生成器抛出特定的错误类型
 * eg:
 * var exampleErr = iceError('example');
 * exampleErr('code', '这是一个示例错误');
 *
 * console:
 * [example:code]这是一个示例错误
 *
 * 如果没有传入moduleName或moduleName为空，则在使用此错误生成器时在中括号内不会显示模块名称，而是直接显示错误的code，紧接着跟错误内容。
 *
 * @author JOU
 * @time   2016-07-19T12:34:35+0800
 * @param  {string}                 moduleName 模块名称
 */
function iceError(moduleName) {
	return function (errCode, err) {
		//
		// 打印的错误信息
		//
		var errMsg = '[ice:' + (moduleName ? moduleName + '-' : '') + errCode + '] ' + err;
		return new Error(errMsg);
	}
}


/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals iceError
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported argErr,
	requestErr,
	configErr,
	runtimeErr,
	moduleErr,

	rtype,
	xhr,
	join,
	concat,
	forEach,
	toUpperCase,
	toLowerCase,
	split,
	substr,
	replace,
	hasOwnProperty,
	isPrototypeOf,
	_defaultOptions,
	slice,
	splice,
	push,
	toString,
	ice,
	plugin,
	driver,
	msie,
	msXhrDialect,
	moduleQueue,
	
	STATE_PARSED,
	STATE_READY,
	PAGE_STATE,
	TYPE_PAGE,
	TYPE_MODULE,
	TYPE_PLUGIN,
	TYPE_DRIVER,
	PLUGIN_BUILTIN,
	PLUGIN_EXTERNAL
 */

// 错误类型创建
	/** @type {Function} 环境错误 */
var envErr 					= iceError('env'),

	/** @type {Function} 参数错误 */
	argErr 					= iceError('arg'),

	/** @type {Function} 请求错误 */
	requestErr 				= iceError('request'),

	/** @type {Function} 配置错误 */
	configErr 				= iceError('config'),

	/** @type {Function} 运行时错误 */
	runtimeErr 				= iceError('runtime'),

	/** @type {Function} 模块错误 */
	moduleErr 				= iceError('module');



/** icejs只能运行在浏览器环境，如果当前环境没有window或document，则不再往下执行 */
if (typeof window === 'undefined' || typeof window.document !== 'object') {
	throw envErr('browser', 'ice只能在浏览器环境中运行...');
}

//////////////////////////////////////////
// 函数定义区
var a 	 					= [],
	s 	 					= '',
    slice 					= a.slice,
    splice 					= a.splice,
    push 					= a.push,
    join 					= a.join,
    concat  				= a.concat,

    toUpperCase 			= s.toUpperCase,
    toLowerCase 			= s.toLowerCase,
    split 					= s.split,
    substr 					= s.substr,
    replace 				= s.replace,

    toString 				= Object.prototype.toString,
    hasOwnProperty 			= Object.prototype.hasOwnProperty,
    isPrototypeOf 			= Object.prototype.isPrototypeOf,
    // END 函数定义区 
    //////////////////////////////////////////
    //
    //
    //////////////////////////////////////////
	// 变量定义区
	xhr,	 				// XMLHttpRequest对象
	document 				= window.document,

    /** @type {Object} ice对象 */
	ice 					= window.ice || (window.ice = {}),

	/** @type {RegExp} ajax支持的返回类型正则表达式 */
	rtype 					= /^(?:TEXT|JSON|SCRIPT)$/,

    // 默认参数对象初始化
    /** @type {Object} ajax默认参数对象初始化 */
    _defaultOptions 		= {
    	method 					: 'GET',
    	url 					: '',
    	data 					: '',     
    	async 					: true,
    	cache 					: true,
    	contentType 			: 'application/x-www-form-urlencoded; charset=UTF-8',
    	type 					: 'TEXT'
    },
    

	/** @type {Object} documentMode只存在于ie浏览器中，这里用于判断运行环境是否为ie浏览器 */
	msie 					= document.documentMode,

	/** @type {Array} 创建IE ActiveXObject时的所使用到的各版本参数 */
	msXhrDialect			= ['Microsoft.XMLHTTP', 
								'MSXML.XMLHTTP', 
								'Msxml2.XMLHTTP.7.0', 
								'Msxml2.XMLHTTP.6.0', 
								'Msxml2.XMLHTTP.5.0', 
								'Msxml2.XMLHTTP.4.0', 
								'MSXML2.XMLHTTP.3.0', 
								'MSXML2.XMLHTTP'];
// END 变量定义区 
//////////////////////////////////////////


//////////////////////////////////////////
// 常量定义区
// 
/** 当前页面状态值 */
/** @type {Number} STATE_LOADING表示未解析当前页面元素且未执行ice.page() */
var STATE_LOADING 			= 0,

	/** @type {Number} STATE_PARSED表示解析完成当前页面元素但未执行ice.page() */
	STATE_PARSED 			= 1,

	/** @type {Number} STATE_PARSED表示解析完成当前页面元素且执行完成ice.page() */
	STATE_READY 			= 2,


	/**
	 * 当前页面状态，表示未解析当前页面元素、解析完成当前页面元素、执行完成ice.page()【ice.page() @see core.js】，具体状态值@see STATE_LOADING\STATE_PARSED\STATE_READY
	 * 
	 * warning:解析页面元素与ice.page()方法的执行顺序不可逆
	 * @type {Number} 
	 */
	PAGE_STATE 				= STATE_LOADING,

	
	/** 模块类型 */
	/** @type {Number} 表示ice.page() */
 	TYPE_PAGE 				= 1,

 	/** @type {Number} 表示ice.module() */
	TYPE_MODULE 			= 2,

	/** @type {Number} 表示plugin() */
	TYPE_PLUGIN 			= 3,

	/** @type {Number} 表示driver() */
	TYPE_DRIVER 			= 4,

	/**
	 * 插件类型
	 */
	/** @type {String} 内部插件 */
	PLUGIN_BUILTIN 			= 'builtIn',
	
	/** @type {String} 外部插件 */
	PLUGIN_EXTERNAL 		= 'external';

	// END 常量定义区 
	//////////////////////////////////////////
	//
	//
	//


/* jshint -W030 */
/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals argErr,
	push,
	split,
	slice,
	splice,
	replace,
	toLowerCase,
	toUpperCase,
	concat,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported IceError,
	_get,
	_post,
	_on,
	_html,
	_appendScript,
	urlTransform$,
	pageInvoke$,
	moduleInvoke$,
	util,
 */


/**
 * 获取传入的参数的变量类型，与typeof关键字不同的是，当参数为Array时返回'array'，当变量为null时返回'null'
 *
 * @author JOU
 * @time   2016-07-25T16:18:05+0800
 * @param  {multi}                 arg 需要获取类型的参数
 * @return {string}                    传入参数的类型字符串
 */
function _typeof(arg) {
	return arg !== null ? (arg instanceof Array ? 'array' : typeof arg) : 'null';
}

/**
 * 遍历数组或对象
 *
 * @author JOU
 * @time   2016-09-04T18:36:01+0800
 * @param  {Array/Ojbect}           target     遍历目标参数，数组或对象
 * @param  {Function}               callback   遍历回调函数，函数将会传入遍历值、遍历下标、当前遍历对象三个参数
 * @param  {Boolean} 				mode 	   模式，如果为true且遍历对象是数组，则只遍历数组内元素而不遍历数组本身的方法
 * @return {Boolean} 				isContinue 是否继续循环，如果返回false，则跳出循环
 */
function _forEach(target, callback, mode) {
	var isContinue,
		tTarget 			= _typeof(target),
		tCallback 			= _typeof(callback),
		i 					= 0;

	if (tTarget === 'array' && mode === true) {
		for (; i < target.length; i++) {
			isContinue = callback(target[i], i, target);

			if(isContinue === false) break;
		}
	}
	else if (tTarget === 'object' || mode !== true) {
		for (i in target) {
			isContinue = callback(target[i], i, target);

			if(isContinue === false) break;
		}
	}
	else {
		throw argErr('target', '第一个参数类型必须为array或object');
	}
	if (tCallback !== 'function') {
		throw argErr('callback', '第二个参数类型必须为function');
	}
}


/**
 * 判断指定值是否存在于指定数组中，如果第一个参数不是数组将会抛出argErr错误，如果传入值不存在于该数组中则返回false，否则返回true
 *
 * eg
 * console.log(_inArray([1, 2, 3], 5)); return false;
 *
 * @author JOU
 * @time   2016-07-25T14:32:25+0800
 * @param  {Array}                 array 查找数组
 * @param  {Multi}                 value 被搜索的值
 * @return {Boolean}                     存在返回true，否则返回false
 */
function _inArray(array, value) {
	if (_typeof(array) === 'array') {
		var i = array.length;
		while(--i >= 0) {
			if (array[i] === value) {
				return true;
			}
		}
		return false;
	}
	else {
		throw argErr('function inArray:array', '第一个参数必须为数组');
	}
}

/**
 * 判断指定Key是否存在于指定对象中，如果第一个参数不是对象将会抛出argErr错误，如果Key存在则返回该Key的值，不存在则返回false
 *
 * eg
 * console(_hasKey({a: 1, b: 2}, 3)); return false;
 * console(_hasKey({a: 5, b: 6}, b)); return 6;
 *
 * @author JOU
 * @time   2017-02-16T23:25:47+0800
 * @param  {Object}                 object 查找对象
 * @param  {String}                 key    被搜索的键
 * @return {Boolean}                       存在返回该Key的值，否则返回false
 */
function _hasKey(object, key) {
	if (_typeof(object) === 'object') {
		var result = false;
		_forEach(object, function(v, k) {
			if (k === key) {
				result = v;
				return false;
			}
		});

		return result;
	}
	else {
		throw argErr('function hasKey:object', '检测对象必须为object类型');
	}
}

/**
 * 此函数用于继承参数属性，可以传入不定个数被继承参数，以第一个参数作为继承参数，继承对象类型必须为array、object、function，被继承参数可以是任意类型的参数。
 *
 * #Warning: 此函数会改变继承参数
 *
 * 参数说明：
 * 当继承参数类型为array时，被继承参数可以是任何类型，当被继承参数为array或object时会将内部全部属性继承下来。参数只会继承不重复的参数
 * 当继承参数类型为object或function时，被继承参数只能是object，如果被继承参数中有其他类型参数将会直接被忽略。相同键的属性将会被覆盖
 *
 * eg:
 * 1、
 * var arr = _extend(['a', 'b', 'c'], ['c', 'd', 'e'], ['f']);
 * 合并后的arr为['a', 'b', 'c', 'd', 'e', 'f']
 * 
 * 2、
 * var obj = _extend({a: 1, b: 2, c: 3}, {c: 4, d: 5, e: 6});
 * 合并后的obj为{a: 1, b: 2, c: 4, d: 5, e: 6}
 * 
 *
 * @author JOU
 * @time   2016-07-25T10:27:25+0800
 * @return {Array/Object/Boolean}                 合并后的array、object或function
 */
function _extend() {
	var target 				= arguments[0],
		targetType 			= _typeof(arguments[0]),
		extendedArgs 		= slice.call(arguments, 1),

		/** 临时存储被继承参数的类型 */
		tArg;

	if (targetType !== 'array' && targetType !== 'object' && targetType !== 'function') {
		throw argErr(targetType, '合并父体类型需为Array、Object或Function');
	}

	// 依次处理被继承参数
	_forEach(extendedArgs, function(extendedArg) {
		tArg = _typeof(extendedArg);

		if (targetType === 'array') {
			if (tArg === 'array' || tArg === 'object') {
				_forEach(extendedArg, function(arg) {
					if (!_inArray(target, arg)) {
						push.call(target, arg);
					}
				});
			}
			else if (tArg !== null && tArg !== undefined) {
				push.call(target, extendedArg);
			}
		}
		else if (targetType === 'object' || targetType === 'function') {
			// 只处理object类型的被继承参数，其他类型的将会被忽略
			if (tArg === 'object') {
				_forEach(extendedArg, function(arg, key) {
					target[key] = arg;
				});
			}
		}
	});
	
	return target;
}

/**
 * 判断对象或数组是否为空对象或空数组
 *
 * @author JOU
 * @time   2016-08-01T14:15:56+0800
 * @param  {Object/Array}                 object 被判断的对象或数组
 * @return {Boolean}                      		 为空时返回true，不空时返回false
 */
function _isEmpty(object) {
	var result 	= true,
		t 		= _typeof(object);

	if (t !== 'array' && t !== 'object') {
		throw argErr('object', '参数类型必须为array或object');
	}
	else {
		_forEach(object, function() {
			result = false;

			// 跳出循环
			return false;
		});
	}

	return result;
}

/**
 * 去除字符串左右两边的空格
 *
 * @author JOU
 * @time   2016-09-04T17:49:26+0800
 * @param  {String}                 str 字符串
 * @return {String}                     去空格后的字符串
 */
function _trim(str) {
	if (_typeof(str) !== 'string') {
		throw argErr('arg-type', '参数类型必须为string');
	}

	return replace.call(str, /(^\s*)|(\s*$)/g, '');
}

/**
 * 单个元素对象获取简易方法
 *
 * @author JOU
 * @time   2016-11-28T20:10:48+0800
 * @param  {String}                 selector 选择器
 * @param  {Object}                 context  上下文，默认为document
 * @return {Object}                          获取到的单个对象
 */
function _s(selector, context) {
	return (context || document).querySelector(selector);
}

/**
 * 批量元素对象获取简易方法
 *
 * @author JOU
 * @time   2016-11-28T20:11:58+0800
 * @param  {String}                 selector 选择器
 * @param  {Object}                 context  上下文，默认为document
 * @return {Array}                           获取到的对象数组
 */
function _S(selector, context) {
	return (context || document).querySelectorAll(selector);
}

/**
 * 以兼容模式获取context中的所有tag元素，如果tag为空则返回context中所有元素数组，如果context也是tag元素则也将会被返回
 *
 * @author JOU
 * @time   2016-08-08T12:00:55+0800
 * @param  {Object}                 context 操作上下文
 * @param  {tag}                 	tag     获取的元素名称
 * @return {NodeList}                       符合条件的元素列表
 */
function _getAll(context, tag) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || '*') : 
				context.querySelectorAll ? context.querySelectorAll(tag || '*') : [];
	
	return context.nodeName === toUpperCase.call(tag) ? concat.call(slice.call(ret), [context]) : slice.call(ret);
}

/**
 * 以兼容模式绑定事件，如果cover的值为true则覆盖原有事件而不追加绑定事件，当有多个绑定事件时触发后将顺序执行多个绑定事件
 *
 * @author JOU
 * @time   2016-08-08T14:35:33+0800
 * @param  {Object}                 node  事件绑定元素
 * @param  {string}                 types    绑定事件名称，多个名称可使用空格隔开
 * @param  {Function}               listener 绑定方法
 * @return {Object}                          事件绑定元素本身
 */
function _on(node, types, listener) {
	if (node.nodeType !== 1 && node.nodeType !== 9 && node.self !== node) {
		throw argErr('function on:node', 'node参数必须为node对象');
	}
	if (_typeof(types) !== 'string') {
		throw argErr('function on:types', 'types参数类型必须为string');
	}
	if (_typeof(listener) !== 'function') {
		throw argErr('function on:listener', 'listener参数类型必须为function');
	}

	// 多个事件绑定拆分
	types = split.call(types, ' ');

	// Webkit内核浏览器兼容
	if (node.addEventListener) {
		_forEach(types, function(type) {

			// 绑定事件将不会被覆盖而是追加上顺序执行
			type && node.addEventListener(type, listener);
		});
	}
	// IE内核浏览器兼容
	else {
		_forEach(types, function(type) {

			// 绑定事件将不会被覆盖而是追加上倒叙执行
			type && node.attachEvent('on' + type, listener);
		});
	}

	return node;
}


/**
 * 异步动态加载js文件
 *
 * @author JOU
 * @time   2016-08-23T13:45:27+0800
 * @param  {Object}                 node   script标签
 * @param  {Function}               callback 加载回调函数，只有当script标签有src属性时有效
 */
function _appendScript(node, callback) {
	var script 				= document.createElement('script');
	script.type 			= 'text/javascript';

	// 将node的所有属性转移到将要解析的script节点上
	_forEach(node.attributes, function(attr) {
		if (attr.nodeType === 2) {
			script.setAttribute(attr.nodeName, attr.nodeValue);
		}
	});

	if (node.src) {
		script.async 		= true;

		// 绑定加载事件，加载完成后移除此元素
		_on(script, 'load readystatechange', function(event) {
			if (!this.readyState || this.readyState === 'loaded' || this.raeadyState === 'complete') {
				callback && callback(event);
			}

			script.parentNode.removeChild(script);
		});

		_on(script, 'error', function() {
			script.parentNode.removeChild(script);
		});

		document.head.appendChild(script);
	}
	else if (node.text) {
		script.text 		= node.text || '';
		document.head.appendChild(script).parentNode.removeChild(script);
	}
}


/**
 * 执行javascript代码片段
 * 如果参数是script标签数组，则顺序执行
 * 如果参数是script标签或javascript代码，则直接执行
 *
 * @author JOU
 * @time   2016-09-04T22:40:05+0800
 * @param  {Array/ScriptNode/String}                 code 执行的javascript代码，参数类型可以为array/script标签/string
 */
function _scriptEval(code) {
	var tcode 				= _typeof(code);

	if (tcode === 'string') {
		var script 			= document.createElement('script');
		script.type 		= 'text/javascript';
		script.text 		= code;

		_appendScript(script);
	}
	else if (tcode === 'object' && code.nodeType === 1 && toLowerCase.call(code.nodeName) === 'script') {
		_appendScript(code);
	}
	else if (tcode === 'array') {
		var scripts 			= slice.call(code, 0);
		_forEach(code, function(tmpScript) {
			//删除数组中的当前值，以便于将剩下未执行的javascript通过回调函数传递
			splice.call(scripts, 0, 1);
			
			if (!tmpScript.src) {
				 _appendScript(tmpScript);
			}
			else {
				// 通过script的回调函数去递归执行未执行的script标签
				_appendScript(tmpScript, function() {
					scripts.length > 0 && _scriptEval(scripts);
				});

				return false;
			}
		});
	}
	else {
		throw argErr('arg', '参数必须为javascript代码片段、script标签或script标签数组');
	}
}

/**
 * 清空节点元素内的所有内容
 *
 * @author JOU
 * @time   2016-09-11T18:26:23+0800
 * @param  {Object}                 context 待清空的节点元素
 * @return {Object}                         清空后的节点元素
 */
function _clear(context) {
	
	if (context.nodeType !== 1) {
		throw argErr('context', '元素类型必须是dom节点');
	}

	// 防止内存泄漏，需删除context节点内的其他内容
	// add...

	// 删除此元素所有内容
	context.textContent = '';

	return context;
}

/**
 * 在context元素末尾插入element
 * 如果element内有script元素则会在插入元素后执行包含的script
 *
 * @author JOU
 * @time   2016-08-08T10:25:38+0800
 * @param  {Object}		                   context      操作上下文元素
 * @param  {Object/String}                 element      element元素，element对象或字符串
 * @return {Object}                         			处理后的节点元素
 */
function _append(context, element) {
	var	rhtml 				= /<|&#?\w+;/,
	 	telem				= _typeof(element),
		i 					= 0,

		fragment, tmp, script,
		nodes 	 			= [],
		scripts 			= [];

	if (context.nodeType === 1) {
		if (telem === 'string' && !rhtml.test(element)) {

			// 插入纯文本，没有标签时的处理
			push.call(nodes, document.createTextNode(element));
		}
		else if (telem === 'object') {
			element.nodeType && push.call(nodes, element);
		}
		else {
			fragment 	= document.createDocumentFragment(),
			tmp  		= fragment.appendChild(document.createElement('div'));

			// 将element字符串插入tmp中等待处理
			tmp.innerHTML 	= element;

			for (; i < tmp.childNodes.length; i ++) {
				nodes.push(tmp.childNodes[i]);
			}

			// 清空tmp
			tmp.textContent = '';
		}

		

		// 清空fragment并依次插入元素
		fragment.textContent = '';
		_forEach(nodes, function(node) {
			context.appendChild(node);

			if (node.nodeType === 1) {
				tmp = _getAll(node, 'script');

				i = 0;
				while (script = tmp[i++]) {
					// 将所有script标签放入scripts数组内等待执行
					push.call(scripts, script);
				}
			}
		});

		// scripts数组不空则顺序执行script
		_isEmpty(scripts) || _scriptEval(scripts);

		// 需控制新添加的html内容。。。。。。

		return context;
	}
	else {
		throw argErr('context', 'context必须为DOM节点');
	}
}

/**
 * 使用element替换context的内容
 * 如果element内有script元素则会在插入元素后执行包含的script
 *
 * @author JOU
 * @time   2016-09-11T18:29:52+0800
 * @param  {Object}                 context 操作上下文元素
 * @param  {Object/String}          element element元素，element对象或字符串
 * @return {Object}                         处理后的节点元素
 */
function _html(context, element) {
	context = _clear(context);
	context = _append(context, element);

	return context;
}

/**
 * 异步执行函数
 *
 * @author JOU
 * @time   2016-08-22T15:03:12+0800
 * @param  {Function}               fn 异步执行的函数
 */
function _run(fn, args) {
	if (_typeof(fn) !== 'function') {
		throw argErr('function', '参数类型必须为function');
	}

	setTimeout(function() {
		fn.apply(null, args);
	}, 0);
}

/**
 * 将str中所有search替换为replace，特殊字符自动转义
 *
 * @author JOU
 * @time   2016-09-26T16:30:34+0800
 * @param  {String}                 str     被替换字符串
 * @param  {String}                 search  查找的字符串
 * @param  {String}                 replace 替换的字符串
 * @return {String}                         替换后的字符串
 */
function _replaceAll(str, search, rep) {
	if (arguments.length !== 3) {
		throw argErr('function:replaceAll', '必须传入被替换字符串、查找替换的字符串和替换的字符串三个参数');
	}

	if (_typeof(str) !== 'string' || _typeof(search) !== 'string' || _typeof(rep) !== 'string') {
		throw argErr('function:replaceAll', '函数所有参数类型都必须为string');
	}

	// 转义字符串中所有特殊的符号
	search = split.call(search, '');
	_forEach(search, function(char, i, search) {
		search[i] = ['$', '(', ')', '*', '+', '.', '[', ']', '?', '\\', '^', '{', '}', '|'].indexOf(char) !== -1 ?
					'\\' + char :
					char;
	});

	return replace.call(str, new RegExp(search.join(''), 'gm'), rep);
}



/** @description util工具插件方法构造，汇集常用工具方法 */
var util = _extend({}, {
	typeof 					: _typeof,
	inArray 				: _inArray,
	hasKey 					: _hasKey,
	extend 					: _extend,
	isEmpty 				: _isEmpty,
	trim 					: _trim,
	s 						: _s,
	S 						: _S,
	clear 					: _clear,
	append 					: _append,
	html 					: _html,
	run 					: _run,
	replaceAll 				: _replaceAll
});


/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals replace,
	_forEach,
	push,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported urlTransform$,
	setCurrentPath$,
	getCurrentPath$,
	decomposeArray$,
*/

///////////////////////////////
///							///
///     内部调用，外部不可见    ///
///     内部函数末尾带$ 		///
///                         ///
///////////////////////////////


/**
 * 将url中的"/"和"."做调换，此方法用于设置请求路径与模块定义时的依赖注入。
 * 当mode不传或传入null、false时表示false，即字符串将.替换为/
 * 当mode有值时表示true，即字符串将/替换为.
 *
 * @author JOU
 * @time   2016-08-21T10:50:51+0800
 * @param  {String}                 str  被替换的字符串
 * @param  {Multi}                 	mode 替换模式，当mode有值时表示true，不传入或为null时表示false
 * @return {String}                      处理后的字符串
 */
function urlTransform$ ( str, mode ) {
	mode 					= mode ? true : false;

	var rpoint 				= /\./g,
		rsep 				= /\//g,
		point 				= '.',
		separation 			= '/';
		

	return mode ? replace.call(str, rsep, point) : replace.call(str, rpoint, separation);
}

/**
 * 设置module当前加载的路径，用于无刷新跳转时获取替换前的路径，以在后退或前进操作时找到上一个状态所对应的路径
 * 
 *
 * @author JOU
 * @time   2017-03-24T23:32:48+0800
 * @param  {Object}                 module 带有ice-module属性的标签对象
 * @param  {String}                 path   模块的当前路径
 */
function setCurrentPath$ ( module, path ) {
	module.currentPath = path;
}

/**
 * 获取module当前加载的路径，用于无刷新跳转时获取替换前的路径，以在后退或前进操作时找到上一个状态所对应的路径
 *
 * @author JOU
 * @time   2017-03-24T23:36:47+0800
 * @param  {Object}                 module 带有ice-module属性的标签对象
 * @return {String}                        模块的当前路径
 */
function getCurrentPath$ ( module ) {
	return module.currentPath || '';
}

/**
 * 将一个数组以相邻的两个值为一组分解出来并传入回调函数中
 * 此方法将不改变原数组
 * 当前一个值为空时则跳过
 *
 * @author JOU
 * @time   2017-03-27T23:11:58+0800
 * @param  {Array}                 array     分解的数组
 * @param  {Function}              callback  回调函数，函数中传入每次分解出来的两个值
 */
function decomposeArray$ ( array, callback ) {

	// 复制array的副本到_array中
	// 此地方直接使用“=”时只是引用，如果改变tmpArr也将改变原数组
	var _array = concat.call ( [], array ),

		_arr;

	if (_config.params.moduleSeparator === '/') {
		for ( var i = 0; i < _array.length; ) {
			if ( _array [ i ] !== '' ) {
				callback ( _array[ i ], _array[ i + 1] || '' );

				i += 2;
			}
			else {
				i ++;
			}
		}
	}
	else {
		_forEach ( _array, function ( arr ) {
			if ( arr !== '' ) {
				_arr = split.call ( arr, _config.params.moduleSeparator );
				callback ( _arr [ 0 ], _arr [ 1 ] );
			}
		} );
	}
}



/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* 
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported event,
 */


function event() {

}

/* jshint -W030 */
/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals argErr,
	push,
	_forEach,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported slice,
	splice,
	push,
	toString,
	_extend,
	ice,
	_get,
	_post
 */

/**
 * Promose实现类，用于以同步的方式去执行回调函数，而不用将回调函数传入执行函数中，更加符合逻辑，且在需要执行多重回调处理时，以链式结构来表示函数处理后的回调
 * 此类创建的对象，主要有then()、done()、fail()、always()方法
 * 此实现类符合Promises/A+规范。
 *
 * eg:
 * 1、var p = new Promise(function(resolve, reject) {
 * 		if(success) {
 * 			resolve(value);
 * 		}
 * 		else if(fail) {
 * 			reject(reason);
 * 		}
 * });
 *
 * p.then(function(value) {
 * 		// do success callback...
 * 	}, function(reason) {
 * 		// do fail callback...
 * 	});
 *
 * 2. 创建Promise对象如同1
 * var p1 = p.then(function(value) {
 * 		// do success callback...
 * 		return new Promise(function(resolve, reject) {
 * 			if(success) {
 * 		 		resolve(value);
 * 		   }
 * 		   else if(fail) {
 * 			  reject(reason);
 * 		   }
 * 	    });
 * 	}, function(reason) {
 * 		// do fail callback...
 * 	});
 * 	
 * 	p1.then(function(value) {
 * 		// do success callback...
 * 	}, function(reason) {
 * 		// do fail callback...
 * 	});
 *
 * // 如此这样以链式结构的方式来实现多重回调...
 *
 * Promise原理：Promise相当于一个方法的状态机，来管理拥有回调的函数执行。Promise拥有三种状态，分别为Pending、Fulfilled、Rejected，
 * Pending：待发生状态，即待命状态
 * Fulfilled：成功状态，当状态为Fulfilled时，将会触发成功回调
 * Rejected：失败状态，当状态为Rejected时，将会触发失败回调
 * Fulfilled和Rejected状态都只能由Pending状态改变过来，且不可逆
 * 
 * 如上例子，Promose内部定义有三个最重要的方法，分别为then()、resolve()、reject()。
 * then方法用于回调函数的绑定
 * resolve方法用于在成功时的回调，它将修改当前Promise对象为Fulfilled状态并执行then方法绑定的成功回调函数
 * reject方法用于在失败时的回调，它将修改当前Promise对象为Rejected状态并执行then方法绑定的失败回调函数
 * 
 * 第一重函数处理：在创建Promise对象时将会执行第一重处理函数（有回调函数的函数）并将回调函数设为修改此Promise对象状态的函数，也就是resolve和reject方法，然后使用then方法将回调函数绑定到此Promise对象上，当第一重处理函数的回调函数执行时，也就是执行resolve或reject函数时，将会修改当前Promise对象的状态，并执行对应的绑定函数，如果没有绑定回调函数，则这两个方法只改变此Promise对象的状态。
 * 第二重函数处理时：then方法将返回一个新创建的Promise对象作为第二重回调函数执行的代理对象，在第二次调用then方法时其实是将第二重处理函数的回调函数绑定在了此代理对象上。then方法中有对传入的回调函数（onFulfilled和onRejected）进行封装，以致于能够获取到回调函数的返回值，并判断当回调函数返回值为一个thenable对象时（thenable对象是拥有then方法的对象），则通知Promise代理对象去执行第二重的回调函数，是通过回调函数返回的thenable对象去调用then方法绑定回调函数，此回调函数的内容为通知代理对象执行回调函数做到的
 * 以此类推第三重、第四重...
 *
 * @author JOU
 * @time   2016-07-31T16:34:12+0800
 * @param  {@function}                 resolver 处理函数体
 */
function Promise(resolver) {
	// 判断resolver是否为处理函数体
	if (typeof resolver !== 'function') {
		throw argErr('function Promise', '构造函数需传入一个函数参数');
	}

	/** @type {Number} Promise的三种状态定义 */
	var PENDING 			= 0,
		FULFILLED			= 1,
		REJECTED 			= 2,

		/** 预定义的Promise对象对应的处理函数体信息 */
		_value,
		_reason,
		_state 				= PENDING,
		_handler 			= [];

	/**
	 * 用于判断对象是否为thenable对象（即是否包含then方法）
	 *
	 * @author JOU
	 * @time   2016-07-31T17:27:33+0800
	 * @param  {multi}                 value 被判断的值
	 * @return {Boolean}                     是thenable对象返回true，否则返回false
	 */
	this._isThenable = function(value) {
		var t = typeof value;
			if (value && (t === 'object' || t === 'function')) {
				var then = value.then;
				if (typeof then === 'function') {
					return true;
				}
		  }
		  return false;
	}

	/**
	 * 根据Promise对象来对回调函数做出相应处理
	 * 当状态为Pending时，将回调函数保存于promise._handler数组中待调用
	 * 当状态为Fulfilled时，执行onFulfilled方法
	 * 当状态为Rejected时，执行onRejected方法
	 *
	 * @author JOU
	 * @time   2016-07-31T17:29:22+0800
	 * @param  {[type]}                 handler [description]
	 * @return {[type]}                         [description]
	 */
	this.handle = function(handler) {
		if (_state === PENDING) {
			push.call(_handler, handler);
		}
		else if(_state === FULFILLED && typeof handler.onFulfilled === 'function') {
			handler.onFulfilled.apply(null, _value);
		}
		else if(_state === REJECTED && typeof handler.onRejected === 'function') {
			handler.onRejected(_reason);
		}
	}

	/**
	 * 改变Promise对象的状态为Fulfilled并执行promise._handler数组中所有的onFulfilled方法
	 * 此方法用于执行成功时的回调绑定
	 * see Promise注释
	 *
	 * @author JOU
	 * @time   2016-07-31T17:32:54+0800
	 * @param  {multi}                 value 回调函数参数
	 */
	function _resolve() {
		if (_state === PENDING) {
			_state 		= FULFILLED;
			_value 		= arguments;

			_forEach(_handler, function(item) {
				item.onFulfilled && item.onFulfilled.apply(null, _value);
			});
		}
	}

	/**
	 * 改变Promise对象的状态为Rejected并执行promise._handler数组中所有的onRejected方法
	 * 此方法用于执行失败时的回调绑定
	 * see Promise注释
	 *
	 * @author JOU
	 * @time   2016-07-31T17:36:37+0800
	 * @param  {string}                 reason 失败原因
	 */
	function _reject(reason) {
		if (_state === PENDING) {
			_state 		= REJECTED;
			_reason		= reason;

			_forEach(_handler, function(item) {
				item.onRejected && item.onRejected(_reason);
			});
		}
	}

	resolver(_resolve, _reject);
}

// Promise原型对象
Promise.prototype 		 	= {
	/**
	 * Promise的主要方法之一，用于绑定或执行处理函数的回调函数，当成功时的回调函数返回值为thenable对象，则通知代理Promise对象执行回调函数
	 * see Promise注释
	 *
	 * @author JOU
	 * @time   2016-07-31T17:38:34+0800
	 * @param  {function}                 onFulfilled 成功时的回调函数
	 * @param  {function}                 onRejected  失败时的回调函数
	 * @return {object}                               新创建的Promise代理对象
	 */
	then: function(onFulfilled, onRejected) {
		var __this = this;
		return new Promise(function(resolve, reject) {
			__this.handle({
				onFulfilled: function() {
								var result = typeof onFulfilled === 'function' && onFulfilled.apply(null, arguments) || arguments;
								if (__this._isThenable(result)) {
									result.then(
										function() {
											resolve();
										},
										function(reason) {
											reject(reason);
										});
								}
							},


				onRejected: function(reason) {
								var result = typeof onRejected === 'function' && onRejected(reason) || reason;
								reject(result);
							}
			});
		});
	},

	/**
	 * 成功时的回调函数绑定
	 *
	 * @author JOU
	 * @time   2016-07-31T17:41:59+0800
	 * @param  {function}                 onFulfilled 回调函数
	 * @return {object}                               当前Promise对象
	 */
	done: function(onFulfilled) {
		this.handle({
			onFulfilled: onFulfilled
		});

		return this;
	},

	/**
	 * 失败时的回调函数绑定
	 *
	 * @author JOU
	 * @time   2016-07-31T17:43:20+0800
	 * @param  {function}                 onRejected 回调函数
	 * @return {object}                              当前Promise对象
	 */
	fail: function(onRejected) {
		this.handle({
			onRejected: onRejected
		});

		return this;
	},

	/**
	 * 绑定执行函数成功或失败时的回调函数，即不管执行函数成功与失败，都将调用此方法绑定的回调函数
	 *
	 * @author JOU
	 * @time   2016-07-31T17:44:07+0800
	 * @param  {function}               callback 回调函数
	 */
	always: function(callback) {
		this.handle({
			onFulfilled: callback,
			onRejected: callback
		});
	}

}

/**
 * 存储准备调用的promise对象，用于多个异步请求并发协作时使用。
 * 此函数会等待传入的promise对象的状态发生变化再做具体的处理
 *
 * @author JOU
 * @time   2016-07-28T17:31:10+0800
 * @param  {object} 		promise[1-n] 不定个数Promise对象
 * @return {object}                 	 promise对象
 */
Promise.when 		= function() {

}


/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/*  
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported animation,
 */


/** @type {Function} 基于ice的无刷新跳转和@state状态的动画控制对象 */
function animation() {

}


/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/*  
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported language,
 */

/** @type {Function} 前端标签管理对象，页面中所有的标签都建议使用此对象来加载控制，有助于标签的统一维护管理 */
function language() {

}


/* jshint -W030 */
/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals msXhrDialect,
	requestErr,
	Promise,
	_extend,
	_defaultOptions,
	toUpperCase,
	rtype,
	_typeof,
	_forEach,
	push,
	join,
	slice,
	_scriptEval
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported IceError,
	http,
 */


/**
 * ajax请求封装
 * 参数options为一个对象，传入的参数与默认参数进行合并操作（开发者参数没有定义的将使用默认参数）
 * defaultOptions = 
 * {
 * 		method 			: 'GET',		// 请求类型，默认为GET，可设置参数为{GET/POST}
 *   	url 			: '',			// 请求地址，默认为空
 *   	data 			: '',     		// 请求参数，默认为空
 *    	async 			: true,			// 是否异步请求，默认为异步，可设置参数为{true/false}
 *    	cache 			: true,			// 开启缓存，默认开启，可设置参数为{true/false}
 *    	contentType 	: 'application/x-www-form-urlencoded; charset=UTF-8',  // 请求为post时设置的Content-Type，一般传入此参数
 *    	type 			: 'TEXT'		// 返回的数据类型，默认文本，可设置参数为{TEXT/JSON/SCRIPT}
 * }
 *
 * @author JOU
 * @time   2016-07-26T17:07:21+0800
 * @param  {object}                 options ajax请求参数
 * @return {object}                        Promise对象
 */
function _ajax(options) {
	return new Promise(function(resolve, reject) {
		var	nohashUrl, hash, xhr,
			r20 			= /%20/g,
			rhash 			= /#.*$/,
			rts 			= /([?&])_=[^&]*/,
			rquery 			= /\?/,
			rnoContent 		= /^(?:GET|HEAD)$/;

		options.resolve 	= resolve;
		options.reject 		= reject;

		options 			= _extend({}, _defaultOptions, (options || {}));

		// 将method字符串转为大写以统一字符串为大写，以便下面判断
		// 再讲统一后的method传入查看是不是POST提交
		options.hasContent 	= !rnoContent.test(options.method = toUpperCase.call(options.method));

		// 将type字符串转为大写
		// 如传入的type不符合rtype定义的，则默认为TEXT
		options.type 		= rtype.test(options.type = toUpperCase.call(options.type || '')) ? options.type : 'TEXT';

		// 如果传入的data参数为对象，则将{k1: v1, k2: v2}转为以k1=v1&k2=v2
		if (_typeof(options).data === 'object') {
			var argArr 	= [];
			_forEach(options.data, function(data, index) {
				push.call(argArr, (index + '=' + data));
			});

			options.data = join.call(argArr, '&');
		}

		// 当请求为GET或HEAD时，拼接参数和cache为false时的时间戳
		if (!options.hasContent) {
			nohashUrl 		= options.url.replace(rhash, '');

			// 获取url中的hash
			hash 			= slice.call(options.url, nohashUrl.length);

			// 拼接data
			nohashUrl 		+= options.data ? (rquery.test(nohashUrl) ? '&' : '?') + options.data : '';

			// 处理cache参数，如果为false则需要在参数后添加时间戳参数
			nohashUrl 		= nohashUrl.replace(rts, '');
			nohashUrl 		+= options.cache === false ? (rquery.test(nohashUrl) ? '&' : '?') + '_=' + Date.now() : '';

			options.url 	= nohashUrl + (hash || '');
		}
		else if (options.data && _typeof(options.data) === 'string' && (options.contentType || '').indexOf('application/x-www-form-urlencoded') === 0) {
			options.data 	= options.data.replace(r20, '+');
		}

		// 获取当前浏览器的XMLHttpRequest对象，如果当前浏览器为IE，则根据不同版本的获取方式去逐一获取ActiveXObject对象
		if (window.XMLHttpRequest) {
			xhr 		= new XMLHttpRequest();
		}
		else if (window.ActiveXObject) {
			// 如果是IE浏览器，则使用IE所支持的各版本参数去创建ActiveXObject对象
			_forEach(msXhrDialect, function(item) {
				try {
					xhr = new window.ActiveXObject(item);
				} catch(e) {
					// 不作处理
				}
			});
		}
		else {
			throw requestErr('create', '创建XHR失败');
		}

		xhr.open(
				options.method,
				options.url,
				options.async
			);

		// 如果返回类型为json，则设置overrideMimeType为text/json
		// xhr.responseType = 'json';

		// 设置post header
		if (options.hasContent && options.data && options.contentType) {
			xhr.setRequestHeader('Content-Type', options.contentType);
		}

		xhr.onload = function() {
			if ((xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) && options.resolve) {
				var result,
					typeDeal = {
					TEXT: function() {
						result = xhr.responseText;
					},
					JSON: function() {
						try {
							result = JSON.parse(xhr.responseText);
						} catch(e) {
							result = '';
						}
					},
					SCRIPT: function() {
						result = xhr.responseText;
						_scriptEval(result);
					}
				};
				typeDeal[options.type]();


				// 如果传入了成功回调的方法，则执行该方法
				options.success && options.success(result) || options.resolve(result);
			}
			else if (options.reject){
				// 如果传入了失败回调的方法，则执行该方法
				options.error && options.error(xhr.responseText) || options.reject(xhr.responseText);
			}
		}

		xhr.onerror = function(error) {
			// 如果传入了失败回调的方法，则执行该方法
			options.error && options.error(error) || options.reject(error);
		}
		xhr.onabort = function() {
			// ... 
		}

		try {
			// 发送请求
			xhr.send(options.hasContent && options.data || null);
		} catch (e) {
			throw requestErr('send', e);
		}
	});
}


/**
 * ajax GET请求，内部调用_ajax方法实现
 *
 * @author JOU
 * @time   2016-07-26T17:23:03+0800
 * @param  {string}                 url      请求地址
 * @param  {string/object}          args     传递参数，如k1=v1&k2=v2或{k1: v1, k2: v2}
 * @param  {Function}               callback 请求成功回调函数
 * @param  {type}                 	type     数据返回类型，TEXT或JSON
 * @return {object}                          Promise对象
 */
function _get(url, args, callback, type) {
	// 1、如果没有传入args，则将callback的值给type，将args的值给callback，args设为undefined，
	// 2、如果没有传入args和type，将args的值给callback，args设为undefined
	if (_typeof(callback) === 'string' && type === undefined) {
		type 					= callback;
		callback 				= undefined;
	}
	if (_typeof(args) === 'function') {
		callback 				= args;
		args 					= undefined;
	}
	else if (rtype.test(toUpperCase.call(args || ''))) {
		type 					= args;
		args 					= undefined;
	}

	/** @type {Object} get请求参数初始化 */
	var params 					= {url: url};

	// 参数有值才将此参数纳入params对象内
	args && (params.args 		= args);
	callback && (params.success = callback);
	type && (params.type 		= type);

	return _ajax(params);
}


/**
 * ajax POST请求，内部调用_ajax方法实现
 *
 * @author JOU
 * @time   2016-07-26T17:27:26+0800
 * @param  {string}                 url      请求地址
 * @param  {string/object}          args     传递参数，如k1=v1&k2=v2或{k1: v1, k2: v2}
 * @param  {Function}               callback 请求成功回调函数
 * @param  {type}                 	type     数据返回类型，TEXT或JSON
 * @return {object}                          Promise对象
 */
function _post(url, data, callback, type) {
	// 1、如果没有传入data，则将callback的值给type，将data的值给callback，data设为undefined，
	// 2、如果没有传入data和type，将data的值给callback，data设为undefined
	if (_typeof(callback) === 'string' && type === undefined) {
		type 					= callback;
		callback 				= undefined;
	}
	if (_typeof(data) === 'function') {
		callback 				= data;
		data 					= undefined;
	}
	else if (rtype.test(toUpperCase.call(data || ''))) {
		type 					= data;
		data 					= undefined;
	}

	/** @type {Object} get请求参数初始化 */
	var params 					= {
									url: url,
									method: 'POST'
								};

	// 参数有值才将此参数纳入params对象内
	data && (params.data 		= data);
	callback && (params.success = callback);
	type && (params.type 		= type);

	return _ajax(params);
}


/** @description http请求插件方法构造 */
var http = _extend({}, {
					request : _ajax,
					get 	: _get,
					post 	: _post
				});


/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals moduleErr,
	_typeof,
	_forEach,
	push,
	
	TYPE_PLUGIN,
	TYPE_DRIVER,
	PLUGIN_BUILTIN,
	PLUGIN_EXTERNAL,
	PAGE_STATE,
	STATE_PARSED,
	STATE_READY,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported cache,
	
 */

/** @type {Object} 内部缓存对象
 * 缓存内容如下：
 * 1. 插件对象缓存
 * 2. 元素驱动器缓存
 * 3. 页面跳转与状态切换时的缓存，开启缓存后，页面跳转数据将会被缓存，再次调用相同地址时将使用缓存更新页面以提高响应速度，实时性较高的页面建议关闭缓存。
 * 4. 当前页面初始化未完成时将page()模块的工厂方法缓存于page中，ice.page()未调用时，将ice.module()内定义的方法缓存于此等待执行
 */
var cache = (function() {
	/** @type {Object} 插件存储，加载完成的插件都会存储于此 */
	var plugins 	= {
			/** @type {Object} 内置插件存储 */
			builtIn 	: {},
			/** @type {Object} 自定义插件存储 */
			external 	: {}
		},

		/** @type {Object} 元素驱动器存储 */
		drivers 	= {},

		/** @type {Object} 页面跳转与状态切换时的缓存 */
		redirects 	= {},

		/**
		 * @type {Object} 模块方法队列
		 */
		moduleQueue = {
			page 		: null,
			module 		: []
		};


	/**
	 * 添加插件
	 *
	 * @author JOU
	 * @time   2016-09-23T16:20:25+0800
	 * @param  {String}                 name   插件名称
	 * @param  {Object/Function}       	plugin 插件对象
	 * @param  {String}                 type   插件类型
	 */
	function addPlugin(plugin, type) {
		// 遍历插件对象组依次缓存
		_forEach(plugin, function(item, name) {
			if (!hasOwnProperty.call(plugins[type], name)) {
				plugins[type][name] = item;
			}
			else {
				throw moduleErr('plugin', name + '插件已存在');
			}
		});
	}


	/**
	 * 添加元素驱动器
	 *
	 * @author JOU
	 * @time   2016-09-23T16:24:53+0800
	 * @param  {String}                 name   驱动器名称
	 * @param  {Function}               driver 驱动器对象
	 */
	function addDriver(driver) {
		// 遍历插件对象组依次缓存
		_forEach(driver, function(item, name) {
			if (!hasOwnProperty.call(drivers, name)) {
				drivers[name] = item;
			}
			else {
				throw moduleErr('driver', name + '元素驱动器已存在');
			}
		});
	}

	// 曝光接口到外部
	return {
		/**
		 * 将组件的构造对象根据组件类型按传入的组件名进行分类缓存，并返回组件本身
		 * 此方法将会根据type和name查找组件，如果组件已经定义则会抛出错误
		 *
		 * 缓存将保存在cache对象内【@see cache.js】，此对象也是通过此方法构造生成，所以cache对象应该也会在第一时间构造生成以便后续缓存的使用，如果在cache对象生成前缓存对象将会抛出错误	
		 *
		 * @author JOU
		 * @time   2016-09-23T13:40:33+0800
		 * @param  {String}                 component 组件名
		 * @param  {Object}                 component 组件构造对象
		 * @param  {String}                 type      组件类型
		 * @return {Object}                           组件对象或组件对象组
		 */
		componentCreater: function(name, component, type) {
			var tmp,
				tname = _typeof(name);

			// 当未传入组件名，而是直接传入组件对象组时，将组件对象组传入cache对象缓存
			if (tname === 'object') {
				type 		= component;
				component 	= name;
				name 		= undefined;
			}
			else {
				tmp 		= component;
				component 	= {};
				component[name] = tmp;
			}

			if (type === PLUGIN_BUILTIN || type === PLUGIN_EXTERNAL) {
				addPlugin(component, type);
			}
			else if (type === TYPE_DRIVER) {
				addDriver(component);	
			}

			return tmp || component;
		},

		/**
		 * 根据组件类型和名称获取组件对象，如果不传入type参数则默认获取插件
		 * 当获取插件时，此方法会先查找内部插件是否存在符合条件的插件，如果不存在再从外部插件查找
		 *
		 * @author JOU
		 * @time   2016-09-23T16:22:10+0800
		 * @param  {String}                 name 组件名称
		 * @param  {Number}                 type 组件类型
		 * @return {Object/Function}      anonymous 组件对象
		 */
		componentFactory: function(name, type) {
			return (type === TYPE_PLUGIN || type === undefined) ? 
				   (plugins[PLUGIN_BUILTIN][name] || plugins[PLUGIN_EXTERNAL][name]) :
				   		type === TYPE_DRIVER ? drivers[name] : null;
		},

		/**
		 * 添加跳转缓存模块
		 *
		 * @author JOU
		 * @time   2016-09-23T16:29:23+0800
		 * @param  {String}                 name     缓存名称
		 * @param  {Multi}                 redirect  缓存模块
		 */
		addRedirect: function(name, redirect) {
			if (!hasOwnProperty.call(redirects, name)) {
				redirects[name] = redirect;
			}
			else {
				throw moduleErr('module', name + '页面模块已存在');
			}
		},

		/**
		 * 获取跳转缓存模块
		 *
		 * @author JOU
		 * @time   2016-09-23T16:33:46+0800
		 * @param  {String}                 name 缓存名称
		 * @return {Multi}                  anonymous 缓存模块
		 */
		getRedirect: function(name) {
			return redirects[name];
		},

		/**
		 * 添加模块注入后工厂方法
		 *
		 * @author JOU
		 * @time   2016-09-23T16:34:36+0800
		 * @param  {String}                 name    模块名称
		 * @param  {Function}               factory 模块注入后工厂方法
		 */
		// addModule: function(name, factory) {
		// 	if (!hasOwnProperty.call(modules, name)) {
		// 		modules[name] = factory;
		// 	}
		// 	else {
		// 		throw moduleErr('module', name + '模块已存在');
		// 	}
		// },

		/**
		 * 获取模块注入后工厂方法
		 *
		 * @author JOU
		 * @time   2016-09-23T16:37:04+0800
		 * @param  {String}                 name      模块名称
		 * @return {Function}               anonymous 模块注入后工厂方法
		 */
		// getModule: function(name) {
		// 	return modules[name];
		// },

		/**
		 * 设置ice.page()注入后工厂方法，当页面状态为Loading状态时会将ice.page()注入后工厂方法保存于此等待页面解析完毕并执行
		 *
		 * @author JOU
		 * @time   2016-09-23T16:37:53+0800
		 * @param  {[type]}                 pageFactory [description]
		 */
		setPageFactory: function(factory) {
			if (_typeof(factory) === 'function') {
				moduleQueue.page = factory;
			}
		},

		/**
		 * 添加ice.module()待执行注入后工厂方法，当页面状态不为Ready状态时会将ice.module()注入后工厂方法保存于此等待ice.page()执行完毕并执行
		 *
		 * @author JOU
		 * @time   2016-09-23T16:46:38+0800
		 * @param  {[type]}                 factory [description]
		 */
		addUnexecutedModule: function(factory) {
			if (_typeof(factory) === 'function') {
				push.call(moduleQueue.module, factory);
			}
		},

		/**
		 * 调用被缓存的工厂方法
		 *
		 * @author JOU
		 * @time   2016-08-23T12:00:15+0800
		 */
		queueInvoke: function() {
			if (PAGE_STATE === STATE_PARSED && _typeof(moduleQueue.page) === 'function') {
				moduleQueue.page();
			}

			// 依次执行被缓存的module主函数
			else if (PAGE_STATE === STATE_READY  && moduleQueue.module.length > 0) {
				_forEach(moduleQueue.module, function(module) {
					if (_typeof(module) === 'function' ) {
						module();
					}
				});
			}
		}
	};
})();


/* jshint -W030 */
/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals _typeof,
	_config,
	cache,
	_html,
	_replaceAll,
	substr,
	_get,
	setCurrentPath$,
	getCurrentPath$,
	envErr,
	moduleErr,
	_extend,
	_forEach,
	_s,
	push,
	join,

 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported crystals,

 */


/** 
 * 根据url请求html，并将html放入module（module为模块节点），如果pushStack为true则将url和title压入history栈内。如果pushStack不为true，则不压入history栈内。
 * 浏览器前进/后退调用时，不调用pushState方法
 *
 * 此函数可通过第一个参数传入数组的方式同时更新多个模块，此时module的值代表pushStack的值，title的值代表onpopstate的值（方法体中将纠正参数）
 * 第一个参数传入数组时，格式为：
 * [
 * 		{url: url1, entity: module1, title: title1, isCache: isCache1}
 * 		{url: url2, entity: module2, title: title2, isCache: isCache2}
 * 		...
 * 	]
 *
 * @author JOU
 * @time   2017-01-20T15:48:04+0800
 * @param  {String/Object}          url        请求路径或请求数据对象
 * @param  {Object/Boolean}         module     模块节点（当url为请求数据对象时为pushStack的值）
 * @param  {String/Boolean}         title      标题名称（当url为请求数据对象时为onpopstate的值）
 * @param  {Boolean/Null} 	        isCache    是否缓存（当url为请求数据对象时为null）
 * @param  {Boolean/Null} 	        pushStack  是否压入history栈内（当url为请求数据对象时为null）
 * @param  {Boolean/Null} 	        onpopstate 是否为浏览器前进/后退时调用（当url为请求数据对象时为null）
 */
function single ( url, module, title, isCache, pushStack, onpopstate ) {

	var 
		type,
		moduleName, 

		modules, 

		historyMod, html, 

		/** @type {String} 模块名占位符 */
		modPlaceholder 	= ':m',

		/** @type {String} 模块内容标识占位符 */
		conPlaceholder 	= ':v',


		/** @type {String} 模块内容缓存key */
		redirectKey, 


		//////////////////////////////////////////////////
		/// 请求url处理相关
		///

		/** @type {String} 完整请求url初始化 */
		complateUrl, 
		hasSeparator,


		/** @type {String} 临时保存刷新前的title */
		currentTitle,

		/** @type {String} 上一页面的路径 */
		lastPath,

		_state 			= [];

	// 判断传入的url的类型，如果是string，是普通的参数传递，即只更新一个模块的数据； 如果是array，它包括一个或多个模块更新的数据
	if ( _typeof ( url ) === 'string' ) {

		// 参数无需纠正
		modules 		= [{url: url, entity: module, title: title, isCache: isCache}];
	}
	else {
		modules 		= url;

		// 纠正参数
		pushStack 		= module;
		onpopstate 		= title;
	}



	// 循环modules，依次更新模块
	_forEach ( modules, function ( _module ) {

		// console.log(_module);

		type 			= _typeof(_module.title);
		moduleName 		= _module.entity.getAttribute ( single.aModule );
		redirectKey 	= moduleName + '_' + _module.url;
		complateUrl 	= _config.params.urlRule;

		// isCache=true且cache已有当前模块的缓存时，才使用缓存
		if ( _module.isCache === true && ( historyMod = cache.getRedirect ( redirectKey ) ) ) {
			_html ( _module.entity, historyMod );
		}
		else {

			// 通过url规则转换url，并通过ice-base来判断是否添加base路径
			complateUrl 	= _replaceAll ( complateUrl || '', modPlaceholder, moduleName );
			complateUrl 	= _replaceAll ( complateUrl || '', conPlaceholder, _module.url );


			hasSeparator 	= complateUrl.indexOf ( '/' );
			complateUrl 	= _module.entity.getAttribute ( single.aBase ) !== 'false' && _config.params.base.url.length > 0 ?  
							  _config.params.base.url +  ( hasSeparator === 0 ? substr.call ( complateUrl, 1 ) : complateUrl )
							  :
							  hasSeparator === 0 ? complateUrl : '/' + complateUrl;


			_get ( complateUrl ).done ( function ( result ) {
				try {

					result 	= JSON.parse ( result );
					html 	= result [ _config.params.htmlKey ];

				} catch ( e ) {
					html 	= result;
				}

				/////////////////////////////////////////////////////////
				// 将请求的html替换到module模块中
				//
				_html ( _module.entity, html );

				/////////////////////////////////////////////////////////
				// 如果需要缓存，则将html缓存起来
				//
				_module.isCache === true && cache.addRedirect ( redirectKey, html );

				// 将_module.title统一为字符串
				// 如果没有获取到字符串则为null
				_module.title = type === 'string'   ? _module.title : 
							  	type === 'function' ? _module.title ( result [ _config.params.codeKey ] || null ) || null : null;
			} );


			if ( _typeof ( _module.title ) === 'string' ) {

				currentTitle 	= document.title;
				document.title 	= _module.title;
			}

			// 先保存上一页面的path用于上一页面的状态保存，再将模块的当前路径更新为刷新后的url
			lastPath = getCurrentPath$ ( _module.entity );
			setCurrentPath$ ( _module.entity, _module.url );

			push.call ( _state,  {
				url 		: lastPath,
				moduleName 	: moduleName,
				cache 		: _module.isCache,
				title 		: currentTitle
			} );


			pushStack === true && single.setModuleRecord ( moduleName, _module.url, true );
		}
	} );

	// 判断是否调用pushState
	if (pushStack === true) {

		// 需判断是否支持history API新特性
		if (single.history.entity.pushState) {


			/////////////////////////////////////////////////////////
			// 保存跳转前的页面状态
			//

			single.history.setState ( single.history.signature, _state, true );

			// console.log(single.getFormatModuleRecord ());
			onpopstate === true || single.history.push ( null, _module.title, single.getFormatModuleRecord () );

			// 初始化一条将当前页的空值到single.history.state中
			single.history.setState ( window.location.pathname, null );
			
		}
		else {
			throw envErr ( 'History API', '浏览器不支持HTML5 History API' );
		}
	}
}

//////////////////////////////////////////
// module无刷新跳转相关属性通用参数，为避免重复定义，统一挂载到single对象上
//
_extend(single, {
	aModule 		: 'ice-module',
	aSrc 			: 'ice-src',
	aCache 			: 'ice-cache',
	aBase 			: 'ice-base',
	aLoading 		: 'ice-loading',
	aFinish 		: 'ice-finish',

	aHref			: 'href',
	aAction 		: 'action',
	aTargetMod 		: 'ice-target-module'
});


_extend(single, {

	/** @type {Object} window.history封装 */
	history : {

		/** @type {Object} window.history对象 */
		entity  	: window.history,

		/**
		 * 对history.replaceState方法的封装
		 *
		 * @author JOU
		 * @time   2017-03-25T13:29:44+0800
		 * @param  {Object}                 state 参数传递对象
		 * @param  {String}                 title 标题
		 * @param  {String}                 url   刷新的url
		 */
		replace 	: function ( state, title, url ) {
			this.entity.replaceState ( state, title, url );
		},

		/**
		 * 对history.pushState方法的封装
		 *
		 * @author JOU
		 * @time   2017-03-25T13:29:44+0800
		 * @param  {Object}                 state 参数传递对象
		 * @param  {String}                 title 标题
		 * @param  {String}                 url   刷新的url
		 */
		push 		: function ( state, title, url ) {
			this.entity.pushState ( state, title, url );
		},

		/**
		 * 获取参数传递对象
		 *
		 * @author JOU
		 * @time   2017-03-25T13:32:12+0800
		 * @return {Object}                 参数传递对象
		 */
		getOriginalState 	: function () {
			return this.entity.state;
		},

		////////////////////////////////////
		/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
		/// 
		state 		: {},

		/** @type {Object} 状态记录标记 */
		signature 	: null,

		/**
		 * 设置状态记录，并标记此条记录
		 * 先查找key对应的记录，找到时更新此记录并标记，未找到时添加一条记录并标记
		 *
		 * 注意：mode为true时不标记此条记录
		 * 
		 * @author JOU
		 * @time   2017-03-26T13:55:55+0800
		 * @param  {String}                 key   记录key
		 * @param  {Boolean}                mode  模式
		 * @param  {Object}                 value 记录值
		 */
		setState 	: function ( key, value, mode ) {

			this.state [ key ] = value;

			mode === true  || ( this.signature 	= key );
		},

		/**
		 * 获取对应记录
		 *
		 * @author JOU
		 * @time   2017-03-26T13:58:06+0800
		 * @param  {String}                 key 记录key
		 * @return {Object}                     记录值
		 */
		getState 	: function ( key ) {

			return this.state [ key ];
		}
	},


	////////////////////////////////////
	/// 模块路径记录数组
	/// 记录页面的所有模块名及对应模块中当前所显示的模块内容
	/// 
	moduleRecord : {},

	/**
	 * 将最新的模块和对应的模块内容标识添加或更新到moduleRecord数组中
	 * filter = true时过滤moduleRecord数组中不存在于当前页面中的模块记录，filter = false时不过滤
	 *
	 * @author JOU
	 * @time   2017-03-26T21:24:54+0800
	 * @param  {String}                 moduleName 模块名称
	 * @param  {String}                 value      模块内容标识
	 * @param  {Boolean}                filter     是否过滤
	 */
	setModuleRecord : function ( moduleName, value, filter ) {

		// 更新或添加一项到moduleRecord数组中
		single.moduleRecord [ moduleName ] = value;

		if ( filter === true ) {

			// 过滤moduleRecord数组中不存在于当前页面中的模块记录
			var _record 		= {};

			_forEach ( single.moduleRecord, function ( recordItem, key ) {
				_typeof ( _s ( '*[ice-module=' + key + ']' ) ) === 'object' && ( _record [ key ] = recordItem );
			});

			single.moduleRecord 	= _record;
		}
	},

	/**
	 * 获取对应模块名称的模块内容标识
	 *
	 * @author JOU
	 * @time   2017-03-26T21:48:42+0800
	 * @param  {String}                 moduleName 模块名称
	 * @return {String}                            模块内容标识
	 */
	getModuleRecord : function ( moduleName ) {
		return single.moduleRecord [ moduleName ];
	},

	/**
	 * 获取moduleRecord格式化为pathname后的字符串
	 *
	 * @author JOU
	 * @time   2017-03-26T21:58:39+0800
	 * @return {String}                 格式化为pathname的字符串
	 */
	getFormatModuleRecord : function () {
		var 
			_array = [];

		_forEach ( single.moduleRecord, function ( recordItem, key ) {
			push.call ( _array, key + ( _config.params.moduleSeparator || '' ) + recordItem );
		} );


		return '/' + join.call ( _array, '/' );
	},

	/**
	 * 点击无刷新跳转的事件封装，预先绑定到同时具有href和ice-target-module两个属性的Node中
	 *
	 * @author JOU
	 * @time   2017-03-04T23:03:56+0800
	 * @param  {Object}                 e 事件回调参数event
	 */
	click 	: function ( e ) {

		var 

			/** 临时存储目标模块名称 */
			_moduleName 	= this.getAttribute ( single.aTargetMod ),

			src 			= this.getAttribute ( single.aHref ),

			cache 			= this.getAttribute ( single.aCache ),

			/** 获取当前按钮操作的模块 */
			module				= _s ( '*[' + single.aModule + '=' + _moduleName + ']' );

		e.preventDefault ();
		if ( _typeof ( module ) === 'object' ) {

			// 调用single方法
			getCurrentPath$ ( module ) === src || 
			single ( src, module, _config.params.header [ src ], 

					// 模块定义ice-cache="true"，或配置文件定义redirectCache为true且模块没有定义为false
					cache === 'true' || ( _config.params.redirectCache === true && cache !== 'false' ), true );
		}
		else {
			throw moduleErr ( 'module', '找不到' + _moduleName + '模块' );
		}
	}
});


/** @type {Object} 基于url的状态控制对象，一个url可能包含多个状态。
 * 状态解释：此框架的核心功能之一，普通的页面对DOM结构的处理、文本输入等不需要刷新页面但却改变了页面的初始状态，只要页面一刷新，则之前对本页面的操作都将重置为初始状态，此对象就是基于url来记录当前页面的操作状态，当页面中包括DOM结构处理（如弹出框、点击显示或隐藏DOM）、文本输入（一般为form表单部件的输入）都将记录在url中，当重新刷新此页面或将url分享给别人时，将根据url中的状态标识恢复页面状态
 * 1、自动解析请求url中的状态标识符并调用相应的绑定方法
 * 2、页面内容改变时自动判断已存在的状态是否还存在，如果不存在了则去掉url中相应的状态标识
 */
var State = {

}


/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals runtimeErr,
	_typeof,
	_forEach,
	_isEmpty,
	crystals,
	push,
	splice,
	Promise,
	animation,
	language,
	util,
	http,
	cache,

	TYPE_PAGE,
	TYPE_MODULE,
	TYPE_PLUGIN,
	TYPE_DRIVER,
	PAGE_STATE: true,
	STATE_LOADING,
	STATE_PARSED,
	STATE_READY,
	PLUGIN_BUILTIN,
	PLUGIN_EXTERNAL,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported moduleInvoke,

 */

/** @type {Object} 模块加载器，使用ice.page()或ice.module()依赖注入插件时将在此对象上进行查找插件并注入，如注入插件未加载则加载完成后保存于此，以防止重复加载
	插件分为内置插件与外部插件，内置插件可直接使用插件名注入；
	外部插件则需使用插件相对于_config.base的路径注入(可省略.js)。
 */
var moduleLoader 			= {
	/** @type {String} 文件后缀 */
	suffix					: '.js',

	/** @type {String} js插件的模块名称属性，通过此属性可以得到加载完成的模块名 */
	moduleName 				: 'data-moduleName',

	/** @type {String} 顶层模块名 */
	topModuleName 			: '*',

	/** @type {Object} 模块加载容器，用于模块加载时的控制 */
	context 				: {
		/** @type {Object} 需要加载的模块，加载完成所有模块需要遍历此对象上的所有模块并调用相应回调函数 */
		loadModules 			: {},
		/** @type {Array} 等待加载完成的模块，每加载完成一个模块都会将此模块在waiting对象上移除，当waiting为空时则表示相关模块已全部加载完成 */
		waiting 				: [],
		/** @type {Object} 正在加载中的模块信息，此对象用于当前正在加载中的模块内获取模块名称，此对象将会在_module方法内被赋值 */
		loadingModules 			: {
			/** @type {Number} 当前模块名指针 */
			pointer 		 		: 0,
			/** @type {Array} 正在加载中的模块名数组 */
			names 					: []
		}
	},


	/**
	 * 模块加载器初始化
	 *
	 * @author JOU
	 * @time   2016-09-04T15:45:01+0800
	 */
	init: function() {
		// 初始化context对象
		this.context.loadModules 				= {};
		this.context.waiting 					= [];
		this.context.loadingModules.pointer 	= 0;
		this.context.loadingModules.names 		= [];
	},

	/**
	 * 将模块对象放入context.loadModules对象中，等到所有的模块都加载完成后则会在this.onScriptLoaded方法内依次使用此对象内的内容
	 *
	 * @author JOU
	 * @time   2016-09-06T12:11:35+0800
	 * @param  {String}                 name   保存的模块名
	 * @param  {Object}                 module 保存的模块对象
	 */
	putLoadModules: function(name, module) {
		this.context.loadModules[name] = module;
	},

	/**
	 * 将等待加载完成的模块名放入context.waiting中
	 *
	 * @author JOU
	 * @time   2016-09-06T12:06:13+0800
	 * @param  {String}                 name 模块名
	 */
	putWaitingModuleName: function(name) {
		if (_typeof(this.context.waiting) === 'array') {
			push.call(this.context.waiting, name);
		}
	},

	/**
	 * 将正在加载中的模块名放入context.loadingModules.names中
	 *
	 * @author JOU
	 * @time   2016-09-06T12:02:25+0800
	 * @param  {String}                 name 模块名
	 */
	putLoadingModuleName: function(name) {
		if (_typeof(this.context.loadingModules.names) === 'array') {
			push.call(this.context.loadingModules.names, name);
		}
	},

	/**
	 * 获取正在加载中的模块名
	 *
	 * @author JOU
	 * @time   2016-09-06T11:51:30+0800
	 * @return {String}                 模块名
	 */
	getLoadingModuleName: function() {
		return (!_isEmpty(this.context.loadingModules.names) && this.context.loadingModules.pointer >= 0) ? this.context.loadingModules.names[this.context.loadingModules.pointer++] : false;
	},

	/**
	 * 插件注入方法实现，此方法默认注入的第一个参数是crystals对象，deps数组中的对象从第二个参数开始注入
	 * 此方法先查找顺序为内置插件、外部插件、动态加载插件并缓存于外部插件
	 *
	 * @author JOU
	 * @time   2016-09-06T14:13:38+0800
	 * @param  {[type]}                 module [description]
	 * @return {[type]}                        [description]
	 */
	inject: function(module) {
		var args 			= [crystals],
			_this 			= moduleLoader,

			depModule,
			returnValue;

		if (_typeof(module.deps) === 'array') {
			_forEach(module.deps, function(dep) {
				// 查找插件
				if (depModule = cache.componentFactory(dep, TYPE_PLUGIN)) {
					push.call(args, depModule);
				}

				// 如果都没找到则去此次加载完成的模块中获取并缓存入外部对象
				else {
					depModule = _this.inject(_this.context.loadModules[dep]);
					cache.componentCreater(
						dep, 
						depModule, 
						PLUGIN_EXTERNAL
					);

					push.call(args, depModule);
				}
			});
		}

		// 根据模块类型进行不同的操作
		// 当模块类型为page或module时将依赖模块注入factory方法内返回，因为需要根据当前的页面状态值来判断是否需要马上执行factory方法；
		// 当模块类型为plugin时注入依赖项并立即执行factory方法获取plugin对象
		if (module.type === TYPE_PAGE || module.type === TYPE_MODULE) {
			returnValue = function() {
				module.factory.apply(null, args);
			};
		}
		else if (module.type === TYPE_PLUGIN) {
			returnValue = module.factory.apply(null, args);
		}
		else if (module.type === TYPE_DRIVER) {
			// 后续添上
		}

		return returnValue;
	},

	/**
	 * js依赖模块onload事件回调函数
	 * ps:此函数不是直接在其他地方调用，而是赋值给script的onload事件的，所以函数里的this都需要使用moduleLoader来替代
	 *
	 * @author JOU
	 * @time   2016-09-05T15:44:48+0800
	 * @param  {Object}                 event event对象
	 */
	onScriptLoaded: function(event) {
		var /** @type {Function} 依赖注入后的工厂方法 */
			factory,

			_this 	= moduleLoader,
			pointer = _this.context.waiting.indexOf(event.target.getAttribute(_this.moduleName));


		// 移除已加载完成的模块
		if (pointer !== -1) {
			splice.call(_this.context.waiting, pointer, 1);
		}

		// 执行
		if (_this.context.waiting.length === 0) {
			factory = _this.inject(_this.context.loadModules[_this.topModuleName]);

			// 调用工厂方法
			_this.factoryInvoke(factory, _this.context.loadModules[_this.topModuleName].type);
		}
	}, 

	/**
	 * 模块工厂方法调用控制，只调用ice.page和ice.module的工厂方法调用。只有当页面状态正确时才会调用，否则将会存储起来等待调用
	 *
	 * @author JOU
	 * @time   2016-09-11T01:42:39+0800
	 * @param  {Function}                 factory 待执行的工厂方法
	 * @param  {type}                 	  type    模块类型
	 */
	factoryInvoke: function(factory, type) {
		// 通过ice.PAGE_STATE 判断页面是否初始化是否完成，如未完成则存入模块数组等待执行，如完成则直接执行
		// 当module调用者为ice.page时
		if (type === TYPE_PAGE) {
			if (PAGE_STATE === STATE_LOADING) {

				// 当前页面还未解析完成时，将page传入的主函数存储起来等待执行（将会在当前页面解析完成后执行此函数）
				cache.setPageFactory(factory);
				
			}
			else if (PAGE_STATE === STATE_PARSED) {
				factory && factory(); // jshint ignore:line

				// 将初始化状态设置为准备状态且执行完成ice.page
				PAGE_STATE = STATE_READY;

				// 执行缓存的module
				cache.queueInvoke();
			}
			else {
				throw runtimeErr('error', '页面状态错误(page)');
			}
		}
		// 当module调用者为ice.module时
		else if (type === TYPE_MODULE) {
			if (PAGE_STATE === STATE_PARSED) {
				cache.addUnexecutedModule(factory);
			}
			else if (PAGE_STATE === STATE_READY) {
				factory && factory(); // jshint ignore:line
			}
			else {
				throw runtimeErr('error', '页面状态错误(module)');
			}
		}
	}
};

cache.componentCreater({
	event 					: event,
	Promise 				: Promise,
	animation 				: animation,
	language 				: language,
	util					: util,
	http 					: http
}, PLUGIN_BUILTIN);


/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/*  
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported crystals,

 */

/** @type {Function} 贯穿整个框架的对象。crystals提供了外部环境与ice内部环境的交互的接口，开发者可在此对象上设置一些参数来供内部查找调用，同时也提供内部封装属性给开发者进行调用 */
function crystals() {

}


function crystals_refreshModule() {

}

_extend(crystals, {
	refreshModule 	: crystals_refreshModule
});


/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals _extend,
	_isEmpty,
	configErr,
	_typeof,
	ice,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* 
 */

/** @type {Array} 目前所支持的状态标记符号，如果所传入的状态标记符号不在此列表中，则会使用默认的状态标记符号@ */
var stateValue 	= ['@', '$', '^', '*', '|', ':', '~', '!'];


/**
 * 对开发者传入的配置参数进行初始化操作，并获取crystals对象供开发者进行调用。传入的参数将会与默认参数合并，当开发者没有设置的一些配置项将会使用默认的参数
 * 参数格式：
 *  {
		stateMark: '...', 		状态标识符，默认为"@"
		base: { 	    	    对象，内包含url、lang、plugin、driver参数
			url: '...',			请求base路径
			lang: '...',		语言包根目录，当此值为function时需返回一个路径字符串
			plugin: '...', 		插件根目录，当此值为function时需返回一个路径字符串
			driver: '...' 		驱动器根目录，当此值为function时需返回一个路径字符串
		},
		redirectCache, '...'	模块跳转缓存，当加载过的模块再次跳转时则使用缓存而不再请求服务器，适用于实时性差的模块,默认为true
	}
 *
 * @author JOU
 * @time   2016-07-25T16:33:26+0800
 * @param  {Object}                 	params 开发者传入的配置参数对象
 */
function _config(params) {
	// 配置参数的类型固定为object
	if (_typeof(params) !== 'object') {
		throw configErr('params', '配置参数为参数对象');
	}

	/** @type {String} 用于临时存储参数的类型 */
	var type,

		/** @type {Object} 默认配置参数 */
		_params 	= {
		/** @type {Object} 异步加载时的依赖目录，设置后默认在此目录下查找，此对象下有4个依赖目录的设置，如果不设置则表示不依赖任何目录 */
		base 			: {
			/** 
			 * url请求依赖目录，影响crystals.path方法中的路径设置，如果此参数已设置，则crystals.path方法内设置的路径都是基于此依赖目录来请求的
			 * 
			 * ps：此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
			 * @type {String/Function}
			 */
			url 			: '',

			/** 
			 * 插件加载的依赖目录，影响ice.page\ice.module\plugin方法加载插件时的路径设置，如果此参数已设置，则加载插件的路径都是基于此依赖目录来加载的
			 * 
			 * ps：此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
			 * @type {String/Function}
			 */
			plugin 			: '',

			/** 
			 * 元素驱动器的加载依赖目录，影响driver方法加载驱动器时的路径设置，如果此参数已设置，则加载驱动器的路径都是基于此依赖目录加载
			 * 
			 * ps：此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
			 * @type {String/Function}
			 */
			driver 			: '',

			/** 
			 * 语言包依赖目录，影响language内置插件的路径设置，如果此参数已设置，则language内置插件的路径都是基于此依赖目录来请求的文件的
			 * 
			 * ps：此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
			 * @type {String/Function}
			 */
			lang 			: ''
		},

		/** @type {String} url地址中的状态标识符，如http://...@login表示当前页面在login的状态 */
		stateMark		: stateValue[0],

		/** @type {Boolean} 是否开启跳转缓存，默认开启。跳转缓存是当页面无刷新跳转时缓存跳转数据，当此页面实时性较低时建议开启，以提高相应速度 */
		redirectCache 	: true,

		/** @type {String} 状态码键名，此状态码为服务器返回的数据中用于标识数据状态，客户端根据此状态码作出不同的处理。默认为"code" */
		codeKey 		: 'code',

		/** @type {String} 自定义html模块键名，此html模块为服务器返回的数据中用于标识请求的html内容，客户端将此内容填充进对应模块中。默认为"html" */
		htmlKey 		: 'html',

		/** @type {String} url中模块名称与模块内容标识的分隔符，默认为"-" */
		moduleSeparator : '-',

		/** @type {String} 自定义ajax请求时的url规则，通过设置此规则将规则中的模块名称与模块内容标识替换为当前请求环境的真实值，此规则与base.url和ice-base关联，即当设置了base.url且ice-base不为false时将自动添加base.url到此url前，如果ice-base为false时，此规则转换后的url将会从根目录当做url的起始路径，即在设置规则时第一个字符如果不是"/"，则系统将自动添加"/"到url的开头部分。默认规则为":m/:v.html" */
		urlRule 		: ':m/:v.html',

		/** @type {Array} 二维数组，无刷新跳转时，不同请求路径对应的标题，格式为{path1: title1, path2: title2...}。path可以是任何字符，但必须使用引号引起，title为字符串或方法（当为方法时接收一个codeKey参数，方法需返回一个字符串作为标题，如返回为空则标题将不变） */
		header 			: {}
	};

	if (!_isEmpty(params)) {
		// 处理params.base内参数
		if (params.base !== undefined) {
			// 处理params.base.url参数
			if (params.base.url !== undefined) {
				type 				= _typeof(params.base.url);
				params.base.url = type === 'string' ? params.base.url : 
									  type === 'function' ? params.base.url() :
									  '';
				params.base.url = params.base.url.substr(-1, 1) === '/' ? params.base.url : params.base.url + '/';
			}

			// 处理params.base.plugin参数
			if (params.base.plugin !== undefined) {
				type 		= _typeof(params.base.plugin);
				params.base.plugin = type === 'string' ? params.base.plugin : 
									  type === 'function' ? params.base.plugin() :
									  '';
				params.base.plugin = params.base.plugin.substr(-1, 1) === '/' ? params.base.plugin : params.base.plugin + '/';
			}

			// 处理params.base.driver参数
			if (params.base.driver !== undefined) {
				type 		= _typeof(params.base.driver);
				params.base.driver = type === 'string' ? params.base.driver : 
									  type === 'function' ? params.base.driver() :
									  '';
				params.base.driver = params.base.driver.substr(-1, 1) === '/' ? params.base.driver : params.base.driver + '/';
			}
		}

		// 处理params.base.lang参数
		if (params.base !== undefined && params.base.lang !== undefined) {
			type 			= _typeof(params.base.lang);
			params.base.lang = type === 'string' ? params.base.lang : 
								  type === 'function' ? params.base.lang() :
								  '';

			params.base.lang = params.base.lang.substr(-1, 1) === '/' ? params.base.lang : params.base.lang + '/';
		}

		// 判断传入的stateMark是否在stateValue限定的状态标记符号内
		params.stateMark = stateValue.indexOf(params.stateMark) === -1 ? stateValue[0] : params.stateMark;

		// 判断传入的redirectCache是否为true或false
		params.redirectCache = params.redirectCache !== false ? true : false;
	}
	
	params.base = _extend(_params.base, params.base);
	_extend(_config, {params: _extend(_params, params)});
}

// ice对象继承config方法
_extend(ice, {
	config : _config
});


/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals _extend,
	_typeof,
	_forEach,
	_trim,
	argErr,
	split,
	moduleLoader,
	_config,
	_s,
	_S,
	_on,
	TYPE_PAGE,
	TYPE_MODULE,
	TYPE_PLUGIN,
	TYPE_DRIVER,
	ice,
	cache,
	slice,
	push,
	concat,

	_ajax,
	_run,
	_appendScript,
	PAGE_STATE: true,
	STATE_PARSED,

	urlTransform$,
	setCurrentPath$,
	decomposeArray$,

	single,


 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/*  
 */

 /**
  * 管控传入的html，使管控后的html表现出符合icejs的特性，一般诸如服务器返回的、个人js添加的新代码会使用到此方法
  * 1、 加载带有ice-src的模块内容
  * 2、 给带有ice-target-module属性和src属性的元素绑定点击事件
  * 3、 加载并运行对应的元素驱动器
  *
  * @author JOU
  * @time   2016-11-28T17:18:15+0800
  * @param  {Object}                 node 		包含新增代码的节点对象或DocumentFragment对象
  * @param  {Boolean} 				 external 	是否为外部调用（外部指的是框架外），外部调用不具有不传参解析当前所有html的功能
  */
function _control(node, external) {
	if (external === true) {
		if (node === undefined || node === null || (node.nodeType !== 1 && node.nodeType !== 11)) {
			throw argErr('function control:node', 'control方法要求传入一个有效的node对象或DocumentFragment对象');
		}
	}
	else if (external === undefined && (node === undefined || node === null)) {
		node = _s('body');
	}
	
	var 

		/** @type {String} driver相关参数变量 */
		aDriver 		= 'ice-driver',
		aParam 			= 'ice-param',

		nodes 			= [],

		src, cache, state, 

		/** @type {Object} 保存浏览器前进/后退前的pathname中所包含的模块信息 */
		before,

		/** @type {Object} 保存浏览器前进/后退后的pathname中所包含的模块信息 */
		after,

		/** @type {Object} 用于在浏览器前进/后退并刷新页面时，再前进/后退时两个页面url中相差的模块信息的保存 */
		differentState 	= {},

		_modules, _module;



	//////////////////////////////////////////
	// ******* 加载带有ice-src的模块内容 *******
	//

	// 如果根节点也是一个模块定义，则需要将根节点一起处理
	if (node.nodeType === 1 && node.getAttribute(single.aModule) !== null) {
		push.call(nodes, node);
	}

	nodes = concat.call(nodes, slice.call(_S('*[' + single.aModule + ']', node)));
	_forEach(nodes, function(module) {

		// 过滤nodes数组本身带有的属性或方法
		if (module.nodeType === 1) {
			if (src 		= module.getAttribute(single.aSrc)) {
				cache 		= module.getAttribute(single.aCache);


				// 如果在single.moduleRecord中找到了当前加载模块的信息，则使用single.moduleRecord中的模块内容信息去加载内容
				// 此模块信息是由初始化时将pathname解析而来
				// 如果pathname中包含该模块的加载信息，则该模块需根据pathname的信息来加载，否则使用该模块的默认模块信息加载
				src 		= single.getModuleRecord(module.getAttribute(single.aModule)) || src;

				// 保存当前的路径
				// 用于无刷新跳转时，模块内容替换前的状态保存
				// 这样便可以在后退或前进时找到刷新前的状态
				setCurrentPath$(module, src);

				// 无刷新跳转组件调用来完成无刷新跳转
				single(
					src, 
					module, 
					null, 

					// 模块定义ice-cache="true"，或配置文件定义redirectCache为true且模块没有定义为false
					cache === 'true' || (_config.params.redirectCache === true && cache !== 'false')
				);
			}
		}
		else {
			return false;
		}
	});

	


	/////////////////////////////////////////////////////////
	// 给带有ice-target-module属性和src属性的元素绑定点击事件
	//
	_forEach ( slice.call ( _S ( '*[' + single.aHref + ']' ) ), function ( btn ) {
		if ( btn.nodeName !== 'LINK' && btn.getAttribute ( single.aTargetMod ) ) {
			_on ( btn, 'click', single.click );
		}
	});


	/////////////////////////////////////////////////////////
	// 后退/前进事件绑定
	//
	_on ( window, 'popstate', function ( event ) {

	    // 取得在single中通过replaceState保存的state object
	    state 		= single.history.getState ( window.location.pathname );

	    before 			= {};
	    after 			= {};
	    differentState  = {};

	    _modules 		= [];

	    if ( _typeof ( state ) === 'array' && state.length > 0 ) {

	    	if ( state.length === 1 ) {

	    		push.call ( _modules, {
	    			url 	: state [ 0 ].url, 
	    			entity 	: _s ( '*[' + single.aModule + '=' + state [ 0 ].moduleName + ']' ), 
	    			title 	: state [ 0 ].title, 
	    			isCache : state [ 0 ].cache
	    		} );
	    	}
	    	else {
	    		_forEach ( state, function ( item ) {

	    			push.call ( _modules, {
	    				url 	: item.url, 
	    				entity 	: _s ( '*[' + single.aModule + '=' + item.moduleName + ']' ), 
	    				title 	: item.title, 
	    				isCache : item.cache
	    			} );
	    		} );
	    	}


	    	single ( _modules, true, true );
	    }
	    else {

	    	// 获得跳转前的模块信息
    		decomposeArray$ ( split.call ( single.history.signature, '/' ), function ( key, value ) {
    			before [ key ] = value ;
    		} );

    		// 获得跳转后的模块信息
    		decomposeArray$ ( split.call ( window.location.pathname, '/' ), function ( key, value ) {
    			after [ key ]  = value ;
    		} );


	    	// 对比跳转前后url所体现的变化module信息，根据这些不同的模块进行加载模块内容
	    	_forEach ( after, function ( afterItem, key ) {
	    		if ( before [ key ] !== afterItem ) {
	    			differentState [ key ] = afterItem;
	    		}
	    	} );

			_forEach ( before, function ( afterItem, key ) {
				if ( after [ key ] !== afterItem ) {
					differentState [ key ] = null;
				}
			} );



			// 根据对比跳转前后变化的module信息，遍历重新加载
			_forEach ( differentState, function ( src, moduleName ) {
				_module = _s ( '*[' + single.aModule + '=' + moduleName + ']' );

				src 	  = src === null ? _module.getAttribute( single.aSrc ) : src;
				
				single ( 
						src, 
						_module, 
						_config.params.header[src], 
						_module.getAttribute ( single.aCache ) !== 'false' && _config.params.redirectCache, 
						true, 
						true 
					);
			} );
	    }

	    // if (state) {
	    // 	// 是否有逆状态方法缓存，有则调用，并移除此缓存
	    // 	if(inverseFuncCache.hasOwnProperty(location.pathname)) {
	    // 		var _inverseFunc = inverseFuncCache[location.pathname];
	    // 		// 移除此逆状态方法
	    // 		delete inverseFuncCache[location.pathname];

	    // 		if (_inverseFunc) {
	    // 			eval(_inverseFunc + '()');
	    // 		}
	    // 	}
	    // 	// 在没有逆状态方法缓存的情况下，判断当前地址是否为状态地址，即有@符号的，有则调用
	    // 	else if (state.url.status && state.url.status.indexOf('@') === 0) {
	    // 		var funcInvokeName = state.url.status.substr(1);
	    // 		inverseFuncCache[previousPathname] = state.url.inverseFunc;

	    // 		eval(funcInvokeName + '()');
	    // 	}
	    // 	else {
		   //  	$('title').html(state.title);

		   //  	// 读取本地数组缓存
		   //  	if (window.pageCache.hasOwnProperty(state.url)) {
		   //  		document.querySelector('html').innerHTML = window.pageCache[state.url];
		   //  		console.log(document.querySelector('head'));
		   //  	}
	    //     	// 如果没有本地数组缓存则ajax重新请求再放入缓存
	    //     	else {
	    //     		// 加载数据
	    //     		loading(state.url);
	    //     		window.pageCache[state.url] = document.querySelector('html').innerHTML;
	    //     	}
	    // 	}
	    // }
	});
}

/**
 * 模块处理方法，ice.page、ice.module、plugin和driver的内部实现都是调用的此方法。
 * 此方法主要实现了deps数组的动态加载并依赖注入到factory中，根据页面状态来处理factory函数
 *
 * @author JOU
 * @time   2016-08-21T12:43:18+0800
 * @param  {String}        			 moduleName   模块名
 * @param  {Array}                 	 deps 		  依赖项数组
 * @param  {factory}                 factory      模块执行方法
 * @param  {Number}                  type         模块类型
 */
function _module(moduleName, deps, factory, type) {
	// 判断参数合法性
	// 当传入参数只有一个且此参数类型是function时，参数合法并纠正参数
	if (!deps && !factory) {
		throw argErr('function module', '至少需要传入模块主函数参数');
	}
	else if (deps && !factory) {
		factory 			= deps;
		deps 				= undefined;
	}

	var tdeps 				= _typeof(deps),
		tfactory 			= _typeof(factory);

	// deps = undefined(or)null(or)array
	if(deps !== undefined && deps !== null && tdeps !== 'array') {
		throw argErr('function module:dependence', '方法第一个参数类型为Array，也可不传入第一个参数或传入null，方法将自动忽略此参数');
	}

	// factory参数必须为function
	if(tfactory !== 'function') {
		throw argErr('function module:factory', '至少需要传入模块主函数参数，而不是其他类型参数');
	}

	/** @type {Object} 动态加载插件时的script标签 */
	var script,

		rargs 				= /^function\s*\((.*)\)\s*/,
		args 				= split.call(rargs.exec(factory.toString())[1], ',');

	_forEach(args, function(arg, index, args) {
		args[index] = _trim(arg);
	});

	// 通过所使用插件过滤所需的加载项
	deps = _typeof(deps) === 'array' ? slice.call(deps, 0, args.length - 1) : deps;

	// 将此模块保存于loadModule中
	moduleLoader.putLoadModules(moduleName, {
												type 	: type,
												deps 	: deps,
												factory : factory,
												args 	: args
											});

	// 遍历依赖，如果模块未被加载，则放入waiting中等待加载完成
	if (_typeof(deps) === 'array') {
		_forEach(deps, function(dep) {

			// 模块名统一使用“.“作为命名空间分隔，将依赖项名字中的“/”统一转换为“.”
			dep 				= urlTransform$(dep, true);
			if (!cache.componentFactory(dep, TYPE_PLUGIN)) {

				// 放入moduleLoader.context.waiting数组中等待加载
				moduleLoader.putWaitingModuleName(dep);

				// 将依赖项名称放入正在加载中模块名数组中，以供plugin方法内去获取当前正在加载中的模块名称
				moduleLoader.putLoadingModuleName(dep);
			}

			script 				= document.createElement('script');

			script.src 			= _config.params.base.plugin + dep + moduleLoader.suffix;

			script.setAttribute(moduleLoader.moduleName, urlTransform$(dep));
			_appendScript(script, moduleLoader.onScriptLoaded);
		});
	}
}

/**
 * 使用icejs初始化页面方法
 * #此方法所做工作如下：
 * 1、 如果开发者调用了config配置，则加载config配置项。配置项以ajax同步的方式加载，跨域加载请确保在HTML5环境下运行，且服务器端需设置响应头为：
 * 	   [Access-Control-Allow-Origin:*]
 *     [Access-Control-Allow-Methods:POST,GET']
 * 2、 管控页面结构，使之表现出具有icejs的特性
 * 3、 解析完页面后将PAGE_STATE置为STATE_PARSED
 * 4、 执行缓存的page()（此方法主要防止异步执行时ice.page()和_init()的顺序错乱问题，_init()必须在ice.page()前执行）
 *
 * @author JOU
 * @time   2017-01-13T17:11:28+0800
 */
function _init() {

	//////////////////////////////////////////
	// 根据icejs的script标签上的config属性来调用js文件，如没有该属性则传入空配置参数初始化配置
	// 
	var 
		scripts 		= _S ( 'script[config]' );

	if ( scripts.length > 0 ) {
		_ajax( {
			url 	: scripts [ scripts.length - 1 ].getAttribute( 'config' ),
			async 	: false,
			type 	: 'SCRIPT'
		} );
	}
	else {
		_config( {} );
	}
	//////////////////////////////////////////
	//
	//


	// 初始化url中的模块信息到single.moduleRecord中
	decomposeArray$ ( split.call ( window.location.pathname, '/' ), function ( key, value ) {
		single.setModuleRecord ( key, value );
	} );


	// 初始化一条将当前页的空值到single.history.state中
	single.history.setState ( window.location.pathname, null );

	//////////////////////////////////////////
	// (异步执行)管控页面结构
	//
	_run ( _control );

	//////////////////////////////////////////
	// 将初始化状态设置为解析完成当前页面元素且执行完成ice.page
	// 
	PAGE_STATE = STATE_PARSED;

	// 执行缓存的page
	cache.queueInvoke ();
	//////////////////////////////////////////
	//
	//
}

// ice对象继承page、module方法
_extend(ice, {
	/**
	 * 页面初始化，异步执行方法，一个页面只能调用一次此方法
	 * ice.page()会在所有模块方法执行前执行
	 * ice.page()只有在PAGE_STATE=1时可执行，否则会将factory函数处理好缓存于moduleQueue中，等待PAGE_STATE置为1时立即执行
	 *
	 * @author JOU
	 * @time   2016-08-21T12:31:04+0800
	 * @param  {Array}                 	 deps 依赖项数组
	 * @param  {factory}                 factory      模块执行方法
	 * @return {Object} 							  ice对象
	 */
	page: function(deps, factory) {
		_init();

		// 每次使用都需要先初始化模块加载器，以确认加载器内的参数是原始的
		moduleLoader.init();
		_module(moduleLoader.topModuleName, deps, factory, TYPE_PAGE);

		return this;
	},

	/**
	 * 模块定义方法，异步执行方法，与ice.page()的功能基本相同。ice.module()会在初始化完成，即PAGE_STATE=2时立即执行此方法，否则将缓存于moduleQueue，等待PAGE_STATE置为2时立即执行
	 *
	 * 此方法永远不会先于ice.page()执行前执行	
	 *
	 * @author JOU
	 * @time   2016-08-21T12:36:36+0800
	 * @param  {}                 deps [description]
	 * @param  {Array}                 	 deps 依赖项数组
	 * @param  {factory}                 factory      模块执行方法
	 * @return {Object} 							  ice对象
	 */
	module: function(deps, factory) {
		// 每次使用都需要先初始化模块加载器，以确认加载器内的参数是原始的
		moduleLoader.init();

		_module(moduleLoader.topModuleName, deps, factory, TYPE_MODULE);

		return this;
	},

	/** 
	 * 管控传入的html(@see function _control)，此方法为外部调用方法，只能传递一个参数
	 *
	 * @author JOU
	 * @time   2017-01-16T19:46:38+0800
	 * @param  {Object}                 node 包含新增代码的节点对象或DocumentFragment对象
	 * @return {[type]}                      [description]
	 */
	control: function(node) {
		_control(node, true);
	}
});


// window全局对象继承plugin、driver方法
_extend(window, {

	/**
	 * 插件定义方法，此方法传入依赖插件数组deps和factory对象(factory可以为函数)
	 *
	 * @author JOU
	 * @time   2016-09-06T11:52:59+0800
	 * @param  {Array}                 	  deps    依赖插件数组
	 * @param  {Function}                 factory 插件工厂方法
	 */
	plugin: function(deps, factory) {
		_module(moduleLoader.getLoadingModuleName() || '', deps, factory, TYPE_PLUGIN);
	},

	/**
	 * 元素驱动器定义方法，此方法传入依赖插件数组deps和factory对象(factory可以为函数)
	 *
	 * @author JOU
	 * @time   2016-09-06T11:56:47+0800
	 * @param  {Array}                 	  deps    依赖插件数组
	 * @param  {Function}                 factory 插件工厂方法
	 */
	driver: function (deps, factory) {
		_module('', deps, factory, TYPE_DRIVER);
	}
});
})(window);