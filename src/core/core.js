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

			// 获取apply方法参数
			applyArgs 	= matchFnArgs ( vmData.apply || noop ),




			initDeps 	= initArgs.map ( plugin => cache.getPlugin ( plugin ) ),

			parentVm = findParentVm ( moduleElem ) || {},

			// 获取后初始化vm的init方法
			// 对数据模型进行转换
			vm = new ViewModel ( vmData.init.apply ( parentVm, initDeps ) ),

			// 使用vm解析模板
			tmpl = new Tmpl ( moduleElem );
		
		// 将当前vm保存在对应的模块根节点下，以便子模块寻找父模块的vm对象
		moduleElem.__vm__ = vm;

		// 解析模板，挂载数据
		tmpl.mount ( vm, true );

		vm.view = slice.call ( moduleElem.childNodes ) || [];
		// 查看是否有元素驱动器，有的话就加载驱动器对象
		// 调用apply方法
		 
		return vm;
	}
};