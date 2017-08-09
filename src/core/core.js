import config from "./config/config";
import cache from "../cache/core";
import single from "../single/core";
import depend from "./deps/depend";
import Loader from "./deps/Loader";
import { type, isEmpty, foreach } from "../func/util";
import { query } from "../func/node";
import check from "../check";
import NodeLite from "./NodeLite";
import ViewModel from "./ViewModel";
import Tmpl from "./tmpl/Tmpl";


/////////////////////////////////
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
let ice = {
	config : config (),

	use ( structure ) {
		// 查看是否有deps，有的时候，value类型分为以下情况：
		// 1、若value为string，则使用cache.componentCreater方法获取插件，如果没有则使用模块加载器加载
		// 2、若value为object，则调用use构建插件
		// 判断是plugin还是driver，存入相应的cache中并返回
	},

	module ( moduleName, vmData ) {

		// 检查参数
		check ( moduleName ).type ( "string" ).notBe ( "" ).ifNot ( "ice.module", "moduleName参数类型必须为string" ).do ();
		check ( vmData ).type ( "object" ).check ( vmData.init ).type ( "function" ).ifNot ( "ice.module", "vmData参数必须为带有init方法的的object" ).do ();
      	
      	/////////////////////////////////
      	/////////////////////////////////
      	///
		let moduleElem 	= query ( "*[" + single.aModule + "=" + moduleName + "]" ),
			rarg 		= /^function\s*\((.*)\)\s*/,

			// 获取init方法参数
			initArgs 	= ( ( rarg.exec ( vmData.init.toString () ) || [] ) [ 1 ] || "" ).split ( "," ).map ( item => item.trim () ),

			// 获取apply方法参数
			applyArgs 	= type ( vmData.apply ) === "function" ? 
						( ( rarg.exec ( vmData.apply.toString () ) || [] ) [ 1 ] || "" ).split ( "," ).map ( item => item.trim () ) : [],

			// apply方法的第一个参数为module根元素，而不是插件
			args 		= applyArgs.slice ( 1 ).concat ( initArgs ),
			deps 		= vmData.deps,
			_deps 		= {};

		// 过滤多余的依赖项
		foreach ( deps, ( item, key ) => {
			if ( args.indexOf ( key ) > -1 ) {
				_deps [ key ] = item;
			}
		} );
		deps = _deps;

		// 依赖注入插件对象后
		depend ( Loader.topName, deps, ( depObject ) => {
			
			let initDeps = initArgs.map ( arg => depObject [ arg ] ),

				parentVm = findParentVm ( moduleElem ) || {},

				// 获取后初始化vm的init方法
				// 对数据模型进行转换
				vm = new ViewModel ( vmData.init.apply ( parentVm, initDeps ) ),

				// 使用vm解析模板
				tmpl = new Tmpl ( moduleElem );
			
			// 将当前vm保存在对应的模块根节点下，以便子模块寻找父模块的vm对象
			moduleElem.__vm__ = vm;

			// 解析模板，挂载数据
			tmpl.mount ( vm );
		} );
		// 查看是否有元素驱动器，有的话就加载驱动器对象
		// 调用apply方法
	},

	drivenElem () {

	}
};

export default ice;