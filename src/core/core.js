import { AUTO, HASH, BROWSER } from "../router/history/historyMode";
import Class from "../Class";
import startRouter from "../router/core";
import install from "./plugin/install";
import Module from "./Module";
import Component from "./component/core";
import cache from "../cache/core";
import { type, foreach, isEmpty, isPlainObject, guid } from "../func/util";
import event from "../event/core";
import http from "../http/core";
import Promise from "../promise/core";

// 创建插件
cache.pushPlugin ( "util", { type, foreach, isEmpty, isPlainObject, guid } );
cache.pushPlugin ( "event", {
	on ( types, listener, once ) {
		event.on ( undefined, types, listener, false, once );
	},
	remove ( types, listener ) {
		event.remove ( undefined, types, listener, false );
	},
	emit ( types ) {
		event.emit ( undefined, types );
	}
} );
cache.pushPlugin ( "http", http );
cache.pushPlugin ( "Promise", Promise );


// 导出amaple主对象
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