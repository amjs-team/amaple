import { noop, guid, extend, type, foreach } from "../func/util";
import { query } from "../func/node";
import { matchFnArgs, parseGetQuery } from "../func/private";
import slice from "../var/slice";
import cache from "../cache/core";
import { newClassCheck } from "../Class.js";
import ViewModel from "./ViewModel";
import Tmpl from "./tmpl/Tmpl";
import iceAttr from "../single/iceAttr";
import check from "../check";
import Structure from "./tmpl/Structure";
import VNode from "./vnode/VNode";


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
    initModuleLifeCycle ( module: Object, lifeCycle: Array, vm: Object )
    
    Return Type:
    void
    
    Description:
    初始化模块对象的生命周期
    
    URL doc:
    http://icejs.org/######
*/
function initModuleLifeCycle ( module, vm ) {
    const
    	// Module生命周期
		lifeCycle = [ "queryChanged", "paramChanged", "unmount" ],
        lifeCycleContainer = {};
            
    foreach ( lifeCycle, cycleItem => {
        lifeCycleContainer [ cycleItem ] = vm [ cycleItem ] || noop;
        module [ cycleItem ] = () => {
            lifeCycleContainer [ cycleItem ].apply ( module, cache.getDependentPlugib ( lifeCycleContainer [ cycleItem ] ) );
        }
        
        delete vm [ cycleItem ];
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
	1、module属性名，普通模式时的模块名，此方法将会根据模块名获取dom元素
	2、实际dom和fragment，此方法将直接解析此元素

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
	initModuleLifeCycle ( this, vmData );

	let parent;
	if ( Structure.currentPage ) {
		
    	// 只有单页模式时Structure.currentPage会有值
		// 单页模式时，使用Structure.currentPage.getCurrentParentVm()获取父级的vm
		const currentRender = Structure.currentPage.getCurrentRender ();
    	parent = currentRender.parent && currentRender.parent.module.vm;
		
        this.params = currentRender.param;
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
	}
    this.parent = parent;
	
	moduleElem = VNode.domToVNode ( moduleElem );
    const
    	moduleElemBackup = moduleElem.clone (),
    	components = ( () => {
        	let compFn = vmData.depComponents,
                deps = cache.getDependentPlugin ( compFn || noop );
        	
        	try {
        		return ( compFn || noop ).apply ( this, deps );
            }
        	catch ( e ) {
            	const 
 					depStrs = ( compFn.toString ().match ( /return\s+\[(.+?)\]/ ) || [ "", "" ] ) [ 1 ].split ( "," ).map ( item => item.trim () ),
                    depComps = [];

            	foreach ( depStrs, depObj => {
                	depComps.push ( depObj );
                } );
            	
            	return depComps;
			}
        } ) (),
	
		// 获取后初始化vm的init方法
		// 对数据模型进行转换
		vm = new ViewModel ( vmData.init.apply ( this, cache.getDependentPlugin ( vmData.init ) ) ),

		// 使用vm解析模板
		tmpl = new Tmpl ( vm, components, this );
	
	// this.view = slice.call ( moduleElem.childNodes ) || [];
	this.state = vm;

	// 解析模板，挂载数据
	// 如果forceMount为true则强制挂载moduleElem
	// 单页模式下未挂载的模块元素将会在ModuleLoader.load完成挂载
	// 普通模式下，如果parent为对象时表示此模块不是最上层模块，不需挂载
	tmpl.mount ( moduleElem, Structure.currentPage ? false : !parent );
	
	moduleElem.render ();
	
	// 对比新旧vnode计算出差异
	// 并根据差异更新到实际dom中
	moduleElem.diff ( moduleElemBackup ).patch ();
	
	// 调用apply方法
	( vmData.apply || noop ).apply ( this, cache.getDependentPlugin ( vmData.apply || noop ) );
}

extend ( Module.prototype, {
	refs ( ref ) {
    	return this.refs [ ref ] || null;
    }
} );

extend ( Module, {
	identifier : "ice-identifier",
	
	getIdentifier () {
		return "module" + guid ();
	}
} )