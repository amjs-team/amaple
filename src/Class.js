import { foreach, isEmpty } from "./func/util";
import { classErr } from "./error";

const 
	rconstructor = /^(?:constructor\s*|function\s*)?\((.*?)\)\s*(?:=>\s*)?{([\s\S]*)}$/;

/**
	newClassCheck ( object: Object, constructor: Function )

	Return Type:
	void

	Description:
	检查一个类不能被当做函数调用，否则会抛出错误

	URL doc:
	http://icejs.org/######
*/
function newClassCheck ( object, constructor ) {
	if ( !( object instanceof constructor ) ) {
		throw classErr ( "define", "Cannot call a class as a function" );
	}
}

/**
	defineMemberFunction ( constructor: Function, proto: Object )

	Return Type:
	void

	Description:
	为一个类添加原型方法和静态变量

	URL doc:
	http://icejs.org/######
*/
function defineMemberFunction ( constructor, proto ) {
	foreach ( proto, ( prop, name ) => {
		if ( name === "statics" ) {
			foreach ( prop, ( staticProp, staticName ) => {
	            Object.defineProperty ( constructor, staticName, {
	            	value : staticProp,
	            	enumerable : false,
	            	configurable : true,
	            	writable : true
	            } );
			} );
		}
		else {
			Object.defineProperty ( constructor.prototype, name, {
				value : prop,
				enumerable : false,
				configurable : true,
				writable : true
			} );
		}
	} );
}

/**
	Plugin Class
	( clsName?: String )

	Description:
	创建一个类
	clsName为类名，proto为类体

	用法与ES6的类创建相似：
	创建一个类：Class("clsName") ( {
		constructor : function () {
			// 名为”constructor“的方法为此方法构造函数
		},
		statics : {
			// 名为”statics“的对象内为该类的静态变量
		}
	} );

	URL doc:
	http://icejs.org/######
*/
export default function Class ( clsName ) {
	let _superClass;

	function classDefiner ( proto ) {
		let constructMatch = rconstructor.exec ( proto.constructor || "" ),
			fnBody = `return function ${ clsName } (`,
			mustNew = `newClassCheck(this, ${ clsName });`,
			classFn;

		if ( constructMatch ) {
			fnBody += `${ constructMatch [ 1 ] }) {${ mustNew }${ constructMatch [ 2 ] }}`;
			delete proto.constructor;
		}
		else {
			fnBody += "){${ mustNew }}";
		}

		classFn = new Function ( "newClassCheck", fnBody ) ( newClassCheck );

		// 定义成员方法
		if ( !isEmpty ( proto ) ) {
			defineMemberFunction ( classFn, proto );
		}

		return classFn;
	}

	// 继承函数
	classDefiner.extends = ( superClass ) => {
		_superClass = superClass;
		return classDefiner;
	};

	return classDefiner;
}