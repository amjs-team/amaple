import { type, extend, foreach, noop, isPlainObject, isEmpty } from "../func/util";
import { query, attr } from "../func/node";
import { queryModuleNode, parseGetQuery } from "../func/private";
import require from "../require/core";
import { envErr, moduleErr } from "../error";
import amHistory from "./history/core";
import compileModule from "../compiler/moduleCompiler/compileModule";
import configuration from "../core/configuration/core";
import am from "../core/core";
import cache from "../cache/core";
import http from "../http/core";
import event from "../event/core";
import { identifierName, getIdentifier } from "../core/Module";
import Router from "../router/Router";
import Structure from "./Structure";
import Tmpl from "../compiler/tmpl/core";
import VNode from "../core/vnode/VNode";
import NodeTransaction from "../core/vnode/NodeTransaction";

/**
	compareArgs ( newArgs: Array, originalArgs: Array )

	Return Type:
	Boolean
	参数是否有改变

	Description:
	对比新旧参数数组中是否存在改变的参数，有则返回true，没有则返回false

	URL doc:
	http://amaple.org/######
*/
function compareArgs ( newArgs, originalArgs ) {
	const len = Object.keys ( newArgs ).length;
	
	let isChanged = false;
    if ( len !== Object.keys ( originalArgs ).length ) {
    	isChanged = true;
	}
    else {
    	if ( len > 0 ) {
    		foreach ( newArgs, ( newVal, key ) => {
            	if ( newVal !== originalArgs [ key ] ) {
                	isChanged = true;
                
                	return false;
                }
            } );
        }
    }
	
	return isChanged;
}

/**
	ModuleLoader ( name: String, load: Object )

	Return Type:
	void

	Description:
	页面模块加载器

	URL doc:
	http://amaple.org/######
*/
export default function ModuleLoader ( nextStructure, param, get, post ) {

	this.nextStructure = nextStructure;
	this.param = param;
	this.get = get;
	this.post = post;

	// 等待加载完成的页面模块，每加载完成一个页面模块都会将此页面模块在waiting对象上移除，当waiting为空时则表示相关页面模块已全部加载完成
	this.waiting = [];

	// 模块更新函数上下文
	this.moduleUpdateContext = [];

	// 加载错误时会将错误信息保存在此
	this.moduleError = null;

	// 当前跳转的标题
	this.title = "";

	// 已使用的模块节点数组
	// 防止多层使用相同模块名时，子模块获取到的是父模块的模块节点
	this.usedModuleNodes = [];
}


extend ( ModuleLoader.prototype, {

	/**
		addWaiting ( name: String )
	
		Return Type:
		void
	
		Description:
		将等待加载完成的页面模块名放入context.waiting中
	
		URL doc:
		http://amaple.org/######
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
		http://amaple.org/######
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

	/**
		update ( title: String )
	
		Return Type:
		void
	
		Description:
		更新标题
		标题按模块从上到下，从外到内的顺序遍历获取第一个有标题的模块进行更新
	
		URL doc:
		http://amaple.org/######
	*/
	updateTitle ( title ) {
		if ( !this.title ) {
			document.title = title;

			this.title = title;
		}
	},

	/**
		load ( structure: Object )
	
		Return Type:
		Object
	
		Description:
		根据structure对象来加载更新模块
	
		URL doc:
		http://amaple.org/######
	*/
	load ( structure, param ) {
		structure = structure || this.nextStructure.entity;
		param = param || this.param;

		foreach ( structure, route => {
		    if ( route.hasOwnProperty ( "notUpdate" ) && route.modulePath !== null ) {

		    	// 需过滤匹配到的空模块
		    	// 空模块没有modle对象，也没有param等参数
		    	if ( route.module && param [ route.name ] ) {
                	const paramData = param [ route.name ].data;

		            // 比较新旧param和get,post对象中的值，如果有改变则调用paramUpdated和queryUpdated
                    if ( compareArgs ( paramData, route.module.param ) ) {
                    	route.module.param = paramData;
                    	route.module.paramUpdated ();
                    }
                	
                    const getData = parseGetQuery ( this.get );
                	if ( compareArgs ( getData, route.module.get ) || compareArgs ( this.post, route.module.post ) ) {
                    	route.module.get = getData;
                    	route.module.post = this.post;
                		route.module.queryUpdated ();
                    }
		    	}
		        
		        delete route.notUpdate;
		    }
		    else {

			    // 需更新模块与强制重新渲染模块进行渲染
		    	let moduleNode = route.moduleNode;

		        // 如果结构中没有模块节点则查找DOM树获取节点
		        if ( !moduleNode ) {
		        	moduleNode = queryModuleNode ( route.name === "default" ? "" : route.name, route.parent && route.parent.moduleNode.node || undefined );

		        	// 模块存在并且不在已使用的模块节点中时可使用
		            if ( moduleNode && this.usedModuleNodes.indexOf ( moduleNode ) === -1 ) {
		            	this.usedModuleNodes.push ( moduleNode );

		            	// 获取到moduleNode时去解析此moduleNode
		            	moduleNode = VNode.domToVNode ( moduleNode );
		            	const tmpl = new Tmpl ( {}, [], {} );
                		tmpl.mount ( moduleNode, true );
                		moduleNode.render ();

		                route.moduleNode = moduleNode;
		            }
		            else {

		            	// 没有获取到moduleNode时将moduleNode封装为一个获取函数
		            	// 此函数将会在它的父模块解析后再调用，此时就能获取到route.moduleNode
		                moduleNode = () => {
		                	if ( route.moduleNode ) {
		                		return route.moduleNode;
		                	}
		                	else {
		                		throw moduleErr ( "moduleNode", `找不到加载路径为"${ route.modulePath }"的模块node` );
		                	}
		                };
		            }
		        }

		        // 无刷新跳转组件调用来完成无刷新跳转
		        ModuleLoader.actionLoad.call ( this, route, moduleNode, param [ route.name ] && param [ route.name ].data, this.get, this.post );
		    }

		    // 此模块下还有子模块需更新
		    if ( type ( route.children ) === "array" ) {

		    	// 添加子模块容器并继续加载子模块
		        this.load ( route.children, param [ route.name ].children );
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
		http://amaple.org/######
	*/
	flush () {
		if ( this.moduleError ) {

			// 加载模块遇到错误，直接处理错误信息
		   	const 
		   		pathResolver = amHistory.history.buildURL ( this.moduleError ),
		   		param = {},
		   		nextStructure = Router.matchRoutes ( pathResolver.pathname, param ),
		   		nextStructureBackup = nextStructure.copy (),

		   		location = {
			       	path : this.moduleError,
			       	nextStructure,
			       	param,
			       	get : pathResolver.search,
			       	post : {},
			       	action : "REPLACE" // 暂不确定是不是为"PUSH"???
			    };

		   	// 根据更新后的页面结构体渲染新视图
		   	Structure.currentPage
		   	.update ( location.nextStructure )
		   	.render ( location, nextStructureBackup );
		}
		else {

			foreach ( this.nextStructure.entity, structure => {
				if ( structure.updateFn ) {
					structure.updateFn ();
					delete structure.updateFn;
				}
			} );
		}
	}
} );

extend ( ModuleLoader, {

	/**
		actionLoad ( url: String|Object, moduleNode: DMOObject, moduleIdentifier: String, currentStructure: Object, param?: Object, args?: Object, data?: Object, method?:String, timeout?: Number, before?: Function, success?: Function, error?: Function, abort?: Function )

		Return Type:
		void

		Description:
		根据path请求跳转模块数据并更新对应的moduleNode（moduleNode为模块节点）
		param为路径匹配到的参数
		args参数为get请求参数，会将此参数添加到path后
		data为post参数，直接提交给http的data

		URL doc:
		http://amaple.org/######
	*/
	actionLoad ( currentStructure, moduleNode, param, args, data, method, timeout, before = noop, success = noop, error = noop, abort = noop ) {

		let path = currentStructure.modulePath;

		// path为null时表示此模块为空
		// 此时只需删除模块内元素
		if ( path === null ) {
			currentStructure.updateFn = () => {
				moduleNode = type ( moduleNode ) === "function" ? moduleNode () : moduleNode;
				const diffBackup = moduleNode.clone ();
				moduleNode.clear ();
				moduleNode.diff ( diffBackup ).patch ();
			};

			return;
		}

		//////////////////////////////////////////////////
		//////////////////////////////////////////////////
		//////////////////////////////////////////////////
		const 
			baseURL = configuration.getConfigure ( "baseURL" ).module,
			suffix = configuration.getConfigure ( "moduleSuffix" );
		path = path.substr ( 0, 1 ) === "/" ? baseURL.substr ( 0, baseURL.length - 1 ) : baseURL + path;
		path += suffix + args;

		const 
			historyModule = cache.getModule ( path ),
			signCurrentRender = () => {
				Structure.signCurrentRender ( currentStructure, param, args, data );
			},
			flushChildren = ( route ) => {
				return () => {
					if ( type ( route.children ) === "array" ) {
						foreach ( route.children, child => {
							if ( child.updateFn ) {
								child.updateFn ();
								delete child.updateFn;
							}
						} );
					}
				};
			};

		// 给模块元素添加编号属性，此编号是用于模块加载时的模块识别
		let moduleIdentifier = ( historyModule && historyModule.moduleIdentifier ) || 
							( moduleNode && moduleNode.nodeType === 1 && moduleNode.attr ( identifierName ) );
		if ( !moduleIdentifier ) {
			moduleIdentifier = getIdentifier ();
		}

		// 加入等待加载队列
		this.addWaiting ( moduleIdentifier );

		// 请求不为post
		// 并且已有缓存
		if ( ( !method || method.toUpperCase () !== "POST" ) && historyModule ) {
			this.updateTitle ( historyModule.title );
	        currentStructure.updateFn = function () {
        		moduleNode = type ( moduleNode ) === "function" ? moduleNode () : moduleNode;
                if ( !moduleNode [ identifierName ] ) {
                	moduleNode [ identifierName ] = moduleIdentifier;

                	// 调用render将添加的am-identifier同步到实际node上
                	moduleNode.render ();
                }

	        	historyModule.updateFn ( am, { moduleNode, moduleFragment: historyModule.updateFn.moduleFragment.clone (), NodeTransaction, require, signCurrentRender, flushChildren : flushChildren ( this ) } );
	        };

	        // 获取模块更新函数完成后在等待队列中移除
	        // 此操作需异步，否则将会实时更新模块
	    	setTimeout ( () => {
	    		this.delWaiting ( moduleIdentifier );
	    	} );
		}
		else {
							  
			// 请求模块跳转页面数据
			http.request ( {

				url 		: path,
				method 		: /^(GET|POST)$/i.test ( method ) ? method.toUpperCase () : "GET",
	        	data 		: data,
				timeout 	: timeout || 0,
				cache 		: false,
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
	            const { updateFn, title } = compileModule ( moduleString );
	            this.updateTitle ( title );
	        	
	        	currentStructure.updateFn = function () {
	        		moduleNode = type ( moduleNode ) === "function" ? moduleNode () : moduleNode;

		            // 缓存模块
		            cache.pushModule ( path, {
		            	title,
		            	updateFn, 
		            	moduleIdentifier
		            } );

	                if ( !moduleNode [ identifierName ] ) {
	                	moduleNode [ identifierName ] = moduleIdentifier;
	                }

	        		updateFn ( am, { moduleNode, moduleFragment: updateFn.moduleFragment.clone (), NodeTransaction, require, signCurrentRender, flushChildren : flushChildren ( this ) } );

	            	// 调用success回调
					success ( moduleNode );
	            };

	            // 获取模块更新函数完成后在等待队列中移除
	    		this.delWaiting ( moduleIdentifier );
			} ).fail ( ( amXHR, errorCode ) => {

				// 保存错误信息并立即刷新
	        	this.moduleError = Router.getError ( errorCode );
	        	this.flush ();
	        	error ( moduleNode, error );
			} );
		}
	}
} );