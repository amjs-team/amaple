import ComponentLoader from "./ComponentLoader";
import cache from "../../../cache/core";
import { foreach, guid } from "../../../func/util";
import { appendScript, attr } from "../../../func/node";

/**
	require ( deps: Object, factory: Function )

	Return Type:
	void

	Description:
	依赖处理方法
	此方法主要实现了deps的动态加载并依赖注入到factory中

	URL doc:
	http://icejs.org/######
*/
export default function require ( deps, factory ) {

	const
    	nguid = guid (),
    	
		// 正在加载的依赖数
		loadingCount = 0,

		module = {
			deps 	: deps,
			factory : factory,
		},
	
		loadObj = ComponentLoader.create ( nguid, module );

	// 遍历依赖，如果依赖未被加载，则放入waiting中等待加载完成
	foreach ( deps, depStr => {
		if ( !cache.getComponent ( depStr ) ) {

			// 放入待加载列表中等待加载
			loadObj.putWaiting ( depStr );

			// 加载依赖
			const script = document.createElement ( "script" );

			script.src 	= depStr + ComponentLoader.suffix;
			script [ ComponentLoader.depName ] = depStr;
			script [ ComponentLoader.ComponentLoaderID ] = nguid;

			appendScript ( script, ComponentLoader.onScriptLoaded );

			loadingCount ++;
		}
	} );

	// 如果顶层执行依赖没有待加载的依赖参数，或可以直接触发，则直接执行
	if ( loadingCount === 0 && name === ComponentLoader.topName ) {
		loadObj.inject ();
		loadObj.fire ();
	}
}