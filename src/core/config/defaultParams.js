import allowState from "./allowState";

export default {
	// 异步加载时的依赖目录，设置后默认在此目录下查找，此对象下有4个依赖目录的设置，如果不设置则表示不依赖任何目录
	base : {
		
		// url请求base路径，设置此参数后则跳转请求都依赖此路径
		// 此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则使用""
		url : "",

		// 插件加载base路径，设置此参数后动态加载插件均依赖此路径
		// 此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
		plugin : "",

		// 元素驱动器base路径，设置此参数后动态加载元素驱动器均依赖此路径
		// 此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
		driver : ""
	},

	// url地址中的状态标识符，如http://...@login表示当前页面在login的状态
	stateSymbol : allowState [ 0 ],

	// 是否开启跳转缓存，默认开启。跳转缓存是当页面无刷新跳转时缓存跳转数据，当此页面实时性较低时建议开启，以提高相应速度
	directionCache : true,

	// url中模块名称与模块内容标识的分隔符，默认为"-"
	moduleSeparator : "-",

	// 自定义ajax请求时的url规则，通过设置此规则将规则中的模块名称与模块内容标识替换为当前请求环境的真实值，此规则与base.url和ice-base关联，即当设置了base.url且ice-base不为false时将自动添加base.url到此url前，如果ice-base为false时，此规则转换后的url将会从根目录当做url的起始路径，即在设置规则时第一个字符如果不是"/"，则系统将自动添加"/"到url的开头部分。默认规则为":m/:v.html"
	urlRule : ":m/:v.html",

	// 元素驱动器别名，当一个元素设置了别名后可在页面中直接使用别名使用对应的元素加载器。格式为{alias1: driver1, alias2: driver2...}
	alias : {},

	// 定义404页面显示模块及请求地址，格式为{moduleName: 404url}
	page404 : "",

	// 定义500页面显示模块及请求地址，格式为{moduleName: 500url}
	page500 : ""
};