import plugin from "./plugin";
import driver from "./driver";
import module from "./module";
import event from "./event";

/**
	Plugin cache

	Description:
	内部缓存对象
	缓存内容如下：
	1. 插件对象缓存
	2. 元素驱动器缓存
	3. 页面跳转与状态切换时的缓存，开启缓存后，页面跳转数据将会被缓存，再次调用相同地址时将使用缓存更新页面以提高响应速度，实时性较高的页面建议关闭缓存。

	URL doc:
	http://icejs.org/######
*/
export default {
	
	// 查看是否存在指定插件
	hasPlugin ( name ) {
		return plugin.has ( name );
	},

	// 添加插件缓存
	pushPlugin ( name, p ) {
		plugin.push ( name, p );
	},

	// 获取已加载插件
	getPlugin ( name ) {
		return plugin.get ( name );
	},

	// 添加元素驱动器缓存
	pushDriver ( name, d ) {
		driver.push ( name, d );
	},

	// 获取已加载元素驱动器
	getDriver ( name ) {
		return driver.get ( name );
	},

	// 添加页面模块缓存
	pushModule ( name, d ) {
		module.push ( name, d )
	},

	// 获取页面模块缓存
	getModule ( name ) {
		return module.get ( name );
	},

	// 添加非元素事件缓存
	pushEvent ( type, listener ) {
		event.push ( type, listener );
	},

	// 获取非元素事件缓存
	getEvent ( type ) {
		return event.get ( type );
	},

	// 获取所有事件
	getAllEvent () {
		return event.getAll ();
	},
};