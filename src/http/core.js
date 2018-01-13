import { extend, type, foreach, isPlainObject } from "../func/util";
import { attr, serialize } from "../func/node";
import event from "../event/core";
import correctParam from "../correctParam";
import Promise from "../promise/core";
import AmXMLHttpRequest from "./AmXMLHttpRequest";
import xhr from "./transport/xhr";
import script from "./transport/script";
import jsonp from "./transport/jsonp";
import upload from "./transport/upload";

/**
	Plugin http
	( method: String )

	Description:
	ajax请求外层包裹函数，该函数返回ajax具体实现的函数（以下简称此返回的函数为ajax函数）
	ajax函数传入的参数与默认参数进行合并操作（开发者参数没有定义的将使用默认参数）
	defaultOptions = 
	{
		method 			: "GET",		// 请求类型，默认为GET，可设置参数为{GET/POST}
	  	url 			: "",			// 请求地址，默认为空
	  	data 			: "",     		// 请求参数，默认为空
	   	async 			: true,			// 是否异步请求，默认为异步，可设置参数为{true/false}
	   	cache 			: true,			// 开启缓存，默认开启，可设置参数为{true/false}
	   	contentType 	: "application/x-www-form-urlencoded; charset=UTF-8",  // 请求为post时设置的Content-Type，一般传入此参数
	   	dataType 		: "TEXT"		// 返回的数据类型，默认文本，可设置参数为{TEXT/JSON/SCRIPT/JSONP}
	}
	此外层包裹方法定义了许多仅供ajax函数使用的内部固定变量，只需编译一次且只能由ajax函数访问即可，所以使用了外层包裹的方式来设计此函数，http中的request、get、post方法调用此外层包裹方法并传入不同参数来获取对应的ajax函数

	URL doc:
	http://amaple.org/######
*/
function request ( method ) {

	const
		// 相关正则表达式
		r20 			= /%20/g,
		rhash 			= /#.*$/,
		rts 			= /([?&])_=[^&]*/,
		rquery 			= /\?/,
		rnoContent 		= /^(?:GET|HEAD)$/,

		// ajax支持的返回类型正则表达式
		rtype 			= /^(?:TEXT|JSON|SCRIPT|JSONP)$/,

		accepts 		= {
			"*" 		: ["*/"] + ["*"], // 避免被压缩
			text 		: "text/plain",
			html 		: "text/html",
			xml 		: "application/xml, text/xml",
			json 		: "application/json, text/javascript"
		},

	    // 默认参数对象初始化
	    // ajax默认参数对象初始化
	    defaultOptions = {
	    	method 		: "GET",
	    	url 		: "",
	    	data 		: "",     
	    	async 		: true,
	    	cache 		: true,
	    	contentType : "application/x-www-form-urlencoded; charset=UTF-8",
	    	dataType 	: "TEXT",
	    	headers 	: {}
	    },

	    
	    // 返回合并后的参数对象，参数对象的合并根据http.get、http.post、http.request请求方法进行区分
	    extendOptions 	= ( function ( method ) {

	    	return function ( options ) {

	    		// request请求时，参数肯定是一个对象，直接返回
	    		if ( method ) {

	    			let
	    				url 		= options [ 0 ],
	    				data 		= options [ 1 ],
	    				callback 	= options [ 2 ],
	    				dataType 	= options [ 3 ];

	    			// 纠正参数
	    			// 1、如果没有传入data，则将callback的值给dataType，将data的值给callback，data设为undefined，
	    			// 2、如果没有传入data和dataType，将data的值给callback，data设为undefined
	    			correctParam ( data, callback, dataType ).to ( [ /=/, "object" ], "function", rtype ).done ( function () {
                    	data = this.$1;
                    	callback = this.$2;
                    	dataType = this.$3;
                    } );

	    			// get请求参数初始化
	    			params = { url, data, success : callback, dataType, method };
	    		}
	    		else {
	    			params = options [ 0 ];
	    		}

	    		// 合并参数
	    		return extend ( {}, defaultOptions, params );
	    	};
	    } ) ( method ),

		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		// ajax传送器，根据数据类型
	    ajaxTransports = { xhr, script, jsonp, upload };
	

	let	// GET、POST时的默认参数
		url, args, callback, dataType, 

		transportName,

		params, nohashUrl, hash;
	
	/**
		[anonymous] ()
	
		Return Type:
		Object
		Promise对象
	
		Description:
		ajax异步请求方法实现
	
		URL doc:
		http://amaple.org/######
	*/
	return ( ...args ) => {

		let // 合并参数
			options = extendOptions ( args ),
            data = options.data,

			// 自定义xhr对象，用于统一处理兼容问题
			amXHR = new AmXMLHttpRequest ();


		// 如果传入的data参数为数据对象，则将{k1: v1, k2: v2}转为以k1=v1&k2=v2
		if ( type ( data ) === "object" ) {

			// 判断是否为表单对象
			// 如果是则使用FormData来提交
			// 如果不支持FormData对象，则判断是否包含上传信息，如果不包含则将参数序列化出来post提交，如果包含，则使用iframe刷新的方法实现
			if ( data.nodeName && data.nodeName.toUpperCase () === "FORM" ) {

				// 如果是表单对象则获取表单的提交方式，默认为POST
				options.method = attr ( data, "method" ) || "POST";
				
				// 当data为form对象时，如果也提供了src参数则优先使用src参数
				options.url    = attr ( data, "src" ) || options.url;

				// 如果支持FormData则使用此对象进行数据提交
				try {
					options.data = new FormData ( data );
				}
				catch ( e ) {

					let hasFile;

					// 判断表单中是否含有上传文件
					foreach ( data.elements.slice (), inputItem => {
						if ( inputItem.type === "file" ) {
							hasFile = true;
							return false;
						}
					} );

					if ( !hasFile ) {

						// 如果表单中不包含上传文件，则序列化表单数据以供xhr提交
						options.data = serialize ( data );
					}
				}
			}

			if ( isPlainObject ( options.data ) ) {
				let args = [];
				foreach ( options.data, ( _data, index ) => {
					args.push ( index + "=" + _data );
				} );

				options.data = args.join ( "&" );
			}
		}

		// 将method字符串转为大写以统一字符串为大写，以便下面判断
		// 再将统一后的method传入查看是不是POST提交
		options.hasContent = !rnoContent.test ( options.method = options.method.toUpperCase () );

		// 将dataType字符串转为大写
		// 如传入的dataType不符合rtype定义的，则默认为TEXT
		options.dataType = rtype.test ( options.dataType = ( options.dataType || "" ).toUpperCase () ) ? options.dataType : "TEXT";

		// 修正timeout参数
		options.timeout = options.timeout > 0 ? options.timeout : 0;


		// 是否跨域
		if ( !options.crossDomain ) {
			let originAnchor 	= document.createElement ( "a" ),
				urlAnchor 	 	= document.createElement ( "a" );

			originAnchor.href 	= location.href;
			urlAnchor.href 		= options.url;
			try {
				options.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
									urlAnchor.protocol + "//" + urlAnchor.host;
			}
			catch ( e ) {
				options.crossDomain = true;
			}
		}


		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		//返回Promise对象
		return new Promise ( ( resolve, reject ) => {

			// 获取传送器名
			// 根据上面判断，上传文件时如果支持FormData则使用此来实现上传，所以当data为form对象时，表示不支持FormData上传，需使用upload传送器实现上传
			if ( options.data.nodeName && options.data.nodeName.toUpperCase () === "FORM" ) {
				transportName = "upload";
			}

			// 如果dataType为script但async为false时，使用xhr来实现同步请求
			else if ( options.dataType === "SCRIPT" && options.async === false ) {
				transportName = "xhr";
			}
			else {
				transportName = options.dataType.toLowerCase ();
			}
			
			// 获取传送器对象，当没有匹配到传送器时统一使用xhr
			amXHR.transport = ( ajaxTransports [ transportName ] ||  ajaxTransports.xhr  ) ( options );

			// 小写dataType
			amXHR.transport.dataType = options.dataType.toLowerCase ();

			// 当请求为GET或HEAD时，拼接参数和cache为false时的时间戳
			if ( !options.hasContent ) {
				nohashUrl = options.url.replace ( rhash, "" );

				// 获取url中的hash
				hash = options.url.slice ( nohashUrl.length );

				// 拼接data
				nohashUrl += options.data ? ( rquery.test ( nohashUrl ) ? "&" : "?" ) + options.data : "";

				// 处理cache参数，如果为false则需要在参数后添加时间戳参数
				nohashUrl = nohashUrl.replace ( rts, "" );
				nohashUrl += options.cache === false ? ( rquery.test ( nohashUrl ) ? "&" : "?" ) + "_=" + Date.now () : "";

				options.url = nohashUrl + ( hash || "" );
			}
			else if ( options.data && type ( options.data ) === "string" && ( options.contentType || "" ).indexOf ( "application/x-www-form-urlencoded" ) === 0) {
				options.data = options.data.replace ( r20, "+" );
			}

			// 设置Content-Type
	        if ( options.contentType ) {
	            amXHR.setRequestHeader ( "Content-Type", options.contentType );
	        }

	        // 设置Accept
	        amXHR.setRequestHeader ( "Accept", accepts [ amXHR.transport.dataType ] ? accepts [ amXHR.transport.dataType ] + ", */*; q=0.01" : accepts [ "*" ] );

	        // haders里面的首部
	        foreach ( options.headers, ( header, key ) => {
	            amXHR.setRequestHeader ( key, header );
	        } );

	        // 调用请求前回调函数
	        if ( type ( options.beforeSend ) === "function" ) {
	        	options.beforeSend ( amXHR, options );
	        }

	        // 将事件绑定在amXHR中
			foreach ( [ "complete", "success", "error" ], callbackName => {

				// 如果是success或error回调，则使用resolve或reject代替
				if ( callbackName === "success" ) {
					options [ callbackName ] = options [ callbackName ] || resolve;
				}
				else if ( callbackName === "error" ) {
					options [ callbackName ] = options [ callbackName ] || reject;
				}

				amXHR.addEventListener ( callbackName, options [ callbackName ] );
			} );

			// 处理超时
	        if ( options.async && options.timeout > 0 ) {
	            amXHR.transport.timeoutID = setTimeout ( () => {
	                amXHR.abort ( "timeout" );
	            }, options.timeout );
	        }

			amXHR.transport.send ( options, amXHR );
		} );
	};
}


// http请求插件方法构造
export default {
	
	request: request (),

	/**
		get ( url: String, args?: String|Object, callback?: Function, dataType?: String )
	
		Return Type:
		Object
		Promise对象
	
		Description:
		ajax GET请求，内部调用request方法实现
	
		URL doc:
		http://amaple.org/######
	*/
	get : request ( "GET" ),

	/**
		post ( url: String, args?: String|Object, callback?: Function, dataType?: String )
	
		Return Type:
		Object
		Promise对象
	
		Description:
		ajax POST请求，内部调用request方法实现
	
		URL doc:
		http://amaple.org/######
	*/
	post : request ( "POST" ),
	
	// onrequest ( target, callback ) {
    	
 //    },
	
	// oncomplete ( target, callback ) {
    	
 //    },
	
	// onsuccess ( target, callback ) {
    	
 //    },
	
	// onerror ( target, callback ) {
    	
 //    },
	
	// onabort ( target, callback ) {
    	
 //    },
	
	// onprogress ( target, callback ) {
    	
 //    },
	
	// onuploadprogress ( target, callback ) {
    	
 //    },
};