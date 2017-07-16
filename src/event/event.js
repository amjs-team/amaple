import map from "./eventMap";
import cache from "../cache/cache";
import { type, foreach, guid, isEmpty } from "../func/util";
import { attr } from "../func/node";
import { rword } from "../var/const";
import check from "../check";
import correctParam from "../correctParam";

let	// 存储元素型自定义事件回调
	events = {},

	// 创建事件触发对象时，根据事件类型来创建不同事件对象
	eventMap = map,

	// 特殊事件的判断函数替代事件
	special = {

		// DOMContentLoaded事件的判断方式
		DOMContentLoaded: function () {
			return !!document.addEventListener;
		},
	},
	eventProxy, _valueOf, ttype, tlistener, i, _this, _listeners;

/**
	handler ( e: EventObject )

	Return Type:
	void

	Description:
	所有事件绑定的回调函数
	将根据事件触发DOM和事件类型调用相应真实的回调

	URL doc:
	http://icejs.org/######
*/
function handler ( e ) {
	_listeners = eventAccess ( this, e.type );
	if ( type ( _listeners ) === "array" && _listeners.length > 0 ) {

		foreach ( _listeners, listener => {
			type ( listener ) === "function" && listener.call ( this, e );

			// 如果该回调函数只执行一次则移除
			if ( listener.once === true ) {
				eventProxy.remove ( this, e.type, listener, listener.useCapture );
			}
		} );
	}
}


/**
	eventAccess ( elem: DOMObject, type: String, listener: Function, remove?: Boolean )

	Return Type:
	any
	缓存数据

	Description:
	获取或保存事件缓存
	只有在保存事件缓存时，如果elem的valueOf还未经过改造才需对它进行改造
	remove参数为true时移除事件缓存

	URL doc:
	http://icejs.org/######
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

/**
	Plugin event

	Description:
	事件绑定与事件触发对象
	可在节点对象上绑定常规与自定义事件，也可无节点绑定事件，由event.emit(type)手动触发
	常规事件一般在交互过程中触发，自定义事件需调用event.emit(elem, type)手动触发

	URL doc:
	http://icejs.org/######
*/
export default {

	/**
		support ( type: String, elem?: DOMObject )
	
		Return Type:
		Boolean
		是否支持type事件
	
		Description:
		判断元素是否支持指定事件
	
		URL doc:
		http://icejs.org/######
	*/
	support ( type, elem = document.createElement ( "div" ) ) {
		let support;

		if ( type ( special [ type ] ) === "function" ) {
			support = special [ type ] ();
		}
		else {
			type = "on" + type;
			support = type in elem;

			if ( !support && elem.setAttribute ) {
				attr ( elem, type, "" );

				support = type ( elem [ type ] ) === "function";
			}
		}

		return support;
	},

	/**
		on ( elem: DOMObject, types: String, listener: Function, useCapture?: Boolean, once?: Boolean )
	
		Return Type:
		void
	
		Description:
		以兼容模式绑定事件，当有多个绑定事件时触发后将顺序执行多个绑定事件
		绑定事件的节点类型不为文本节点（nodeType = 3）或注释节点（nodeType = 8）
		当在节点上绑定事件时，节点只绑定调用函数，而所有的事件绑定则存储在events私有对象上，节点对象上将保存对事件key的引用
	
		URL doc:
		http://icejs.org/######
	*/
	on ( elem, types, listener, useCapture, once ) {

		// 纠正参数
		correctParam ( elem, types, listener, useCapture ).to ( "object", "string" ).done ( args => {
			elem = args [ 0 ];
			types = args [ 1 ];
			listener = args [ 2 ];
			useCapture = args [ 3 ];
		} );

		check ( types ).type ( "string" ).ifNot ( "function event.on:types", "types参数类型必须为string" ).do ();
		check ( listener ).type ( "function" ).ifNot ( "function event.on:listener", "listener参数类型必须为function" ).do ();
		if ( elem ) {
			check ( elem.nodeType ).notBe ( 3 ).notBe ( 8 ).ifNot ( "function event.on:elem", "elem参数不能为文本节点或注释节点" ).do ();
		}

		// 给监听回调添加guid，方便移除事件
		if ( !listener.guid ) {
			listener.guid = guid ();
		}

		// 如果once为true，则该回调只执行一次
		if ( once === true ) {
			listener.once 		= true;
			listener.useCapture = !!useCapture;
		}

		let events;

		// 多个事件拆分绑定
		( types || "" ).replace ( rword, type => {

			if ( elem ) {
				events = elem.valueOf [ type ] = elem.valueOf [ type ] || [];
				events.push ( listener );
			}
			else {
				cache.pushEvent ( type, listener );
			}

			// 元素对象存在，且元素支持浏览器事件时绑定事件，以方便浏览器交互时触发事件
			// 元素不支持时属于自定义事件，需手动调用event.emit()触发事件
			// IE.version >= 9
			if ( elem && this.support ( type, elem ) && elem.addEventListener ) {
				elem.addEventListener ( type, handler, !!useCapture );
			}
		} );
	},


	/**
		remove ( elem: DOMObject, types: String, listener: Function, useCapture: Boolean )
	
		Return Type:
		void
	
		Description:
		以兼容模式解绑事件，可一次解绑多个类型的事件
	
		URL doc:
		http://icejs.org/######
	*/
	remove ( elem, types, listener, useCapture ) {

		// 纠正参数
		correctParam ( elem, types, listener, useCapture ).to ( "object", "string" ).done ( args => {
			elem = args [ 0 ];
			types = args [ 1 ];
			listener = args [ 2 ];
			useCapture = args [ 3 ];
		} );

		if ( elem ) {
			check ( elem.nodeType ).notBe ( 3 ).notBe ( 8 ).ifNot ( "function event.on:elem", "elem参数不能为文本节点或注释节点" ).do ();			
		}
		check ( types ).type ( "string" ).ifNot ( "function event.on:types", "types参数类型必须为string" ).do ();
		check ( listener ).type ( "function" ).ifNot ( "function event.on:listener", "listener参数类型必须为function" ).do ();

		if ( elem && elem.valueOf ) {
			return false;
		}

		( types || "" ).replace ( rword, type => {

			if ( isEmpty ( eventAccess ( elem, type, listener, true ) ) && elem && this.support ( type, elem ) && elem.removeEventListener ) {
				elem.removeEventListener ( type, handler, !!useCapture );	
			}
		} );
	},

	/**
		emit ( elem: DOMObject, types: String )
	
		Return Type:
		void
	
		Description:
		触发事件
	
		URL doc:
		http://icejs.org/######
	*/
	emit ( elem, types ) {

		// 纠正参数
		let args = correctParam ( elem, types ).to ( "object", "string" );
		elem = args [ 0 ];
		types = args [ 1 ];

		check ( elem.nodeType ).notBe ( 3 ).notBe ( 8 ).ifNot ( "function event.emit:elem", "elem参数不能为文本节点或注释节点" ).do ();
		check ( types ).type ( "string" ).ifNot ( "function event.emit:types", "types参数类型必须为string" ).do ()

		( types || "" ).replace ( rword, type => {
			if ( this.support ( type, elem ) ) {

				// 使用creaeEvent创建事件
				let e = document.createEvent ( eventMap [ type ] || "CustomEvent" );
				e.initEvent ( type, true, false );

				document.dispatchEvent ( e );
				
			}
			else {
				handler.call ( elem, { type: type } );
			}
		} );
	}
};