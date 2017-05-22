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

		transportName,

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
		rtype 			= /^(?:TEXT|JSON|SCRIPT|JSONP)$/,

		rcheckableType 	= ( /^(?:checkbox|radio)$/i ),
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable 	= /^(?:input|select|textarea|keygen)/i,
		rCRLF 			= /\r?\n/g,

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
	    		return util.type ( text ) === 'object' ? text : JSON.parse ( text );
	    	},

	    	script: function ( text ) {
	    		util.scriptEval ( text );
	    	}
	    },

	    /**
	     * 请求回调调用
	     *
	     * @author JOU
	     * @time   2017-05-21T21:26:06+0800
	     * @param  {Object}                 iceXHR iceXHR自定义对象
	     */
	    complete = function ( iceXHR ) {

	    	var transport = iceXHR.transport;

	    	if ( transport.completed ) {
	    		return;
	    	}

	    	transport.completed = true;

			// 如果存在计时ID，则清除此
			if ( transport.timeoutID ) {
				window.clearTimeout( transport.timeoutID );
			}

			// 如果解析错误也会报错，并调用error
			if ( transport.response ) {
				try {
					transport.response 	= ajaxConverters [ transport.dataType ] && ajaxConverters [ transport.dataType ] ( transport.response );
				} catch ( e ) {
					transport.status 	= 500;
					transport.statusText = 'Parse Error: ' + e;
				}
			}

	    	// 请求成功，调用成功回调，dataType为script时不执行成功回调
	    	if ( transport.status === 200 && transport.dataType !== 'script' ) {
	    		transport.callbacks.success && transport.callbacks.success ( transport.response, transport.statusText, iceXHR );
	    	}

	    	// 请求错误调用error回调
	    	else if ( transport.status === 500 ) {
	    		transport.callbacks.error && transport.callbacks.error ( iceXHR, transport.statusText );
	    	}

	    	// 调用complete回调
	    	transport.callbacks.complete && transport.callbacks.complete ( iceXHR, transport.statusText );
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

	    				if ( options.crossDomain && !'withCredentials' in xhr ) {
	    					throw requestErr ( 'crossDomain', '该浏览器不支持跨域请求' );
	    				}

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
	                    		options.abort ( this.statusText );
	                    	}
	                    }

	                    if ( event.support ( 'error', xhr ) ) {
	                    	xhr.onload = xhr.onerror = function ( e ) {

								iceXHR.transport.status = ( xhr.status >= 200 && xhr.status < 300 ) || xhr.status === 304 || xhr.status === 1223 ? 200 : 500;

	                    		self.done ( iceXHR );
	                    	}
	                    }
	                    else {
	                    	xhr.onreadystatechange = function () {
	                    		if ( xhr.readyState === XMLHttpRequest.DONE ) {

	                    			// 兼容IE有时将204状态变为1223的问题
	                    			iceXHR.transport.status = ( xhr.status >= 200 && xhr.status < 300 ) || xhr.status === 304 || xhr.status === 1223 ? 200 : 500;

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
	    			 * ajax请求完成后的处理
	    			 *
	    			 * @author JOU
	    			 * @time   2017-05-14T02:37:38+0800
	    			 * @param  {Object}                 iceXHR iceXHR自定义对象
	    			 */
	    			done : function ( iceXHR ) {

	    				var xhr = this.xhr;

	    				xhr.onload = xhr.onerror = xhr.onreadystatechange = null;

    					// 获取所有返回头信息
    					this.responseHeadersString = xhr.getAllResponseHeaders ();

    					this.status 		= xhr.status;
    					this.statusText 	= xhr.statusText;
    					this.response 		= xhr.responseText;

    					complete ( iceXHR );
	    			},

	    			/**
	    			 * ajax请求中断
	    			 *
	    			 * @author JOU
	    			 * @time   2017-05-21T23:40:08+0800
	    			 */
	    			abort : function () {
	    				this.status 	= 0;
	    				this.statusText = this.abortText;

	    				xhr.abort && xhr.abort ();
	    			}
	    		};
	    	},


	    	// 动态执行script
	    	script : function ( options ) {

	    		var script;

	    		return {

	    			/**
	    			 * 动态执行javascript
	    			 *
	    			 * @author JOU
	    			 * @time   2017-05-21T17:52:31+0800
	    			 * @param  {Object}         options ajax设置参数对象
	    			 * @param  {Object}         iceXHR  iceXHR自定义对象
	    			 */
	    			send : function ( options, iceXHR ) {
	    				var self 	= this;

	    				script 		= document.createElement ( 'script' );
	    				script.src 	= options.url;


	    				event.on ( script, 'load error', function ( e ) {

	    					if ( script.parentNode ) {
	    						script.parentNode.removeChild ( script );
	    					}

							if ( e.type === 'load' ) {
								this.status 		= 200;
								this.statusText 	= 'success';
							}
							else {
								this.status 		= 500;
								this.statusText 	= 'error';
							}
							self.done ( iceXHR );
    					} );

    					document.head.appendChild ( script );
	    			},

	    			/**
	    			 * 完成或中断后的处理
	    			 *
	    			 * @author JOU
	    			 * @time   2017-05-21T17:53:18+0800
	    			 * @param  {Object}         iceXHR  iceXHR自定义对象
	    			 */
	    			done : function ( iceXHR ) {

    					if ( options.dataType === 'JSONP' ) {

    						dataType = 'json';

    						if ( util.type ( window [ options.jsonpCallback ] ) !== 'function' ) {
    							this.status 	= 200;
    							this.statusText = 'success';
    							this.response 	= window [ options.jsonpCallback ];
    						}
    						else {
    							this.status 	= 500;
    							this.statusText = 'error';
    						}
    					}

    					complete ( iceXHR );
	    			},

	    			/**
	    			 * 请求中断处理
	    			 *
	    			 * @author JOU
	    			 * @time   2017-05-21T23:41:31+0800
	    			 */
	    			abort : function () {
	    				if ( script.parentNode ) {
	    					script.parentNode.removeChild ( script );
	    				}

	    				this.status 		= 0;
	    				this.statusText 	= this.abortText;

	    				util.type ( options.abort ) === 'function' && options.abort ( this.statusText );
	    			}
	    		};
	    	},

	    	// jsonp跨域请求
	    	jsonp : function ( options ) {

	    		var script, 
	    			scriptExtend 	= ajaxTransports.script ( options ),
	    			jsonpCallback 	= options.jsonpCallback = 'jsonpCallback' + Date.now ();

	    		window [ jsonpCallback ] = function ( result ) {
	    			window [ jsonpCallback ] = result;
	    		};

	    		options.data += ( ( options.data ? '&' : '' ) + 'callback=' + jsonpCallback );

	    		return {
	    			send : function ( options, iceXHR ) {
	    				scriptExtend.send ( options, iceXHR );
	    			},

	    			done : function ( iceXHR ) {
	    				scriptExtend.done ( iceXHR );
	    			},

	    			abort : function () {
	    				scriptExtend.abort ();
	    			}
	    		};
	    	},

	    	// 文件异步上传传送器，在不支持FormData的旧版本浏览器中使用iframe刷新的方法模拟异步上传
	    	upload : function () {

	    		var uploadFrame = document.createElement ( 'iframe' ),
	    			id 			= 'upload-iframe-unique-' + guid$ ();

	    			uploadFrame.setAttribute ( 'id', id );
	    			uploadFrame.setAttribute ( 'name', id );
	    			uploadFrame.style.position 	= 'absolute';
	    			uploadFrame.style.top 		= '9999px';
	    			uploadFrame.style.left 		= '9999px';
	    			( document.body || document.documentElement ).appendChild ( uploadFrame );

	    		return {

	    			/**
	    			 * 文件上传请求，在不支持FormData进行文件上传的时候会使用此方法来实现异步上传
	    			 * 此方法使用iframe来模拟异步上传
	    			 *
	    			 * @author JOU
	    			 * @time   2017-05-21T16:40:45+0800
	    			 * @param  {Object}         options ajax设置参数对象
	    			 * @param  {Object}         iceXHR  iceXHR自定义对象
	    			 */
	    			send : function ( options, iceXHR ) {
	    				var self 		= this,

	    					// 备份上传form元素的原有属性，当form提交后再使用备份还原属性
	    					backup 		= {
	    						action  : options.data.action  || '',
	    						method  : options.data.method  || '',
	    						enctypt : options.data.enctypt || '',
	    						target  : options.data.target  || '',
	    					};

	    				// 绑定回调
	    				event.on ( uploadFrame, 'load', function () {

	    					self.done ( iceXHR );
	    				}, false, true );

	    				// 设置form的上传属性
	    				options.data.setAttribute ( 'action', options.url );
	    				options.data.setAttribute ( 'method', 'POST');
	    				options.data.setAttribute ( 'target', id );

	    				// 当表单没有设置enctype时自行加上，此时需设置encoding为multipart/form-data才有效
	    				if ( options.data.getAttribute ( 'enctypt' ) !== 'multipart/form-data' ) {
	    					options.data.encoding = 'multipart/form-data';
	    				}

	    				options.data.submit ();

	    				// 还原form备份参数
	    				util.foreach ( backup, function ( val, attr ) {
	    					if ( val ) {
	    						options.data.setAttribute ( attr, val );
	    					}
	    					else {
	    						options.data.removeAttribute ( attr );
	    					}
	    				} );

	    			},

	    			/**
	    			 * 上传完成的处理，主要工作是获取返回数据，移除iframe
	    			 *
	    			 * @author JOU
	    			 * @time   2017-05-21T16:42:35+0800
	    			 * @param  {Object}                 iceXHR iceXHR自定义对象
	    			 */
	    			done : function ( iceXHR ) {

	    				// 获取返回数据
    					var child, entity,
    						doc 	= uploadFrame.contentWindow.document;
    					if ( doc.body ) {

    						this.status 	= 200;
    						this.statusText = 'success';

    						// 当mimeType为 text/javascript或application/javascript时，浏览器会将内容放在pre标签中
    						if ( ( child = doc.body.firstChild ) && child.nodeName.toUpperCase () === 'PRE' && child.firstChild ) {
    							this.response = child.innerHTML;
    						}
    						else {
    							this.response = doc.body.innerHTML;
    						}

    						// 如果response中包含转义符，则将它们转换为普通字符
    						if ( /&\S+;/.test (this.response) ) {
    							entity 	= {
    								lt 		: '<',
    								gt 		: '>',
    								nbsp 	: ' ',
    								amp 	: '&',
    								quot 	: '"'
    							};
									this.response = this.response.replace ( /&(lt|gt|nbsp|amp|quot);/ig, function ( all, t ) {
										return entity [ t ];
									} );
    						}
    					}

    					complete ( iceXHR );

	    				// 移除iframe
	    				uploadFrame.parentNode.removeChild (uploadFrame);
	    			},

	    			/**
	    			 * 请求中断处理，此时无法中断
	    			 *
	    			 * @author JOU
	    			 * @time   2017-05-21T23:42:09+0800
	    			 */
	    			abort : function () {}
	    		};
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

		var // 合并参数
			options 	= extendOptions ( arguments ),

			// 自定义xhr对象，用于统一处理兼容问题
			iceXHR 		= {

			// 请求传送器，根据不同的请求类型来选择不同的传送器进行请求
			transport : null,

			// 设置请求头
			setRequestHeader : function ( header, value ) {

				if ( !this.transport.completed ) {
					this.transport.headers = this.transport.headers || {};
					this.transport.headers [ header.toLowerCase () ] = value;
				}
			},

			// 获取返回头
			getResponseHeader : function ( header ) {

				var match;

				if ( this.transport.completed ) {
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
				return this.transport.completed ? this.transport.responseHeadersString : null;
			},

			// 设置mimeType
			overrideMimeType : function ( mimetype ) {
				if ( !this.transport.completed ) {
					options.mimetype = mimetype;
				}
			},

			// 请求超时触发
			abort : function ( statusText ) {
		        if ( this.transport ) {
		        	this.transport.abortText = statusText || 'abort';
		            this.transport.abort ();
		        }
			},

			// 绑定xhr回调事件
			addEventListener : function ( type, callback ) {
				if ( !this.transport.completed ) {
					this.transport.callbacks = this.transport.callbacks || {};
					this.transport.callbacks [ type ] = callback;
				}
			}
		};


		// 如果传入的data参数为数据对象，则将{k1: v1, k2: v2}转为以k1=v1&k2=v2
		if ( util.type ( options.data ) === 'object' ) {

			var args = [];

			// 判断是否为表单对象
			// 如果是则使用FormData来提交
			// 如果不支持FormData对象，则判断是否包含上传信息，如果不包含则将参数序列化出来post提交，如果包含，则使用iframe刷新的方法实现
			if ( options.data.nodeName && options.data.nodeName.toUpperCase () === 'FORM' ) {

				// 如果是表单对象则获取表单的提交方式，默认为POST
				options.method = options.data.getAttribute ( 'method' ) || 'POST';

				// 当data为form对象时，如果也提供了src参数则优先使用src参数
				options.url    = options.data.getAttribute ( 'src' ) || options.url;

				// 如果支持FormData则使用此对象进行数据提交
				try {
					options.data = new FormData ( options.data );
				} catch ( e ) {

					var hasFile,
						formArray 	= slice.call ( options.data.elements );

					// 判断表单中是否含有上传文件
					util.foreach ( formArray, function ( item ) {
						if ( item.type === 'file' ) {
							hasFile = true;
							return false;
						}
						else if ( item.name && !item.getAttribute ( 'disabled' ) && rsubmittable.test( item.nodeName ) && !rsubmitterTypes.test( item.type ) && ( item.checked || !rcheckableType.test( item.type ) ) ) {

							args.push ( item.name + '=' + item.value.replace ( rCRLF, '\r\n' )  );
						}
					} );

					if ( !hasFile ) {
						options.data = args.join ( '&' );
					}
				}
			}
			else {
				util.foreach ( options.data, function ( data, index ) {
					args.push ( index + '=' + data );
				} );

				options.data = args.join ( '&' );
			}
		}

		// 将method字符串转为大写以统一字符串为大写，以便下面判断
		// 再将统一后的method传入查看是不是POST提交
		options.hasContent 	= !rnoContent.test ( options.method = options.method.toUpperCase () );

		// 将dataType字符串转为大写
		// 如传入的dataType不符合rtype定义的，则默认为TEXT
		options.dataType 	= rtype.test ( options.dataType = ( options.dataType || '' ).toUpperCase () ) ? options.dataType : 'TEXT';

		// 修正timeout参数
		options.timeout 	= options.timeout > 0 ? options.timeout : 0;


		// 是否跨域
		if ( !options.crossDomain ) {
			var originAnchor 	= document.createElement ( 'a' ),
				urlAnchor 	 	= document.createElement ( 'a' );

			originAnchor.href 	= location.href;
			urlAnchor.href 		= options.url;
			try {
				options.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
									urlAnchor.protocol + "//" + urlAnchor.host;
			} catch(e) {
				options.crossDomain = true;
			}
		}


		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		//返回Promise对象
		return new Promise ( function ( resolve, reject ) {

			// 获取传送器名
			// 根据上面判断，上传文件时如果支持FormData则使用此来实现上传，所以当data为form对象时，表示不支持FormData上传，需使用upload传送器实现上传
			if ( options.data.nodeName && options.data.nodeName.toUpperCase () === 'FORM' ) {
				transportName = 'upload';
			}

			// 如果dataType为script但async为false时，使用xhr来实现同步请求
			else if ( options.dataType === 'SCRIPT' && options.async === false ) {
				transportName = 'xhr';
			}
			else {
				transportName = options.dataType.toLowerCase ();
			}

			// 获取传送器对象，当没有匹配到传送器时统一使用xhr
			iceXHR.transport 	= ( ajaxTransports [ transportName ] ||  ajaxTransports.xhr  ) ( options );

			// 小写dataType
			iceXHR.transport.dataType = options.dataType.toLowerCase ();

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

			// 设置Content-Type
	        if ( options.contentType ) {
	            iceXHR.setRequestHeader ( 'Content-Type', options.contentType );
	        }

	        // 设置Accept
	        iceXHR.setRequestHeader ( 'Accept', accepts [ iceXHR.transport.dataType ] ? accepts [ iceXHR.transport.dataType ] + ', */*; q=0.01' : accepts [ '*' ] );

	        // haders里面的首部
	        for ( var i in options.headers ) {
	            iceXHR.setRequestHeader ( i, options.headers [ i ] );
	        }

	        // 调用请求前回调函数
	        if ( util.type ( options.beforeSend ) === 'function' ) {
	        	options.beforeSend ( iceXHR, options );
	        }

	        // 将事件绑定在iceXHR中
			util.foreach ( [ 'complete', 'success', 'error' ], function ( callbackName ) {

				// 如果是success或error回调，则使用resolve或reject代替
				if ( callbackName === 'success' ) {
					options [ callbackName ] = options [ callbackName ] || resolve;
				}
				else if ( callbackName === 'error' ) {
					options [ callbackName ] = options [ callbackName ] || reject;
				}

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