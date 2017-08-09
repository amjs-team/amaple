import { extend, foreach } from "../../func/util";
import cache from "../../cache/core";

/**
	loader ( name: String, load: Object )

	Return Type:
	void

	Description:
	依赖加载器

	URL doc:
	http://icejs.org/######
*/
export default function Loader ( name, load ) {

	
	// 需要加载的依赖，加载完成所有依赖需要遍历此对象上的所有依赖并调用相应回调函数
	this.load 	 = {};

	 // 等待加载完成的依赖，每加载完成一个依赖都会将此依赖在waiting对象上移除，当waiting为空时则表示相关依赖已全部加载完成
	this.waiting = [];

	this.factory;

	//////////////////////////////////////////
	//////////////////////////////////////////
	this.load [ name ] = load;
}


extend ( Loader.prototype, {

	/**
		putWaiting ( name: String )
	
		Return Type:
		void
	
		Description:
		将等待加载完成的依赖名放入context.waiting中
	
		URL doc:
		http://icejs.org/######
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
		http://icejs.org/######
	*/
	dropWaiting ( name ) {
		let pointer = this.waiting.indexOf ( name );
		if ( pointer !== -1 ) {
			this.waiting.splice ( pointer, 1 );
		}

		return this.waiting.length;
	},

	/**
		putLoad ( name: String, load: Object )
	
		Return Type:
		void
	
		Description:
		将加载的依赖信息放入load对象中
	
		URL doc:
		http://icejs.org/######
	*/
	putLoad ( name, load ) {
		this.load [ name ] = load;
	},

	/**
		getLoad ( name: String )
	
		Return Type:
		Object
	
		Description:
		获取需要加载的依赖对象
	
		URL doc:
		http://icejs.org/######
	*/
	getLoad ( name ) {
		return this.load [ name ];
	},

	/**
		inject ( module: Object )
	
		Return Type:
		Object
	
		Description:
		依赖注入方法实现
	
		URL doc:
		http://icejs.org/######
	*/
	inject () {

		let 
			module = this.getLoad ( Loader.topName ),
			deps = {},
			depObj, ret;

		foreach ( module.deps, dep => {

			// 查找插件
			if ( depObj = cache.getPlugin ( dep ) ) {
				deps [ dep ] = depObj;
			}

			// 如果都没找到则去此次加载完成的依赖中获取并缓存入外部对象
			else {
				depObj = this.inject ( this.getLoad ( dep ) );
				cache.pushPlugin ( dep, depObj );
            	deps [ dep ] = depObj;
			}
		} );

		// 返回注入后工厂方法
		this.factory = () => {
			module.factory ( deps );
		}
	},

	/**
		fire ()
	
		Return Type:
		void
	
		Description:
		触发依赖工厂方法
	
		URL doc:
		http://icejs.org/######
	*/
	fire () {
		this.factory ();
	},
} );



extend ( Loader, {

	// 文件后缀
	suffix : ".js",

	// js插件的依赖名称属性，通过此属性可以得到加载完成的依赖名
	depName : "data-depName",

	// script加载依赖时用于标识依赖
	scriptFlag : "dep-loading",

	// script加载依赖时用于标识依赖
	loaderID : "loader-ID",

	// 顶层依赖名
	topName : "*",

	// 保存正在使用的依赖加载器对象，因为当同时更新多个依赖时将会存在多个依赖加载器对象
	loaderMap : {},

	/**
		create ( guid: Number, name: String, loadDep: Object )
	
		Return Type:
		Object
	
		Description:
		创建Loader对象保存于Loader.LoaderMap中
	
		URL doc:
		http://icejs.org/######
	*/
	create ( guid, name, loadDep ) {
		return Loader.loaderMap [ guid ] = new Loader ( name, loadDep );
	},

	/**
		getCurrentDep ()
	
		Return Type:
		Object
	
		Description:
		获取当前正在执行的依赖名与对应的依赖加载器编号
	 	此方法使用报错的方式获取错误所在路径，使用正则表达式解析出对应依赖信息
	
		URL doc:
		http://icejs.org/######
	*/
	getCurrentDep () {
		try {
			____a.____b();
		} catch(e) {
			if ( e.stack ) {
				let match = /\?m=(\S+)&guid=([\d]+):?/.exec ( e.stack );
				return {
					name: match [ 1 ],
					guid: match [ 2 ]
				};
			}
		}
	},

	/**
		onScriptLoaded ( event: Object, : , :  )
	
		Return Type:
		void
	
		Description:
		js依赖加载onload事件回调函数
		此函数不是直接在其他地方调用，而是赋值给script的onload事件的，所以函数里的this都需要使用Loader来替代
	
		URL doc:
		http://icejs.org/######
	*/
	onScriptLoaded ( event ) {

		let loadID = event.target.getAttribute ( Loader.loaderID ),
			curLoader = Loader.loaderMap [ loadID ];

		// 执行
		if ( curLoader.dropWaiting ( event.target.getAttribute ( Loader.depName ) ) === 0 ) {

			// 依赖注入后的工厂方法
			let factory = curLoader.inject ();

			// 调用工厂方法
			Loader.fire ( factory );
			
			delete Loader.loaderMap [ loadID ];
		}
	}
} );