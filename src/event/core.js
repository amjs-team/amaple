import eventMap from "./eventMap";
import cache from "../cache/core";
import { type, foreach, guid, isEmpty, isPlainObject } from "../func/util";
import { attr } from "../func/node";
import { rword } from "../var/const";
import check from "../check";
import correctParam from "../correctParam";

let	expando = "eventExpando" + Date.now (),

	// 特殊事件的判断函数替代事件
	special = {

		// DOMContentLoaded事件的判断方式
		DOMContentLoaded: function () {
			return !!document.addEventListener;
		},
	};

/**
	handler ( e: EventObject )

	Return Type:
	void

	Description:
	所有事件绑定的回调函数
	将根据事件触发DOM和事件类型调用相应真实的回调

	URL doc:
	http://amaple.org/######
*/
function handler ( e ) {
	let _listeners = isPlainObject ( this )  
		? cache.getEvent ( e.type )
		: this [ expando ] ? this [ expando ] [ e.type ] : [];

	foreach ( _listeners || [], listener => {
		listener.call ( this, e );

		// 如果该回调函数只执行一次则移除
		if ( listener.once === true ) {
			handler.event.remove ( this, e.type, listener, listener.useCapture );
		}
	} );
}

/**
	Plugin event

	Description:
	事件绑定与事件触发对象
	可在节点对象上绑定常规与自定义事件，也可无节点绑定事件，由event.emit(type)手动触发
	常规事件一般在交互过程中触发，自定义事件需调用event.emit(elem, type)手动触发

	URL doc:
	http://amaple.org/######
*/
export default {

	/**
		support ( eventType: String, elem?: DOMObject )
	
		Return Type:
		Boolean
		是否支持type事件
	
		Description:
		判断元素是否支持指定事件
	
		URL doc:
		http://amaple.org/######
	*/
	support ( eventType, elem = document.createElement ( "div" ) ) {
		let support;

		if ( type ( special [ eventType ] ) === "function" ) {
			support = special [ eventType ] ();
		}
		else {
			eventType = "on" + eventType;
			support = eventType in elem;

			if ( !support && elem.setAttribute ) {
				attr ( elem, eventType, "" );

				support = type ( elem [ eventType ] ) === "function";
				attr ( elem, eventType, null );
			}
		}

		return support;
	},

	/**
		on ( elem?: DOMObject, types: String, listener: Function, useCapture?: Boolean, once?: Boolean )
	
		Return Type:
		void
	
		Description:
		以兼容模式绑定事件，当有多个绑定事件时触发后将顺序执行多个绑定事件
		绑定事件的节点类型不为文本节点（nodeType = 3）或注释节点（nodeType = 8）
		当在节点上绑定事件时，节点只绑定调用函数，而所有的事件绑定则存储在events私有对象上，节点对象上将保存对事件key的引用
	
		URL doc:
		http://amaple.org/######
	*/
	on ( elem, types, listener, useCapture, once ) {

		// 纠正参数
		correctParam ( elem, types, listener, useCapture ).to ( "object", "string" ).done ( function () {
			elem = this.$1;
			types = this.$2;
			listener = this.$3;
			useCapture = this.$4;
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
			listener.once = once;
			listener.useCapture = !!useCapture;
		}

		// 多个事件拆分绑定
		( types || "" ).replace ( rword, type => {

			if ( elem ) {
				elem [ expando ] = elem [ expando ] || {};
				const events = elem [ expando ] [ type ] = elem [ expando ] [ type ] || [];

				// 元素对象存在，且元素支持浏览器事件时绑定事件，以方便浏览器交互时触发事件
				// 元素不支持时属于自定义事件，需手动调用event.emit()触发事件
				// IE.version >= 9
				if ( elem && this.support ( type, elem ) && elem.addEventListener && events.length <= 0 ) {
					handler.event = this;
					elem.addEventListener ( type, handler, !!useCapture );
				}

				// 避免绑定相同的事件函数
				if ( events.indexOf ( listener ) === -1 ) {
					events.push ( listener );
				}
			}
			else {
				cache.pushEvent ( type, listener );
			}
		} );
	},


	/**
		remove ( elem?: DOMObject, types: String, listener: Function, useCapture?: Boolean )
	
		Return Type:
		void
	
		Description:
		以兼容模式解绑事件，可一次解绑多个类型的事件
	
		URL doc:
		http://amaple.org/######
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

		let i, events;
		( types || "" ).replace ( rword, type => {
			if ( elem ) {
				events = elem [ expando ] && elem [ expando ] [ type ] || [];
			}
			else {
				events = cache.getEvent ( type ) || [];
			}

			// 获取事件监听回调数组
			i = events.length;
			if ( i > 0 ) {

				// 符合要求则移除事件回调
				while ( --i > -1 ) {
					if ( events [ i ].guid === listener.guid ) {
						events.splice ( i, 1 );
					}
				}

				// 如果该事件的监听回调为空时，则解绑事件并删除监听回调数组
				if ( events.length === 0 ) {
					delete ( elem ? elem [ expando ] [ type ] : cache.getAllEvent () [ type ] );

					if ( elem && this.support ( type, elem ) && elem.removeEventListener ) {
						elem.removeEventListener ( type, handler, !!useCapture );	
					}
				}
			}
		} );
	},

	/**
		emit ( elem?: DOMObject, types: String )
	
		Return Type:
		void
	
		Description:
		触发事件
	
		URL doc:
		http://amaple.org/######
	*/
	emit ( elem, types ) {

		// 纠正参数
		let args = correctParam ( elem, types ).to ( "object", "string" ).done ( function () {
			elem = this.$1;
			types = this.$2;
		} );

		if ( elem ) {
			check ( elem.nodeType ).notBe ( 3 ).notBe ( 8 ).ifNot ( "function event.emit:elem", "elem参数不能为文本节点或注释节点" ).do ();
		}
		check ( types ).type ( "string" ).ifNot ( "function event.emit:types", "types参数类型必须为string" ).do ();

		( types || "" ).replace ( rword, t => {
			if ( elem && this.support ( t, elem ) ) {
				if ( document.createEvent ) {

					// 使用createEvent创建事件
					let eventType;
					foreach ( eventMap, ( v, k ) => {
						if ( v.indexOf ( t ) !== -1 ) {
							eventType = k;
						}
					} );
					const e = document.createEvent ( eventType || "CustomEvent" );
					e.initEvent ( t, true, false );

					elem.dispatchEvent ( e );
				}
			}
			else {
				handler.event = this;

				// IE9下的call调用传入非引用类型的值时，函数内的this指针无效
				handler.call ( {}, { type: t } );
			}
		} );
	}
};