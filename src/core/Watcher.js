import { extend, type, foreach } from "../func/util";
import { runtimeErr } from "../error";
import Subscriber from "./Subscriber";


/**
	makeFn ( code: String )

	Return Type:
	Function
    代码解析后的方法体

	Description:
	通过解析代码获取的对应vm属性值的方法

	URL doc:
	http://icejs.org/######
*/
function makeFn ( code ) {
	return new Function ( "obj", 
	`with ( obj ) {
		try {
			return ${ code };
		}
		catch ( e ) {
			throw runtimeErr ( "view model", e );
		}
	}` );
}

/**
	Watcher ( directive: Object, node: DOMObject, expr: String, vm: Object, scoped: Object )

	Return Type:
	void

	Description:
	视图监听类
	模板中所有需绑定的视图都将依次转换为此类的对象
	当数据发生变化时，这些对象负责更新视图

	URL doc:
	http://icejs.org/######
*/
export default function Watcher ( directive, node, expr, vm, scoped ) {
	
  	// 如果scoped为局部数据对象则将expr内的局部变量名替换为局部变量名
	if ( type ( scoped ) === "object" && scoped.__$reg__ instanceof RegExp ) {
		expr = expr.replace ( scoped.__$reg__, match => scoped [ match ] || match );
	}

	this.directive = directive;
	this.node = node;
	this.vm = vm;
	this.getVal = type ( expr ) === "function" ? expr : makeFn ( expr );
	
	if ( directive.before && !directive.before.call ( this ) ) {
    	return;
    }

    // 将获取表达式的真实值并将此watcher对象绑定到依赖监听属性中
	Subscriber.watcher = this;
	let val = this.getVal ( vm );

	// 移除局部变量
	foreach ( scoped || [], ( k, v ) => {
		if ( type ( v ) === "string" ) {
			delete vm [ v ];
		}
	} );

	directive.update.call ( this, val );
}

extend ( Watcher.prototype, {

	/**
		update ()
	
		Return Type:
		void
	
		Description:
		更新视图
	
		URL doc:
		http://icejs.org/######
	*/
	update () {
    	this.directive.update.call ( this, this.getVal ( this.vm ) );
    },

    /**
    	defineScoped ( scopedDefinition: Object, vm: Object )
    
    	Return Type:
    	Object
    	局部变量操作对象
    
    	Description:
		定义模板局部变量
		此方法将生成局部变量操作对象（包含替身变量名）和增加局部变量属性到vm中
    	此替身变量名不能为当前vm中已有的变量名，所以需取的生僻些
    	在挂载数据时如果有替身则会将局部变量名替换为替身变量名来达到不重复vm中已有变量名的目的
    
    	URL doc:
    	http://icejs.org/######
    */
    defineScoped ( scopedDefinition, vm ) {
    	let scopedPrefix = "ICE_FOR_" + Date.now() + "_",
    		scoped 		 = {};

    	foreach ( scopedDefinition, ( variable, val ) => {
    		if ( variable ) {
    			scoped [ variable ] = scopedPrefix + variable;
    			vm [ scopedPrefix + variable ] = val;
    		}
    	} );

    	scoped.__$reg__ = new RegExp ( Object.keys ( scoped ).join ( "|" ), "g" );

    	return scoped;
    }
} );