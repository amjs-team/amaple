import allowState from "./allowState";

export default {

	// 异步加载时的依赖目录，设置后默认在此目录下查找，此对象下有4个依赖目录的设置，如果不设置则表示不依赖任何目录
	// url请求base路径，设置此参数后则跳转请求都依赖此路径
	baseURL : {
		module : "/",
		plugin : "/",
		component : "/"
	},

	// url地址中的状态标识符，如http://...@login表示当前页面在login的状态
	// stateSymbol : allowState [ 0 ],

	// 模块文件后缀配置
	moduleSuffix : ".html",
};