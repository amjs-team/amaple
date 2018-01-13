import { AUTO, HASH, BROWSER } from "../router/history/historyMode";
import Class from "../Class";
import startRouter from "../router/core";
import install from "./plugin/install";
import Module from "./Module";
import Component from "./component/core";

const am = {

	// 路由模式，启动路由时可进行模式配置
	// 默认为自动选择路由模式，即在支持html5 history API时使用新特性，不支持的情况下自动回退到hash模式
	AUTO,

	// 强制使用hash模式
	HASH,

	// 强制使用html5 history API模式
	// 使用此模式时需注意：在不支持新特新的浏览器中是不能正常使用的
	BROWSER,
	
	// Module对象
	Module,

	// Component对象
	Component,

	// Class类构造器
	// 用于创建组件类
	class : Class,
	
	// 启动路由
	startRouter,

	// 安装插件
 	install
};

export default am;