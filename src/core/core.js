import configuration from "./configuration/core";
import cache from "../cache/core";
import single from "../single/core";
import { type, isEmpty, foreach, noop } from "../func/util";
import { query } from "../func/node";
import { matchFnArgs } from "../func/private";
import { TYPE_PLUGIN, TYPE_DRIVER } from "../var/const";
import slice from "../var/slice";
import check from "../check";
import correctParam from "../correctParam";
import ModuleCaller from "./ModuleCaller";
import NodeLite from "./NodeLite";
import ViewModel from "./ViewModel";
import Tmpl from "./tmpl/Tmpl";


/////////////////////////////////

/**
	filterDeps ( deps: Object, args: Array )

	Return Type:
	Object
	过滤后deps对象

	Description:
	过滤deps中未被接收的依赖项

	URL doc:
	http://icejs.org/######
*/
function filterDeps ( deps, args ) {
	let _deps = {};
	
	// 过滤多余的依赖项
	foreach ( deps, ( item, key ) => {
		if ( args.indexOf ( key ) > -1 ) {
			_deps [ key ] = item;
		}
	} );

	return _deps;
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
	http://icejs.org/######
*/
function findParentVm ( elem ) {

	let parentVm = null;
	while ( elem.parentNode ) {
		if ( elem.__vm__ instanceof ViewModel ) {
			parentVm = elem.__vm__;
			break;
		}

		elem = elem.parentNode;
	}

	return parentVm;
}


/////////////////////////////////
export default {
	configure : configuration,

	install ( structure ) {
    	
		// 查看是否有deps，有的时候，value类型分为以下情况：
		// 1、若value为string，则使用cache.componentCreater方法获取插件，如果没有则使用模块加载器加载
		// 2、若value为object，则调用use构建插件
		// 判断是plugin还是driver，存入相应的cache中并返回
    	
    	check ( structure.build ).type ( "function" ).or ().check ( structure.init ).type ( "function" ).ifNot ( "plugin-driver", "plugin必须包含build方法，driver必须包含init方法" ).do ();
      
    	let deps = structure.deps || {},
            moduleType = structure.build ? TYPE_PLUGIN :TYPE_DRIVER,
            moduleInfo = Loader.getCurrentDep (),
            args;
    	
        switch ( moduleType ) {
            case TYPE_PLUGIN:
                args = matchFnArgs ( structure.build );
            	deps = filterDeps ( deps, args );
    			depend ( moduleInfo || {}, deps, ( depObject ) => {
                	cache.pushPlugin ( moduleInfo.name, structure.build.apply ( null, args.map ( arg => depObject [ arg ] ) ) );
                } );
            	
                break;
            case TYPE_DRIVER:
                args = matchFnArgs ( structure.apply ).slice ( 1 ).concat ( matchFnArgs ( structure.init ) );
            	deps = filterDeps ( deps, args );
          		cache.pushDriver ( structure );
    			depend ( Loader.TopName, deps, noop );
            	
                break;
        }
	},
	
	/**
		module ( moduleName: String, vmData: Object )
		
		Return Type:
		Object
		转换后的模块监听ViewModel对象
		
		Description:
		初始化模块
        初始化包括转换监听对象，动态绑定数据到视图层
		
		URL doc:
		http://icejs.org/######
	*/
	module ( moduleName, vmData ) {

		// 检查参数
		check ( moduleName ).type ( "string" ).notBe ( "" ).ifNot ( "ice.module", "moduleName参数类型必须为string" ).do ();
		check ( vmData ).type ( "object" ).check ( vmData.init ).type ( "function" ).ifNot ( "ice.module", "vmData参数必须为带有init方法的的object" ).do ();
      	
      	/////////////////////////////////
      	/////////////////////////////////
      	///
		let moduleElem 	= query ( "*[" + single.aModule + "=" + moduleName + "]" ),

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
    	mc.set ( { state : vm } );
		
		// 将当前vm保存在对应的模块根节点下，以便子模块寻找父模块的vm对象
		moduleElem.__vm__ = vm;

		// 解析模板，挂载数据
		tmpl.mount ( vm, true );

		vm.view = slice.call ( moduleElem.childNodes ) || [];
    	
		// 调用apply方法
		vmData.apply.apply ( mc, applyDeps );
      
		return vm;
	},
	
	/**
		start ( rootModuleName: String )
		
		Return Type:
		void
		
		Description:
		以一个module作为起始点启动ice
		
		URL doc:
		http://icejs.org/######
	*/
	start ( rootModuleName ) {
    	
    	// 后退/前进事件绑定
		//
		event.on ( window, "popstate", function ( event ) {
			let
	    // 取得在single中通过replaceState保存的state object
	    		state 			= single.history.getState ( window.location.pathname ),

	    		before 			= {},
	    		after 			= {},
	    		differentState  = {},

	    		_modules 		= [];

	    	if ( type ( state ) === "array" && state.length > 0 ) {

    			foreach ( state, item => {

    				_modules.push ( {
    					url 	: item.url, 
    					entity 	: item.module, 
    					data 	: item.data
    				} );
    			} );

	    		single ( _modules, null, null, null, null, null, null, null, null, true, true );
	    	}
	    	else {

	    		// 获得跳转前的模块信息
    			decomposeArray ( split.call ( single.history.signature, "/" ), ( key, value ) => {
    				before [ key ] = value ;
    			} );

    			// 获得跳转后的模块信息
    			decomposeArray ( split.call ( window.location.pathname, "/" ), ( key, value ) => {
    				after [ key ]  = value ;
    			} );


	    		// 对比跳转前后url所体现的变化module信息，根据这些不同的模块进行加载模块内容
	    		foreach ( after, ( afterItem, key ) => {
	    			if ( before [ key ] !== afterItem ) {
	    				differentState [ key ] = afterItem;
	    			}
	    		} );

				foreach ( before, ( afterItem, key ) => {
					if ( after [ key ] !== afterItem ) {
						differentState [ key ] = null;
					}
				} );



				// 根据对比跳转前后变化的module信息，遍历重新加载
				foreach ( differentState, ( src, moduleName ) => {
					_module = query ( `*[${ single.aModule }=${ moduleName }]` );

					src 	  = src === null ? attr ( _module, single.aSrc ) : src;

					_modules.push ( {
    					url 	: src, 
    					entity 	: _module, 
    					data 	: null
					} );
				} );

				single ( _modules, null, null, null, null, null, null, null, null, true, true );
	    	}
		} );
    	
    	// 引入根模块内容
    	single.includeModule ( query ( `*[${ single.aModule }=${ rootModuleName }]` );
    }
};