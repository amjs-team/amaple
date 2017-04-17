'use strict';

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