import { extend, foreach } from "../func/util";
import { attr } from "../func/node";
import { getFunctionName } from "../func/private";
import slice from "../var/slice";
import cache from "../cache/core";

/**
	Loader ( load: Object )

	Return Type:
	void

	Description:
	依赖加载器

	URL doc:
	http://amaple.org/######
*/
export default function Loader ( load ) {

	
	// 需要加载的依赖，加载完成所有依赖需要遍历此对象上的所有依赖并调用相应回调函数
	this.load = load;

	 // 等待加载完成的依赖，每加载完成一个依赖都会将此依赖在waiting对象上移除，当waiting为空时则表示相关依赖已全部加载完成
	this.waiting = [];
	this.loadedModule = {};
}


extend ( Loader.prototype, {

	/**
		putWaiting ( name: String )
		
		Return Type:
		void
	
		Description:
		将等待加载完成的依赖名放入context.waiting中
	
		URL doc:
		http://amaple.org/######
	*/
	putWaiting ( name ) {
		this.waiting.push ( name );
	},

	/**
		dropWaiting ( name: String )
	
		Return Type:
		Number
	
		Description:
		将已加载完成的依赖从等待列表中移除
	
		URL doc:
		http://amaple.org/######
	*/
	dropWaiting ( name ) {
		const pointer = this.waiting.indexOf ( name );
		if ( pointer !== -1 ) {
			this.waiting.splice ( pointer, 1 );
		}

		return this.waiting.length;
	},

	/**
		inject ()
	
		Return Type:
		Function
	
		Description:
		依赖注入方法实现
	
		URL doc:
		http://amaple.org/######
	*/
	inject () {
		const deps = [];
		foreach ( this.load.deps, depStr => {
			deps.push ( this.loadedModule [ depStr ] );
		} );

		// 返回注入后工厂方法
		return () => {
			this.load.factory.apply ( {}, deps );
		};
	},

	/**
		fire ( factory: Function )
	
		Return Type:
		void
	
		Description:
		触发依赖工厂方法
	
		URL doc:
		http://amaple.org/######
	*/
	fire ( factory ) {
		factory ();
		Loader.isRequiring = false;
	},
} );



extend ( Loader, {

	// 是否正在加载依赖组件
	isRequiring : false,

	// 文件后缀
	suffix : ".js",

	// js组件的依赖名称属性，通过此属性可以得到加载完成的依赖名
	depName : "data-depName",

	// script加载依赖时用于标识依赖
	loaderID : "loader-ID",

	// 保存正在使用的依赖加载器对象，因为当同时更新多个依赖时将会存在多个依赖加载器对象
	loaderMap : {},

	/**
		create ( guid: Number, name: String, loadDep: Object )
	
		Return Type:
		Object
	
		Description:
		创建Loader对象保存于Loader.LoaderMap中
	
		URL doc:
		http://amaple.org/######
	*/
	create ( guid, loadDep ) {
		return Loader.loaderMap [ guid ] = new Loader ( loadDep );
	},

	/**
			getCurrentPath ()
		
			Return Type:
			Object
		
			Description:
			获取当前正在执行的依赖名与对应的依赖加载器编号
		 	此方法使用报错的方式获取错误所在路径，使用正则表达式解析出对应依赖信息
		
			URL doc:
			http://amaple.org/######
		*/
		getCurrentPath () {
			const anchor = document.createElement ( "a" );
	    	if ( document.currentScript ) {

	    		// Chrome, Firefox, Safari高版本
	        	anchor.href = document.currentScript.src;
	        }
	    	else {

	        	// IE10+, Safari低版本, Opera9
	        	try {
					____a.____b ();
				}
				catch ( e ) {
					const stack = e.stack || e.sourceURL || e.stacktrace;
	            	if ( stack ) {
	            		const 
	            			stackArray = e.stack.match ( /(?:http|https|file):\/\/.*?\/.+?\.js/g ) || [],
	            			length = stackArray.length;
	            		if ( length > 0 ) {
	            			anchor.href = stackArray [ length - 1 ];
	            		}
	                }
	            	else {

	                	// IE9
	                	const scripts = slice.call ( document.head.querySelectorAll ( "script" ) );
	                	foreach ( scripts, script => {
	                    	if ( script.readyState === "interactive" ) {
	                        	anchor.href = script.src;
	                        	return false;
	                        }
	                    } );
	                }
				}
	        }

	        // IE下的a标签的pathname属性开头没有"/"
	        const pathname = ( anchor.pathname.match ( /^(.*?).js$/ ) || [ "", "" ] ) [ 1 ];
	        return ( pathname.substr ( 0, 1 ) === "/"  ? "" : "/" ) + pathname;
		},

	/**
		onScriptLoaded ( event: Object )
	
		Return Type:
		void
	
		Description:
		js依赖加载onload事件回调函数
		此函数不是直接在其他地方调用，而是赋值给script的onload事件的，所以函数里的this都需要使用Loader来替代
	
		URL doc:
		http://amaple.org/######
	*/
	onScriptLoaded ( e ) {

		const
			target = e.target,
        	loadID = attr ( target, Loader.loaderID ),
        	depName = attr ( target, Loader.depName ),
			curLoader = Loader.loaderMap [ loadID ];

		curLoader.loadedModule [ depName ] = curLoader.getLoadedModule ( depName );
		if ( curLoader.dropWaiting ( depName ) === 0 ) {

			// 调用工厂方法
			curLoader.fire ( curLoader.inject () );
			delete Loader.loaderMap [ loadID ];
		}
	}
} );