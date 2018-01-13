import { noop, guid, extend, type, foreach, isEmpty } from "../func/util";
import { parseGetQuery, queryModuleNode, getReference } from "../func/private";
import { clear } from "../func/node";
import { DEVELOP_COMMON, DEVELOP_SINGLE } from "../var/const";
import slice from "../var/slice";
import cache from "../cache/core";
import { newClassCheck } from "../Class.js";
import { argErr } from "../error.js";
import ViewModel from "./ViewModel";
import Tmpl from "../compiler/tmpl/core";
import check from "../check";
import Structure from "../router/Structure";
import VNode from "./vnode/VNode";
import NodeTransaction from "./vnode/NodeTransaction";

// 模块标识名
export const identifierName = "moduleIdentifier";
	
/**
	getIdentifier ()

	Return Type:
	String
	模块标识字符串

	Description:
	获取模块标识字符串
	用于区分不同模块

	URL doc:
	http://amaple.org/######
*/
export function getIdentifier () {
	return "module" + guid ();
}

/**
	findParentVm ( elem: DOMObject )

	Return Type:
	Object|Null
	父模块的vm对象
	没有找到则返回null

	Description:
	获取父模块的vm对象

	URL doc:
	http://amaple.org/######
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
    initModuleLifeCycle ( module: Object, vmData: Object )
    
    Return Type:
    void
    
    Description:
    初始化模块对象的生命周期
    
    URL doc:
    http://amaple.org/######
*/
function initModuleLifeCycle ( module, vmData ) {

	// Module生命周期
    const lifeCycle = [ "queryUpdated", "paramUpdated", "unmount" ];

    module.lifeCycle = {};
    foreach ( lifeCycle, cycleItem => {
        module.lifeCycle [ cycleItem ] = vmData [ cycleItem ] || noop;
        delete vmData [ cycleItem ];
    } );
}

/**
	Module ( moduleName: String|DOMObject|Object, vmData: Object )

	Return Type:
	Object
	Module对象

	Description:
	创建模块对象初始化模块
    初始化包括转换监听对象，动态绑定数据到视图层
    module可传入：
	1、实际dom和fragment，此方法将直接解析此元素
	2、虚拟dom，只有单页模式时会传入此类参数

	URL doc:
	http://amaple.org/######
*/
export default function Module ( moduleElem, vmData ) {
	vmData = vmData || {
		init: function () {
			return {};
		}
	};

	newClassCheck ( this, Module );
	
	const developMode = moduleElem instanceof VNode ? DEVELOP_SINGLE : DEVELOP_COMMON;
	let parent, moduleElemBackup;
      	
	// 检查参数
	if ( moduleElem ) {
		check ( moduleElem.nodeType ).be ( 1, 3, 11 ).ifNot ( "Module", "module参数可传入模块元素的:module属性值或直接传入需挂在模块元素" ).do ();
		check ( vmData ).type ( "object" ).check ( vmData.init ).type ( "function" ).ifNot ( "Module", "vmData参数必须为带有init方法的的object" ).do ();
	}
	else {
		throw argErr ( "Module", "module参数可传入模块元素的:module属性值或直接传入需挂在模块元素" );
	}
  	
  	/////////////////////////////////
  	/////////////////////////////////
	if ( developMode === DEVELOP_SINGLE && Structure.currentPage ) {
		
    	// 只有单页模式时Structure.currentPage会有值
		// 单页模式时，使用Structure.getCurrentRender().parent.module.state获取父级的vm
		const currentRender = Structure.getCurrentRender ();
    	parent = currentRender.parent && currentRender.parent.module;
		
        this.param = currentRender.param;
        this.get = parseGetQuery ( currentRender.get );
        this.post = currentRender.post;
    	
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

		// 将module元素转换为vnode，并拷贝vnode
		moduleElem = VNode.domToVNode ( moduleElem );
		moduleElemBackup = moduleElem.clone ();

		// 先清空后再添加上去进行对比
        // 避免造成if、else-if、for指令在对比时出错
        moduleElemBackup.clear ();
        clear ( moduleElemBackup.node );
	}
    this.parent = parent;
	
	initModuleLifeCycle ( this, vmData );

    const
		// 获取后初始化vm的init方法
		// 对数据模型进行转换
		vm = new ViewModel ( vmData.init.apply ( this, cache.getDependentPlugin ( vmData.init ) ) || {} ),

		// 使用vm解析模板
		tmpl = new Tmpl ( vm, vmData.depComponents || [], this );
	
	this.state = vm;
	this.references = {};

	// 解析模板，挂载数据
	// 如果forceMount为true则强制挂载moduleElem
	// 单页模式下未挂载的模块元素将会在ModuleLoader.load完成挂载
	// 普通模式下，如果parent为对象时表示此模块不是最上层模块，不需挂载
	tmpl.mount ( moduleElem, Structure.currentPage ? false : !parent );
	
	// 调用mounted钩子函数
	( vmData.mounted || noop ).apply ( this, cache.getDependentPlugin ( vmData.mounted || noop ) );

	/////////////////////////////////
  	/////////////////////////////////
	if ( developMode === DEVELOP_COMMON ) {

		// 普通模式下才会在Module内对比新旧vnode计算出差异
		// 并根据差异更新到实际dom中
		// 单页模式将会在compileModule编译的函数中对比更新dom
		moduleElem.diff ( moduleElemBackup ).patch ();
	}
}

extend ( Module.prototype, {

	/**
		refs ( ref: String )
		
		Return Type:
		DOMObject|Object
		被引用的组件行为对象或元素
		
		Description:
		获取被引用的组件行为对象或元素
		当组件不可见时返回undefined
	
		URL doc:
		http://amaple.org/######
	*/
	refs ( ref ) {
		return getReference ( this.references, ref );
    },

    /**
		queryUpdated ()
	
		Return Type:
		void
	
		Description:
		模块生命周期hook
		当url更新时该模块未重新渲染且query参数更改时调用
	
		URL doc:
		http://amaple.org/######
	*/
    queryUpdated () {            
		const nt = new NodeTransaction ().start ();
	    this.lifeCycle.queryUpdated.apply ( this, cache.getDependentPlugin ( this.lifeCycle.queryUpdated ) );

	    // 提交节点更新事物，更新所有已更改的vnode进行对比
	    // 对比新旧vnode计算出差异并根据差异更新到实际dom中
	    nt.commit ();
    },

    /**
		paramUpdated ()
	
		Return Type:
		void
	
		Description:
		模块生命周期hook
		当url更新时该模块未重新渲染且param参数更改时调用
	
		URL doc:
		http://amaple.org/######
	*/
    paramUpdated () {
    	const nt = new NodeTransaction ().start ();
	    this.lifeCycle.paramUpdated.apply ( this, cache.getDependentPlugin ( this.lifeCycle.paramUpdated ) );
	    nt.commit ();
    },

    /**
		unmount ()
	
		Return Type:
		void
	
		Description:
		模块生命周期hook
		当该模块卸载时调用
	
		URL doc:
		http://amaple.org/######
	*/
    unmount () {
    	if ( !isEmpty ( this.components ) ) {
    		foreach ( this.components, comp => {
    			comp.__unmount__ ();
    		} );
    	}

	    this.lifeCycle.unmount.apply ( this, cache.getDependentPlugin ( this.lifeCycle.unmount ) );
    }
} );