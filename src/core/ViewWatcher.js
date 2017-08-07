import { extend, type, foreach, noop } from "../func/util";
import { runtimeErr } from "../error";
import slice from "../var/slice";
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
	return new Function ( "runtimeErr", 
	`let self = this,
		 ret;
	self.addScoped ();
	with ( self.vm ) {
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

	this.directive = directive;
	this.node = node;
	this.expr = expr;
	this.vm = vm;
	this.scoped = scoped;

	( directive.before || noop ).call ( this );

  	// 如果scoped为局部数据对象则将expr内的局部变量名替换为局部变量名
	if ( type ( scoped ) === "object" && scoped.regexp instanceof RegExp ) {
		this.expr = this.expr.replace ( scoped.regexp, match => scoped.prefix + match );
	}

	this.getter = makeFn ( this.expr );

    // 将获取表达式的真实值并将此watcher对象绑定到依赖监听属性中
	Subscriber.watcher = this;
	let val = this.getter ( runtimeErr );
  
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
    	defineScoped ( scopedDefinition: Object )
    
    	Return Type:
    	Object
    	局部变量操作对象
    
    	Description:
		定义模板局部变量
		此方法将生成局部变量操作对象，内含替身变量前缀
    	此替身变量名不能为当前vm中已有的变量名，所以需取的生僻些
    	在挂载数据时如果有替身则会将局部变量名替换为替身变量名来达到不重复vm中已有变量名的目的
    
    	URL doc:
    	http://icejs.org/######
    */
    defineScoped ( scopedDefinition ) {
		let scoped = {
            	prefix : "ICE_FOR_" + Date.now() + "_",
        		vars : {}
            },
            availableItems = [];

    	foreach ( scopedDefinition, ( val, varName ) => {
    		if ( varName ) {
    			scoped.vars [ scoped.prefix + varName ] = val;
            	availableItems.push ( varName );
    		}
    	} );

    	scoped.regexp = new RegExp ( availableItems.join ( "|" ), "g" );

    	return scoped;
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
    	// 增加局部变量
		foreach ( this.scoped && this.scoped.vars || {}, ( val, varName ) => {
			this.vm [ varName ] = val;
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
    	foreach ( this.scoped && this.scoped.vars || {}, ( val, varName ) => {
        	if ( this.vm.hasOwnProperty ( varName ) ) {
                delete this.vm [ varName ]
            }
		} );
    }
} );