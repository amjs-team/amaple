import plugin from "./plugin";
import driver from "./driver";
import direction from "./direction";
import { TYPE_PLUGIN, TYPE_DRIVER } from "../var/const";

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
	
	// 添加插件缓存
	pushPlugin : plugin.push,

	// 获取已加载插件
	getPlugin : plugin.get,

	// 获取已加载元素驱动器
	getDriver : driver.get,

	// 添加元素驱动器缓存
	pushDriver : driver.push,

	// 添加跳转缓存模块
	pushDirection : direction.push,

	// 获取跳转缓存模块
	getDirection : direction.get,
};