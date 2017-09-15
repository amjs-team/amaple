import { noop, guid, extend, type, foreach } from "../func/util";
import { query } from "../func/node";
import { matchFnArgs, parseGetQuery } from "../func/private";
import slice from "../var/slice";
import cache from "../cache/core";
import { newClassCheck } from "../Class.js";
import ModuleCaller from "./ModuleCaller";
import ViewModel from "./ViewModel";
import Tmpl from "./tmpl/Tmpl";
import iceAttr from "../single/iceAttr";
import check from "../check";
import Structure from "./tmpl/Structure";


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
		if ( elem.__module__ ) {
			parentVm = elem.__module__.vm;
			break;
		}

		elem = elem.parentNode;
	}

	return parentVm;
}

/**
	Module ( moduleName: String|DOMObject, vmData: Object )

	Return Type:
	Object
	Module对象

	Description:
	创建模块对象初始化模块
    初始化包括转换监听对象，动态绑定数据到视图层

	URL doc:
	http://icejs.org/######
*/
export default function Module ( module, vmData = { init: function () { return {}; } } ) {

	newClassCheck ( this, Module );
	
	let moduleElem;
    if ( type ( module ) === "string" ) {
    	moduleElem = query ( `*[${ iceAttr.module }=${ module }]` );
    }
    else if ( module.nodeType === 1 || module.nodeType === 3 || module.nodeType === 11 ) {
    	moduleElem = module;
    }
      	
	// 检查参数
	check ( moduleElem.nodeType ).be ( 1, 3, 11 ).ifNot ( "ice.Module", "module参数可传入模块元素的ice-module属性值或直接传入需挂在模块元素" ).do ();
	check ( vmData ).type ( "object" ).check ( vmData.init ).type ( "function" ).ifNot ( "ice.Module", "vmData参数必须为带有init方法的的object" ).do ();
  	
  	/////////////////////////////////
  	/////////////////////////////////
	const
		// 获取init方法参数
		initArgs = matchFnArgs ( vmData.init ),
      	initDeps = initArgs.map ( plugin => cache.getPlugin ( plugin ) ),

		// 获取apply方法参数
		applyArgs = matchFnArgs ( vmData.apply || noop ),
        applyDeps = applyArgs.map ( plugin => cache.getPlugin ( plugin ) ),
        caller = this.caller = new ModuleCaller ();

	let parent;
	if ( Structure.currentPage ) {

		// 单页模式时，使用Structure.currentPage.getCurrentParentVm()获取父级的vm
		const currentRender = Structure.currentPage.getCurrentRender ();
    	parent = currentRender.parent && currentRender.parent.module.vm;
    
    	caller.set ( {
        	param : currentRender.param,
        	get : parseGetQuery ( currentRender.get ),
        	post : currentRender.post
        } );
    	
     	// 参数传递过来后可移除，以免与下一次传递的参数混淆
    	delete currentRender.param;
        delete currentRender.get;
        delete currentRender.post;

        // 将此Module对象保存到页面结构体的对应位置中
        currentRender.module = this;
	}
	else {

		// 普通模式时，使用向上寻找DOM的形式获取父级vm
		parent = findParentVm ( moduleElem );
		
		// 将当前Module对象保存在对应的模块根节点下，以便子模块寻找父模块的Module对象
		moduleElem.__module__ = this;
	}
    caller.set ( { parent } );
    
    const
	
		// 获取后初始化vm的init方法
		// 对数据模型进行转换
		vm = new ViewModel ( vmData.init.apply ( caller, initDeps ) ),

		// 使用vm解析模板
		tmpl = new Tmpl ( vm, vmData.components );
	
	this.vm = vm;
	this.view = slice.call ( moduleElem.childNodes ) || [];
	caller.set ( { state : vm } );

	// 解析模板，挂载数据
	// 如果forceMount为true则强制挂载moduleElem
	// 如果parentVm为对象时表示此模块不是最上层模块，不需挂载
	tmpl.mount ( moduleElem, !parent );
	
	this.initLifeCycle ( caller );
	
	// 调用apply方法
	( vmData.apply || noop ).apply ( caller, applyDeps );
}

extend ( Module.prototype, {
	initLifeCycle ( caller ) {
    	const 
    		lifeCycle = [ "mount", "queryChanged", "paramChanged", "unmount" ],
    		lifeCycleContainer = {};
    	
    	foreach ( lifeCycle, cycleItem => {
        	lifeCycleContainer [ cycleItem ] = this.vm [ cycleItem ] || noop;
        	this [ cycleItem ] = () => {
            	lifeCycleContainer [ cycleItem ].call ( caller );
            }
        	
        	delete this.vm [ cycleItem ];
        } );
    }
} );

extend ( Module, {
	identifier : "ice-identifier",
	
	getIdentifier () {
		return "module" + guid ();
	}
} )