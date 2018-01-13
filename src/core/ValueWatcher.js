import { extend, type, foreach } from "../func/util";
import { runtimeErr } from "../error";
import Subscriber from "./Subscriber";

/**
	ValueWatcher ( updateFn: Function, getter: Function )

	Return Type:
	void

	Description:
	计算属性监听类
	vm中所有依赖监听属性的计算属性都将依次创建ComputedWatcher类的对象被对应的监听属性监听
	当监听属性发生变化时，这些对象负责更新对应的计算属性值

	URL doc:
	http://amaple.org/######
*/
export default function ValueWatcher ( updateFn, getter ) {

	this.updateFn = updateFn;
	this.getter = getter;

    // 将获取表达式的真实值并将此watcher对象绑定到依赖监听属性中
	Subscriber.watcher = this;
	updateFn ( getter () );
	delete Subscriber.watcher;
}

extend ( ValueWatcher.prototype, {

	/**
		update ( newVal: Any )
	
		Return Type:
		void
	
		Description:
		更新视图
	
		URL doc:
		http://amaple.org/######
	*/
	update () {
    	this.updateFn ( this.getter () );
    }

} );