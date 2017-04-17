'use strict';

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