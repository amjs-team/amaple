import allowState from "./allowState";

export default {
	// 异步加载时的依赖目录，设置后默认在此目录下查找，此对象下有4个依赖目录的设置，如果不设置则表示不依赖任何目录
	// url请求base路径，设置此参数后则跳转请求都依赖此路径
	// 此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则使用""
	baseURL : "",

	// url地址中的状态标识符，如http://...@login表示当前页面在login的状态
	// stateSymbol : allowState [ 0 ],

	// 模块相关配置
	module : {

	// 是否开启跳转缓存，默认开启。跳转缓存是当页面无刷新跳转时的缓存跳转数据，当此页面实时性较低时建议开启，以提高相应速度
		cache : true,
    	expired : 0
	},

	// 定义404页面显示模块及请求地址，格式为{moduleName: 404url}
	// page404 : "",

	// 定义500页面显示模块及请求地址，格式为{moduleName: 500url}
	// page500 : ""
};