import { type, extend, foreach, noop } from "../func/util";
import { attr, html, scriptEval } from "../func/node";
import { envErr, moduleErr } from "../error";
import { MODULE_UPDATE, MODULE_REQUEST, MODULE_RESPONSE } from "../var/const";
import compileModule from "./compileModule";
import iceAttr from "./iceAttr";
import configuration from "../core/configuration/core";
import ice from "../core/core";
import cache from "../cache/core";
import http from "../http/core";
import event from "../event/core";
import Module from "../core/Module";
import Router from "../router/core";


function loopFlush ( moduleUpdateContext ) {

	let title, _title;
	foreach ( moduleUpdateContext, moduleUpdateItem => {
		_title = moduleUpdateItem.updateFn ();
		title = title || _title;

		if ( type ( moduleUpdateItem.children ) === "array" ) {
			_title = loopFlush ( moduleUpdateItem.children );
			title = title || _title;
		}
	} );

	return title;
}

/**
	ModuleLoader ( name: String, load: Object )

	Return Type:
	void

	Description:
	页面模块加载器

	URL doc:
	http://icejs.org/######
*/
export default function ModuleLoader () {

	 // 等待加载完成的页面模块，每加载完成一个页面模块都会将此页面模块在waiting对象上移除，当waiting为空时则表示相关页面模块已全部加载完成
	this.waiting = [];

	// 模块更新函数上下文
	this.moduleUpdateContext = [];

	// 加载错误时会将错误信息保存在此
	this.moduleError = null;
}


extend ( Loader.prototype, {

	/**
		addWaiting ( name: String )
	
		Return Type:
		void
	
		Description:
		将等待加载完成的页面模块名放入context.waiting中
	
		URL doc:
		http://icejs.org/######
	*/
	addWaiting ( name ) {
		this.waiting.push ( name );
	},

	/**
		delWaiting ( name: String )
	
		Return Type:
		void
	
		Description:
		将已加载完成的页面模块从等待列表中移除
		如果等待队列已空则立即刷新模块
	
		URL doc:
		http://icejs.org/######
	*/
	delWaiting ( name ) {
		const pointer = this.waiting.indexOf ( name );
		if ( pointer !== -1 ) {
			this.waiting.splice ( pointer, 1 );
		}

		// 如果等待队列已空则立即刷新模块
		if ( isEmpty ( this.waiting ) ) {
			this.flush ();
		}
	},

	signModuleHierarchy ( currentHierarchy ) {
		this.currentHierarchy = currentHierarchy;
	},

	saveModuleUpdateFn ( updateFn ) {
		const moduleUpdateItem = { updateFn };

		// 标记当前处理模块
		this.moduleUpdateItem = moduleUpdateItem;
		this.currentHierarchy.push ( moduleUpdateItem );
	},

	addChildrenContext () {
		const children = [];
		this.moduleUpdateItem.children = children;
		return children;
	},

	/**
		load ( structure: Object, args: Object, currentHierarchy?: Array )
	
		Return Type:
		Object
	
		Description:
		根据structure对象来加载更新模块
	
		URL doc:
		http://icejs.org/######
	*/
	load ( structure, args, currentHierarchy = this.moduleUpdateContext ) {

		let toRender = false;
		foreach ( structure.entity, route => {
		    if ( route.hasOwnProperty ( "notUpdate" ) ) {
		        if ( route.hasOwnProperty ( "forcedRender" ) ) {
		            toRender = true;
		        }
		        else {
		            // 比较新旧param和search对象中的值，如果有改变则调用paramUpdated和searchUpdated
		            // foreach 
		            // route.module.
		        }
		        
		        delete route.notUpdate;
		    }
		    else {
		        toRender = true;
		    }

		    // 需更新模块与强制重新渲染模块进行渲染
		    if ( toRender ) {

		        // 如果结构中没有模块节点则查找DOM树获取节点
		        if ( !route.moduleNode ) {
		            const moduleNode = query ( `[${ iceAttr.module }=${ route.name === "default" ? "''" : route.name }]`, route.parent.moduleNode || undefined );

		            if ( moduleNode ) {
		                route.moduleNode = moduleNode;
		            }
		            else {
		                throw moduleErr ( "moduleNode", `找不到加载路径为"${ route.modulePath }"的模块node` );
		            }
		        }

		        // 给模块元素添加编号属性，此编号有两个作用：
		        // 1、用于模块加载时的模块识别
		        // 2、使用此属性作为子选择器限制样式范围
		        let moduleIdentifier = attr ( route.moduleNode, Module.identifier );
		        if ( !moduleIdentifier ) {
		        	moduleIdentifier = Module.getIdentifier ();
		        	attr ( route.moduleNode, Module.identifier, moduleIdentifier );
		        }

		        // 加入等待加载队列
		        this.addWaiting ( moduleIdentifier );

		        // 将基于当前相对路径的路径统一为相对于根目录的路径
				const pathAnchor = document.createElement ( "a" );
				pathAnchor.href = route.modulePath || "";

				// 标记模块更新函数容器的层级
				// 这样在actionLoad函数中调用saveModuleUpdateFuncs保存更新函数时可以保存到对应的位置
				this.signModuleHierarchy ( this.currentHierarchy );

		        // 无刷新跳转组件调用来完成无刷新跳转
		        ModuleLoader.actionLoad.call ( this, pathAnchor.pathname, route.moduleNode, route, args.param [ route.name ], args.search );
		    }

		    // 此模块下还有子模块需更新
		    if ( type ( route.children ) === "array" ) {

		    	// 添加子模块容器并继续加载子模块
		        this.load ( route.children, args, this.addChildrenContext () );
		    }
		} );
	},

	/**
		flush ()
	
		Return Type:
		void
	
		Description:
		调用已加载完成的模块更新函数执行更新操作
	
		URL doc:
		http://icejs.org/######
	*/
	flush () {
		if ( this.moduleError ) {

			// 加载模块遇到错误，直接处理错误信息
		   	const location = {
		       	path : this.moduleError,
		       	nextStructure : Router.matchRoutes ( this.path, this.param ),
		       	param : {},
		       	search : Router.matchSearch ( getSearch () ),
		       	action : "PUSH" // 暂不确定是不是为"PUSH"???
		       };

		   	// Router.matchRoutes()匹配当前路径需要更新的模块
		   	// 更新currentPage结构体对象，如果为空表示页面刚刷新，将nextStructure直接赋值给currentPage
		   	Structure.currentPage = Structure.currentPage ? Structure.currentPage.update ( location.nextStructure ) : location.nextStructure;
		   	
		   	// 根据更新后的页面结构体渲染新视图
		   	Structure.currentPage.render ( location );
		}
		else {

			// 正常加载，将调用模块更新函数更新模块
			const title = loopFlush ( this.moduleUpdateContext );

			// 更新页面title
			if ( title && document.title !== title ) {
    		document.title = title;
    	}
		}
	}
} );

extend ( ModuleLoader, {

	/**
		actionLoad ( url: String|Object, moduleNode: DMOObject, currentStructure: Object, param?: Object, data?: String|Object, method?:String, timeout?: Number, before?: Function, success?: Function, error?: Function, abort?: Function )

		Return Type:
		void

		Description:
		根据path请求跳转模块数据并更新对应的moduleNode（moduleNode为模块节点）

		URL doc:
		http://icejs.org/######
	*/
	actionLoad ( path, moduleNode, currentStructure, param, data, method, timeout, before = noop, success = noop, error = noop, abort = noop ) {


		const 
			moduleName = attr ( moduleNode, iceAttr.module ),
			isCache = attr ( moduleNode, iceAttr.cache ),
			moduleConfig = configuration.getConfigure ( "module" ),
	        
	        baseURL = configuration.getConfigure ( "baseURL" ),
	        isBase = attr ( moduleElem, iceAttr.base ) !== "false" && baseURL.length > 0,
			hasSeparator = url.indexOf ( "/" );

		path = isBase 
			? baseURL + ( hasSeparator === 0 ? path.substr ( 1 ) : path )
			: path;

		const historyModule = cache.getModule ( path );

		// 模块强制缓存或者全局使用缓存并且模块没有强制不使用缓存
		// 并且请求不为post
		// 并且已有缓存
		// 并且缓存未过期
		// cache已有当前模块的缓存时，才使用缓存
		if (
			( isCache === "true" || moduleConfig.cache === true && isCache !== "false" )
			&& ( !method || method.toUpperCase () !== "POST" )
			&& historyModule
			&& ( moduleConfig.expired === 0 || historyModule.time + moduleConfig.expired > Date.now () )
		) {
	        this.saveModuleUpdateFn ( () => {
            	Structure.currentPage.signCurrentRender ( currentStructure, param, data );
            	
	        	const title = historyModule.updateFn ( ice, moduleNode, currentStructure, html, scriptEval );
				event.emit ( moduleNode, MODULE_UPDATE );

				return title;
	        } );

	    	// 获取模块更新函数完成后在等待队列中移除
	    	this.delWaiting ( attr ( moduleNode, Module.identifier ) );
		}
		else {
	    	
	    	// 触发请求事件回调
	    	event.emit ( moduleElem, MODULE_REQUEST );
							  
			// 请求模块跳转页面数据
			http.request ( {

				url 		: path,
				method 		: /^(GET|POST)$/i.test ( method ) ? method.toUpperCase () : "GET",
	        	data 		: data,
				timeout 	: timeout || 0,
				beforeSend 	: () => {
					before ( moduleNode );
				},
				abort		: () => {
					abort ( moduleNode );
				},
			} ).done ( moduleString => {

				/////////////////////////////////////////////////////////
	        	// 编译module为可执行函数
				// 将请求的html替换到module模块中
	            const updateFn = compileModule ( moduleString );

	            // 缓存模块更新函数
	            cache.pushModule ( path, { updateFn, time : Date.now () } );
	        	
	        	this.saveModuleUpdateFn ( () => {
	            	event.emit ( moduleNode, MODULE_RESPONSE );
                	
                	Structure.currentPage.signCurrentRender ( currentStructure, param, data );
                	
	        		const title = updateFn ( ice, moduleNode, currentStructure, html, scriptEval );
	            	event.emit ( moduleNode, MODULE_UPDATE );

	            	// 调用success回调
					success ( moduleNode );

					return title;
	            } );
			} ).fail ( ( iceXHR, errorCode ) => {

				// 保存错误信息并立即刷新
	        	this.moduleError = Router.getError ( errorCode );
	        	this.flush ();
	        	error ( moduleNode, error );
			} );
		}
	}
} );