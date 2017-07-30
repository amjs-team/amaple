import toString from "../var/toString";
import check from "../check";

/**
 	type ( arg: any )
 
 	Return Type:
 	String
 	传入参数的类型字符串
 
 	Description:
 	获取传入的参数的变量类型，与typeof关键字不同的是，当参数为Array时返回"array"，当变量为null时返回"null"
 
 	URL doc:
 	http://icejs.org/######
 */
export function type ( arg ) {
	return arg !== null ? ( arg instanceof Array ? "array" : typeof arg ) : "null";
}

/**
	noop ()

	Return Type:
	void

	Description:
	空函数
	用于函数调用兼容处理

	URL doc:
	http://icejs.org/######
*/
export function noop () {}

/**
	foreach ( target: Array|Object, callback: Function )

	Return Type:
	Boolean
	是否继续循环，如果返回false，则跳出循环

	Description:
	遍历数组或对象

	URL doc:
	http://icejs.org/######
*/
export function foreach ( target, callback ) {

	let 
		isContinue, i,
		tTarget 	= type ( target ),
		tCallback 	= type ( callback );

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
}

/**
	isEmpty ( object: Object )

	Return Type:
	Boolean
	为空时返回true，不空时返回false

	Description:
	判断对象或数组是否为空对象或空数组

	URL doc:
	http://icejs.org/######
*/
export function isEmpty ( object ) {

	check ( object ).type ( "array", "object" ).ifNot ( "object", "参数类型必须为array或object" ).do ();

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
	此函数用于继承参数属性，可以传入不定个数被继承参数，以第一个参数作为继承参数，继承对象类型必须为array、object、function，被继承参数可以是任意类型的参数。
	
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
	http://icejs.org/######
*/
export function extend ( ...args ) {

	let target = args [ 0 ],
		ttarget = type ( target ),
		targ;

	args = args.slice ( 1 );

	// 依次处理被继承参数
	foreach ( args, function ( arg ) {
		targ = type ( arg );

		if ( ttarget === "array" ) {
			if ( targ === "array" || targ === "object" ) {
				foreach ( arg, function ( arg ) {
					if ( !inArray ( target, arg ) ) {
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
	replaceAll ( str: String, search: String, replaces: String )

	Return Type:
	String
	替换后的字符串

	Description:
	将str中所有search替换为replace，特殊字符自动转义

	URL doc:
	http://icejs.org/######
*/
export function replaceAll ( str, search, replaces ) {
	check ( arguments.length ).toBe ( 3 ).ifNot ( "function:replaceAll", "必须传入被替换字符串、查找替换的字符串和替换的字符串三个参数" ).do ();
	check ( str, search, replaces ).type ( "string" ).ifNot ( "function:replaceAll", "函数所有参数类型都必须为string" ).do ();

	// 转义字符串中所有特殊的符号
	search = search.split( "" );
	foreach ( search, ( char, i, search ) => {
		search [ i ] = [ "$", "(", ")", "*", "+", ".", "[", "]", "?", "\\", "^", "{", "}", "|" ].indexOf ( char ) !== -1 ?
					"\\" + char :
					char;
	});

	return str.replace ( new RegExp ( search.join(""), "gm" ), replaces );
}

/**
	isWindow ( object: Object )

	Return Type:
	Boolean
	是返回true，否返回false

	Description:
	判断一个对象是否为window对象
	使用window的特有函数，及自引用特性进行判断
	如果object.window的undefined，则此对象肯定不是window对象

	URL doc:
	http://icejs.org/######
*/
export function isWindow ( object ) {
	try {
		return type ( object ) === "object" && !!object.eval && !!object.setInterval && object.window === object.window.window;
	}
	catch( e ) {
		return false;
	}
}

/**
	isPlainObject ( object: Object )

	Return Type:
	Boolean

	Description:
	判断一个对象是否为纯粹的对象

	URL doc:
	http://icejs.org/######
*/
export function isPlainObject ( object ) {
	return toString.call ( object ) === "[object Object]";
}

/**
	guid ()

	Return Type:
	Number

	Description:
	获取唯一标识

	URL doc:
	http://icejs.org/######
*/
export function guid () {
	return setTimeout( 1 ) + "";
}