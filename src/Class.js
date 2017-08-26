import { foreach, isEmpty, type } from "./func/util";
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

function inherits ( subClass, superClass ) {
    // Object.create第二个参数修复子类的constructor
    subClass.prototype = Object.create ( superClass && superClass.prototype, {
        constructor : {
            value : subClass,
            enumerable : false,
            writable : true,
            configurable : true
        }
    } );
	
    if ( superClass ) {
      Object.setPrototypeOf ? Object.setPrototypeOf ( subClass, superClass ) : subClass.__proto__ = superClass;
    }
}

function getSuperConstructorReturn ( subInstance, constructorReturn ) {
	const tcr = type ( constructorReturn );
	return constructorReturn && ( tcr === "function" || tcr === "object" ) ? constructorReturn : subInstance;
}

function defineSuper ( subInstance, superConstructor ) {
	subInstance.__super = () => {
		superConstructor.apply ( subInstance, arguments );
		delete subInstance.__super;
	};
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
		let constructMatch = rconstructor.exec ( proto.constructor && proto.constructor.toString () || "" ) || [],
			fnBody = `return function ${ clsName } (`,
			mustNew = `newClassCheck(this, ${ clsName });`,
            codeNoComment = ( constructMatch [ 2 ] || "" ).replace ( rscriptComment, match => "" ),
			classFn;

        	
        // 此类有继承另一个类的时候
        if ( _superClass !== undefined ) {
            	
            fnBody += `(${ constructMatch [ 1 ] || "" }) {${ mustNew }inherits(${ clsName },superClass);var __superReturn;`;
        	
        	if ( constructMatch [ 2 ] ) {
            	const 
                	ruseThisBeforeCallSuper = /[\s{;]this\s*\.[\s\S]+this\.__super/,
                	raddReceiver = /[\s{;]this.__super\s*\(/,
                	rscriptComment = /\/\/(.*?)\n|\/\*(.*?)\*\//g;
            	
            	if ( ruseThisBeforeCallSuper.test ( codeNoComment ) ) {
            		throw classErr ( "constructor", "\"this\" is not allow before call this.__super()" );
            	}
            	
            	let superCallCount = 0;
            	codeNoComment = codeNoComment.replace ( raddReceiver, match => {
                	superCallCount ++;
                    return "__superReturn=" + match;
                } );
         		
            	if ( superCallCount === 0 ) {
                	throw classErr ( "constructor", "" );
                }
            	else if ( superCallCount > 1 ) {
                	throw classErr ( "constructor", "" );
                }
            	
        		fnBody += `defineSuper(this,(${ clsName }.__proto__ || Object.getPrototypeOf(${ clsName })))`;
            }
        	else {
            	fnBody += `__superReturn = (${ clsName }.__proto__ || Object.getPrototypeOf(${ clsName })).call(this);`;
            }
		}
		else {
			fnBody += `){${ mustNew }}`;
		}
    	
    	fnBody += `${ codeNoComment };return getSuperConstructorReturn(this,__superReturn)}`;

		classFn = new Function ( "newClassCheck", "inherits", "getSuperConstructorReturn", "superClass", fnBody ) ( newClassCheck, inherits, getSuperConstructorReturn, _superClass );

    	delete proto.constructor;
    	
		// 定义成员方法
		if ( !isEmpty ( proto ) ) {
			defineMemberFunction ( classFn, proto );
		}

		return classFn;
	}

	// 继承函数
	classDefiner.extends = ( superClass ) => {
    	// superClass需要为函数类型，否则会报错
    	if ( type ( superClass ) !== 'function' && superClass !== null ) {
        	throw classErr ( "extends", "Class extends value is not a constructor or null" );
    	}
    	
		_superClass = superClass;
		return classDefiner;
	};

	return classDefiner;
}