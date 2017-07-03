export default {

	// window.history封装
	history : {

		// window.history对象
		entity : window.history,

		/**
			replace ( state: Object, title: String, url: String )
		
			Return Type:
			void
		
			Description:
			对history.replaceState方法的封装
		
			URL doc:
			http://icejs.org/######
		*/
		replace ( state, title, url ) {
			this.entity.replaceState ( state, title, url );
		},

		/**
			push ( state: Object, title: String, url: String )
		
			Return Type:
			void
		
			Description:
			对history.pushState方法的封装
		
			URL doc:
			http://icejs.org/######
		*/
		push ( state, title, url ) {
			this.entity.pushState ( state, title, url );
		},

		/**
			getOriginalState ()
		
			Return Type:
			Object
		
			Description:
			获取参数传递对象
		
			URL doc:
			http://icejs.org/######
		*/
		getOriginalState () {
			return this.entity.state;
		},

		////////////////////////////////////
		/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
		/// 
		state : {},

		// 状态记录标记
		signature : null,

		/**
			setState ( key: String, value: Object, mode?: Boolean )
		
			Return Type:
			void
		
			Description:
			设置状态记录，并标记此条记录
			先查找key对应的记录，找到时更新此记录并标记，未找到时添加一条记录并标记
			注意：mode为true时不标记此条记录
		
			URL doc:
			http://icejs.org/######
		*/
		setState ( key, value, mode ) {

			this.state [ key ] = value;

			mode === true  || ( this.signature 	= key );
		},

		/**
			getState ( key: String )
		
			Return Type:
			Object
		
			Description:
			获取对应记录
		
			URL doc:
			http://icejs.org/######
		*/
		getState ( key ) {

			return this.state [ key ];
		}
	},


	////////////////////////////////////
	/// 模块路径记录数组
	/// 记录页面的所有模块名及对应模块中当前所显示的模块内容
	/// 
	moduleRecord : {},

	/**
		setModuleRecord ( moduleName: 模块名称, value: String, filter: Boolean )
	
		Return Type:
		void
	
		Description:
		将最新的模块和对应的模块内容标识添加或更新到moduleRecord数组中
		filter = true时过滤moduleRecord数组中不存在于当前页面中的模块记录，filter = false时不过滤
	
		URL doc:
		http://icejs.org/######
	*/
	setModuleRecord ( moduleName, value, filter ) {

		// 更新或添加一项到moduleRecord数组中
		single.moduleRecord [ moduleName ] = value;

		if ( filter === true ) {

			// 过滤moduleRecord数组中不存在于当前页面中的模块记录
			var _record = {};

			util.foreach ( single.moduleRecord, function ( recordItem, key ) {
				util.type ( util.s ( "*[ice-module=" + key + "]" ) ) === "object" && ( _record [ key ] = recordItem );
			});

			single.moduleRecord = _record;
		}
	},

	/**
		getModuleRecord ( moduleName: String )
	
		Return Type:
		String
	
		Description:
		获取对应模块名称的模块内容标识
	
		URL doc:
		http://icejs.org/######
	*/
	getModuleRecord ( moduleName ) {
		return single.moduleRecord [ moduleName ];
	},

	
	/**
		getFormatModuleRecord ()
	
		Return Type:
		String
	
		Description:
		获取moduleRecord格式化为pathname后的字符串
	
		URL doc:
		http://icejs.org/######
	*/
	getFormatModuleRecord () {
		var 
			_array = [];

		util.foreach ( single.moduleRecord, function ( recordItem, key ) {
			push.call ( _array, key + ( config.params.moduleSeparator || "" ) + recordItem );
		} );


		return "/" + join.call ( _array, "/" );
	},

	/**
		requestEvent ( e: Object )
	
		Return Type:
		void
	
		Description:
		无刷新跳转的事件封装
		预先绑定到同时具有href和ice-target的元素，或具有action和ice-target的form元素
	
		URL doc:
		http://icejs.org/######
	*/
	requestEvent : function ( e ) {

		var 

			// 临时存储目标模块名称
			_moduleName 	= this.getAttribute ( single.aTargetMod ),

			src 			= this.getAttribute ( single.aHref ) || this.getAttribute ( single.aAction ),

			// 获取当前按钮操作的模块
			module			= util.s ( "*[" + single.aModule + "=" + _moduleName + "]" ),
			method, data;

		if ( this.nodeName === "FORM" ) {
			method 			= "POST";
			data 			= this;
		}

		e.preventDefault ();
		if ( util.type ( module ) === "object" ) {

			//  url, module, data, title, method, timeout, before, success, error, abort, pushStack, onpopstate 
			// 当前模块路径与请求路径不相同时，调用single方法
			getCurrentPath$ ( module ) === src || 
			single ( src, module, data, config.params.header [ src ], method, null, null, null, null, null, true );
		}
		else {
			throw moduleErr ( "module", "找不到" + _moduleName + "模块" );
		}
	}
};