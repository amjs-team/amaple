export default {

	components : {},

	/**
		push ( name: String, component: Object )
	
		Return Type:
		void
	
		Description:
		添加组件
	
		URL doc:
		http://amaple.org/######
	*/
	push ( name, component ) {
    	this.components [ name ] = component;
	},

	/**
		get ( name: String )
	
		Return Type:
		Object
		元素驱动器对象
	
		Description:
		获取元素驱动器，没有找打则返回null
	
		URL doc:
		http://amaple.org/######
	*/
	get ( name ) {
		return this.components [ name ] || null;
	}
};