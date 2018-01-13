import { foreach, guid, noop } from "../func/util";
import { attr, appendScript } from "../func/node";
import { TYPE_COMPONENT, TYPE_PLUGIN } from "../var/const";
import Loader from "./Loader";
import { getLoadedPlugin, getLoadedComponent } from "./getLoadedModule";
import cache from "../cache/core";


/**
	require ( deps: Object, factory: Function, moduleType, callbacks: Object )

	Return Type:
	void

	Description:
	依赖处理方法
	此方法主要实现了deps的动态加载并依赖注入到factory中
	callbacks中的回调函数为对应的url下，script的onload事件需调用的回调函数

	URL doc:
	http://amaple.org/######
*/
export default function require ( deps, factory, moduleType, callbacks ) {
	Loader.isRequiring = true;

	// 正在加载的依赖数
	let	loadingCount = 0,
		getCache = null;

	const
    	nguid = guid (),
		module = {
			deps 	: deps,
			factory : factory,
		},
		loadObj = Loader.create ( nguid, module );

	switch ( moduleType ) {
		case TYPE_COMPONENT : 
			loadObj.getLoadedModule = loadURL => {
				return getLoadedComponent ( loadURL, Loader );
			};
			getCache = depStr => {
				return cache.getComponent ( depStr );
			};

			break;
		case TYPE_PLUGIN :
			loadObj.getLoadedModule = loadURL => {
				return getLoadedPlugin ( loadURL, Loader );
			};
			getCache = noop;

			break;
	}

	// 遍历依赖，如果依赖未被加载，则放入waiting中等待加载完成
	foreach ( deps, depStr => {
		const dep = getCache ( depStr );
		if ( !dep ) {

			// 放入待加载列表中等待加载
			loadObj.putWaiting ( depStr );

			// 加载依赖
			const script = document.createElement ( "script" );

			script.src 	= depStr + Loader.suffix;
			attr ( script, Loader.depName, depStr );
			attr ( script, Loader.loaderID, nguid );
			
			appendScript ( script, e => {
				( callbacks && callbacks [ depStr ] || noop ) ( e );
				Loader.onScriptLoaded ( e );
			} );

			loadingCount ++;
		}
		else {
			loadObj.loadedModule [ depStr ] = dep;
		}
	} );

	// 如果顶层执行依赖没有待加载的依赖参数，或可以直接触发，则直接执行
	if ( loadingCount === 0 ) {
		loadObj.fire ( loadObj.inject () );
	}
}