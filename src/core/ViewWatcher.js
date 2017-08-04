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
	return new Function ( "obj", "runtimeErr", 
	`with ( obj ) {
		try {
			return ${ code };
		}
		catch ( e ) {
			throw runtimeErr ( "vm", e );
		}
	}` );
}

/**
	ViewWatcher ( directive: Object, node: DOMObject, expr: String, vm?: Object, scoped?: Object )

	Return Type:
	void

	Description:
	视图监听类
	模板中所有需绑定的视图都将依次转换为ViewWacther类的对象
	当数据发生变化时，这些对象负责更新视图

	URL doc:
	http://icejs.org/######
*/
export default function ViewWatcher ( directive, node, expr, vm, scoped ) {
	
  	// 如果scoped为局部数据对象则将expr内的局部变量名替换为局部变量名
	if ( type ( scoped ) === "object" && scoped.__$reg__ instanceof RegExp ) {
		expr = expr.replace ( scoped.__$reg__, match => scoped [ match ] || match );
	}

	this.directive = directive;
	this.node = node;
	this.expr = expr;
	this.vm = vm;
	this.scoped = scoped;
	if ( directive.before && directive.before.call ( this ) === false ) {
		return;
	}

	this.getter = makeFn ( this.expr );

    // 将获取表达式的真实值并将此watcher对象绑定到依赖监听属性中
	Subscriber.watcher = this;
	this.val = this.getter ( vm, runtimeErr );

	// 移除局部变量
	// foreach ( scoped || [], ( k, v ) => {
	// 	if ( type ( v ) === "string" ) {
	// 		delete vm [ v ];
	// 	}
	// } );
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
    	this.directive.update.call ( this, this.getter ( this.vm, runtimeErr ) );
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
    		scoped = {},
    		scopedVar;

    	foreach ( scopedDefinition, ( variable, val ) => {
    		if ( variable ) {
    			scopedVar = scopedPrefix + variable;
    			scoped [ variable ] = scopedVar;
    			vm [ scopedVar ] = val;
    		}
    	} );

    	scoped.__$reg__ = new RegExp ( Object.keys ( scoped ).join ( "|" ), "g" );

    	return scoped;
    }
} );