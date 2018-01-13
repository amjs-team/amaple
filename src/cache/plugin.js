export default {

	plugins : {},

	/**
		push ( name: String )
	
		Return Type:
		void
	
		Description:
		查看是否存在指定插件
	
		URL doc:
		http://amaple.org/######
	*/
	has ( name ) {
		return !!this.plugins [ name ];
	},

	/**
		push ( name: String, plugin: Object|Function )
	
		Return Type:
		void
	
		Description:
		添加插件
	
		URL doc:
		http://amaple.org/######
	*/
	push ( name, plugin ) {
		this.plugins [ name ] = plugin;
	},

	/**
		get ( name: String )
	
		Return Type:
		Object
		插件对象
	
		Description:
		获取插件，没有找打则返回null
	
		URL doc:
		http://amaple.org/######
	*/
	get ( name ) {
		return this.plugins [ name ] || null;
	}
};