export default {

	events : {},

	/**
		direction

		push ( type: String, direction: DOMString|DOMObject )
	
		Return Type:
		void
	
		Description:
		添加非元素事件缓存
	
		URL doc:
		http://icejs.org/######
	*/
	push : function ( type, listener ) {
		this.events [ type ] = listener;
	},

	/**
		get ( name: String )
	
		Return Type:
		Array
		事件缓存
	
		Description:
		获取事件缓存，没有找打则返回null
	
		URL doc:
		http://icejs.org/######
	*/
	get : function ( type ) {
		return this.events [ type ] || null;
	}
};