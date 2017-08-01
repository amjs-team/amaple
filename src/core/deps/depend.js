import Loader from "./Loader";
import cache from "../../cache/core";
import { foreach } from "../../func/util";
import { urlTransform } from "../../func/private";
import { appendScript } from "../../func/node";
import core from "../core";

/**
	depend ( name: String, deps: Object, args: Array, factory: Function )

	Return Type:
	void

	Description:
	依赖处理方法
	此方法主要实现了deps的动态加载并依赖注入到factory中

	URL doc:
	http://icejs.org/######
*/
export default function depend ( name, deps, args, factory ) {

	let // 非最外层加载依赖则name将接收一个包含name和guid的对象
		guid = name === Loader.topName ? guid$ () : name.guid,

		// 正在加载的依赖数
		loadingCount = 0,
		canFire 	 = true,

		module, loadObj;

	// 判断init方法是否使用插件
	// 如果没有使用插件则可以直接调用
	foreach ( args, item => {
		if ( deps.hasOwnProperty ( item ) ) {
			canFire = false;
			return false;
		}
	} );

	module = {
			// type 	: type,
			deps 	: deps,
			factory : factory,
			args 	: args
		};

	// 只有在加载插件类型的依赖时才不创建Loader加载器
	if ( name === Loader.topName ) {

		// 创建Loader对象并将此依赖保存于loadDep中
		loadObj = Loader.create ( guid, name, module );
	}
	else {
		loadObj = Loader.loaderMap [ guid ];
		loadObj.putLoad ( name.name, module );
	}

	// 遍历依赖，如果依赖未被加载，则放入waiting中等待加载完成
	foreach ( deps, function ( depStr ) {

		// 依赖名可使用“.“作为命名空间分隔，将依赖项名字中的“.”统一转换为“/”
		depStr = urlTransform ( depStr );
		if ( !cache.getPlugin ( depStr ) ) {

			// 放入待加载列表中等待加载
			depStr.putWaiting ( depStr );

			// 加载依赖
			let script 	= document.createElement ( "script" );
			script.src 	= core.config.base.plugin + depStr + loader.suffix + "?m=" + depStr + "&guid=" + guid;
			script.setAttribute ( Loader.depName, depStr );
			script.setAttribute ( Loader.scriptFlag, "" );
			script.setAttribute ( Loader.loaderID, guid );

			appendScript ( script, Loader.onScriptLoaded );

			loadingCount ++;
		}
	} );

	// 如果顶层执行依赖没有待加载的依赖参数，或可以直接触发，则直接执行
	if ( ( loadingCount === 0 && name === Loader.topName ) || canFire ) {
		loadObj.inject ();
		loadObj.fire ();
	}
}