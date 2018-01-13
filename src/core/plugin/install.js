import { foreach } from "../../func/util";
import cache from "../../cache/core";
import { buildPlugin } from "../../func/private";
import check from "../../check";
import pluginBuilder from "./core";
import Loader from "../../require/Loader";
import core from "../core";

/**
	install ( plugin: Object )
	
	Return Type:
	void
	
	Description:
	安装插件
	插件定义对象必须拥有build方法
	若插件安装后会返回一个对象，则可在模块或组件的生命周期钩子函数中直接使用插件名引入，框架会自动注入对应插件
	
	URL doc:
	http://amaple.org/######
*/
export default function install ( pluginDef ) {
	check ( pluginDef.name ).type ( "string" ).notBe ( "" )
	.check ( cache.hasPlugin ( pluginDef.name ) ).be ( false )
	.ifNot ( "plugin.name", "plugin安装对象必须定义name属性以表示此插件的名称，且不能与已有插件名称重复" )
	.do ();

	check ( pluginDef.build ).type ( "function" )
	.ifNot ( "plugin.build", "plugin安装对象必须包含build方法" )
	.do ();

	const path = Loader.getCurrentPath ();
	let find = false;
	foreach ( pluginBuilder.buildings, building => {
		if ( building.url === path ) {
			building.install = () => {
				buildPlugin ( pluginDef, core );
			};
			find = true;
		}
	} );

	// 没有找到需安装插件时直接安装此插件
	// 用于普通模式下安装插件
	if ( !find ) {
		buildPlugin ( pluginDef, core );
	}
}