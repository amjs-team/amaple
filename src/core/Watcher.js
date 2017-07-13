import { extend } from "../func/util";
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
	Watcher ( directive: Object, node: DOMObject, expr: String, vm: Object )

	Return Type:
	void

	Description:
	视图监听类
	模板中所有需绑定的视图都将依次转换为此类的对象
	当数据发生变化时，这些对象负责更新视图

	URL doc:
	http://icejs.org/######
*/
export default function Watcher ( directive, node, expr, vm ) {
	
	this.directive = directive;
	this.node = node;
	this.getVal = makeFn ( expr );
	this.vm = vm;
	
	if ( !directive.before.call ( this ) ) {
    	return;
    }
	Subscriber.watcher = this;
	
	directive.update.call ( this, getVal ( vm ) );
	Subscriber.watcher = undefined;
}

extend ( Watcher.prototype, {

	/**
		update ( value: any )
	
		Return Type:
		void
	
		Description:
		更新视图
	
		URL doc:
		http://icejs.org/######
	*/
	update ( value ) {
    	this.directive.update.call ( this, this.getVal ( vm ) );
    }
} );