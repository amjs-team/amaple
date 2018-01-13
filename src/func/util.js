import toString from "../var/toString";
import slice from "../var/slice";

/**
 	type ( arg: any )
 
 	Return Type:
 	String
 	传入参数的类型字符串
 
 	Description:
 	获取传入的参数的变量类型，与typeof关键字不同的是，当参数为Array时返回"array"，当变量为null时返回"null"
 
 	URL doc:
 	http://amaple.org/######
 */
export function type ( arg ) {
	return arg !== null 
			? arg instanceof Array ? "array" : typeof arg 
			: "null";
}

/**
	noop ()

	Return Type:
	void

	Description:
	空函数
	用于函数调用兼容处理

	URL doc:
	http://amaple.org/######
*/
export function noop () {}

/**
	foreach ( target: Array|Object|ArrayLike, callback: Function )

	Return Type:
	Boolean
	是否继续跳出外层循环，如果返回false，则继续跳出循环

	Description:
	遍历数组或对象
    可遍历带有length的类数组对象如NodeList对象，如果遍历对象为空或不可遍历，则直接返回
    
    回调函数中返回false跳出此循环，且此返回值会在foreach中返回，在需跳出多层循环时return foreach (...)实现

	URL doc:
	http://amaple.org/######
*/
export function foreach ( target, callback ) {

	// 判断目标变量是否可被变量
	if ( !target || ( target.length || Object.keys ( target ).length ) <= 0 ) {
		return;
	}

	let 
		isContinue, i,
		tTarget 	= type ( target ),
		tCallback 	= type ( callback );

	if ( tTarget === "object" && target.length ) {
		target = slice.call ( target );
		tTarget = "array";
	}

	if ( tTarget === "array" ) {
		for ( i = 0; i < target.length; i++ ) {
			isContinue = callback ( target [ i ], i, target );

			if ( isContinue === false ) {
				break;
			}
		}
	}
	else if ( tTarget === "object" ) {
		for ( i in target ) {
			isContinue = callback ( target [ i ], i, target );

			if ( isContinue === false ) {
				break;
			}
		}
	}
	
	return isContinue;
}

/**
	isEmpty ( object: Object )

	Return Type:
	Boolean
	为空时返回true，不空时返回false

	Description:
	判断对象或数组是否为空对象或空数组

	URL doc:
	http://amaple.org/######
*/
export function isEmpty ( object ) {
	const tobj = type ( object );
	if ( !/array|object/.test ( tobj ) ) {
		return;
	}

	let result = true;
	foreach ( object, () => {
		result = false;

		// 跳出循环
		return false;
	} );

	return result;
}

/**
	extend ( target: Object|Array|Function, source1: any, source2?: any ... )

	Return Type:
	Array|Object|Boolean
	合并后的array、object或function

	Description:
	此函数用于继承参数属性，可以传入不定个数被继承参数，以第一个参数作为继承目标对象，继承对象类型必须为array、object、function，被继承参数可以是任意类型的参数。
	
	#Warning: 此函数会改变继承参数
	
	参数说明：
	当继承参数类型为array时，被继承参数可以是任何类型，当被继承参数为array或object时会将内部全部属性继承下来。参数只会继承不重复的参数
	当继承参数类型为object或function时，被继承参数只能是object，如果被继承参数中有其他类型参数将会直接被忽略。相同键的属性将会被覆盖
	
	eg:
	1、
	var arr = extend(["a", "b", "c"], ["c", "d", "e"], ["f"]);
	合并后的arr为["a", "b", "c", "d", "e", "f"]
	
	2、
	var obj = extend({a: 1, b: 2, c: 3}, {c: 4, d: 5, e: 6});
	合并后的obj为{a: 1, b: 2, c: 4, d: 5, e: 6}

	URL doc:
	http://amaple.org/######
*/
export function extend ( ...args ) {

	const 
		target = args [ 0 ],
		ttarget = type ( target );
	let targ;

	args = args.slice ( 1 );

	// 依次处理被继承参数
	foreach ( args, function ( arg ) {
		targ = type ( arg );

		if ( ttarget === "array" ) {
			if ( targ === "array" || targ === "object" ) {
				foreach ( arg, function ( arg ) {
					if ( target.indexOf ( arg ) <= -1 ) {
						target.push ( arg );
					}
				} );
			}
			else if ( targ !== null && targ !== undefined ) {
				target.push ( arg );
			}
		}
		else if ( ttarget === "object" || ttarget === "function" ) {

			// 只处理object类型的被继承参数，其他类型的将会被忽略
			if ( targ === "object" ) {
				foreach ( arg, function ( arg, key ) {
					target [ key ] = arg;
				});
			}
		}
	});
	
	return target;
}

/**
	isPlainObject ( object: Object )

	Return Type:
	Boolean

	Description:
	判断一个对象是否为纯粹的对象
	兼容性处理：IE10及一下的对象上没有__proto__原型引用，而constructor是直接在object上

	URL doc:
	http://amaple.org/######
*/
export function isPlainObject ( object ) {
	return object.constructor === Object;
}

/**
	guid ()

	Return Type:
	Number

	Description:
	获取唯一标识

	URL doc:
	http://amaple.org/######
*/
export function guid () {
	return setTimeout ( noop, 1 ) + "";
}