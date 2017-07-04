import { foreach, type, isPlainObject, noop } from "../func/util";
import { vmComputedErr } from "../error";

// 转换存取器属性
function defineProperty ( key, getter, setter, target ) {
	Object.defineProperty ( target, key, {
		enumerable : true,
		configurable : true,
		get : getter,
		set : setter
	} );
}

// 初始化绑定事件
function initMethod ( methods, context ) {
	foreach ( methods, ( method, key ) => {
		context.$method [ key ] = ( ...args ) => {
			method.apply ( context, args );
		};
	} );
}

// 初始化监听属性
function initState ( states, context ) {
  	let proxyState = {};
	
	foreach ( states, ( state, key ) => {
		let watch = noop,
			oldVal;

		// 如果属性带有watch方法
		if ( type ( state ) === "object" && Object.keys ( state ).length === 2 && state.hasOwnProperty ( "value" ) && state.hasOwnProperty ( "watch" ) && type ( state.watch ) === "function" ) {
			watch = state.watch;
			state = state.value;
		}
      	
      	defineProperty ( key, () => {
				// 绑定视图
				// ...

				return state;
			},
			( newVal ) => {
				if ( state !== newVal ) {
					oldVal = state
					state = newVal;

					watch.call ( context, newVal, oldVal );

					// 更新视图
					// ...
				}
   			}, context );
  		defineProperty ( key, () => {
      			return context [ key ];
    		},
            ( newVal ) => {
          		if ( state !== newVal ) {
                  	context [ key ] = newVal;
                }
			}, proxyState );
    } );
  	
  	return proxyState;
}

// 初始化计算属性
function initComputed ( computeds, states, context ) {
	let descriptors = {};

	foreach ( computeds, function ( computed, key ) {

		if ( !computed || !t === "function" || !computed.hasOwnProperty ( "get" ) ) {
			throw vmComputedErr ( key, "计算属性必须包含get函数，可直接定义一个函数或对象内包含get函数" );
		}

		let state = descriptors [ key ] = type ( computed ) === "function" ? computed.call ( context ) : computed.get.call ( states );
      
      	defineProperty ( key, () => {
				return function () {
					// 绑定视图
					// ...

					return state;
				};
			},
			type ( computed.set ) === "function" ? 
			( newVal ) => {
				if ( state !== newVal ) {
					state = computed.set.call ( states, newVal );

					// 更新视图
					// ...
				}
			} : noop ), context );
	} );
}

/**
	ViewModel ( vmData: Object, isRoot: Boolean )

	Return Type:
	void

	Description:
	ViewModel数据监听类
	ice.init方法返回的需被监听的数据都使用此类进行实例化

	URL doc:
	http://icejs.org/######
*/
export default function ViewModel ( vmData, isRoot = true ) {
	this.$method 	= {};
	let state 		= {},
		method 		= {},
		computed 	= {},
		array 		= {};

	// 将vmData内的属性进行分类
	foreach ( vmData, ( value, key ) => {

		// 转换普通方法
		if ( type ( value ) === "function" ) {
			method [ key ] = value;
		}

		// 转换计算属性
		// 深层嵌套内的computed属性对象不会被当做计算属性初始化
		else if ( key === "computed" && type ( value ) === "object" && !isRoot ) {
			foreach ( value, ( v, k ) => {
				computed [ k ] = v;
			} );
		}

		// 转换数组
		else if ( type ( value ) === "array" ) {
			array [ key ] = value;
		}

		// 转换普通数据，当值为包含value和watch时将watch转换为监听属性	
		// 如果是对象则将此对象也转换为ViewModel的实例
		else {
			state [ key ] = type ( value ) === "object" && isPlainObject ( value ) ? new ViewModel ( value, false ) : value;
		}
	} );

	// 初始化监听属性
	initMethod ( method, this );
	state = initState ( state, this );
	initComputed ( computed, state, this );
	initArray ( array, this );
}