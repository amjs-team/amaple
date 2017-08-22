import { setCurrentPath } from "../../func/private";
import { attr } from "../../func/node";
import single from "./core";

export default function includeModule ( module, src = attr ( module, single.aSrc ), moduleName = arre ( module, single.aModule ) ) {
	// 如果在single.moduleRecord中找到了当前加载模块的信息，则使用single.moduleRecord中的模块内容信息去加载内容
	// 此模块信息是由初始化时将pathname解析而来
	// 如果pathname中包含该模块的加载信息，则该模块需根据pathname的信息来加载，否则使用该模块的默认模块信息加载
	src = single.getModuleRecord ( moduleName ) || src;

	// 保存当前的路径
	// 用于无刷新跳转时，模块内容替换前的状态保存
	// 这样便可以在后退或前进时找到刷新前的状态
	setCurrentPath ( module, src );

	// 无刷新跳转组件调用来完成无刷新跳转
	single ( src, module );
}