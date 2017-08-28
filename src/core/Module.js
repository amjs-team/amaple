import { noop } from "../func/util";
import { query } from "../func/node";
import slice from "../var/slice";
import { newClassCheck } from "../Class.js";
import ModuleCaller from "./ModuleCaller";
import ViewModel from "./ViewModel";
import Tmpl from "./tmpl/Tmpl";
import singleAttr from "../single/singleAttr";
import check from "../check";
import { matchFnArgs } from "../func/private";

/**
	findParentVm ( elem: DOMObject )

	Return Type:
	Object|Null
	父模块的vm对象
	没有找到则返回null

	Description:
	获取父模块的vm对象

	URL doc:
	http://icejs.org/######
*/
function findParentVm ( elem ) {

	let parentVm = null;
	while ( elem.parentNode ) {
		if ( elem.__module__ instanceof ViewModel ) {
			parentVm = elem.__module__;
			break;
		}

		elem = elem.parentNode;
	}

	return parentVm;
}


export default function Module ( moduleName, vmData ) {

	newClassCheck ( this, Module );
    	
	// 检查参数
	check ( moduleName ).type ( "string" ).notBe ( "" ).ifNot ( "ice.module", "moduleName参数类型必须为string" ).do ();
	check ( vmData ).type ( "object" ).check ( vmData.init ).type ( "function" ).ifNot ( "ice.module", "vmData参数必须为带有init方法的的object" ).do ();
  	
  	/////////////////////////////////
  	/////////////////////////////////
  	///
	let moduleElem 	= query ( `*[${ singleAttr.aModule }=${ moduleName }]` ),

		// 获取init方法参数
		initArgs 	= matchFnArgs ( vmData.init ),
      	initDeps 	= initArgs.map ( plugin => cache.getPlugin ( plugin ) ),

		// 获取apply方法参数
		applyArgs 	= matchFnArgs ( vmData.apply || noop ),
        applyDeps 	= applyArgs.map ( plugin => cache.getPlugin ( plugin ) ),

		parent = findParentVm ( moduleElem ) || {},
        
        mc = new ModuleCaller ( { parent } ),

		// 获取后初始化vm的init方法
		// 对数据模型进行转换
		vm = new ViewModel ( vmData.init.apply ( mc, initDeps ) ),

		// 使用vm解析模板
		tmpl = new Tmpl ( moduleElem );
	
	this.vm = vm;
	this.view = slice.call ( moduleElem.childNodes ) || [];
	mc.set ( { state : vm } );
	
	// 将当前Module对象保存在对应的模块根节点下，以便子模块寻找父模块的Module对象
	moduleElem.__module__ = this;

	// 解析模板，挂载数据
	tmpl.mount ( vm, true );
	
	// 调用apply方法
	( vmData.apply || noop ).apply ( mc, applyDeps );
}