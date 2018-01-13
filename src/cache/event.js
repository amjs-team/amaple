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
		http://amaple.org/######
	*/
	push ( type, listener ) {
		this.events [ type ] = this.events [ type ] || [];
		this.events [ type ].push ( listener );
	},

	/**
		get ( name: String )
	
		Return Type:
		Array
		事件缓存
	
		Description:
		获取事件缓存，没有找打则返回null
	
		URL doc:
		http://amaple.org/######
	*/
	get ( type ) {
		return this.events [ type ] || null;
	},

	/**
		getAll ()
	
		Return Type:
		Object
		所有非元素事件
	
		Description:
		获取所有非元素事件
	
		URL doc:
		http://amaple.org/######
	*/
	getAll () {
		return this.events;
	}
};