import cache from "../../cache/core";
import check from "../../check";

/**
	install ( plugin: Object )
	
	Return Type:
	void
	
	Description:
	安装插件
	插件定义对象必须拥有build方法
	若插件安装后会返回一个对象，则可在模块或组件的生命周期钩子函数中直接使用插件名引入，框架会自动注入对应插件
	
	URL doc:
	http://icejs.org/######
*/
export default function install ( plugin ) {
	check ( plugin.name ).type ( "string" ).notBe ( "" )
	.check ( cache.hasPlugin ( plugin.name ) ).be ( false )
	.ifNot ( "plugin.name", "plugin安装对象必须定义name属性以表示此插件的名称，且不能与已有插件名称重复" )
	.do ();

	check ( plugin.build ).type ( "function" )
	.ifNot ( "plugin.build", "plugin安装对象必须包含build方法" )
	.do ();
	
	const deps = cache.getDependentPlugin ( plugin.build );
    cache.pushPlugin ( plugin.name, plugin.build.apply ( this, deps ) );
}