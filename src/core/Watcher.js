import { extend } from "../func/util";

/**
	Watcher ( exp: String )

	Return Type:
	void

	Description:
	视图监听类
	模板中所有需绑定的视图都将依次转换为此类的对象
	当数据发生变化时，这些对象负责更新视图

	URL doc:
	http://icejs.org/######
*/
function Watcher ( exp ) {
	this.exp = exp;
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
    	
    }
} );