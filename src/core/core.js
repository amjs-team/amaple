import config from "./config/config";
import cache from "../cache/core";
import single from "../single/core";
import depend from "./deps/depend";
import { type, isEmpty } from "../func/util";
import { query } from "../func/node";
import check from "../check";
import NodeLite from "./NodeLite";
import ViewModel from "./ViewModel";
import Tmpl from "./tmpl/Tmpl";


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
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
		check ( vmData ).type ( "Object" ).ifNot ( "ice.module", "vmData参数类型必须为object" ).do ();
      	
		// 查看是否有deps，有的话，value类型分为以下情况：
		// 1、若value为string，则使用cache.componentCreater方法获取插件，如果没有则使用模块加载器加载
		// 2、若value为object，则调用use构建插件
		if ( type ( vmData.deps ) === "object" && !isEmpty ( vmData.deps ) ) {

			let 
				
				rarg 		= /^function\s*\((.*)\)\s*/,

				// 获取init方法参数
				initArgs 	= rarg.exec ( vmData.init.toString () )[1].split ( "," ).map ( item => item.trim () ),

				// 获取apply方法参数
				applyArgs 	= type ( vmData.apply ) === "function" ? 
							rarg.exec ( vmData.apply.toString () )[1].split ( "," ).map ( item => item.trim () ) : [],
				args 		= initArgs.concat ( applyArgs ).map ( item => {
									return item.trim ();
								} ),
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
			depend ( loader.topName, deps, initArgs, ( ...depArray ) => {
				
				let moduleElem = query ( "*[" + single.aModule + "=" + moduleName + "]" ),
                    vm, tmpl;
				if ( !deps.hasOwnProperty ( initArgs [ 0 ] ) ) {
					depArray.unshift ( new NodeLite ( moduleElem ) );
				}
				
              	// 对数据模型进行转化
				vm = new ViewModel ( vmData.init.apply ( depArray ) );
				
              	// 使用vm解析模板
              	tmpl = new Tmpl ( moduleElem );
				tmpl.mount ( vm );
			} );
		}

		// 获取后初始化vm的init方法，如果init方法不依赖任何deps，则不需要在加载完deps就可以调用
		// 解析模板
		// 查看是否有元素驱动器，有的话就加载驱动器对象
		// 调用apply方法
	},

	drivenElem () {

	}
};

export default ice;