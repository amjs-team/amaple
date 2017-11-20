import plugin from "./plugin";
import module from "./module";
import component from "./component";
import event from "./event";
import { pluginErr } from "../error";

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

	/**
		getDependentPlugin ( fn: Function )
	
		Return Type:
		Array
		函数依赖的插件对象数组
	
		Description:
		获取函数依赖的插件对象数组
	
		URL doc:
		http://icejs.org/######
	*/
	getDependentPlugin ( fn ) {
		const fnString = fn.toString ();
		let plugin;

		return ( ( /^function(?:\s+\w+)?\s*\((.*)\)\s*/.exec ( fnString ) 
				|| /^\(?(.*?)\)?\s*=>/.exec ( fnString ) 
				|| /^\S+\s*\((.*?)\)/.exec ( fnString ) 
				|| [] ) [ 1 ] || "" )
		.split ( "," )
		.filter ( item => !!item )
		.map ( pluginName => {
			pluginName = pluginName.trim ();
			plugin = this.getPlugin ( pluginName );
			if ( !plugin ) {
				throw pluginErr ( "inject", `没有找到名为'${ pluginName }'的插件` );
			}

			return plugin;
		} );
	},
	
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
	
	pushComponent ( name, comp ) {
    	component.push ( name, comp );
    },
	
	getComponent ( name ) {
    	return component.get ( name );
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