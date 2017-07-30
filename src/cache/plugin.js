import { type, foreach } from "../func/util";

export default {

	plugins : {},

	/**
		plugin

		push ( name: String, plugin: Object|Function )
	
		Return Type:
		void
	
		Description:
		添加插件
	
		URL doc:
		http://icejs.org/######
	*/
	push : function ( name, plugin ) {

		if ( name && type ( name ) === "string" ) {
			var _plugin = {};

			_plugin [ name ] = plugin;
			plugin = _plugin;
		}
		
		// 遍历插件对象组依次缓存
		foreach ( plugin, ( item, name ) => {
			if ( !this.plugins.hasOwnProperty ( name ) ) {
				this.plugins [ name ] = item;
			}
			else {
				throw moduleErr ( "plugin", name + "插件已存在" );
			}
		} );
	},

	/**
		get ( name: String )
	
		Return Type:
		Object
		插件对象
	
		Description:
		获取插件，没有找打则返回null
	
		URL doc:
		http://icejs.org/######
	*/
	get : function ( name ) {
		return this.plugins [ name ] || null;
	}
};