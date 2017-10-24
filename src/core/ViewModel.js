import { foreach, type, isPlainObject, noop } from "../func/util";
import { vmComputedErr } from "../error";
import { defineReactiveProperty } from "../func/private";
import Subscriber from "./Subscriber";
import ValueWatcher from "./ValueWatcher";


function convertState ( value, subs, context ) {
  	return type ( value ) === "object" && isPlainObject ( value ) ? 
				new ViewModel ( value, false ) : 
					type ( value ) === "array" ? 
					initArray ( value, subs, context ) : value;
}

// 初始化绑定事件
function initMethod ( methods, context ) {
	foreach ( methods, ( method, key ) => {
		context [ key ] = function ( ...args ) {
			method.apply ( context, args );
		};
	} );
}

// 初始化监听属性
function initState ( states, context ) {
	foreach ( states, ( state, key ) => {
		const subs = new Subscriber ();
        	
        let watch = noop,
			oldVal;

		// 如果属性带有watch方法
		if ( type ( state ) === "object" && Object.keys ( state ).length === 2 && state.hasOwnProperty ( "value" ) && state.hasOwnProperty ( "watch" ) && type ( state.watch ) === "function" ) {
			watch = state.watch;
			state = state.value;
		}
      
    	state = convertState ( state, subs, context );
      	
      	defineReactiveProperty ( key, () => {

				// 绑定视图
				subs.subscribe ();
				return state;
			},
			( newVal ) => {
				if ( state !== newVal ) {
					oldVal = state
					state = newVal;

					watch.call ( context, newVal, oldVal );

					// 更新视图
					subs.notify ( newVal );
				}
   			}, context );
    } );
}

// 初始化监听计算属性
function initComputed ( computeds, context ) {
	foreach ( computeds, function ( computed, key ) {

		if ( type ( computed ) !== "function" && type ( computed ) === "object" && type ( computed.get ) !== "function" ) {
			throw vmComputedErr ( key, "计算属性必须包含get函数，可直接定义一个函数或对象内包含get函数" );
		}

		const
			subs = new Subscriber (),
			getter = ( () => {
				let computedGetter = type ( computed ) === "function" ? computed : computed.get;
				return function () {
					return computedGetter.call ( context );
				};
        	} ) ();

        let state;

        // 创建ComputedWatcher对象供依赖数据监听
        new ValueWatcher ( ( newVal ) => {
        		state = getter ();

        		// 更新视图
				subs.notify ( state );
        	}, getter );
      	
      	// 设置计算属性为监听数据
      	defineReactiveProperty ( key, () => {

				// 绑定视图
				subs.subscribe ();

				return state;
			},
			type ( computed.set ) === "function" ? 
			( newVal ) => {
				if ( state !== newVal ) {
					computed.set.call ( context, newVal );

					// 更新视图
					subs.notify ( newVal );
				}
			} : noop, context );
	} );
}

// 初始化监听数组
function initArray ( array, subs, context ) {

  	// 监听数组转换
	array = array.map ( item => convertState ( item, subs, context ) );
  	
  	foreach ( [ "push", "pop", "shift", "unshift", "splice", "sort", "reverse" ], method => {
      	const nativeMethod = Array.prototype [ method ];
 		let res;
      	
      	Object.defineProperty ( array, method, {
          	value ( ...args ) {
          		if ( /push|unshift|splice/.test ( method ) ) {
                  	
                  	// 转换数组新加入的项
                  	args = args.map ( item => convertState ( item, subs, context ) );
        		}
        		res = nativeMethod.apply ( this, args );
              	
              	// 更新视图
				subs.notify ( { method, args } );
              	
              	return res;
        	},
            writable : true,
            configurable : true,
            enumeratable : false
        } );
    } );

    return array;
}

/**
	ViewModel ( vmData: Object, isRoot?: Boolean )

	Return Type:
	void

	Description:
	ViewModel数据监听类
	ice.init方法返回的需被监听的数据都使用此类进行实例化

	URL doc:
	http://icejs.org/######
*/
export default function ViewModel ( vmData, isRoot = true ) {
	let state 		= {},
		method 		= {},
		computed 	= {};

	// 将vmData内的属性进行分类
	foreach ( vmData, ( value, key ) => {

		// 转换普通方法
		if ( type ( value ) === "function" ) {
			method [ key ] = value;
		}

		// 转换计算属性
		// 深层嵌套内的computed属性对象不会被当做计算属性初始化
		else if ( key === "computed" && type ( value ) === "object" && isRoot ) {
			computed = value;
		}

		// 转换监听属性，当值为包含value和watch时将watch转换为监听属性	
		// 如果是对象则将此对象也转换为ViewModel的实例
		// 如果是数组则遍历数组将其内部属性转换为对应监听数组
		else {
			state [ key ] = value;
		}
	} );

	// 初始化监听属性
	initMethod ( method, this );
	initState ( state, this );
	initComputed ( computed, this );
}