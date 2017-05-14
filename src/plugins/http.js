'use strict';

/* jshint -W030 */
/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals msXhrDialect,
	requestErr,
	Promise,
	rtype,
	util,
	push,
	join,
	slice,
	window,
	XMLHttpRequest,

 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported IceError,
	http,
 */


 /**
  * ajax请求外层包裹函数，该函数返回ajax具体实现的函数（以下简称此返回的函数为ajax函数）
  * ajax函数传入的参数与默认参数进行合并操作（开发者参数没有定义的将使用默认参数）
  * defaultOptions = 
  * {
  * 	method 			: 'GET',		// 请求类型，默认为GET，可设置参数为{GET/POST}
  *   	url 			: '',			// 请求地址，默认为空
  *   	data 			: '',     		// 请求参数，默认为空
  *    	async 			: true,			// 是否异步请求，默认为异步，可设置参数为{true/false}
  *    	cache 			: true,			// 开启缓存，默认开启，可设置参数为{true/false}
  *    	contentType 	: 'application/x-www-form-urlencoded; charset=UTF-8',  // 请求为post时设置的Content-Type，一般传入此参数
  *    	dataType 		: 'TEXT'		// 返回的数据类型，默认文本，可设置参数为{TEXT/JSON/SCRIPT/JSONP}
  * }
  *
  * 此外层包裹方法定义了许多仅供ajax函数使用的内部固定变量，只需编译一次且只能由ajax函数访问即可，所以使用了外层包裹的方式来设计此函数，http中的request、get、post方法调用此外层包裹方法并传入不同参数来获取对应的ajax函数
  *
  * @author JOU
  * @time   2017-05-11T23:15:51+0800
  * @param  {String}                 method 请求方式（GET或POST）
  * @return {Function}                      ajax具体实现方法
  */
function request ( method ) {

	var	// GET、POST时的默认参数
		url, args, callback, dataType,

		// 保存合并后的ajax处理参数
		options, // 请求是否完成
		
		// ajax相关信息
		completed, status, statusText, 

		transportName,

		// 返回的内容
		response, 

		params, nohashUrl, hash,

		// 相关正则表达式
		rheader 		= /^(.*?):[ \t]*([^\r\n]*)$/mg,
		rargs 			= /(\S+)=(\S+)&?/,
		r20 			= /%20/g,
		rhash 			= /#.*$/,
		rts 			= /([?&])_=[^&]*/,
		rquery 			= /\?/,
		rnoContent 		= /^(?:GET|HEAD)$/,

		/** @type {RegExp} ajax支持的返回类型正则表达式 */
		rtype 			= /^(?:TEXT|JSON|SCRIPT)$/,

		accepts 		= {
			'*' 		: ['*/'] + ['*'], // 避免被压缩
			text 		: 'text/plain',
			html 		: 'text/html',
			xml 		: 'application/xml, text/xml',
			json 		: 'application/json, text/javascript'
		},

	    // 默认参数对象初始化
	    /** @type {Object} ajax默认参数对象初始化 */
	    defaultOptions = {
	    	method 		: 'GET',
	    	url 		: '',
	    	data 		: '',     
	    	async 		: true,
	    	cache 		: true,
	    	contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
	    	dataType 	: 'TEXT',
	    	headers 	: {}
	    },

	    /**
	     * 返回合并后的参数对象，参数对象的合并根据http.get、http.post、http.request请求方法进行区分
	     *
	     * @author JOU
	     * @time   2017-05-11T23:09:49+0800
	     * @param  {String}                 method 请求方式（GET或POST）
	     * @return {Function}                      合并参数的方法体
	     */
	    extendOptions 	= ( function ( method ) {

	    	return function ( options ) {

	    		// request请求时，参数肯定是一个对象，直接返回
	    		if ( method ) {

	    			url 		= options [ 0 ];
	    			args 		= options [ 1 ];
	    			callback 	= options [ 2 ];
	    			dataType 	= options [ 3 ];

	    			// 纠正参数
	    			// 1、如果没有传入args，则将callback的值给dataType，将args的值给callback，args设为undefined，
	    			// 2、如果没有传入args和dataType，将args的值给callback，args设为undefined
	    			if ( util.type ( callback ) === 'string' && dataType === undefined ) {
	    				dataType 				= callback;
	    				callback 				= undefined;
	    			}
	    			if ( util.type ( args ) === 'function' ) {
	    				callback 				= args;
	    				args 					= undefined;
	    			}
	    			else if ( rtype.test ( ( args || '' ).toUpperCase () ) ) {
	    				dataType 				= args;
	    				args 					= undefined;
	    			}

	    			/** @type {Object} get请求参数初始化 */
	    			params = { 
	    				url 	: url, 
	    				args 	: args || undefined, 
	    				success : callback || undefined,
	    				dataType: dataType || undefined,
	    				method 	: method
	    			};
	    		}
	    		else {
	    			params = options [ 0 ];
	    		}

	    		// 合并参数
	    		return util.extend ( {}, defaultOptions, params );
	    	}
	    } ) ( method ),

	    /** @type {Object} ajax返回数据转换器 */
	    ajaxConverters 	= {

	    	text: function ( text ) {
	    		return text;
	    	},

	    	json: function ( text ) {
	    		return JSON.parse ( text );
	    	},

	    	script: function ( text ) {
	    		util.scriptEval ( text );
	    	},

	    	jsonp: function () {

	    	}
	    },



		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
	    /** @type {Object} ajax传送器，根据数据类型 */
	    ajaxTransports 		= {
	    	xhr : function () {

	    		return {

	    			/**
	    			 * ajax请求前设置参数，并发送请求
	    			 *
	    			 * @author JOU
	    			 * @param  {Object}         options ajax设置参数对象
	    			 * @param  {Object}         iceXHR  iceXHR自定义对象
	    			 * @time   2017-05-13T23:22:19+0800
	    			 */
	    			send : function ( options, iceXHR ) {

	    				var i, 
	    					self = this,

	    					// 获取xhr对象
	    					xhr = this.xhr = ( function () {
	    						try {
	    							return new XMLHttpRequest ();
	    						} catch ( e ) {}
	    					} ) ();

	    				xhr.open ( options.method, options.url, options.async, options.username, options.password );

	    				// 覆盖原有的mimeType
						if ( options.mimeType && xhr.overrideMimeType ) {
							xhr.overrideMimeType( options.mimeType );
						}

						xhr.setRequestHeader ( 'X-Requested-With', 'XMLHTTPRequest' );
	                    for ( i in this.headers ) {
	                        xhr.setRequestHeader ( i, this.headers [ i ] );
	                    }

	                    // 绑定请求中断回调
	                    if ( util.type ( options.abort ) === 'function' && event.support ( 'abort', xhr ) ) {
	                    	xhr.onabort = function () {
	                    		options.abort ( iceXHR.statusText );
	                    	}
	                    }

	                    if ( event.support ( 'error', xhr ) ) {
	                    	xhr.onload = xhr.onerror = function ( e ) {

	                    		completed = true;
								self.status = e.type === 'load' ? 200 : 500;

	                    		self.done ( iceXHR );
	                    	}
	                    }
	                    else {
	                    	xhr.onreadystatechange = function () {
	                    		if ( xhr.readyState === XMLHttpRequest.DONE ) {

	                    			completed = true;

	                    			// 兼容IE有时将204状态变为1223的问题
	                    			self.status = ( xhr.status >= 200 && xhr.status < 300 ) || xhr.status === 304 || xhr.status === 1223 ? 200 : 500;

	                    			self.done ( iceXHR );

	                    		}
	                    	}
	                    }

	                    // 发送请求
	                    try {
	                    	xhr.send ( options.hasContent && options.data || null );
	                    } catch ( e ) {
	                    	throw requestErr ( 'send', e );
	                    }
	    			},

	    			/**
	    			 * ajax请求完成或中断后的处理
	    			 *
	    			 * @author JOU
	    			 * @time   2017-05-14T02:37:38+0800
	    			 * @param  {Object}                 iceXHR iceXHR自定义对象
	    			 */
	    			done : function ( iceXHR ) {
	    				var xhr = this.xhr;

	    				if ( !xhr ) {
	    					return;
	    				}

	    				xhr.onload = xhr.onerror = xhr.onreadystatechange = null;

	    				if ( this.type && util.type ( xhr.abort ) === 'function' ) {

	    					status 		= 0;
	    					statusText 	= this.type;

	    					xhr.abort ();
	    				}

	    				if ( completed ) {

	    					// 如果存在计时ID，则清除此
							if ( this.timeoutID ) {
								window.clearTimeout( this.timeoutID );
							}

							// 获取所有返回头信息
							this.responseHeadersString = xhr.getAllResponseHeaders ();

							status 				= xhr.status;
							statusText 		   	= xhr.statusText;

							// 如果解析错误也会报错，并调用error
							try {
								response 		= ajaxConverters [ dataType ] ( xhr.responseText );
							} catch ( e ) {

								status 			= this.status	= 500;
								statusText 		= 'Parse Error: ' + e;
							}

	    					// 请求成功，调用成功回调
	    					if ( this.status === 200 ) {
	    						this.callbacks.success && this.callbacks.success ( response, statusText, iceXHR );
	    					}

	    					// 请求错误调用error回调
	    					else if ( this.status === 500 ) {
	    						this.callbacks.error && this.callbacks.error ( iceXHR, statusText );
	    					}

	    					// 调用complete回调
	    					this.callbacks.complete && this.callbacks.complete ( iceXHR, statusText );

	    					delete iceXHR.transport;
	    					delete this.status;
	    				}
	    			}
	    		};
	    	},

	    	jsonp : function () {

	    		return {
	    			send : function () {

	    			},

	    			done : function () {

	    			}
	    		};
	    	},

	    	script : function () {

	    		return {
	    			send : function () {

	    			},

	    			done : function () {

	    			}
	    		};
	    	},

	    	submit : function () {

	    		return {
	    			send : function () {

	    			},

	    			done : function () {

	    			}
	    		};
	    	}
	    },

	    // 自定义xhr对象，用于统一处理兼容问题
	    iceXHR 			= {

	    	// 请求传送器，根据不同的请求类型来选择不同的传送器进行请求
	    	transport : null,

	    	// 设置请求头
	    	setRequestHeader : function ( header, value ) {

	    		if ( !completed ) {
	    			this.transport.headers = this.transport.headers || {};
	    			this.transport.headers [ header.toLowerCase () ] = value;
	    		}
	    	},

	    	// 获取返回头
	    	getResponseHeader : function ( header ) {

	    		var match;

	    		if ( completed ) {
	    			if ( !this.transport.respohseHeader ) {
	    				this.transport.respohseHeader = {};
	    				while ( match = rheader.exec ( this.transport.responseHeadersString || '' ) ) {
	    					this.transport.respohseHeader [ match [ 1 ].toLowerCase () ] = match [ 2 ];
	    				}
	    			}

	    			match = this.transport.responseHeader [ header ];
	    		}

	    		return match || null;
	    	},

	    	// 获取所有返回头信息
	    	getAllResponseHeaders : function () {
	    		return completed ? this.transport.responseHeadersString : null;
	    	},

	    	// 设置mimeType
	    	overrideMimeType : function ( mimetype ) {
	    		if ( !completed ) {
	    			options.mimetype = mimetype;
	    		}
	    	},

	    	// 请求超时触发
	    	abort : function ( statusText ) {
	            if ( this.transport ) {
	            	this.transport.type = statusText || 'abort';
	                this.transport.done ();
	            }
	    	},

	    	// 绑定xhr回调事件
	    	addEventListener : function ( type, callback ) {
	    		if ( !completed ) {
	    			this.transport.callbacks = this.transport.callbacks || {};
	    			this.transport.callbacks [ type ] = callback;
	    		}
	    	}
	    };

	/**
	 * ajax异步请求方法实现
	 *
	 * @author JOU
	 * @time   2017-05-11T23:14:13+0800
	 * @return {Object}                         Promise对象
	 */
	return function () {

		// 初始化ajax状态信息
		completed 			= false;
		status 				= 0;
		statusText 			= '';

		// 合并参数
		options 			= extendOptions ( arguments );

		// 将method字符串转为大写以统一字符串为大写，以便下面判断
		// 再将统一后的method传入查看是不是POST提交
		options.hasContent 	= !rnoContent.test ( options.method = options.method.toUpperCase () );

		// 将dataType字符串转为大写
		// 如传入的dataType不符合rtype定义的，则默认为TEXT
		options.dataType 	= rtype.test ( options.dataType = ( options.dataType || '' ).toUpperCase () ) ? options.dataType : 'TEXT';

		// 修正timeout参数
		options.timeout 	= options.timeout > 0 ? options.timeout : 0;

		// 如果传入的data参数为对象，则将{k1: v1, k2: v2}转为以k1=v1&k2=v2
		if ( util.type ( options.data ) === 'object') {
			var args 		= [];
			util.foreach ( options.data, function ( data, index ) {
				args.push ( index + '=' + data );
			} );

			options.data = args.join ( '&' );
		}

		// 当请求为GET或HEAD时，拼接参数和cache为false时的时间戳
		if ( !options.hasContent ) {
			nohashUrl 		= options.url.replace ( rhash, '' );

			// 获取url中的hash
			hash 			= options.url.slice ( nohashUrl.length );

			// 拼接data
			nohashUrl 		+= options.data ? ( rquery.test ( nohashUrl ) ? '&' : '?' ) + options.data : '';

			// 处理cache参数，如果为false则需要在参数后添加时间戳参数
			nohashUrl 		= nohashUrl.replace ( rts, '' );
			nohashUrl 		+= options.cache === false ? ( rquery.test ( nohashUrl ) ? '&' : '?' ) + '_=' + Date.now () : '';

			options.url 	= nohashUrl + ( hash || '' );
		}
		else if ( options.data && util.type ( options.data ) === 'string' && ( options.contentType || '' ).indexOf ( 'application/x-www-form-urlencoded' ) === 0) {
			options.data 	= options.data.replace ( r20, '+' );
		}


		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		//返回Promise对象
		return new Promise ( function ( resolve, reject ) {

			// 小写dataType
			dataType 			= options.dataType.toLowerCase ();

			// 获取传送器名
			transportName 		= ( options.data !== '' && util.type ( options.data ) === 'string' && !rargs.test ( options.data ) ) || options.data instanceof FormData ? 'submit' : dataType;

			// 获取传送器对象，当没有匹配到传送器时统一使用xhr
			iceXHR.transport 	= ajaxTransports [ transportName ] ? ajaxTransports [ transportName ] () : ajaxTransports.xhr ();

			// 设置Content-Type
	        if ( options.contentType ) {
	            iceXHR.setRequestHeader ( 'Content-Type', options.contentType );
	        }

	        // 设置Accept
	        iceXHR.setRequestHeader ( 'Accept', accepts [ dataType ] ? accepts [ dataType ] + ', */*; q=0.01' : accepts [ '*' ] );

	        // haders里面的首部
	        for ( var i in options.headers ) {
	            iceXHR.setRequestHeader ( i, options.headers [ i ] );
	        }

	        // 调用请求前回调函数
	        if ( util.type ( options.beforeSend ) === 'function' ) {
	        	options.beforeSend ( iceXHR, options );
	        }

	        // 将事件绑定在iceXHR中
			'complete success error'.replace ( /\S+/g, function ( callbackName ) {

				// 如果是success或error回调，则使用resolve或reject代替
				options [ callbackName ] = callbackName === 'success' ? resolve : options [ callbackName ];
				options [ callbackName ] = callbackName === 'error' ? reject : options [ callbackName ];

				iceXHR.addEventListener ( callbackName, options [ callbackName ] );
			} );

			// 处理超时
	        if ( options.async && options.timeout > 0 ) {
	            iceXHR.transport.timeoutID = setTimeout ( function () {
	                iceXHR.abort ( 'timeout' );
	            }, options.timeout );
	        }

			iceXHR.transport.send ( options, iceXHR );
		} );
	}
}


/** @description http请求插件方法构造 */
var http = util.extend( {}, {
	
	request: request (),


	/**
	 * ajax GET请求，内部调用request方法实现
	 *
	 * @author JOU
	 * @time   2016-07-26T17:23:03+0800
	 * @param  {string}                 url      请求地址
	 * @param  {string/object}          args     传递参数，如k1=v1&k2=v2或{k1: v1, k2: v2}
	 * @param  {Function}               callback 请求成功回调函数
	 * @param  {String}                 dataType 数据返回类型，TEXT或JSON
	 * @return {object}                          Promise对象
	 */
	get : request ( 'GET' ),


	/**
	 * ajax POST请求，内部调用request方法实现
	 *
	 * @author JOU
	 * @time   2016-07-26T17:27:26+0800
	 * @param  {string}                 url      请求地址
	 * @param  {string/object}          args     传递参数，如k1=v1&k2=v2或{k1: v1, k2: v2}
	 * @param  {Function}               callback 请求成功回调函数
	 * @param  {String}                 dataType 数据返回类型，TEXT或JSON
	 * @return {object}                          Promise对象
	 */
	post : request ( 'POST' )
} );