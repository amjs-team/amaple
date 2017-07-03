import { type, foreach } from "../func/util";

export default {

	drivers : {},

	/**
		driver

		push ( name: String, driver: Object )
	
		Return Type:
		void
	
		Description:
		添加元素驱动器
	
		URL doc:
		http://icejs.org/######
	*/
	push : function ( name, driver ) {

		if ( name && type ( name ) === "string" ) {
			var _driver = {};

			_driver [ name ] = driver;
			driver = _driver;
		}

		// 遍历插件对象组依次缓存
		foreach ( driver, ( item, name ) => {
			if ( !drivers.hasOwnProperty ( name ) ) {
				drivers [ name ] = item;
			}
			else {
				throw moduleErr ( "driver", name + "元素驱动器已存在" );
			}
		} );
	},

	/**
		get ( name: String )
	
		Return Type:
		Object
		元素驱动器对象
	
		Description:
		获取元素驱动器，没有找打则返回null
	
		URL doc:
		http://icejs.org/######
	*/
	get : function ( name ) {
		return this.drivers [ name ] || null;
	}
};