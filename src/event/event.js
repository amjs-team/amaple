"use strict";

/* 声明此文件在jshint检测时的变量不报 "variable" is not defined. */
/* globals document,
	util,
	splice,
	slice,
	util.isWindow,
	argErr,
	replace,
	
 */

/* 声明此文件在jshint检测时的变量不报 "variable" is defined but never used */
/* exported event,
 */

/**
 * 事件绑定与手动触发对象，可在节点对象上绑定常规与自定义事件（常规事件一般在交互过程中触发，自定义事件需调用event.emit(elem, type)手动触发），也可无节点绑定事件，由event.emit(type)手动触发
 * 
 * @type {Object}
 */
var event = (function () {

	var	/** @type {Object} 存储元素型自定义事件回调 */
		events 		= {},

		rword 		= /\S+/g,

		/** @type {Object} 特殊事件的判断函数、替代事件 */
		special 	= {

			// DOMContentLoaded事件的判断方式
			DOMContentLoaded: function () {
				return !!document.addEventListener;
			},
		},

		/** @type {Object} 创建事件触发对象时，根据事件类型来创建不同事件对象 */
		eventMap 	= {
			load 	: "HTMLEvents",
			unload 	: "HTMLEvents",
			abort 	: "HTMLEvents",
			error 	: "HTMLEvents",
			select 	: "HTMLEvents",
			change 	: "HTMLEvents",
			submit 	: "HTMLEvents",
			reset 	: "HTMLEvents",
			focus 	: "HTMLEvents",
			blur 	: "HTMLEvents",
			resize 	: "HTMLEvents",
			scroll 	: "HTMLEvents",


			keypress: "KeyboartEvent",
			keyup 	: "KeyboartEvent",
			keydown : "KeyboartEvent",


			contextmenu : "MouseEvents",
			click 		: "MouseEvents",
			dbclick 	: "MouseEvents",
			mouseout 	: "MouseEvents",
			mouseover 	: "MouseEvents",
			mouseenter 	: "MouseEvents",
			mouseleave 	: "MouseEvents",
			mousemove 	: "MouseEvents",
			mousedown 	: "MouseEvents",
			mouseup 	:"MouseEvents",
			mousewheel 	:"MouseEvents"
		},

		eventProxy, _valueOf, ttype, tlistener, i, _this, _listeners;

		/**
		 * 所有事件绑定的回调函数
		 * 将根据事件触发DOM和事件类型调用相应真实的回调
		 *
		 * @author JOU
		 * @time   2017-04-29T11:35:10+0800
		 * @param  {Event}                 e 事件触发时的event对象
		 */
		function handler ( e ) {
			
			_this = this;

			_listeners = eventAccess ( _this, e.type );
			if ( util.type ( _listeners ) === "array" && _listeners.length > 0 ) {

				util.foreach ( _listeners, function ( listener ) {
					util.type ( listener ) === "function" && listener.call ( _this, e );

					// 如果该回调函数只执行一次则移除
					if ( listener.once === true ) {
						eventProxy.remove ( _this, e.type, listener, listener.useCapture );
					}
				} );
			}
		}

		/**
		 * 获取或保存事件缓存
		 * 只有在保存事件缓存时，如果elem的valueOf还未经过改造才需对它进行改造
		 *
		 * @author JOU
		 * @time   2017-04-29T12:35:39+0800
		 * @param  {Object}                 elem 	 元素对象
		 * @param  {String}                 type 	 事件类型
		 * @param  {Function}               listener 事件回调函数
		 * @param  {Boolean}                listener 是否为删除事件缓存
		 * @return {Multi}                           缓存体
		 */
		function eventAccess ( elem, type, listener, remove ) {

			//////////////////////////////////
			//////////////////////////////////
			//////////////////////////////////
			function accessInner ( eventsData, elem, type, listener, remove ) {

				ttype 		= util.type ( type );
				tlistener 	= util.type ( listener );

				if ( ttype === "string" ) {
					if ( tlistener === "function" ) {

						// 保存事件缓存
						if ( !remove ) {
							eventsData [ type ] = eventsData [ type ] || [];
							eventsData [ type ].push ( listener );
						}

						//移除事件缓存
						else {
							// 获取事件监听回调数组
							if ( i = eventsData [ type ].length > 0 ) {

								// 符合要求则移除事件回调
								while ( --i > -1 ) {
									if ( eventsData [ type ] [ i ] && eventsData [ type ] [ i ].guid === listener.guid ) {
										splice.call ( eventsData [ type ], i, 1 );
									}
								}

								// 如果该事件的监听回调为空时，则解绑事件并删除监听回调数组
								if ( eventsData [ type ].length === 0 ) {
									delete eventsData [ type ];
								}

							}
						}

						return eventsData;
					}

					// 获取事件缓存
					else {
						return eventsData [ type ];
					}
				}
				else {
					return eventsData;
				}
			}
			/////////////////////////////////////
			/////////////////////////////////////
			/////////////////////////////////////
			/////////////////////////////////////

			// 找一个外部无法访问的变量来控制重写过的valueOf的内部分支处理
			if ( elem ) {

				if ( elem.valueOf.override !== true ) {

					// 如果还没重写并且是查询或移除，则直接根据是否传入type来返回空数组或空对象
					// 有type参数时查询type事件下的所有回调函数，是数组
					// 没有type参数时查询elem下所有事件类型的回调函数，是对象
					if ( !listener || remove) {
						return type ? [] : {};
					}

					var elemEvents 	= {};
					_valueOf 		= elem.valueOf;

					// 重写元素对象的valueOf方法
					Object.defineProperty ( elem, "valueOf", {
						value: function () {
							if ( arguments.length > 0 ) {

								return accessInner.apply ( null, [ elemEvents ].concat ( slice.call ( arguments ) ) );
							}
							else {
								return _valueOf.call ( elem );
							}
						}
					} );

					// 用于判断是否重写过
					elem.valueOf.override = true;

				}
				
				return elem.valueOf ( elem, type, listener, remove );
			}
			else {
				return accessInner ( events, null, type, listener, remove );
			}
		}

		eventProxy 	= {

			/**
			 * 判断元素是否支持制定事件
			 *
			 * @author JOU
			 * @time   2017-04-27T20:08:08+0800
			 * @param  {String}                 type 事件名称
			 * @param  {Object}                 elem 侦测元素
			 * @return {Boolean}                     是否支持，是则true，否则false
			 */
			support: function ( type, elem ) {

				elem = elem || document.createElement ( "div" );

				var support;

				if ( util.type ( special [ type ] ) === "function" ) {
					support = special [ type ]();
				}
				else {
					type 	= "on" + type;
					support = type in elem;

					if ( !support && elem.setAttribute ) {
						elem.setAttribute ( type, "" );

						support = util.type ( elem [ type ] ) === "function";
					}
				}

				return support;
			},

			/**
			 * 以兼容模式绑定事件，当有多个绑定事件时触发后将顺序执行多个绑定事件
			 *
			 * 绑定事件的节点类型不为文本节点（nodeType = 3）或注释节点（nodeType = 8）
			 * 当在节点上绑定事件时，节点只绑定调用函数，而所有的事件绑定则存储在events私有对象上，节点对象上将保存对事件key的引用
			 *
			 * @author JOU
			 * @time   2017-04-26T20:35:24+0800
			 * @param  {Object}                 elem  	   事件绑定元素
			 * @param  {string}                 types      绑定事件名称，多个名称可使用空格隔开
			 * @param  {Function}               listener   事件监听回调
			 * @param  {Boolean}                useCapture false（默认）- 事件句柄在冒泡阶段执行，true - 事件句柄在捕获阶段执行
			 * @param  {Boolean}                once       是否触发一次就移除事件
			 */
			on : function ( elem, types, listener, useCapture, once ) {

				if ( !util.isWindow ( elem ) && ( util.type ( elem ) !== "object" || !elem.nodeType ) ) {

					// 纠正参数
					once 		= useCapture;
					useCapture 	= listener;
					listener 	= types;
					types 		= elem;
					elem 		= undefined;
				}
				if ( elem && ( elem.nodeType === 3 || elem.nodeType === 8 ) ) {
					throw argErr ( "function event.on:elem", "elem参数不能为文本节点或注释节点" );
				}
				if ( util.type ( types ) !== "string" ) {
					throw argErr ( "function event.on:types", "types参数类型必须为string" );
				}
				if ( util.type ( listener ) !== "function" ) {
					throw argErr ( "function event.on:listener", "listener参数类型必须为function" );
				}

				// 给监听回调添加guid，方便移除事件
				if ( !listener.guid ) {
					listener.guid = guid$ ();
				}

				// 如果once为true，则该回调只执行一次
				if ( once === true ) {
					listener.once 		= true;
					listener.useCapture = useCapture;
				}

				// 多个事件拆分绑定
				replace.call ( types || "", rword, function ( type ) {

					eventAccess ( elem, type, listener );

					// 元素对象存在，且元素支持浏览器事件时绑定事件，以方便浏览器交互时触发事件
					// 元素不支持时属于自定义事件，需手动调用event.emit()触发事件
					// IE.version >= 9
					if ( elem && eventProxy.support ( type, elem ) && elem.addEventListener ) {
						elem.addEventListener ( type, handler, !!useCapture );
					}
				} );
			},

			/**
			 * 以兼容模式解绑事件，可一次解绑多个类型的事件
			 *
			 * @author JOU
			 * @time   2017-04-26T23:37:14+0800
			 * @param  {Object}                 elem       事件解绑元素
			 * @param  {String}                 types      绑定事件名称，多个名称可使用空格隔开
			 * @param  {Function}               listener   事件监听回调
			 * @param  {Boolean}                useCapture false（默认）- 事件句柄在冒泡阶段执行，true - 事件句柄在捕获阶段执行
			 */
			remove : function ( elem, types, listener, useCapture ) {

				if ( !util.isWindow ( elem ) && ( util.type ( elem ) !== "object" || !elem.nodeType ) ) {

					// 纠正参数
					useCapture 	= listener;
					listener 	= types;
					types 		= elem;
					elem 		= undefined;
				}
				if ( elem.nodeType && ( elem.nodeType === 3 || elem.nodeType === 8 ) ) {
					throw argErr ( "function event.on:elem", "elem参数不能为文本节点或注释节点" );
				}
				if ( util.type ( types ) !== "string" ) {
					throw argErr ( "function event.remove:types", "types参数类型必须为string" );
				}
				if ( util.type ( listener ) !== "function" ) {
					throw argErr ( "function event.remove:listener", "listener参数类型必须为function" );
				}

				if ( util.isEmpty ( eventAccess ( elem ) ) ) {
					return;
				}

				replace.call ( types || "", rword, function ( type ) {

					if ( util.isEmpty ( eventAccess ( elem, type, listener, true ) ) && elem && eventProxy.support ( type, elem ) && elem.removeEventListener ) {
						elem.removeEventListener ( type, handler, !!useCapture );	
					}
				} );
			},

			/**
			 * 触发事件
			 *
			 * @author JOU
			 * @time   2017-04-26T23:45:55+0800
			 * @param  {Object}                 elem  事件触发元素
			 * @param  {String}                 types 触发事件名称，多个名称可使用空格隔开
			 */
			emit : function ( elem, types ) {

				if ( util.type ( elem ) === "string" ) {

					// 纠正参数
					types 		= elem;
					elem 		= undefined;
				}

				if ( elem && ( elem.nodeType === 3 || elem.nodeType === 8 ) ) {
					throw argErr ( "function event.emit:elem", "elem参数不能为文本节点或注释节点" );
				}
				if ( util.type ( types ) !== "string" ) {
					throw argErr ( "function event.emit:types", "types参数类型必须为string" );
				}

				replace.call ( types || "", rword, function ( type ) {
					if ( event.support ( type, elem ) ) {

						// 使用creaeEvent创建事件
						var e = document.createEvent ( eventMap [ type ] || "CustomEvent" );
						e.initEvent ( type, true, false );

						document.dispatchEvent ( e );
						
					}
					else {
						handler.call ( elem, { type: type } );
					}
				} );
			}
		};


	return eventProxy;
} ) ();