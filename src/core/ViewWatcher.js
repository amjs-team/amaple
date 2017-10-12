import { extend, type, foreach, noop } from "../func/util";
import { attr } from "../func/node";
import { runtimeErr } from "../error";
import slice from "../var/slice";
import Subscriber from "./Subscriber";
import Tmpl from "./tmpl/Tmpl";


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
	return new Function ( "runtimeErr", 
	`let self = this,
		 ret;
	self.addScoped ();
	with ( self.tmpl.getViewModel () ) {
		try {
			ret = ${ code };
		}
		catch ( e ) {
			throw runtimeErr ( "vm", e );
		}
	}
	self.removeScoped ();
	return ret;` );
}

/**
	ViewWatcher ( directive: Object, node: DOMObject, expr: String, tmpl?: Object, scoped?: Object )

	Return Type:
	void

	Description:
	视图监听类
	模板中所有需绑定的视图都将依次转换为ViewWacther类的对象
	当数据发生变化时，这些对象负责更新视图

	URL doc:
	http://icejs.org/######
*/
export default function ViewWatcher ( directive, node, expr, tmpl, scoped ) {

	this.directive = directive;
	this.node = node;
	this.expr = expr;
	this.tmpl = tmpl;
	this.scoped = scoped;
	
	( directive.before || noop ).call ( this );

	// 如果scoped为局部数据对象则将expr内的局部变量名替换为局部变量名
	if ( type ( scoped ) === "object" && scoped.regexp instanceof RegExp ) {
		this.expr = this.expr.replace ( scoped.regexp, match => scoped.prefix + match );
	}
	
	// 移除相关属性指令表达式
	// 当属性指令表达式与指令名称不同的时候可将对应表达式赋值给this.attrExpr
	if ( node.nodeType === 1 ) {
		attr ( node, Tmpl.directivePrefix + ( this.attrExpr || directive.name ), null );
	}

	this.getter = makeFn ( this.expr );
	
	if ( directive.dynamic !== false ) {
    	
    	// 将获取表达式的真实值并将此watcher对象绑定到依赖监听属性中
		Subscriber.watcher = this;
    }
	
	const val = this.getter ( runtimeErr );
  
	// 局部变量没有设置监听，所以不会调用Subscriber.subscriber()，需手动设置为undefined
	Subscriber.watcher = undefined;
  
	directive.update.call ( this, val );
}

extend ( ViewWatcher.prototype, {

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
    	this.directive.update.call ( this, this.getter ( runtimeErr ) );
    },
	
	/**
    	addScoped ()
    
    	Return Type:
    	Object
    	void
    
    	Description:
		为vm增加局部变量
    
    	URL doc:
    	http://icejs.org/######
    */
	addScoped () {
    	const vm = this.tmpl.getViewModel ();
    	
    	// 增加局部变量
		foreach ( this.scoped && this.scoped.vars || {}, ( val, varName ) => {
			vm [ varName ] = val;
		} );
    },
	
	/**
    	removeScoped ()
    
    	Return Type:
    	Object
    	void
    
    	Description:
		移除vm中的局部变量
    
    	URL doc:
    	http://icejs.org/######
    */
	removeScoped () {
    	const vm = this.tmpl.getViewModel ();
    	foreach ( this.scoped && this.scoped.vars || {}, ( val, varName ) => {
        	if ( vm.hasOwnProperty ( varName ) ) {
                delete vm [ varName ]
            }
		} );
    }
} );