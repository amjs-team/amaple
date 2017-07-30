/**
 * iceJS v0.1.0
 * (c) 2017-2017 JOU http://icejs.org
 * License: MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ice = factory());
}(this, (function () { 'use strict';

// 目前所支持的状态标记符号，如果所传入的状态标记符号不在此列表中，则会使用默认的状态标记符号@
var allowState = ["@", "$", "^", "*", "|", ":", "~", "!"];

var defaultParams = {
	// 异步加载时的依赖目录，设置后默认在此目录下查找，此对象下有4个依赖目录的设置，如果不设置则表示不依赖任何目录
	base: {

		// url请求base路径，设置此参数后则跳转请求都依赖此路径
		// 此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则使用""
		url: "",

		// 插件加载base路径，设置此参数后动态加载插件均依赖此路径
		// 此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
		plugin: "",

		// 元素驱动器base路径，设置此参数后动态加载元素驱动器均依赖此路径
		// 此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则路径设置无效
		driver: ""
	},

	// url地址中的状态标识符，如http://...@login表示当前页面在login的状态
	stateSymbol: allowState[0],

	// 是否开启跳转缓存，默认开启。跳转缓存是当页面无刷新跳转时缓存跳转数据，当此页面实时性较低时建议开启，以提高相应速度
	directionCache: true,

	// url中模块名称与模块内容标识的分隔符，默认为"-"
	moduleSeparator: "-",

	// 自定义ajax请求时的url规则，通过设置此规则将规则中的模块名称与模块内容标识替换为当前请求环境的真实值，此规则与base.url和ice-base关联，即当设置了base.url且ice-base不为false时将自动添加base.url到此url前，如果ice-base为false时，此规则转换后的url将会从根目录当做url的起始路径，即在设置规则时第一个字符如果不是"/"，则系统将自动添加"/"到url的开头部分。默认规则为":m/:v.html"
	urlRule: ":m/:v.html",

	// 元素驱动器别名，当一个元素设置了别名后可在页面中直接使用别名使用对应的元素加载器。格式为{alias1: driver1, alias2: driver2...}
	alias: {},

	// 定义404页面显示模块及请求地址，格式为{moduleName: 404url}
	page404: "",

	// 定义500页面显示模块及请求地址，格式为{moduleName: 500url}
	page500: ""
};

/**
	error ( errorType: String )

	Return Type:
	Function
	指定错误类型的错误函数

	Description:
	错误类型生成器，你可以使用此函数生成一个特定类型的错误生成器，在抛出错误异常时使用特定生成的错误生成器抛出特定的错误类型
	eg:
	let exampleErr = error("example");
	exampleErr("code", "这是一个示例错误");
	
	console:
	[example:code]这是一个示例错误
	
	如果没有传入moduleName或moduleName为空，则在使用此错误生成器时在中括号内不会显示模块名称，而是直接显示错误的code，紧接着跟错误内容。

	URL doc:
	http://icejs.org/######
*/
function error(errorType) {
	return function (errorCode, errorText) {

		// 打印的错误信息
		let errMsg = "[ice:" + (errorType ? errorType + "-" : "") + errCode + "] " + err;
		return new Error(errMsg);
	};
}

 // 环境错误
let argErr = error("arg"); // 参数错误
let checkErr = error("check"); // 参数检查错误
 // 请求错误
let configErr = error("config"); // 配置错误
let runtimeErr = error("runtime"); // 运行时错误
let vmComputedErr = error("vm-computed"); // 模块错误

var toString = Object.prototype.toString;

/**
    check ( variable: Any )

    Return Type:
    Object(check)|null

    Description:
    检查参数错误
    如果错误则抛出error

    URL doc:
    http://icejs.org/######
*/
function check(variable) {
    this.target = variable;
    this.condition = [];

    this.code = "";
    this.text = "";

    return this instanceof check ? null : new check(variable);
}

extend$1(check.prototype, {

    /**
        or ()
    
        Return Type:
        Object(check)
    
        Description:
        "||"条件连接符（默认为"&"条件连接符）
    
        URL doc:
        http://icejs.org/######
    */
    or() {
        if (/^\|\|$/.test(this.condition[this.condition.length - 1])) {
            throw checkErr("condition", "不能连续调用“or()”");
        }
        this.condition.push("||");

        return this;
    },

    /**
           prior ( priorCb:Function )
       
           Return Type:
           Object(check)
       
           Description:
           优先判断的条件，相当于“()”
       
           URL doc:
           http://icejs.org/######
       */
    prior(priorCb) {
        let i = this.condition.push("prior") - 1;
        priorCb(this);
        this.condition.splice(i, this.condition.length - i);

        check.compare.call(this, [check.calculate(this.condition.slice(1))], _var => _var);
    },

    /**
        ifNot ( code: String, text: String )
    
        Return Type:
        Object(check)
    
        Description:
        设置条件不成立时抛出的错误信息
    
        URL doc:
        http://icejs.org/######
    */
    ifNot(code, text) {
        this.code = code;
        this.text = text;

        return this;
    },

    /**
        check ( variable: any )
    
        Return Type:
        Object(check)
    
        Description:
        改变条件判断变量
    
        URL doc:
        http://icejs.org/######
    */
    check(variable) {
        this.target = variable;

        return this;
    },

    /**
        do ()
    
        Return Type:
        Object(check)
    
        Description:
        执行判断
        如果判断不通过则抛出ifNot设置的提示
    
        URL doc:
        http://icejs.org/######
    */
    // [true, "&&", false, "||", true]
    do() {

        // 如果值为false则抛出错误
        if (!check.calculate(this.condition)) {
            throw argErr(this.code, this.text);
        }
    },

    /**
        be ( variable: any )
    
        Return Type:
        Object(check)
    
        Description:
        增加 "===" 条件
    
        URL doc:
        http://icejs.org/######
    */
    be(...vars) {
        check.compare.call(this, vars, _var => {
            return this.target === _var;
        });

        return this;
    },

    /**
        notBe ( variable: any )
    
        Return Type:
        Object(check)
    
        Description:
        增加 "!==" 条件
    
        URL doc:
        http://icejs.org/######
    */
    notBe(...vars) {
        check.compare.call(this, vars, _var => {
            return this.target !== _var;
        });

        return this;
    },

    /**
        type ( string: String )
    
        Return Type:
        Object(check)
    
        Description:
        增加变量类型相等条件
    
        URL doc:
        http://icejs.org/######
    */
    type(...strs) {
        check.compare.call(this, strs, str => {
            return type$1(this.target) === str;
        });

        return this;
    },

    /**
        notType ( string: String )
    
        Return Type:
        Object(check)
    
        Description:
        增加变量类型不相等条件
    
        URL doc:
        http://icejs.org/######
    */
    notType(...strs) {
        check.compare.call(this, vars, _var => {
            return type$1(this.target) !== _var;
        });

        return this;
    }
});

extend$1(check, {
    compare(vars, compareFn) {
        Array.prototype.push.apply(this.condition, (type$1(this.condition[this.condition.length - 1]) === "boolean" ? ["&&"] : []).concat((() => {
            let _var, res;
            while (_var = vars.shift()) {
                res = res || compareFn(_var);
            }
        })()));
    },

    calculate(condition) {
        if (condition.length === 0) {
            throw checkErr("condition", "没有设置检查条件");
        } else if (/^\|\|$/.test(condition[condition.length - 1])) {
            throw checkErr("condition", "\"or()\"应该需要紧跟条件，而不能作为最后的条件调用方法");
        } else if (this.condition.length % 2 === 1) {
            let res = this.condition[0];
            for (let i = 0; this.condition[i]; i += 2) {
                switch (this.condition[i + 1]) {
                    case "&&":
                        res = res && this.condition[i + 2];
                        break;
                    case "||":
                        res = res || this.condition[i + 2];
                        break;
                }
            }

            return res;
        }
    }
});

/**
 	type ( arg: any )
 
 	Return Type:
 	String
 	传入参数的类型字符串
 
 	Description:
 	获取传入的参数的变量类型，与typeof关键字不同的是，当参数为Array时返回"array"，当变量为null时返回"null"
 
 	URL doc:
 	http://icejs.org/######
 */
function type$1(arg) {
	return arg !== null ? arg instanceof Array ? "array" : typeof arg : "null";
}

/**
	noop ()

	Return Type:
	void

	Description:
	空函数
	用于函数调用兼容处理

	URL doc:
	http://icejs.org/######
*/
function noop() {}

/**
	foreach ( target: Array|Object, callback: Function, mode?: Boolean )

	Return Type:
	Boolean
	是否继续循环，如果返回false，则跳出循环

	Description:
	遍历数组或对象

	URL doc:
	http://icejs.org/######
*/
function foreach$1(target, callback, mode) {

	check(target).type("array", "object").ifNot("target", "第一个参数类型必须为array或object").do();
	check(callback).type("function").ifNot("callback", "第二个参数类型必须为function").do();

	var isContinue,
	    tTarget = type$1(target),
	    tCallback = type$1(callback),
	    i = 0;

	if (tTarget === "array" && mode === true) {
		for (; i < target.length; i++) {
			isContinue = callback(target[i], i, target);

			if (isContinue === false) {
				break;
			}
		}
	} else if (tTarget === "object" || mode !== true) {
		for (i in target) {
			isContinue = callback(target[i], i, target);

			if (isContinue === false) {
				break;
			}
		}
	}
}

/**
	isEmpty ( object: Object )

	Return Type:
	Boolean
	为空时返回true，不空时返回false

	Description:
	判断对象或数组是否为空对象或空数组

	URL doc:
	http://icejs.org/######
*/
function isEmpty(object) {

	check(object).type("array", "object").ifNot("object", "参数类型必须为array或object").do();

	let result = true;
	foreach$1(object, () => {
		result = false;

		// 跳出循环
		return false;
	});

	return result;
}

/**
	extend ( target: Object|Array|Function, source1: any, source2?: any ... )

	Return Type:
	Array|Object|Boolean
	合并后的array、object或function

	Description:
	此函数用于继承参数属性，可以传入不定个数被继承参数，以第一个参数作为继承参数，继承对象类型必须为array、object、function，被继承参数可以是任意类型的参数。
	
	#Warning: 此函数会改变继承参数
	
	参数说明：
	当继承参数类型为array时，被继承参数可以是任何类型，当被继承参数为array或object时会将内部全部属性继承下来。参数只会继承不重复的参数
	当继承参数类型为object或function时，被继承参数只能是object，如果被继承参数中有其他类型参数将会直接被忽略。相同键的属性将会被覆盖
	
	eg:
	1、
	var arr = extend(["a", "b", "c"], ["c", "d", "e"], ["f"]);
	合并后的arr为["a", "b", "c", "d", "e", "f"]
	
	2、
	var obj = extend({a: 1, b: 2, c: 3}, {c: 4, d: 5, e: 6});
	合并后的obj为{a: 1, b: 2, c: 4, d: 5, e: 6}

	URL doc:
	http://icejs.org/######
*/
function extend$1(...args) {

	let target = args[0],
	    ttarget = type$1(target),
	    targ;

	args = args.slice(1);

	check(target).type("array", "object", "function").ifNot("target", "合并父体类型需为array、object或function").do();

	// 依次处理被继承参数
	foreach$1(args, function (arg) {
		targ = type$1(arg);

		if (ttarget === "array") {
			if (targ === "array" || targ === "object") {
				foreach$1(arg, function (arg) {
					if (!inArray(target, arg)) {
						target.push(arg);
					}
				});
			} else if (targ !== null && targ !== undefined) {
				target.push(arg);
			}
		} else if (ttarget === "object" || ttarget === "function") {

			// 只处理object类型的被继承参数，其他类型的将会被忽略
			if (targ === "object") {
				foreach$1(arg, function (arg, key) {
					target[key] = arg;
				});
			}
		}
	});

	return target;
}

/**
	replaceAll ( str: String, search: String, replaces: String )

	Return Type:
	String
	替换后的字符串

	Description:
	将str中所有search替换为replace，特殊字符自动转义

	URL doc:
	http://icejs.org/######
*/


/**
	isWindow ( object: Object )

	Return Type:
	Boolean
	是返回true，否返回false

	Description:
	判断一个对象是否为window对象
	使用window的特有函数，及自引用特性进行判断
	如果object.window的undefined，则此对象肯定不是window对象

	URL doc:
	http://icejs.org/######
*/


/**
	isPlainObject ( object: Object )

	Return Type:
	Boolean

	Description:
	判断一个对象是否为纯粹的对象

	URL doc:
	http://icejs.org/######
*/
function isPlainObject(object) {
	return toString.call(object) === "[object Object]";
}

/**
	guid ()

	Return Type:
	Number

	Description:
	获取唯一标识

	URL doc:
	http://icejs.org/######
*/
function guid() {
	return setTimeout(1) + "";
}

// 初始化配置方法
var config$1 = function () {

	// config API
	function config(params) {
		// 配置参数的类型固定为object
		if (type$1(params) !== "object" || isEmpty(params)) {
			throw configErr("params", "配置参数要求为非空object");
		}

		if (type$1(base) && !isEmpty(base)) {
			let _type,
			    base = params.base;

			foreach(base, (item, key, base) => {
				_type = type$1(item);

				base[key] = _type === "string" ? base[key] : _type === "function" ? base[key]() : "";
				base[key] = base[key].substr(-1, 1) === "/" ? base[key] : base[key] + "/";
			});
		} else {
			delete params.base;
		}

		params.stateSymbol = allowState.indexOf(params.stateSymbol) === -1 ? allowState[0] : params.stateSymbol;
		params.redirectCache = params.redirectCache !== false ? true : false;

		extend(config, params);
	}

	// 设置默认参数
	return extend(config, defaultParams);
};

var plugin = {

	plugins: {},

	/**
 	plugin
 		push ( name: String, plugin: Object|Function )
 
 	Return Type:
 	void
 
 	Description:
 	添加插件
 
 	URL doc:
 	http://icejs.org/######
 */
	push: function (name, plugin) {

		if (name && type$1(name) === "string") {
			var _plugin = {};

			_plugin[name] = plugin;
			plugin = _plugin;
		}

		// 遍历插件对象组依次缓存
		foreach$1(plugin, (item, name) => {
			if (!this.plugins.hasOwnProperty(name)) {
				this.plugins[name] = item;
			} else {
				throw moduleErr("plugin", name + "插件已存在");
			}
		});
	},

	/**
 	get ( name: String )
 
 	Return Type:
 	Object
 	插件对象
 
 	Description:
 	获取插件，没有找打则返回null
 
 	URL doc:
 	http://icejs.org/######
 */
	get: function (name) {
		return this.plugins[name] || null;
	}
};

var driver = {

	drivers: {},

	/**
 	driver
 		push ( name: String, driver: Object )
 
 	Return Type:
 	void
 
 	Description:
 	添加元素驱动器
 
 	URL doc:
 	http://icejs.org/######
 */
	push: function (name, driver) {

		if (name && type$1(name) === "string") {
			var _driver = {};

			_driver[name] = driver;
			driver = _driver;
		}

		// 遍历插件对象组依次缓存
		foreach$1(driver, (item, name) => {
			if (!drivers.hasOwnProperty(name)) {
				drivers[name] = item;
			} else {
				throw moduleErr("driver", name + "元素驱动器已存在");
			}
		});
	},

	/**
 	get ( name: String )
 
 	Return Type:
 	Object
 	元素驱动器对象
 
 	Description:
 	获取元素驱动器，没有找打则返回null
 
 	URL doc:
 	http://icejs.org/######
 */
	get: function (name) {
		return this.drivers[name] || null;
	}
};

var direction = {

	directions: {},

	/**
 	direction
 		push ( name: String, direction: DOMString|DOMObject )
 
 	Return Type:
 	void
 
 	Description:
 	添加跳转缓存模块
 
 	URL doc:
 	http://icejs.org/######
 */
	push: function (name, direction) {

		if (!this.directions.hasOwnProperty(name)) {
			this.directions[name] = direction;
		} else {
			throw moduleErr("module", name + "页面模块已存在");
		}
	},

	/**
 	get ( name: String )
 
 	Return Type:
 	DOMString|DOMObject
 	缓存模块
 
 	Description:
 	获取跳转缓存模块，没有找打则返回null
 
 	URL doc:
 	http://icejs.org/######
 */
	get: function (name) {
		return this.directions[name] || null;
	}
};

var event$1 = {

	events: {},

	/**
 	direction
 		push ( type: String, direction: DOMString|DOMObject )
 
 	Return Type:
 	void
 
 	Description:
 	添加非元素事件缓存
 
 	URL doc:
 	http://icejs.org/######
 */
	push(type, listener) {
		this.events[type] = listener;
	},

	/**
 	get ( name: String )
 
 	Return Type:
 	Array
 	事件缓存
 
 	Description:
 	获取事件缓存，没有找打则返回null
 
 	URL doc:
 	http://icejs.org/######
 */
	get(type) {
		return this.events[type] || null;
	},

	/**
 	getAll ()
 
 	Return Type:
 	Object
 	所有非元素事件
 
 	Description:
 	获取所有非元素事件
 
 	URL doc:
 	http://icejs.org/######
 */
	getAll() {
		return this.events;
	}
};

/**
	Plugin cache

	Description:
	内部缓存对象
	缓存内容如下：
	1. 插件对象缓存
	2. 元素驱动器缓存
	3. 页面跳转与状态切换时的缓存，开启缓存后，页面跳转数据将会被缓存，再次调用相同地址时将使用缓存更新页面以提高响应速度，实时性较高的页面建议关闭缓存。

	URL doc:
	http://icejs.org/######
*/
var cache$1 = {

	// 添加插件缓存
	pushPlugin: plugin.push,

	// 获取已加载插件
	getPlugin: plugin.get,

	// 获取已加载元素驱动器
	getDriver: driver.get,

	// 添加元素驱动器缓存
	pushDriver: driver.push,

	// 添加跳转缓存模块
	pushDirection: direction.push,

	// 获取跳转缓存模块
	getDirection: direction.get,

	// 添加非元素事件缓存
	pushEvent: event$1.push,

	// 获取非元素事件缓存
	getEvent: event$1.get,

	// 获取所有事件
	getAllEvent: event$1.getAll
};

var singleAttr = {
	aModule: "ice-module",
	aSrc: "ice-src",
	aCache: "ice-cache",
	aBase: "ice-base",

	aHref: "href",
	aAction: "action",
	aTargetMod: "ice-target"
};

var clsProperty = {

	// window.history封装
	history: {

		// window.history对象
		entity: window.history,

		/**
  	replace ( state: Object, title: String, url: String )
  
  	Return Type:
  	void
  
  	Description:
  	对history.replaceState方法的封装
  
  	URL doc:
  	http://icejs.org/######
  */
		replace(state, title, url) {
			this.entity.replaceState(state, title, url);
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
		push(state, title, url) {
			this.entity.pushState(state, title, url);
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
		getOriginalState() {
			return this.entity.state;
		},

		////////////////////////////////////
		/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
		/// 
		state: {},

		// 状态记录标记
		signature: null,

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
		setState(key, value, mode) {

			this.state[key] = value;

			mode === true || (this.signature = key);
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
		getState(key) {

			return this.state[key];
		}
	},

	////////////////////////////////////
	/// 模块路径记录数组
	/// 记录页面的所有模块名及对应模块中当前所显示的模块内容
	/// 
	moduleRecord: {},

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
	setModuleRecord(moduleName, value, filter) {

		// 更新或添加一项到moduleRecord数组中
		single.moduleRecord[moduleName] = value;

		if (filter === true) {

			// 过滤moduleRecord数组中不存在于当前页面中的模块记录
			var _record = {};

			util.foreach(single.moduleRecord, function (recordItem, key) {
				util.type(util.s("*[ice-module=" + key + "]")) === "object" && (_record[key] = recordItem);
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
	getModuleRecord(moduleName) {
		return single.moduleRecord[moduleName];
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
	getFormatModuleRecord() {
		var _array = [];

		util.foreach(single.moduleRecord, function (recordItem, key) {
			push.call(_array, key + (config.params.moduleSeparator || "") + recordItem);
		});

		return "/" + join.call(_array, "/");
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
	requestEvent: function (e) {

		var

		// 临时存储目标模块名称
		_moduleName = this.getAttribute(single.aTargetMod),
		    src = this.getAttribute(single.aHref) || this.getAttribute(single.aAction),


		// 获取当前按钮操作的模块
		module = util.s("*[" + single.aModule + "=" + _moduleName + "]"),
		    method,
		    data;

		if (this.nodeName === "FORM") {
			method = "POST";
			data = this;
		}

		e.preventDefault();
		if (util.type(module) === "object") {

			//  url, module, data, title, method, timeout, before, success, error, abort, pushStack, onpopstate 
			// 当前模块路径与请求路径不相同时，调用single方法
			getCurrentPath$(module) === src || single(src, module, data, config.params.header[src], method, null, null, null, null, null, true);
		} else {
			throw moduleErr("module", "找不到" + _moduleName + "模块");
		}
	}
};

/**
	single ( url: String|Object, module: DMOObject, data?: String|Object, title?:String, method?:String, timeout?: Number, before?: Function, success?: Function, error?: Function, abort?: Function, pushStack?: Boolean, onpopstate?: Boolean )

	Return Type:
	void

	Description:
	根据url请求html并将html放入module（module为模块节点）
	如果pushStack为true则将url和title压入history栈内。如果pushStack不为true，则不压入history栈内
	浏览器前进/后退调用时，不调用pushState方法
	
	此函数可通过第一个参数传入数组的方式同时更新多个模块
	多模块同时更新时的参数格式为：
	[
		{url: url1, entity: module1, data: data1},
		{url: url2, entity: module2, data: data2},
		...
	], title, timeout, before, success, error, abort, pushStack, onpopstate

	URL doc:
	http://icejs.org/######
*/
function single$1(url, module, data, title, method, timeout, before, success, error, abort, pushStack, onpopstate) {

	var moduleName,
	    aCache,
	    isCache,
	    isBase,
	    modules,
	    historyMod,
	    html,
	    ttitle = util.type(title),


	// 模块名占位符
	modPlaceholder = ":m",


	// 模块内容标识占位符
	conPlaceholder = ":v",


	// 模块内容缓存key
	directionKey,


	//////////////////////////////////////////////////
	/// 请求url处理相关
	///

	/** @type {String} 完整请求url初始化 */
	complateUrl,
	    hasSeparator,


	/** @type {String} 临时保存刷新前的title */
	currentTitle = document.title,


	/** @type {String} 上一页面的路径 */
	lastPath,
	    _state = [];

	// 判断传入的url的类型，如果是string，是普通的参数传递，即只更新一个模块的数据； 如果是array，它包括一个或多个模块更新的数据
	if (util.type(url) === "string") {

		// 统一为modules数组
		modules = [{ url: url, entity: module, data: data }];
	} else {
		modules = url;
	}

	// 循环modules，依次更新模块
	util.foreach(modules, function (moduleItem, i) {

		moduleName = moduleItem.entity.getAttribute(single$1.aModule);
		directionKey = moduleName + "_" + moduleItem.url;
		complateUrl = config.params.urlRule;

		aCache = moduleItem.entity.getAttribute(single$1.aCache);
		isCache = aCache === "true" || config.params.redirectCache === true && aCache !== "false";
		isBase = moduleItem.entity.getAttribute(single$1.aBase) !== "false" && config.params.base.url.length > 0;

		// isCache=true、标题为固定的字符串、cache已有当前模块的缓存时，才使用缓存
		// 如果当标题为function时，很有可能需要服务器实时返回的codeKey字段来获取标题，所以一定需要重新请求
		// 根据不同的codeKey来刷新不同模块也一定需要重新请求，不能做缓存（后续添加）
		if (moduleItem.isCache === true && type !== "function" && (historyMod = cache.getRedirect(directionKey))) {

			util.html(moduleItem.entity, historyMod);

			if (ttitle === "string" && title.length > 0) {
				document.title = title;
			}
		} else {

			// 通过url规则转换url，并通过ice-base来判断是否添加base路径
			complateUrl = util.replaceAll(complateUrl || "", modPlaceholder, moduleName);
			complateUrl = util.replaceAll(complateUrl || "", conPlaceholder, moduleItem.url);

			hasSeparator = complateUrl.indexOf("/");
			complateUrl = isBase ? config.params.base.url + (hasSeparator === 0 ? substr.call(complateUrl, 1) : complateUrl) : hasSeparator === 0 ? complateUrl : "/" + complateUrl;

			http.request({

				url: complateUrl,
				data: moduleItem.data || "",
				method: /^(GET|POST)$/i.test(method) ? method.toUpperCase() : "GET",
				timeout: timeout || 0,
				beforeSend: function () {
					util.type(before) === "function" && before(moduleItem);
				},
				abort: function () {
					util.type(abort) === "function" && abort(moduleItem);
				}

			}).done(function (result) {
				try {
					result = JSON.parse(result);
					html = result[config.params.htmlKey];
				} catch (e) {
					html = result;
				}

				/////////////////////////////////////////////////////////
				// 将请求的html替换到module模块中
				//
				util.html(moduleItem.entity, html);

				/////////////////////////////////////////////////////////
				// 如果需要缓存，则将html缓存起来
				//
				moduleItem.isCache === true && cache.addRedirect(directionKey, html);

				// 将moduleItem.title统一为字符串
				// 如果没有获取到字符串则为null
				title = ttitle === "string" ? title : ttitle === "function" ? title(result[config.params.codeKey] || null) || null : null;

				if (util.type(title) === "string" && title.length > 0) {
					document.title = title;
				}

				// 调用success回调
				util.type(success) === "function" && success(moduleItem);
			}).fail(function (error) {
				util.type(error) === "function" && error(module, error);
			});
		}

		// 先保存上一页面的path用于上一页面的状态保存，再将模块的当前路径更新为刷新后的url
		lastPath = getCurrentPath$(moduleItem.entity);
		setCurrentPath$(moduleItem.entity, moduleItem.url);

		_state.push({
			url: lastPath,
			moduleName: moduleName,
			data: moduleItem.data,
			title: i === "0" ? currentTitle : undefined
		});

		if (pushStack === true) {
			single$1.setModuleRecord(moduleName, moduleItem.url, true);
		}
	});

	// 判断是否调用pushState
	if (pushStack === true) {

		// 需判断是否支持history API新特性
		if (single$1.history.entity.pushState) {

			/////////////////////////////////////////////////////////
			// 保存跳转前的页面状态
			//
			single$1.history.setState(single$1.history.signature, _state, true);

			if (onpopstate !== true) {
				single$1.history.push(null, modules[0].title, single$1.getFormatModuleRecord());
			}

			// 初始化一条将当前页的空值到single.history.state中
			single$1.history.setState(window.location.pathname, null);
		} else {
			throw envErr("History API", "浏览器不支持HTML5 History API");
		}
	}
}

//////////////////////////////////////////
// module无刷新跳转相关属性通用参数，为避免重复定义，统一挂载到single对象上
// single相关静态变量与方法
extend$1(single$1, singleAttr, clsProperty);

var map = {
	HTMLEvents: "load, unload, abort, error, select, change, submit, reset, focus, blur, resize, scroll",
	KeyboartEvent: "keypress, keyup, keydown",
	MouseEvents: "contextmenu, click, dbclick, mouseout, mouseover, mouseenter, mouseleave, mousemove, mousedown, mouseup, mousewheel"
};

// 表示ice.module()


// 表示plugin()


// 表示driver()


// 表达式正则表达式
const rexpr = /{{\s*(.*?)\s*}}/g;

// 连续字符正则表达式
const rword = /\S+/g;

const types = ["string", "number", "boolean", "object", "null", "undefined", "array"];

function correctParam(...params) {
    return {
        to(...condition) {
            let offset = 0,
                _params = [],
                res;
            foreach$1(params, (param, i) => {
                if (!condition[i + offset]) {
                    return false;
                }

                res = false;
                for (let j = i + offset; j < condition.length; j++) {

                    // 统一为数组
                    item = type$1(item) !== "array" ? [item] : item;

                    foreach$1(item, s => {
                        res = res || (() => {
                            return types.indexOf(s) !== -1 ? type$1(param) === s : s instanceof RegExp ? s.test(param) : param === s;
                        })();
                    });

                    if (res) {
                        _params.push(param);
                        break;
                    } else {
                        _params.push(undefined);
                        offset++;
                    }
                }
            });

            this._params = _params;
            return this;
        },

        done(callback) {

            if (params.length === /^function.*\((.*?)\)/.exec(callback.toString())[1].split(",").length) {
                callback.apply(null, this._params);
            } else {
                callback(this._params);
            }
        }
    };
}

let eventMap = map;
let special = {

	// DOMContentLoaded事件的判断方式
	DOMContentLoaded: function () {
		return !!document.addEventListener;
	}
};

/**
	handler ( e: EventObject )

	Return Type:
	void

	Description:
	所有事件绑定的回调函数
	将根据事件触发DOM和事件类型调用相应真实的回调

	URL doc:
	http://icejs.org/######
*/
function handler(e) {
	let _listeners = this ? this.valueOf[e.type] : cache$1.getEvent(e.type);
	if (type$1(_listeners) === "array" && _listeners.length > 0) {

		foreach$1(_listeners, listener => {
			listener.call(this, e);

			// 如果该回调函数只执行一次则移除
			if (listener.once === true) {
				event.remove(this, e.type, listener, listener.useCapture);
			}
		});
	}
}

/**
	Plugin event

	Description:
	事件绑定与事件触发对象
	可在节点对象上绑定常规与自定义事件，也可无节点绑定事件，由event.emit(type)手动触发
	常规事件一般在交互过程中触发，自定义事件需调用event.emit(elem, type)手动触发

	URL doc:
	http://icejs.org/######
*/
var event$2 = event = {

	/**
 	support ( type: String, elem?: DOMObject )
 
 	Return Type:
 	Boolean
 	是否支持type事件
 
 	Description:
 	判断元素是否支持指定事件
 
 	URL doc:
 	http://icejs.org/######
 */
	support(type, elem = document.createElement("div")) {
		let support;

		if (type(special[type]) === "function") {
			support = special[type]();
		} else {
			type = "on" + type;
			support = type in elem;

			if (!support && elem.setAttribute) {
				attr(elem, type, "");

				support = type(elem[type]) === "function";
			}
		}

		return support;
	},

	/**
 	on ( elem: DOMObject, types: String, listener: Function, useCapture?: Boolean, once?: Boolean )
 
 	Return Type:
 	void
 
 	Description:
 	以兼容模式绑定事件，当有多个绑定事件时触发后将顺序执行多个绑定事件
 	绑定事件的节点类型不为文本节点（nodeType = 3）或注释节点（nodeType = 8）
 	当在节点上绑定事件时，节点只绑定调用函数，而所有的事件绑定则存储在events私有对象上，节点对象上将保存对事件key的引用
 
 	URL doc:
 	http://icejs.org/######
 */
	on(elem, types, listener, useCapture, once) {

		// 纠正参数
		correctParam(elem, types, listener, useCapture).to("object", "string").done(args => {
			elem = args[0];
			types = args[1];
			listener = args[2];
			useCapture = args[3];
		});

		check(types).type("string").ifNot("function event.on:types", "types参数类型必须为string").do();
		check(listener).type("function").ifNot("function event.on:listener", "listener参数类型必须为function").do();
		if (elem) {
			check(elem.nodeType).notBe(3).notBe(8).ifNot("function event.on:elem", "elem参数不能为文本节点或注释节点").do();
		}

		// 给监听回调添加guid，方便移除事件
		if (!listener.guid) {
			listener.guid = guid();
		}

		// 如果once为true，则该回调只执行一次
		if (once === true) {
			listener.once = true;
			listener.useCapture = !!useCapture;
		}

		let events;

		// 多个事件拆分绑定
		(types || "").replace(rword, type => {

			if (elem) {
				events = elem.valueOf[type] = elem.valueOf[type] || [];
				events.push(listener);
			} else {
				cache$1.pushEvent(type, listener);
			}

			// 元素对象存在，且元素支持浏览器事件时绑定事件，以方便浏览器交互时触发事件
			// 元素不支持时属于自定义事件，需手动调用event.emit()触发事件
			// IE.version >= 9
			if (elem && this.support(type, elem) && elem.addEventListener) {
				elem.addEventListener(type, handler, !!useCapture);
			}
		});
	},

	/**
 	remove ( elem: DOMObject, types: String, listener: Function, useCapture: Boolean )
 
 	Return Type:
 	void
 
 	Description:
 	以兼容模式解绑事件，可一次解绑多个类型的事件
 
 	URL doc:
 	http://icejs.org/######
 */
	remove(elem, types, listener, useCapture) {

		// 纠正参数
		correctParam(elem, types, listener, useCapture).to("object", "string").done(args => {
			elem = args[0];
			types = args[1];
			listener = args[2];
			useCapture = args[3];
		});

		if (elem) {
			check(elem.nodeType).notBe(3).notBe(8).ifNot("function event.on:elem", "elem参数不能为文本节点或注释节点").do();
		}
		check(types).type("string").ifNot("function event.on:types", "types参数类型必须为string").do();
		check(listener).type("function").ifNot("function event.on:listener", "listener参数类型必须为function").do();

		let i, events;
		(types || "").replace(rword, type => {
			if (elem) {
				events = elem.valueOf[type] = elem.valueOf[type] || [];
			} else {
				events = cache$1.getEvent(type) || [];
			}

			// 获取事件监听回调数组
			if (i = events.length > 0) {

				// 符合要求则移除事件回调
				while (--i > -1) {
					if (events[i] && events[i].guid === listener.guid) {
						events.splice(i, 1);
					}
				}

				// 如果该事件的监听回调为空时，则解绑事件并删除监听回调数组
				if (events.length === 0) {
					delete (elem ? elem.valueOf[type] : cache$1.getAllEvent()[type]);

					if (elem && this.support(type, elem) && elem.removeEventListener) {
						elem.removeEventListener(type, handler, !!useCapture);
					}
				}
			}
		});
	},

	/**
 	emit ( elem: DOMObject, types: String )
 
 	Return Type:
 	void
 
 	Description:
 	触发事件
 
 	URL doc:
 	http://icejs.org/######
 */
	emit(elem, types) {

		// 纠正参数
		let args = correctParam(elem, types).to("object", "string").done((e, t) => {
			elem = e;
			types = t;
		});

		check(elem.nodeType).notBe(3).notBe(8).ifNot("function event.emit:elem", "elem参数不能为文本节点或注释节点").do();
		check(types).type("string").ifNot("function event.emit:types", "types参数类型必须为string").do()(types || "").replace(rword, type => {
			if (this.support(type, elem)) {

				// 使用creaeEvent创建事件
				let e, eventType;
				foreach$1(eventMap, (k, v) => {
					if (v.indexOf(type) !== -1) {
						eventType = k;
					}
				});
				e = document.createEvent(eventType || "CustomEvent");
				e.initEvent(type, true, false);

				elem.dispatchEvent(e);
			} else {
				handler.call(elem, { type: type });
			}
		});
	}
};

/**
	query ( selector: String, context?: Object, all?: Boolean )

	Return Type:
	符合表达式与获取范围的元素( Object | Array )

	Description:
	获取元素对象#!/usr/bin/env 

	URL doc:
	http://icejs.org/######
*/
function query(selector, context, all) {
	var elem = (context || document)[all ? "querySelectorAll" : "querySelector"](selector);
	return elem.length ? Array.prototype.slice.call(elem) : elem;
}

/**
	appendScript ( node: DOMObject, success: Function, error: Function )

	Return Type:
	void

	Description:
	异步动态加载js文件

	URL doc:
	http://icejs.org/######
*/
function appendScript(node, success, error) {
	var script = document.createElement("script");
	script.type = "text/javascript";

	// 将node的所有属性转移到将要解析的script节点上
	foreach$1(node.attributes, attr => {
		if (attr.nodeType === 2) {
			script.setAttribute(attr.nodeName, attr.nodeValue);
		}
	});

	if (node.src) {
		script.async = true;

		// 绑定加载事件，加载完成后移除此元素
		event$2.on(script, "load readystatechange", function (event) {
			if (!this.readyState || this.readyState === "loaded" || this.raeadyState === "complete") {
				success && success(event);
			}

			script.parentNode.removeChild(script);
		});

		event$2.on(script, "error", () => {
			script.parentNode.removeChild(script);
		});

		document.head.appendChild(script);
	} else if (node.text) {
		script.text = node.text || "";
		document.head.appendChild(script).parentNode.removeChild(script);
	}
}

/**
	scriptEval ( code: Array|DOMScript|String )

	Return Type:
	void

	Description:
	执行javascript代码片段
	如果参数是script标签数组，则顺序执行
	如果参数是script标签或javascript代码，则直接执行

	URL doc:
	http://icejs.org/######
*/
function scriptEval(code) {
	check(code).type("string", "array").or().prior(function () {
		this.type("object").check(code.nodeType).be(1).check(code.nodeName.toLowerCase()).be("script");
	}).ifNot("function scriptEval:code", "参数必须为javascript代码片段、script标签或script标签数组").do();

	var tcode = type$1(code);
	if (tcode === "string") {

		var script = document.createElement("script");
		script.type = "text/javascript";
		script.text = code;

		appendScript(script);
	} else if (tcode === "object" && code.nodeType === 1 && code.nodeName.toLowerCase() === "script") {
		appendScript(code);
	} else if (tcode === "array") {
		var scripts = code.slice(0);
		foreach$1(code, _script => {
			//删除数组中的当前值，以便于将剩下未执行的javascript通过回调函数传递
			Array.prototype.splice.call(scripts, 0, 1);

			if (!_script.src) {
				appendScript(_script);
			} else {
				// 通过script的回调函数去递归执行未执行的script标签
				appendScript(_script, () => {
					scripts.length > 0 && scriptEval(scripts);
				});

				return false;
			}
		});
	}
}

/**
	append ( context: DOMObject, node: DOMObject|DOMString|String )

	Return Type:
	DOMObject

	Description:
	在context元素末尾插入node
	如果node内有script元素则会在插入元素后执行包含的script

	URL doc:
	http://icejs.org/######
*/
function append(context, node) {
	check(context.nodeType).toBe(1).ifNot("fn append:context", "context必须为DOM节点").do();

	var rhtml = /<|&#?\w+;/,
	    telem = type$1(node),
	    i = 0,
	    fragment,
	    _elem,
	    script,
	    nodes = [],
	    scripts = [];

	if (telem === "string" && !rhtml.test(node)) {

		// 插入纯文本，没有标签时的处理
		nodes.push(document.createTextNode(node));
	} else if (telem === "object") {
		node.nodeType && nodes.push(node);
	} else {
		fragment = document.createDocumentFragment(), _elem = fragment.appendChild(document.createElement("div"));

		// 将node字符串插入_elem中等待处理
		_elem.innerHTML = node;

		for (; i < _elem.childNodes.length; i++) {
			nodes.push(_elem.childNodes[i]);
		}

		// 清空_elem
		_elem.textContent = "";

		// 清空fragment并依次插入元素
		fragment.textContent = "";
	}

	foreach$1(nodes, node => {
		context.appendChild(node);

		if (node.nodeType === 1) {
			_elem = query("script", node, true).concat(node.nodeName === "SCRIPT" ? [node] : []);

			i = 0;
			while (script = _elem[i++]) {
				// 将所有script标签放入scripts数组内等待执行
				scripts.push(script);
			}
		}
	});

	// scripts数组不空则顺序执行script
	isEmpty(scripts) || scriptEval(scripts);

	// 需控制新添加的html内容。。。。。。

	return context;
}

/**
	clear ( context: DOMObject )

	Return Type:
	DOMObject
	清空后的节点元素

	Description:
	清空节点元素内的所有内容

	URL doc:
	http://icejs.org/######
*/
function clear(context) {

	check(context.nodeType).be(1).ifNot("function clear:context", "元素类型必须是dom节点").do();

	// 防止内存泄漏，需删除context节点内的其他内容
	// add...

	// 删除此元素所有内容
	context.textContent = "";

	return context;
}

/**
	html ( context: DOMObject, node: DOMObject|DOMString|String )

	Return Type:
	DOMObject
	处理后的节点元素

	Description:
	使用node替换context的内容
	如果node内有script元素则会在插入元素后执行包含的script

	URL doc:
	http://icejs.org/######
*/
function html(context, node) {
	context = clear(context);
	context = append(context, node);

	return context;
}

/**
	attr ( context: DOMObject, name: String, val: Object|String|null )

	Return Type:
	void

	Description:
	获取、设置（单个或批量）、移除元素属性

	URL doc:
	http://icejs.org/######
*/
function attr(context, name, val) {
	let args = correctParam(name, val).to("string", ["string", "object"]);
	name = args[0];
	val = arg[1];

	switch (type$1(val)) {
		case "string":
			context.setAttribute(name, val);
			break;
		case "undefined":
			return context.getAttribute(name);
		case "object":
			foreach$1(val, (k, v) => {
				context.setAttribute(k, v);
			});
			break;
		case "null":
			context.removeAttribute(name);
	}
}

/**
	NodeLite ( node: DOMObject|DOMString )

	Return Type:
	void

	Description:
	模块对象封装类
	在模块定义中的init方法和apply方法中会自动注入一个NodeLite的对象

	URL doc:
	http://icejs.org/######
*/
function NodeLite(node) {
	this.originNode = node;
}

extend(NodeLite.prototype, {
	append(node) {
		append(this.originNode, node);
		return this;
	},

	clear() {
		clear(this.originNode);
		return this;
	},

	html(node) {
		html(this.originNode, node);
		return this;
	},

	query(selector, all) {
		query(selector, this.originNode, all);
		return this;
	},

	attr(name, val) {
		attr(this.originNode, name, val);

		return this;
	}
});

/**
	makeFn ( code: String )

	Return Type:
	Function
    代码解析后的方法体

	Description:
	通过解析代码获取的对应vm属性值的方法

	URL doc:
	http://icejs.org/######
*/
function makeFn(code) {
	return new Function("obj", `with ( obj ) {
		try {
			return ${code};
		}
		catch ( e ) {
			throw runtimeErr ( "view model", e );
		}
	}`);
}

/**
	Watcher ( directive: Object, node: DOMObject, expr: String, vm: Object, scoped: Object )

	Return Type:
	void

	Description:
	视图监听类
	模板中所有需绑定的视图都将依次转换为此类的对象
	当数据发生变化时，这些对象负责更新视图

	URL doc:
	http://icejs.org/######
*/
function Watcher(directive, node, expr, vm, scoped) {

	// 如果scoped为局部数据对象则将expr内的局部变量名替换为局部变量名
	if (type$1(scoped) === "object" && scoped.__$reg__ instanceof RegExp) {
		expr = expr.replace(scoped.__$reg__, match => scoped[match] || match);
	}

	this.directive = directive;
	this.node = node;
	this.vm = vm;
	this.getVal = makeFn(expr);

	if (!directive.before.call(this)) {
		return;
	}

	// 将获取表达式的真实值并将此watcher对象绑定到依赖监听属性中
	Subscriber.watcher = this;
	let val = this.getVal(vm);
	Subscriber.watcher = undefined;

	// 移除局部变量
	foreach$1(scoped || [], (k, v) => {
		if (type$1(v) === "string") {
			delete vm[v];
		}
	});

	directive.update.call(this, val);
}

extend$1(Watcher.prototype, {

	/**
 	update ( value: any )
 
 	Return Type:
 	void
 
 	Description:
 	更新视图
 
 	URL doc:
 	http://icejs.org/######
 */
	update(value) {
		this.directive.update.call(this, this.getVal(vm));
	},

	/**
 	defineScoped ( scopedDefinition: Object, vm: Object )
 
 	Return Type:
 	Object
 	局部变量操作对象
 
 	Description:
 定义模板局部变量
 此方法将生成局部变量操作对象（包含替身变量名）和增加局部变量属性到vm中
 	此替身变量名不能为当前vm中已有的变量名，所以需取的生僻些
 	在挂载数据时如果有替身则会将局部变量名替换为替身变量名来达到不重复vm中已有变量名的目的
 
 	URL doc:
 	http://icejs.org/######
 */
	defineScoped(scopedDefinition, vm) {
		let scopedPrefix = "ICE_FOR_" + Date.now() + "_",
		    scoped = {};

		foreach$1(scopedDefinition, (variable, val) => {
			if (variable) {
				scoped[variable] = scopedPrefix + variable;
				vm[scopedPrefix + variable] = val;
			}
		});

		scoped.__$reg__ = new RegExp(Object.keys(scoped).join("|"), "g");

		return scoped;
	}
});

/**
    Subscriber ()

    Return Type:
    void

    Description:
    订阅类
    ViewModel会为每个监听属性创建一个Subscriber对象用于保存该属性对应监听视图的更新

    URL doc:
    http://icejs.org/######
*/
function Subscriber() {
    this.watchers = [];
}

extend$1(Subscriber.prototype, {

    /**
        subscribe ()
    
        Return Type:
        void
    
        Description:
        订阅监听视图
    
        URL doc:
        http://icejs.org/######
    */
    subscribe() {
        if (Subscriber.watcher instanceof Watcher) {
            this.watchers.push(Subscriber.watcher);
            Subscribe.watcher = undefined;
        }
    },

    /**
        notify ()
    
        Return Type:
        void
    
        Description:
        通知所有监听视图进行更新
    
        URL doc:
        http://icejs.org/######
    */
    notify() {
        foreach$1(this.watchers, watcher => {
            watcher.update();
        });
    }
});

// 转换存取器属性
function defineProperty(key, getter, setter, target) {
	Object.defineProperty(target, key, {
		enumerable: true,
		configurable: true,
		get: getter,
		set: setter
	});
}

function convertState(value, context) {
	return type$1(value) === "object" && isPlainObject(value) ? new ViewModel(value, false) : type$1(value) === "array" ? initArray(value, context) : value;
}
// 初始化绑定事件
function initMethod(methods, context) {
	foreach$1(methods, (method, key) => {
		context[key] = (...args) => {
			method.apply(context, args);
		};
	});
}

// 初始化监听属性
function initState(states, context) {
	let proxyState = {};

	foreach$1(states, (state, key) => {
		let subs = new Subscriber();
		watch = noop, oldVal;

		// 如果属性带有watch方法
		if (type$1(state) === "object" && Object.keys(state).length === 2 && state.hasOwnProperty("value") && state.hasOwnProperty("watch") && type$1(state.watch) === "function") {
			watch = state.watch;
			state = state.value;
		}

		defineProperty(key, () => {
			// 绑定视图
			subs.subscribe();

			return state;
		}, newVal => {
			if (state !== newVal) {
				oldVal = state;
				state = newVal;

				watch.call(context, newVal, oldVal);

				// 更新视图
				subs.notify(newVal);
			}
		}, context);

		// 代理监控数据
		defineProperty(key, () => {
			return context[key];
		}, newVal => {
			context[key] = newVal;
		}, proxyState);
	});

	return proxyState;
}

// 初始化监听计算属性
function initComputed(computeds, states, context) {
	let descriptors = {};

	foreach$1(computeds, function (computed, key) {

		if (!computed || !t === "function" || !computed.hasOwnProperty("get")) {
			throw vmComputedErr(key, "计算属性必须包含get函数，可直接定义一个函数或对象内包含get函数");
		}

		let subs = new Subscriber(),
		    state = descriptors[key] = type$1(computed) === "function" ? computed.call(context) : computed.get.call(states);

		defineProperty(key, () => {
			return function () {
				// 绑定视图
				subs.subscribe();

				return state;
			};
		}, type$1(computed.set) === "function" ? newVal => {
			if (state !== newVal) {
				state = computed.set.call(states, newVal);

				// 更新视图
				subs.notify(newVal);
			}
		} : noop, context);
	});
}

// 初始化监听数组
function initArray(array, context) {

	// 监听数组转换
	array = array.map(item => {
		return convertState(item, context);
	});

	foreach$1(["push", "pop", "shift", "unshift", "splice", "sort", "reverse"], method => {
		let nativeMethod = Array.prototype[method];

		Object.defineProperty(array, method, {
			value: function (...args) {

				let res = nativeMethod.apply(this, args);
				if (/push|unshift|splice/.test(method)) {

					// 转换数组新加入的项
					convertState(method === "splice" ? args.slice(2) : args, this);
				}

				// 更新视图
				// ...

				return res;
			},
			writable: true,
			configurable: true,
			enumeratable: false
		});
	});
}

/**
	ViewModel ( vmData: Object, isRoot: Boolean )

	Return Type:
	void

	Description:
	ViewModel数据监听类
	ice.init方法返回的需被监听的数据都使用此类进行实例化

	URL doc:
	http://icejs.org/######
*/
function ViewModel(vmData, isRoot = true) {
	let state = {},
	    method = {},
	    computed = {};

	// 将vmData内的属性进行分类
	foreach$1(vmData, (value, key) => {

		// 转换普通方法
		if (type$1(value) === "function") {
			method[key] = value;
		}

		// 转换计算属性
		// 深层嵌套内的computed属性对象不会被当做计算属性初始化
		else if (key === "computed" && type$1(value) === "object" && !isRoot) {
				foreach$1(value, (v, k) => {
					computed[k] = v;
				});
			}

			// 转换监听属性，当值为包含value和watch时将watch转换为监听属性	
			// 如果是对象则将此对象也转换为ViewModel的实例
			// 如果是数组则遍历数组将其内部属性转换为对应监听数组
			else {
					state[key] = convertState(value, this);
				}
	});

	// 初始化监听属性
	initMethod(method, this);
	initComputed(computed, initState(state, this), this);
}

var directiveIf = {

    /**
        before ()
    
        Return Type:
        void|Boolean
        返回false时停止往下执行
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://icejs.org/######
    */
    before() {
        let elem = this.node;
        if (attr(elem, ":for")) {
            return false;
        }

        attr(elem, ":if", null);
        this.parent = this.elem.parentNode;
        this.replacement = this.elem.ownerDocument.createTextNode("");
    },

    /**
        update ( val: Boolean )
    
        Return Type:
        void
    
        Description:
        “:if”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
    update(val) {
        let elem = this.node,
            parent = elem.parent;

        if (val && !elem.parentNode) {
            parent.replaceChild(this.replacement, elem);
        } else if (!val && this.elem.parentNode == parent) {
            parent.replaceChild(elem, replacement);
        }
    }
};

const rforWord = /^\s*([$\w]+)\s+in\s+([$\w]+)\s*$/;

var directiveFor = {

    /**
        before ()
    
        Return Type:
        void|Boolean
        返回false时停止往下执行
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://icejs.org/######
    */
    before() {

        let variable = rforWord.exec(this.expr),
            elem = this.node;

        this.startNode = elem.ownerDocument.createTextNode("");
        this.endNode = this.startNode.cloneNode();

        this.item = variable[1];
        this.expr = variable[2];
        this.key = attr(elem, ":key");

        if (this.key) {
            attr(elem, ":key", null);
        }

        attr(elem, ":for", null);
    },

    /**
        update ( array: Array )
    
        Return Type:
        void
    
        Description:
        “:for”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
    update(array) {
        let elem = this.node,
            vm = this.vm,
            parent = elem.parentNode,
            fragment = elem.ownerDocument.createDocumentFragment(),
            itemNode,


        // 局部变量定义
        scopedDefinition = {};

        foreach$1(array, (item, key) => {

            // 定义范围变量
            scopedDefinition[this.item] = item;
            scopedDefinition[this.key] = key;

            itemNode = elem.cloneNode(true);

            // 为遍历克隆的元素挂载数据
            Tmpl.mountElem(itemNode, vm, this.defineScoped(scopedDefinition, vm));

            fragment.appendChild(itemNode);
        });

        // 初始化视图时将模板元素替换为挂载后元素
        if (parent) {
            fragment.insertBefore(this.startNode, fragment.firstChild);
            fragment.appendChild(this.endNode);

            parent.replaceChild(fragment, elem);
        }

        // 改变数据后更新视图
        else {
                let el = this.startNode,
                    p = el.parentNode,
                    removes = [];
                while ((el = el.nextSibling) !== this.endNode) {
                    removes.push(el);
                }
                reomves.map(item => {
                    p.removeChild(item);
                });

                p.insertBefore(fragment, this.endNode);
            }
    }
};

var directiveExpr = {

    /**
        before ()
    
        Return Type:
        void|Boolean
        返回false时停止往下执行
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://icejs.org/######
    */
    before() {
        this.expr = "\"" + this.expr + "\"";

        // 将表达式转换为字符串拼接代码
        this.expr.replace(rexpr, (match, rep) => "\" + " + rep + " + \"");
    },

    /**
        update ( val: String )
    
        Return Type:
        void
    
        Description:
        “{{ express }}”表达式对应的视图更新方法
        该表达式可用于标签属性与文本中
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
    update(val) {
        this.node.nodeValue = val;
    }
};

var directiveOn = {

    /**
        before ()
    
        Return Type:
        void|Boolean
        返回false时停止往下执行
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://icejs.org/######
    */
    before() {
        let rarg = /([$\w]+)\s*\((.*?)\)/,
            expr = this.expr.split(":"),
            argMatch = rarg.exec(expr[1]);

        this.type = expr[0];
        this.expr = argMatch ? argMatch[1] : expr[1];
        this.arg = argMatch ? argMatch[1].split(",").map(item => item.trim()) : undefined;
    },

    /**
        update ( listener: Function )
    
        Return Type:
        void
    
        Description:
        事件绑定方法
    
        URL doc:
        http://icejs.org/######
    */
    update(listener) {
        event$2.on(this.node, this.type, listener);
    }
};

var directiveModel = {

    /**
        before ()
    
        Return Type:
        void|Boolean
        返回false时停止往下执行
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://icejs.org/######
    */
    before() {
        let support = {
            input: {
                nodeName: "TEXTAREA",
                type: "text, password, color, search, week, date, datetime-local, month, time, email, range, tel, url"
            },
            change: {
                nodeName: "SELECT",
                inputType: "radio, checkbox"
            }
        },
            elem = this.node,
            expr = this.expr,
            vm = this.vm,
            nodeName = elem.nodeName.toUpperCase(),
            type = attr(elem, "type").toLowerCase(),


        // 如果是复选框则数据要以数组的形式表现
        handler = nodeName === "INPUT" && type === "checkbox" ? function () {
            vm[expr] = vm[expr] || [];
            if (this.checked) {
                vm[expr].push(this.value);
            } else {
                vm[expr].splice(vm[expr].indexOf(this.value), 1);
            }
        } : function () {
            vm[expr] = this.value;
        };

        // 判断支持input事件的元素名称或对应type的input元素
        if (nodeName === "INPUT" && support.input.type.indexOf(type) !== -1 || nodeName.indexOf(support.input.nodeName) !== -1) {
            event$2(elem, "input", handler);
        } else if (nodeName === "INPUT" && support.change.type.indexOf(type) !== -1 || nodeName.indexOf(support.change.nodeName) !== -1) {
            event$2(elem, "change", handler);
        }
    },

    /**
        update ( val: String )
    
        Return Type:
        void
    
        Description:
        表单元素双向绑定方法
    
        URL doc:
        http://icejs.org/######
    */
    update(val) {
        this.node.value = val;
    }
};

/**
    Plugin Tmpl

    Description:
    模板类
    解析模板

    URL doc:
    http://icejs.org/######
*/
function Tmpl(tmplCode) {
    this.tmplCode = tmplCode;
}

extend$1(Tmpl.prototype, {
    mount(vm) {
        Tmpl.mountElem(this.tmplCode, vm);
    }
});

extend$1(Tmpl, {
    mountElem(elem, vm, scoped) {
        const rattr = /^:([\$\w]+)$/;
        let directive, handler, targetNode, expr;

        do {
            if (elem.nodeType === 1) {

                // 处理:for
                // 处理:if :else-if :else
                // 处理{{ expression }}
                // 处理:on、:onrequest :onresponse :onfinish事件
                // 处理:model
                foreach(elem.attributes, attr => {
                    directive = rattr.exec(attr.nodeName);
                    if (directive) {
                        directive = directive[1];
                        if (/^on/.test(directive)) {

                            // 事件绑定
                            handler = Tmpl.directives.on;
                            targetNode = elem, expr = directive.slice(2) + ":" + attr.nodeValue;
                        } else if (Tmpl.directives[directive]) {

                            // 模板属性绑定
                            handler = Tmpl.directives[directive];
                            targetNode = elem;
                            expr = attr.nodeValue;
                        } else {

                            // 没有找到该指令
                            throw runtimeErr("directive", "没有找到\"" + directive + "\"指令或表达式");
                        }
                    } else {

                        // 属性值表达式绑定
                        handler = Tmpl.directives.expr;
                        targetNode = attr;
                        expr = attr.nodeValue;
                    }
                });
            } else if (elem.nodeType === 3) {

                // 文本节点表达式绑定
                handler = Tmpl.directives.expr;
                targetNode = elem;
                expr = elem.nodeValue;
            }

            // 为视图创建Watcher实例
            new Watcher(handler, targetNode, expr, vm, scoped);

            Tmpl.mountElem(elem.firstChild, vm);
        } while (elem = elem.nextSibling);
    },

    directives: {
        for: directiveFor,
        if: directiveIf,
        expr: directiveExpr,
        on: directiveOn,
        model: directiveModel
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
let ice = {
	config: config$1(),

	use(structure) {
		// 查看是否有deps，有的时候，value类型分为以下情况：
		// 1、若value为string，则使用cache.componentCreater方法获取插件，如果没有则使用模块加载器加载
		// 2、若value为object，则调用use构建插件
		// 判断是plugin还是driver，存入相应的cache中并返回
	},

	module(moduleName, vmData) {
		// 检查参数
		check(moduleName).toType("string").toNotBe("").ifNot("ice.module", "moduleName参数类型必须为string").do();
		check(vmData).toType("Object").ifNot("ice.module", "vmData参数类型必须为object").do();

		// 查看是否有deps，有的话，value类型分为以下情况：
		// 1、若value为string，则使用cache.componentCreater方法获取插件，如果没有则使用模块加载器加载
		// 2、若value为object，则调用use构建插件
		if (type$1(vmData.deps) === "object" && !isEmpty(vmData.deps)) {

			let rarg = /^function\s*\((.*)\)\s*/,


			// 获取init方法参数
			initArgs = rarg.exec(vmData.init.toString())[1].split(",").map(item => item.trim()),


			// 获取apply方法参数
			applyArgs = type$1(vmData.apply) === "function" ? rarg.exec(vmData.apply.toString())[1].split(",").map(item => item.trim()) : [],
			    args = initArgs.concat(applyArgs).map(item => {
				return item.trim();
			}),
			    deps = vmData.deps,
			    _deps = {};

			// 过滤多余的依赖项
			foreach(deps, (item, key) => {
				if (args.indexOf(key) > -1) {
					_deps[key] = item;
				}
			});
			deps = _deps;

			// 依赖注入插件对象后
			depend(loader.topName, deps, initArgs, (...depArray) => {

				let moduleElem = query("*[" + single$1.aModule + "=" + moduleName + "]"),
				    vm,
				    tmpl;
				if (!deps.hasOwnProperty(initArgs[0])) {
					depArray.unshift(new NodeLite(moduleElem));
				}

				// 对数据模型进行转化
				vm = new ViewModel(vmData.init.apply(depArray));

				// 使用vm解析模板
				tmpl = new Tmpl(moduleElem);
				tmpl.mount(vm);
			});
		}

		// 获取后初始化vm的init方法，如果init方法不依赖任何deps，则不需要在加载完deps就可以调用
		// 解析模板
		// 查看是否有元素驱动器，有的话就加载驱动器对象
		// 调用apply方法
	},

	drivenElem() {}
};

return ice;

})));