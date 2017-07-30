import { type, extend, foreach } from "../../func/util";
import cache from "../../cache/core";

/**
	elementDriver ( elems: DOMObject|Array, driverExpr: String )

	Return Type:
	void

	Description:
	渲染元素驱动器

	URL doc:
	http://icejs.org/######
*/
function elementDriver ( elems, driverExpr ) {

	let driver,

		// 待加载驱动器数据保存对象
		loading = {};

	// 统一为数组
	elems = type ( elems ) === "array" ? elems : [ elems ];

	foreach ( driverExpr.split ( "," ), driverName => {
		driverName = driverName.trim ();
		driverName = config.params.alias [ driverName ] || driverName;

		// 查看驱动器是否已加载
		// 如果有alias则使用alias获取driver地址，否则直接使用driverName
		if ( driver = cache.componentFactory ( driverName, TYPE_DRIVER ) ) {

			// 渲染元素
			elementDriver.render ( elems, driver );
		}

		// 加载元素驱动器
		else {
			// http.get (  )
		}
	} )
}

//////////////////////////////////////////
// 元素驱动器相关属性通用参数，为避免重复定义，统一挂载到elementDriver对象上
//
extend ( elementDriver, {
	aDriver : "ice-driver",
	aParam 	: "ice-param"
} );


extend ( elementDriver, {

	/**
		render ( elems: Array, driver: Object )
	
		Return Type:
		void
	
		Description:
		使用元素驱动器渲染元素组件
	
		URL doc:
		http://icejs.org/######
	*/
	render ( elems, driver ) {
		foreach ( elems, function ( elem ) {
			driver.init.call ( elem );
		} );
	}
} );