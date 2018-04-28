/**
 * AmapleJS v1.1.6
 * (c) 2018-2018 JOU https://amaple.org
 * License: MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.am = factory());
}(this, (function () { 'use strict';

// 路由模式，启动路由时可进行模式配置
// 自动选择路由模式(默认)
// 在支持html5 history API时使用新特性，不支持的情况下自动回退到hash模式
var AUTO = 0;

// 强制使用hash模式
var HASH = 1;

// 强制使用html5 history API模式
// 使用此模式时需注意：在不支持新特新的浏览器中是不能正常使用的
var BROWSER = 2;

var slice = Array.prototype.slice;

/**
 	type ( arg: any )
 
 	Return Type:
 	String
 	传入参数的类型字符串
 
 	Description:
 	获取传入的参数的变量类型，与typeof关键字不同的是，当参数为Array时返回"array"，当变量为null时返回"null"
 
 	URL doc:
 	http://amaple.org/######
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
	http://amaple.org/######
*/
function noop() {}

/**
	foreach ( target: Array|Object|ArrayLike, callback: Function )

	Return Type:
	Boolean
	是否继续跳出外层循环，如果返回false，则继续跳出循环

	Description:
	遍历数组或对象
    可遍历带有length的类数组对象如NodeList对象，如果遍历对象为空或不可遍历，则直接返回
    
    回调函数中返回false跳出此循环，且此返回值会在foreach中返回，在需跳出多层循环时return foreach (...)实现

	URL doc:
	http://amaple.org/######
*/
function foreach(target, callback) {

	// 判断目标变量是否可被变量
	if (!target || (target.length || Object.keys(target).length) <= 0) {
		return;
	}

	var isContinue = void 0,
	    i = void 0,
	    tTarget = type$1(target);

	if (tTarget === "object" && target.length) {
		target = slice.call(target);
		tTarget = "array";
	}

	if (tTarget === "array") {
		for (i = 0; i < target.length; i++) {
			isContinue = callback(target[i], i, target);

			if (isContinue === false) {
				break;
			}
		}
	} else if (tTarget === "object") {
		for (i in target) {
			isContinue = callback(target[i], i, target);

			if (isContinue === false) {
				break;
			}
		}
	}

	return isContinue;
}

/**
	isEmpty ( object: Object )

	Return Type:
	Boolean
	为空时返回true，不空时返回false

	Description:
	判断对象或数组是否为空对象或空数组

	URL doc:
	http://amaple.org/######
*/
function isEmpty(object) {
	var tobj = type$1(object);
	if (!/array|object/.test(tobj)) {
		return;
	}

	var result = true;
	foreach(object, function () {
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
	此函数用于继承参数属性，可以传入不定个数被继承参数，以第一个参数作为继承目标对象，继承对象类型必须为array、object、function，被继承参数可以是任意类型的参数。
	
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
	http://amaple.org/######
*/
function extend() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var target = args[0],
	    ttarget = type$1(target);
	var targ = void 0;

	args = args.slice(1);

	// 依次处理被继承参数
	foreach(args, function (arg) {
		targ = type$1(arg);

		if (ttarget === "array") {
			if (targ === "array" || targ === "object") {
				foreach(arg, function (arg) {
					if (target.indexOf(arg) <= -1) {
						target.push(arg);
					}
				});
			} else if (targ !== null && targ !== undefined) {
				target.push(arg);
			}
		} else if (ttarget === "object" || ttarget === "function") {

			// 只处理object类型的被继承参数，其他类型的将会被忽略
			if (targ === "object") {
				foreach(arg, function (arg, key) {
					target[key] = arg;
				});
			}
		}
	});

	return target;
}

/**
	isPlainObject ( object: Object )

	Return Type:
	Boolean

	Description:
	判断一个对象是否为纯粹的对象
	兼容性处理：IE10及一下的对象上没有__proto__原型引用，而constructor是直接在object上

	URL doc:
	http://amaple.org/######
*/
function isPlainObject(object) {
	return object.constructor === Object;
}

/**
	guid ()

	Return Type:
	Number

	Description:
	获取唯一标识

	URL doc:
	http://amaple.org/######
*/
function guid() {
	return setTimeout(noop, 1) + "";
}

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
	http://amaple.org/######
*/
function error(errorType) {
	return function (errorCode, errorText) {

		// 打印的错误信息
		var errMsg = "[Amaple:" + (errorType ? errorType + "-" : "") + errorCode + "]" + errorText;
		return new Error(errMsg);
	};
}

var envErr = error("env"); // 环境错误
var argErr = error("arg"); // 参数错误
var checkErr = error("check"); // 参数检查错误
var requestErr = error("request"); // 请求错误
 // 配置错误
var moduleErr = error("module"); // 模块错误
var runtimeErr = error("runtime"); // 运行时错误
var vmComputedErr = error("vm-computed"); // 模块错误
var classErr = error("class"); // 类定义错误
var RouterErr = error("router"); // 路由定义错误
var directiveErr = error("directive"); // 指令使用错误
var componentErr = error("component"); // 组件错误
var pluginErr = error("plugin"); // 插件错误
var vnodeErr = error("vnode"); // 虚拟节点错误
var htmlParserErr = error("HTMLParser"); // html解析错误
var cssParserErr = error("CSSParser"); // css解析错误

var eventMap = {
	HTMLEvents: "load, unload, abort, error, select, change, submit, reset, focus, blur, resize, scroll",
	KeyboartEvent: "keypress, keyup, keydown",
	MouseEvents: "contextmenu, click, dbclick, mouseout, mouseover, mouseenter, mouseleave, mousemove, mousedown, mouseup, mousewheel"
};

var plugin = {

	plugins: {},

	/**
 	push ( name: String )
 
 	Return Type:
 	void
 
 	Description:
 	查看是否存在指定插件
 
 	URL doc:
 	http://amaple.org/######
 */
	has: function has(name) {
		return !!this.plugins[name];
	},


	/**
 	push ( name: String, plugin: Object|Function )
 
 	Return Type:
 	void
 
 	Description:
 	添加插件
 
 	URL doc:
 	http://amaple.org/######
 */
	push: function push(name, plugin) {
		this.plugins[name] = plugin;
	},


	/**
 	get ( name: String )
 
 	Return Type:
 	Object
 	插件对象
 
 	Description:
 	获取插件，没有找打则返回null
 
 	URL doc:
 	http://amaple.org/######
 */
	get: function get(name) {
		return this.plugins[name] || null;
	}
};

var module$1 = {

	modules: {},

	/**
 	push ( name: String, module: DOMString|DOMObject )
 
 	Return Type:
 	void
 
 	Description:
 	添加页面模块缓存
 
 	URL doc:
 	http://amaple.org/######
 */
	push: function push(name, module) {
		this.modules[name] = module;
	},


	/**
 	get ( name: String )
 
 	Return Type:
 	DOMString|DOMObject
 	缓存模块
 
 	Description:
 	获取页面模块缓存，没有找到则返回null
 
 	URL doc:
 	http://amaple.org/######
 */
	get: function get(name) {
		return this.modules[name] || null;
	}
};

var component = {

	components: {},

	/**
 	push ( name: String, component: Object )
 
 	Return Type:
 	void
 
 	Description:
 	添加组件
 
 	URL doc:
 	http://amaple.org/######
 */
	push: function push(name, component) {
		this.components[name] = component;
	},


	/**
 	get ( name: String )
 
 	Return Type:
 	Object
 	元素驱动器对象
 
 	Description:
 	获取元素驱动器，没有找打则返回null
 
 	URL doc:
 	http://amaple.org/######
 */
	get: function get(name) {
		return this.components[name] || null;
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
 	http://amaple.org/######
 */
	push: function push(type, listener) {
		this.events[type] = this.events[type] || [];
		this.events[type].push(listener);
	},


	/**
 	get ( name: String )
 
 	Return Type:
 	Array
 	事件缓存
 
 	Description:
 	获取事件缓存，没有找打则返回null
 
 	URL doc:
 	http://amaple.org/######
 */
	get: function get(type) {
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
 	http://amaple.org/######
 */
	getAll: function getAll() {
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
	http://amaple.org/######
*/
var cache = {

	/**
 	getDependentPlugin ( deps: Function|String )
 
 	Return Type:
 	Array
 	获取依赖插件对象以数组形式返回
 	如果deps为function，则会解析此function中传入的参数作为插件名称进行查找
 	如果deps为含有插件名的array，则直接遍历获取插件对象
 
 	Description:
 	获取函数依赖的插件对象数组
 
 	URL doc:
 	http://amaple.org/######
 */
	getDependentPlugin: function getDependentPlugin(deps) {
		var _this = this;

		if (type$1(deps) === "function") {
			var fnString = deps.toString();
			deps = ((/^function(?:\s+\w+)?\s*\((.*)\)\s*/.exec(fnString) || /^\(?(.*?)\)?\s*=>/.exec(fnString) || /^\S+\s*\((.*?)\)/.exec(fnString) || [])[1] || "").split(",").filter(function (item) {
				return !!item;
			});
		}

		return deps.map(function (pluginName) {
			pluginName = pluginName.trim();
			var plugin$$1 = _this.getPlugin(pluginName);
			if (!plugin$$1) {
				throw pluginErr("inject", "\u6CA1\u6709\u627E\u5230\u540D\u4E3A'" + pluginName + "'\u7684\u63D2\u4EF6");
			}

			return plugin$$1;
		});
	},


	// 查看是否存在指定插件
	hasPlugin: function hasPlugin(name) {
		return plugin.has(name);
	},


	// 添加插件缓存
	pushPlugin: function pushPlugin(name, p) {
		plugin.push(name, p);
	},


	// 获取已加载插件
	getPlugin: function getPlugin(name) {
		return plugin.get(name);
	},
	pushComponent: function pushComponent(name, comp) {
		component.push(name, comp);
	},
	getComponent: function getComponent(name) {
		return component.get(name);
	},


	// 添加页面模块缓存
	pushModule: function pushModule(name, d) {
		module$1.push(name, d);
	},


	// 获取页面模块缓存
	getModule: function getModule(name) {
		return module$1.get(name);
	},


	// 添加非元素事件缓存
	pushEvent: function pushEvent(type, listener) {
		event$1.push(type, listener);
	},


	// 获取非元素事件缓存
	getEvent: function getEvent(type) {
		return event$1.get(type);
	},


	// 获取所有事件
	getAllEvent: function getAllEvent() {
		return event$1.getAll();
	}
};

// 开发模式常量
// 普通开发模式
var DEVELOP_COMMON = 0;

// 单页开发模式
var DEVELOP_SINGLE = 1;

// 连续字符正则表达式
var rword = /\S+/g;

// 变量名正则表达式
var rvar = /^[A-Za-z$_][\w$]*$/;

// 模板表达式匹配正则
var rexpr = /{{\s*(.*?)\s*}}/;

// 组件名正则表达式
var rcomponentName = /^[A-Z][a-zA-Z0-9]*/;

// 局部属性标识前缀
var identifierPrefix = "data-no-";

// 模块类型常量
var TYPE_COMPONENT = 0;
var TYPE_PLUGIN = 1;

// 重复利用的常量
// 样式值为数字时不添加单位“px”的样式名
var noUnitHook = ["z-index"];

// 直接赋值的元素属性，如果不在此的属性将会使用setAttribute设置属性
var attrAssignmentHook = ["value", "checked"];

var amAttr = {
	module: ":module",
	title: ":title",

	href: "href",
	action: "action"
};

/**
    check ( variable: Any )

    Return Type:
    Object(check)|null

    Description:
    检查参数错误
    如果错误则抛出error

    URL doc:
    http://amaple.org/######
*/
function check(variable) {
    if (this) {
        this.target = variable;
        this.condition = [];

        this.code = "";
        this.text = "";
    }

    return this instanceof check ? null : new check(variable);
}

extend(check.prototype, {

    /**
        or ()
    
        Return Type:
        Object(check)
    
        Description:
        "||"条件连接符（默认为"&"条件连接符）
    
        URL doc:
        http://amaple.org/######
    */
    or: function or() {
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
           http://amaple.org/######
       */
    prior: function prior(priorCb) {
        var conditionBackup = this.condition;
        this.condition = [];

        priorCb(this);

        Array.prototype.push.apply(conditionBackup, /^(?:&&|\|\|)$/.test(conditionBackup[conditionBackup.length - 1]) ? [this.condition] : ["&&", this.condition]);
        this.condition = conditionBackup;

        return this;
    },


    /**
        ifNot ( code: String, text: String )
    
        Return Type:
        Object(check)
    
        Description:
        设置条件不成立时抛出的错误信息
    
        URL doc:
        http://amaple.org/######
    */
    ifNot: function ifNot(code, text) {
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
        http://amaple.org/######
    */
    check: function check(variable) {
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
        http://amaple.org/######
    */
    do: function _do() {

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
        http://amaple.org/######
    */
    be: function be() {
        for (var _len = arguments.length, vars = Array(_len), _key = 0; _key < _len; _key++) {
            vars[_key] = arguments[_key];
        }

        check.compare.call(this, vars, function (target, _var) {
            return target === _var;
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
        http://amaple.org/######
    */
    notBe: function notBe() {
        for (var _len2 = arguments.length, vars = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            vars[_key2] = arguments[_key2];
        }

        check.compare.call(this, vars, function (target, _var) {
            return target !== _var;
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
        http://amaple.org/######
    */
    type: function type$$1() {
        for (var _len3 = arguments.length, strs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            strs[_key3] = arguments[_key3];
        }

        check.compare.call(this, strs, function (target, str) {
            return type$1(target) === str;
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
        http://amaple.org/######
    */
    notType: function notType() {
        for (var _len4 = arguments.length, strs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            strs[_key4] = arguments[_key4];
        }

        check.compare.call(this, strs, function (target, str) {
            return type$1(target) !== str;
        });

        return this;
    }
});

extend(check, {
    compare: function compare(vars, compareFn) {
        var target = this.target;
        Array.prototype.push.apply(this.condition, (type$1(this.condition[this.condition.length - 1]) === "function" ? ["&&"] : []).concat(function () {
            var res = void 0;
            foreach(vars, function (_var) {
                res = res || compareFn(target, _var);
            });

            return res;
        }));
    },
    calculate: function calculate(condition) {
        if (condition.length === 0) {
            throw checkErr("condition", "没有设置检查条件");
        } else if (/^\|\|$/.test(condition[condition.length - 1])) {
            throw checkErr("condition", "\"or()\"应该需要紧跟条件，而不能作为最后的条件调用方法");
        } else if (condition.length % 2 === 1) {
            var res = false,
                symbol = void 0,
                titem = void 0,
                bool = void 0;
            foreach(condition, function (item) {
                titem = type$1(item);

                if (titem !== "string") {
                    if (titem === "array") {
                        bool = check.calculate(item);
                    } else if (titem === "function") {
                        bool = item();
                    }

                    switch (symbol) {
                        case "&&":
                            res = res && bool;
                            break;
                        case "||":
                            res = res || bool;
                            break;
                        default:
                            res = bool;
                    }
                } else {
                    if (item === "&&" && res === false || item === "||" && res === true) {
                        return false;
                    } else {
                        symbol = item;
                    }
                }
            });

            return res;
        }
    }
});

function NodeTransaction() {
	this.transactions = [];
}

extend(NodeTransaction.prototype, {

	/**
 	start ()
 
 	Return Type:
 	Object
 	当前开启的事物对象
 
 	Description:
 	开启当前的事物对象
 
 	URL doc:
 	http://amaple.org/######
 */
	start: function start() {
		NodeTransaction.acting = this;
		return this;
	},


	/**
 	collect ( moduleNode: Object )
 
 	Return Type:
 	void
 
 	Description:
 	收集对比的新旧虚拟节点
 
 	URL doc:
 	http://amaple.org/######
 */
	collect: function collect(moduleNode) {
		var find = false;

		// 可能在一个生命周期函数中会有多个模块的视图更新
		foreach(this.transactions, function (transaction) {
			if (transaction[0] === moduleNode) {
				find = true;
				return false;
			}
		});

		if (!find) {
			this.transactions.push([moduleNode, moduleNode.clone()]);
		}
	},


	/**
 	commit ()
 
 	Return Type:
 	void
 
 	Description:
 	提交事物更新关闭已开启的事物
 
 	URL doc:
 	http://amaple.org/######
 */
	commit: function commit() {
		foreach(this.transactions, function (transaction) {
			transaction[0].diff(transaction[1]).patch();
		});
		NodeTransaction.acting = undefined;
	}
});

var expando = "eventExpando" + Date.now();
var special = {

	// DOMContentLoaded事件的判断方式
	DOMContentLoaded: function DOMContentLoaded() {
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
	http://amaple.org/######
*/
function handler(e, param) {
	var _this = this;

	var isNode = !isPlainObject(this);
	var _listeners = !isNode ? cache.getEvent(e.type) : this[expando] ? this[expando][e.type] : [];

	foreach(_listeners || [], function (listener) {
		isNode ? listener.call(_this, e) : listener.apply(_this, param);

		// 如果该回调函数只执行一次则移除
		if (listener.once === true) {
			handler.event.remove(_this, e.type, listener, listener.useCapture);
		}
	});
}

/**
	Plugin event

	Description:
	事件绑定与事件触发对象
	可在节点对象上绑定常规与自定义事件，也可无节点绑定事件，由event.emit(type)手动触发
	常规事件一般在交互过程中触发，自定义事件需调用event.emit(elem, type)手动触发

	URL doc:
	http://amaple.org/######
*/
var event = {

	/**
 	support ( eventType: String, elem?: DOMObject )
 
 	Return Type:
 	Boolean
 	是否支持type事件
 
 	Description:
 	判断元素是否支持指定事件
 
 	URL doc:
 	http://amaple.org/######
 */
	support: function support(eventType) {
		var elem = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.createElement("div");

		var support = void 0;

		if (type$1(special[eventType]) === "function") {
			support = special[eventType]();
		} else {
			eventType = "on" + eventType;
			support = eventType in elem;

			if (!support && elem.setAttribute) {
				attr(elem, eventType, "");

				support = type$1(elem[eventType]) === "function";
				attr(elem, eventType, null);
			}
		}

		return support;
	},


	/**
 	on ( elem?: DOMObject, types: String, listener: Function, useCapture?: Boolean, once?: Boolean )
 
 	Return Type:
 	void
 
 	Description:
 	以兼容模式绑定事件，当有多个绑定事件时触发后将顺序执行多个绑定事件
 	绑定事件的节点类型不为文本节点（nodeType = 3）或注释节点（nodeType = 8）
 	当在节点上绑定事件时，节点只绑定调用函数，而所有的事件绑定则存储在events私有对象上，节点对象上将保存对事件key的引用
 
 	URL doc:
 	http://amaple.org/######
 */
	on: function on(elem, types, listener, useCapture, once) {
		var _this2 = this;

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
			listener.once = once;
			listener.useCapture = !!useCapture;
		}

		// 多个事件拆分绑定
		(types || "").replace(rword, function (type) {

			if (elem) {
				elem[expando] = elem[expando] || {};
				var events = elem[expando][type] = elem[expando][type] || [];

				// 元素对象存在，且元素支持浏览器事件时绑定事件，以方便浏览器交互时触发事件
				// 元素不支持时属于自定义事件，需手动调用event.emit()触发事件
				// IE.version >= 9
				if (elem && _this2.support(type, elem) && elem.addEventListener && events.length <= 0) {
					handler.event = _this2;
					elem.addEventListener(type, handler, !!useCapture);
				}

				// 避免绑定相同的事件函数
				if (events.indexOf(listener) === -1) {
					events.push(listener);
				}
			} else {
				cache.pushEvent(type, listener);
			}
		});
	},


	/**
 	remove ( elem?: DOMObject, types: String, listener: Function, useCapture?: Boolean )
 
 	Return Type:
 	void
 
 	Description:
 	以兼容模式解绑事件，可一次解绑多个类型的事件
 
 	URL doc:
 	http://amaple.org/######
 */
	remove: function remove(elem, types, listener, useCapture) {
		var _this3 = this;

		if (elem) {
			check(elem.nodeType).notBe(3).notBe(8).ifNot("function event.on:elem", "elem参数不能为文本节点或注释节点").do();
		}
		check(types).type("string").ifNot("function event.on:types", "types参数类型必须为string").do();
		check(listener).type("function").ifNot("function event.on:listener", "listener参数类型必须为function").do();

		var i = void 0,
		    events = void 0;
		(types || "").replace(rword, function (type) {
			if (elem) {
				events = elem[expando] && elem[expando][type] || [];
			} else {
				events = cache.getEvent(type) || [];
			}

			// 获取事件监听回调数组
			i = events.length;
			if (i > 0) {

				// 符合要求则移除事件回调
				while (--i > -1) {
					if (events[i].guid === listener.guid) {
						events.splice(i, 1);
					}
				}

				// 如果该事件的监听回调为空时，则解绑事件并删除监听回调数组
				if (events.length === 0) {
					delete (elem ? elem[expando][type] : cache.getAllEvent()[type]);

					if (elem && _this3.support(type, elem) && elem.removeEventListener) {
						elem.removeEventListener(type, handler, !!useCapture);
					}
				}
			}
		});
	},


	/**
 	emit ( elem?: DOMObject, types: String, param: Array )
 
 	Return Type:
 	void
 
 	Description:
 	触发事件
 	并且在无elem下触发可传递额外参数
 
 	URL doc:
 	http://amaple.org/######
 */
	emit: function emit(elem, types, param) {
		var _this4 = this;

		if (elem) {
			check(elem.nodeType).notBe(3).notBe(8).ifNot("function event.emit:elem", "elem参数不能为文本节点或注释节点").do();
		}
		check(types).type("string").ifNot("function event.emit:types", "types参数类型必须为string").do();

		var nt = new NodeTransaction().start();
		(types || "").replace(rword, function (t) {
			if (elem && _this4.support(t, elem)) {
				if (document.createEvent) {

					// 使用createEvent创建事件
					var eventType = void 0;
					foreach(eventMap, function (v, k) {
						if (v.indexOf(t) !== -1) {
							eventType = k;
						}
					});
					var e = document.createEvent(eventType || "CustomEvent");
					e.initEvent(t, true, false);

					elem.dispatchEvent(e);
				}
			} else {
				handler.event = _this4;

				// IE9下的call调用传入非引用类型的值时，函数内的this指针无效
				handler.call({}, { type: t }, param);
			}
		});
		nt.commit();
	}
};

var types = ["string", "number", "function", "boolean", "object", "null", "undefined", "array"];

function correctParam() {
    for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
    }

    return {

        /**
            to ( condition1: any, condition2?: any, condition3?: any, ... )
        
            Return Type:
            Object
            链式调用对象
        
            Description:
            匹配参数期望条件
            通过后向匹配纠正参数位置
        
            URL doc:
            http://amaple.org/######
        */
        to: function to() {
            for (var _len2 = arguments.length, condition = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                condition[_key2] = arguments[_key2];
            }

            var offset = 0,
                _params = [],
                res = void 0,
                item = void 0,
                j = void 0;
            foreach(params, function (param, i) {

                res = null;
                for (j = i + offset; j < condition.length; j++) {

                    // 统一为数组
                    item = type$1(condition[j]) !== "array" ? [condition[j]] : condition[j];

                    res = false;
                    foreach(item, function (s) {
                        res = res || function () {
                            return types.indexOf(s) !== -1 ? type$1(param) === s : s instanceof RegExp ? s.test(param) : param === s;
                        }();
                    });

                    // 已匹配成功
                    if (res) {
                        _params.push(param);
                        break;
                    }

                    // 匹配失败，继续匹配
                    else {
                            _params.push(undefined);
                            offset++;
                        }
                }

                // 未进入匹配操作，直接继承原顺序
                if (res === null) {
                    _params.push(param);
                }
            });

            this._params = _params.slice(0, params.length);
            return this;
        },


        /**
            done ( callback: Function )
        
            Return Type:
            void
        
            Description:
            回调函数返回纠正后参数
            如果开发者传入的回调函数的参数与纠正参数数量不同，则会以一个数组的形式传入回调函数
            如果开发者传入的回调函数的参数与纠正参数数量相同，则会直接将参数按顺序传入回调函数
            如果开发者没有传入回调函数参数，则通过this对象的$1、$2、$3...去按顺序获取纠正后的参数
        
            URL doc:
            http://amaple.org/######
        */
        done: function done(callback) {
            var args = (/^function\s*\((.*?)\)/.exec(callback.toString()) || /^\(?(.*?)\)?\s*=>/.exec(callback.toString()))[1],
                l = args ? args.split(",").length : 0,
                _this = {};

            if (params.length === l) {
                callback.apply(null, this._params);
            } else if (l === 1) {
                callback(this._params);
            } else {
                foreach(this._params, function (p, i) {
                    _this["$" + (i + 1)] = p;
                });

                callback.call(_this);
            }
        }
    };
}

/**
	query ( selector: String, context?: Object, all?: Boolean )

	Return Type:
	符合表达式与获取范围的元素( Object | Array )

	Description:
	获取元素对象#!/usr/bin/env 

	URL doc:
	http://amaple.org/######
*/


/**
	appendScript ( node: DOMObject, success?: Function, error?: Function )

	Return Type:
	void

	Description:
	异步动态加载js文件

	URL doc:
	http://amaple.org/######
*/
function appendScript(node) {
	var success = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
	var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;

	var script = document.createElement("script");
	script.type = "text/javascript";

	// 将node的所有属性转移到将要解析的script节点上
	foreach(node.attributes, function (attr) {
		if (attr.nodeType === 2) {
			script.setAttribute(attr.nodeName, attr.nodeValue);
		}
	});

	if (node.src) {
		script.async = true;

		// 绑定加载事件，加载完成后移除此元素
		// IE下将会触发readystatechange和load事件，所以会执行两次，但只有readyState === "loaded"时会执行语句
		event.on(script, "load readystatechange", function (event$$1) {
			if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
				success(event$$1);
				script.parentNode.removeChild(script);
			}
		});

		event.on(script, "error", function () {
			error();
			script.parentNode.removeChild(script);
		});

		document.head.appendChild(script);
	} else if (node.text) {
		script.text = node.text || "";
		document.head.appendChild(script).parentNode.removeChild(script);
		success();
	}
}

/**
	scriptEval ( code: Array|DOMScript|String, callback?: Function )

	Return Type:
	void

	Description:
	执行javascript代码片段
	如果参数是script标签数组，则顺序执行
	如果参数是script标签或javascript代码，则直接执行

	URL doc:
	http://amaple.org/######
*/
function scriptEval(code) {
	var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

	check(code).type("string", "array").or().prior(function (_this) {
		_this.type("object").check(code.nodeType).be(1).check(code.nodeName).be("SCRIPT");
	}).ifNot("function scriptEval:code", "参数必须为javascript代码片段、script标签或script标签数组").do();

	var tcode = type$1(code);
	if (tcode === "string") {

		var script = document.createElement("script");
		script.type = "text/javascript";
		script.text = code;

		appendScript(script, callback);
	} else if (tcode === "object" && code.nodeType === 1 && code.nodeName.toLowerCase() === "script") {
		appendScript(code, callback);
	} else if (tcode === "array") {
		var scripts = code.concat(),
		    _cb = void 0;

		if (scripts.length > 0) {
			foreach(code, function (_script) {
				// 删除数组中的当前值，以便于将剩下未执行的javascript通过回调函数传递
				scripts.splice(0, 1);

				if (!_script.src) {
					_cb = scripts.length === 0 ? callback : noop;
					appendScript(_script, _cb, _cb);
				} else {
					_cb = scripts.length === 0 ? callback : function () {
						scriptEval(scripts, callback);
					};

					// 通过script的回调函数去递归执行未执行的script标签
					appendScript(_script, _cb, _cb);

					return false;
				}
			});
		}
	}
}

/**
	append ( context: DOMObject, node: DOMObject|DOMString|DocumentFragmentObject|String, callback?: Function )

	Return Type:
	DOMObject

	Description:
	在context元素末尾插入node
	如果node内有script元素则会在插入元素后执行包含的script

	URL doc:
	http://amaple.org/######
*/


/**
	clear ( context: DOMObject )

	Return Type:
	DOMObject
	清空后的节点元素

	Description:
	清空节点元素内的所有内容

	URL doc:
	http://amaple.org/######
*/
function clear(context) {

	check(context.nodeType).be(1, 11).ifNot("function clear:context", "元素类型必须是dom节点").do();

	// 防止内存泄漏，需删除context节点内的其他内容
	// add...

	// 删除此元素所有内容
	context.textContent = "";

	return context;
}

/**
	html ( context: DOMObject, node: DOMObject|DOMString|DocumentFragmentObject|String, callback?: Function )

	Return Type:
	DOMObject
	处理后的节点元素

	Description:
	使用node替换context的内容
	如果node内有script元素则会在插入元素后执行包含的script

	URL doc:
	http://amaple.org/######
*/


/**
	attr ( context: DOMObject, name: String, val: Object|String|null )

	Return Type:
	void

	Description:
	获取、设置（单个或批量）、移除元素属性

	URL doc:
	http://amaple.org/######
*/
function attr(context, name, val) {
	correctParam(name, val).to("string", ["string", "object", null]).done(function () {
		name = this.$1;
		val = this.$2;
	});

	switch (type$1(val)) {
		case "string":
			context.setAttribute(name, val);
			break;
		case "undefined":
			return context.getAttribute(name);
		case "object":
			foreach(val, function (v, k) {
				context.setAttribute(k, v);
			});
			break;
		case "null":
			context.removeAttribute(name);
	}
}

/**
	serialize ( form: DOMObject, serializePrivate: Boolean )

	Return Type:
	Object
	序列化后表单信息Object对象

	Description:
	将表单内的信息序列化为表单信息对象
	当serializePrivate为false时表示不序列化私有信息表单(如password)

	URL doc:
	http://amaple.org/######
*/
function serialize(form, serializePrivate) {
	if (!form.nodeName || form.nodeName.toUpperCase() !== "FORM") {
		return form;
	}

	var rcheckableType = /^(?:checkbox|radio)$/i,
	    rprivateType = /^password$/i,
	    rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	    rsubmittable = /^(?:input|select|textarea|keygen)/i,
	    rCRLF = /\r?\n/g,
	    inputs = slice.call(form.elements),
	    formObject = {};

	// 判断表单中是否含有上传文件
	foreach(inputs, function (inputItem) {
		var name = attr(inputItem, "name"),
		    type = inputItem.type || attr(inputItem, "type");

		if (name && !attr(inputItem, "disabled") && rsubmittable.test(inputItem.nodeName) && (serializePrivate !== false || !rprivateType.test(type)) && !rsubmitterTypes.test(type) && (inputItem.checked || !rcheckableType.test(type))) {
			var val = inputItem.value.replace(rCRLF, "\r\n");
			if (type === "checkbox") {
				formObject[name] = formObject[name] || [];
				formObject[name].push(val);
			} else {
				formObject[name] = val;
			}
		}
	});

	return formObject;
}

/**
    optimizeSteps ( patches: Array )

    Return Type:
    void

    Description:
    优化步骤
    主要优化为子节点的移动步骤优化

    URL doc:
    http://amaple.org/######
*/
function optimizeSteps(patches) {
    var i = 0;

    var _loop = function _loop() {
        var step = patches[i],
            optimizeItems = [],
            span = step.from - step.to,
            nextStep = patches[i + 1],


        // 合并的步骤
        mergeItems = { alternates: [], eliminates: [], previous: [] };

        if (step.to < step.from && (nextStep && nextStep.to === step.to + 1 && nextStep.from - nextStep.to >= span || !nextStep)) {
            for (var _j = step.from - 1; _j >= step.to; _j--) {

                var optimizeItem = {
                    type: step.type,
                    item: step.list[_j],
                    from: _j,
                    to: _j + 1
                };

                //向前遍历查看是否有可合并的项
                for (var _j2 = i - 1; _j2 >= 0; _j2--) {
                    var _mergeStep = patches[_j2];

                    // 只有一个跨度的项可以分解出来
                    if (_mergeStep.from - _mergeStep.to === 1) {
                        _mergeStep = {
                            type: _mergeStep.type,
                            item: _mergeStep.list[_mergeStep.to],
                            from: _mergeStep.to,
                            to: _mergeStep.from
                        };
                    }

                    if (_mergeStep.item === optimizeItem.item && _mergeStep.to === optimizeItem.from) {
                        mergeItems.previous.push({
                            step: _mergeStep, optimizeItem: optimizeItem,
                            exchangeItems: patches.slice(_j2 + 1, i).concat(optimizeItems)
                        });

                        break;
                    }
                }

                optimizeItems.push(optimizeItem);
            }
        } else {
            i++;
            return "continue";
        }

        var toOffset = 1,
            j = i + 1,
            lastStep = step,
            mergeStep = void 0,
            mergeSpan = void 0;

        while (patches[j]) {
            mergeStep = patches[j], mergeSpan = mergeStep.from - mergeStep.to;

            var merge = false;
            if (step.to + toOffset === mergeStep.to) {

                if (mergeSpan === span) {
                    mergeItems.eliminates.push(mergeStep);

                    merge = true;
                    lastStep = mergeStep;
                } else if (mergeSpan > span) {
                    mergeItems.alternates.push(mergeStep);

                    merge = true;
                    lastStep = mergeStep;
                }

                toOffset++;
            }

            j++;

            if (!merge) {
                break;
            }
        }

        // 判断是否分解进行合并，依据为合并后至少不会更多步骤
        // 合并项分为相同跨度的项、向前遍历可合并的项
        // +1是因为需算上当前合并项，但在eliminates中并没有算当前合并项
        if (optimizeItems.length <= mergeItems.eliminates.length + mergeItems.previous.length + 1) {
            Array.prototype.splice.apply(patches, [patches.indexOf(lastStep) + 1, 0].concat(optimizeItems));
            patches.splice(i, 1);

            var _mergeStep2 = void 0;
            foreach(mergeItems.previous, function (prevItem) {
                _mergeStep2 = prevItem.step;

                // 如果两个合并项之间还有其他项，则需与合并项调换位置
                // 调换位置时，合并项的from在调换项的from与to之间（包括from与to）则合并项的from-1；调换项的to在合并项的from与to之间（包括from与to）则调换项的to+1
                var mergeFrom = void 0,
                    mergeTo = void 0,
                    exchangeFrom = void 0,
                    exchangeTo = void 0;
                foreach(prevItem.exchangeItems, function (exchangeItem) {
                    mergeFrom = _mergeStep2.from;
                    mergeTo = _mergeStep2.to;
                    exchangeFrom = exchangeItem.from;
                    exchangeTo = exchangeItem.to;

                    if (mergeFrom >= exchangeFrom && mergeFrom <= exchangeTo) {
                        _mergeStep2.from--;
                    }
                    if (mergeTo >= exchangeFrom && mergeTo <= exchangeTo) {
                        _mergeStep2.to--;
                    }

                    if (exchangeFrom >= mergeFrom && exchangeFrom <= mergeTo) {
                        exchangeItem.from++;
                    }
                    if (exchangeTo >= mergeFrom && exchangeTo <= mergeTo) {
                        exchangeItem.to++;
                    }
                });

                prevItem.optimizeItem.from = _mergeStep2.from;
                patches.splice(patches.indexOf(_mergeStep2), 1);

                // 向前合并了一个项，则i需-1，不然可能会漏掉可合并项
                i--;
            });

            foreach(mergeItems.eliminates, function (eliminateItem) {
                foreach(optimizeItems, function (optimizeItem) {
                    optimizeItem.to++;
                });

                patches.splice(patches.indexOf(eliminateItem), 1);
            });

            foreach(mergeItems.alternates, function (alternateItem) {
                foreach(optimizeItems, function (optimizeItem) {
                    optimizeItem.to++;
                });

                alternateItem.to += optimizeItems.length;
            });
        } else {
            i++;
        }
    };

    while (patches[i]) {
        var _ret = _loop();

        if (_ret === "continue") continue;
    }

    return patches;
}

/**
    createChildrenList ( oldChildren: Array, newChildren: Array )

    Return Type:
    Number
    以新节点构成的每一步生成的节点列表

    Description:
    为移动节点信息创建当前移动步骤所生成的以新节点构成（如果有的话）的list数组
    移动节点所输出的移动信息中的list需使用新节点（如果有的话）
    因为在移动步骤优化中合并步骤时将在list数组中获取合并信息
    当list中的信息为oldChildren中的信息时，如果移动节点内部也有更新dom就会导致更新无法看见

    URL doc:
    http://amaple.org/######
*/
function createChildrenList(oldChildren, newChildren) {
    var list = [];
    foreach(oldChildren, function (oldChild) {
        var isFind = false;
        foreach(newChildren, function (newChild) {
            if (oldChild.key === newChild.key) {
                isFind = true;
                list.push(newChild);
                return false;
            }
        });

        if (!isFind) {
            list.push(oldChild);
        }
    });

    return list;
}

/**
    getInsertIndex ( index: Number, children: Array )

    Return Type:
    Number
    插入元素的位置索引

    Description:
    获取元素插入的位置索引
    因为插入前的元素中可能有组件元素，组件元素渲染为对应实际dom时可能有多个，所以需判断前面的组件元素，并加上他们的模板元素数量

    URL doc:
    http://amaple.org/######
*/
function getInsertIndex(index, children) {
    var insertIndex = 0;

    for (var i = 0; i < index; i++) {
        if (children[i].templateNodes) {
            insertIndex += children[i].templateNodes.length;
        } else {
            insertIndex++;
        }
    }

    return insertIndex;
}

/**
    diffAttrs ( newVNode: Object, oldVNode: Object, nodePatcher: Object )

    Return Type:
    void

    Description:
    对比新旧vnode的属性，将差异存入nodePatcher中

    URL doc:
    http://amaple.org/######
*/
function diffAttrs(newVNode, oldVNode, nodePatcher) {
    foreach(newVNode.attrs, function (attr, name) {
        if (oldVNode.attrs[name] !== attr) {

            // 新旧节点的属性对比出来后的差异需在新vnode上修改，移除时同理
            nodePatcher.reorderAttr(newVNode, name, attr);
        }
    });

    //找出移除的属性
    foreach(oldVNode.attrs, function (attr, name) {
        if (!Object.prototype.hasOwnProperty.call(newVNode.attrs, name)) {
            nodePatcher.removeAttr(newVNode, name);
        }
    });
}

/**
    diffEvents ( newVNode: Object, oldVNode: Object, nodePatcher: Object )

    Return Type:
    void

    Description:
    对比新旧vnode的事件，将差异存入nodePatcher中
    ！！！场景需要，暂不实现卸载事件的功能

    URL doc:
    http://amaple.org/######
*/
function diffEvents(newVNode, oldVNode, nodePatcher) {

    if (!oldVNode.events) {

        // 绑定新vnode上的所有事件
        foreach(newVNode.events, function (handlers, type) {
            nodePatcher.addEvents(newVNode, type, handlers);
        });
    } else {
        var addHandlers = void 0;
        foreach(newVNode.events, function (handlers, type) {

            addHandlers = [];
            if (oldVNode.events.hasOwnProperty(type)) {
                foreach(handlers, function (handler) {
                    if (oldVNode.events[type].indexOf(handler) === -1) {
                        addHandlers.push(handler);
                    }
                });
            } else {
                addHandlers = handlers;
            }

            // 存在没有绑定的时间方法时才绑定
            if (addHandlers.length > 0) {
                nodePatcher.addEvents(newVNode, type, addHandlers);
            }
        });
    }
}

/**
    indexOf ( children: Array, searchNode: Object )

    Return Type:
    Number
    查找的node在children数组中的位置，如果没有找打则返回-1

    Description:
    获取查找的node在children数组中的位置，如果没有找打则返回-1

    URL doc:
    http://amaple.org/######
*/
function indexOf(children, searchNode) {
    var index = -1;
    foreach(children, function (child, i) {
        if (child.key === searchNode.key) {
            index = i;
            return false;
        }
    });

    return index;
}

/**
    diffChildren ( newChildren: Array, oldChildren: Array, nodePatcher: Object )

    Return Type:
    void

    Description:
    比较新旧节点的子节点，将差异存入nodePatcher中

    URL doc:
    http://amaple.org/######
*/
function diffChildren(newChildren, oldChildren, nodePatcher) {

    if (oldChildren && oldChildren.length > 0 && (!newChildren || newChildren.length <= 0)) {
        foreach(oldChildren, function (oldChild) {
            nodePatcher.removeNode(oldChild);
        });
    } else if (newChildren && newChildren.length > 0 && (!oldChildren || oldChildren.length <= 0)) {
        foreach(newChildren, function (newChild, i) {
            nodePatcher.addNode(newChild, getInsertIndex(i, newChildren));
        });
    } else if (newChildren && newChildren.length > 0 && oldChildren && oldChildren.length > 0) {

        var keyType = newChildren[0] && newChildren[0].key === undefined ? 0 : 1,
            obj = { keyType: keyType, children: [] };

        var newNodeClassification = [obj],
            oldNodeClassification = [];

        // 将新节点按有没有key进行分类
        foreach(newChildren, function (newChild) {

            // key为undefined的分类
            if (keyType === 0) {
                if (newChild.key === undefined) {
                    obj.children.push(newChild);
                } else {
                    keyType = 1;
                    obj = { keyType: keyType, children: [newChild] };
                    newNodeClassification.push(obj);
                }
            } else if (keyType === 1) {

                // key为undefined的分类
                if (newChild.key !== undefined) {
                    obj.children.push(newChild);
                } else {
                    keyType = 0;
                    obj = { keyType: keyType, children: [newChild] };
                    newNodeClassification.push(obj);
                }
            }
        });

        // 将旧节点按有没有key进行分类
        keyType = oldChildren[0] && oldChildren[0].key === undefined ? 0 : 1;
        obj = { keyType: keyType, children: [] };
        oldNodeClassification.push(obj);
        foreach(oldChildren, function (oldChild) {

            // key为undefined的分类
            if (keyType === 0) {
                if (oldChild.key === undefined) {
                    obj.children.push(oldChild);
                } else {
                    keyType = 1;
                    obj = { keyType: keyType, children: [oldChild] };
                    oldNodeClassification.push(obj);
                }
            } else if (keyType === 1) {

                // key为undefined的分类
                if (oldChild.key !== undefined) {
                    obj.children.push(oldChild);
                } else {
                    keyType = 0;
                    obj = { keyType: keyType, children: [oldChild] };
                    oldNodeClassification.push(obj);
                }
            }
        });

        // 对每个分类的新旧节点进行对比
        var moveItems = void 0,
            oldIndex = void 0,
            oldChildrenCopy = void 0,
            oldItem = void 0,
            offset = 0;
        foreach(newNodeClassification, function (newItem, i) {
            oldItem = oldNodeClassification[i] || { children: [] };

            if (newItem.keyType === 0) {

                // key为undefined时直接对比同位置的两个节点
                foreach(newItem.children, function (newChild, j) {
                    nodePatcher.concat(newChild.diff(oldItem.children[j]));
                });

                // 如果旧节点数量比新节点多，则移除旧节点中多出的节点
                if (newItem.children.length < oldItem.children.length) {
                    for (var j = newItem.children.length; j < oldItem.children.length; j++) {
                        nodePatcher.removeNode(oldItem.children[j]);
                    }
                }
            } else if (newItem.keyType === 1) {

                // key不为undefined时需对比节点增加、移除及移动
                oldChildrenCopy = oldItem.children;

                // 对比有无增加节点
                foreach(newItem.children, function (newChild, j) {
                    if (indexOf(oldChildrenCopy, newChild) === -1) {
                        nodePatcher.addNode(newChild, getInsertIndex(j, newItem.children) + offset);

                        oldChildrenCopy.splice(j, 0, newChild);
                    }
                });

                // 对比有无移除节点
                var k = 0;
                while (oldChildrenCopy[k]) {
                    if (indexOf(newItem.children, oldChildrenCopy[k]) === -1) {
                        nodePatcher.removeNode(oldChildrenCopy[k]);
                        oldChildrenCopy.splice(k, 1);
                    } else {
                        k++;
                    }
                }

                moveItems = [];
                oldIndex = 0;
                foreach(newItem.children, function (newChild, j) {
                    oldIndex = indexOf(oldChildrenCopy, newChild);
                    if (oldIndex > -1) {
                        nodePatcher.concat(newChild.diff(oldChildrenCopy[oldIndex]));
                        if (oldIndex !== j) {
                            moveItems.push({
                                item: newChild,
                                from: oldIndex,
                                to: getInsertIndex(j, oldChildrenCopy),
                                list: createChildrenList(oldChildrenCopy, newItem.children)
                            });

                            oldChildrenCopy.splice(oldIndex, 1);
                            oldChildrenCopy.splice(j, 0, newChild);
                        }
                    }
                });

                foreach(optimizeSteps(moveItems), function (move) {

                    nodePatcher.moveNode(move.item, move.to + offset);
                });
            }

            offset += getInsertIndex(newItem.children.length, newItem.children);
        });
    }
}

function VTextNode(nodeValue, parent, node) {
	var vnode = new VNode(3, parent, node);
	vnode.nodeValue = nodeValue;

	return vnode;
}

function VFragment(children, docFragment) {
	var vnode = new VNode(11, null, docFragment);
	vnode.children = children && children.concat() || [];

	foreach(vnode.children, function (child) {
		updateParent(child, vnode);
	});

	return vnode;
}

/**
	walkTemplateNodes ( nodes: Array, callback: Function )

	Return Type:
	void

	Description:
	遍历vnode实例的node数组项
	当node数组项中有Array数组时继续遍历此数组
	回调函数为每项遍历的处理回调函数

	URL doc:
	http://amaple.org/######
*/
function walkTemplateNodes(templateNodes, callback) {
	foreach(templateNodes, function (vnode) {
		if (vnode.templateNodes) {
			walkTemplateNodes(vnode.templateNodes, callback);
		} else {
			callback(vnode.node);
		}
	});
}

function NodePatcher() {
	this.patches = [];
}

extend(NodePatcher.prototype, {

	/**
 	reorderNode ( item: Object, index: Number )
 
 	Return Type:
 	void
 
 	Description:
 	记录需增加或移动节点的信息
 
 	URL doc:
 	http://amaple.org/######
 */
	addNode: function addNode(item, index) {
		this.patches.push({ type: NodePatcher.NODE_REORDER, item: item, index: index });
	},


	/**
 	moveNode ( item: Object, index: Number )
 
 	Return Type:
 	void
 
 	Description:
 	记录需增加或移动节点的信息
 
 	URL doc:
 	http://amaple.org/######
 */
	moveNode: function moveNode(item, index) {
		this.patches.push({ type: NodePatcher.NODE_REORDER, item: item, index: index, isMove: true });
	},


	/**
 	replaceNode ( item: Object, replaceNode: Object )
 
 	Return Type:
 	void
 
 	Description:
 	记录替换节点的信息
 
 	URL doc:
 	http://amaple.org/######
 */
	replaceNode: function replaceNode(item, _replaceNode) {
		this.patches.push({ type: NodePatcher.NODE_REPLACE, item: item, replaceNode: _replaceNode });
	},


	/**
 	removeNode ( item: Object )
 
 	Return Type:
 	void
 
 	Description:
 	记录移除节点的信息
 
 	URL doc:
 	http://amaple.org/######
 */
	removeNode: function removeNode(item) {
		this.patches.push({ type: NodePatcher.NODE_REMOVE, item: item });
	},


	/**
 	replaceTextNode ( item: Object, val: String )
 
 	Return Type:
 	void
 
 	Description:
 	记录修改文本节点的信息
 
 	URL doc:
 	http://amaple.org/######
 */
	replaceTextNode: function replaceTextNode(item, replaceNode) {
		this.patches.push({ type: NodePatcher.TEXTNODE, item: item, replaceNode: replaceNode });
	},


	/**
 	reorderAttr ( item: Object, name: String, val: String )
 
 	Return Type:
 	void
 
 	Description:
 	记录重设或增加节点属性的信息
 
 	URL doc:
 	http://amaple.org/######
 */
	reorderAttr: function reorderAttr(item, name, val) {
		this.patches.push({ type: NodePatcher.ATTR_REORDER, item: item, name: name, val: val });
	},


	/**
 	removeAttr ( item: Object, name: String )
 
 	Return Type:
 	void
 
 	Description:
 	记录移除节点属性的记录
 
 	URL doc:
 	http://amaple.org/######
 */
	removeAttr: function removeAttr(item, name) {
		this.patches.push({ type: NodePatcher.ATTR_REMOVE, item: item, name: name });
	},


	/**
 	addEvents ( item: Object, eventType: String, handlers: Array )
 
 	Return Type:
 	void
 
 	Description:
 	记录事件绑定的记录
 
 	URL doc:
 	http://amaple.org/######
 */
	addEvents: function addEvents(item, eventType, handlers) {
		this.patches.push({ type: NodePatcher.EVENTS_ADD, item: item, eventType: eventType, handlers: handlers });
	},


	/**
 	concat ()
 
 	Return Type:
 	void
 
 	Description:
 	合并NodePatcher内的diff步骤
 
 	URL doc:
 	http://amaple.org/######
 */
	concat: function concat(nodePatcher) {
		this.patches = this.patches.concat(nodePatcher.patches);
	},


	/**
 	patch ()
 
 	Return Type:
 	void
 
 	Description:
 	根据虚拟节点差异更新视图
 
 	URL doc:
 	http://amaple.org/######
 */
	patch: function patch() {
		var p = void 0;
		foreach(this.patches, function (patchItem) {
			switch (patchItem.type) {
				case NodePatcher.ATTR_REORDER:
					if (attrAssignmentHook.indexOf(patchItem.name) === -1) {
						attr(patchItem.item.node, patchItem.name, patchItem.val);
					} else {
						patchItem.item.node[patchItem.name] = patchItem.val;
					}

					break;
				case NodePatcher.ATTR_REMOVE:
					attr(patchItem.item.node, patchItem.name, null);

					break;
				case NodePatcher.TEXTNODE:
					patchItem.replaceNode.node.nodeValue = patchItem.item.nodeValue;
					patchItem.item.node = patchItem.replaceNode.node;

					break;
				case NodePatcher.NODE_REORDER:
					patchItem.item.render();

					p = patchItem.item.parent.node;
					if (patchItem.item.templateNodes) {
						var f = document.createDocumentFragment();
						walkTemplateNodes(patchItem.item.templateNodes, function (node) {
							f.appendChild(node);
						});

						if (patchItem.index < p.childNodes.length) {

							// 在template或组件元素移动的情况下是先将移动的元素取出到fragment中，再根据对应位置将fragment插入，不同于普通元素的移动，故不需要+1
							p.insertBefore(f, p.childNodes.item(patchItem.index));
						} else {
							p.appendChild(f);
						}

						// 移动操作的组件需调用组件的update生命周期函数
						if (patchItem.isMove && patchItem.item.isComponent) {
							patchItem.item.component.__update__();
						}
					} else {
						if (patchItem.index < p.childNodes.length) {
							if (patchItem.isMove) {
								p.removeChild(patchItem.item.node);
							}
							p.insertBefore(patchItem.item.node, p.childNodes.item(patchItem.index));
						} else {
							p.appendChild(patchItem.item.node);
						}
					}

					break;
				case NodePatcher.NODE_REMOVE:
					
					if (patchItem.item.templateNodes) {
						walkTemplateNodes(patchItem.item.templateNodes, function (node) {
							node.parentNode.removeChild(node);
						});

						// 移除的组件需调用unmount生命周期函数
						if (patchItem.item.isComponent) {
							patchItem.item.component.__unmount__();
						}
					} else {
						patchItem.item.node.parentNode.removeChild(patchItem.item.node);
					}

					break;
				case NodePatcher.NODE_REPLACE:
					patchItem.item.render();

					var node = void 0;
					if (patchItem.replaceNode.templateNodes) {
						p = patchItem.replaceNode.templateNodes[0].node.parentNode;

						if (patchItem.item.templateNodes) {
							node = document.createDocumentFragment();
							foreach(patchItem.item.templateNodes, function (vnode) {
								node.appendChild(vnode.node);
							});
						} else {
							node = patchItem.item.node;
						}

						p.insertBefore(node, patchItem.replaceNode.templateNodes[0].node);
						foreach(patchItem.replaceNode.templateNodes, function (vnode) {
							p.removeChild(vnode.node);
						});
					} else {
						p = patchItem.replaceNode.node.parentNode;
						node = patchItem.item.node;
						if (patchItem.item.templateNodes) {
							node = document.createDocumentFragment();
							foreach(patchItem.item.templateNodes, function (vnode) {
								node.appendChild(vnode.node);
							});
						}

						p.replaceChild(node, patchItem.replaceNode.node);
					}

					break;
				case NodePatcher.EVENTS_ADD:
					foreach(patchItem.handlers, function (handler) {
						event.on(patchItem.item.node, patchItem.eventType, handler);
					});
					break;
			}
		});
	}
});

extend(NodePatcher, {

	// 虚拟DOM差异标识
	// 属性差异标识
	ATTR_REORDER: 0,
	ATTR_REMOVE: 1,

	// 文本节点差异标识
	TEXTNODE: 2,

	// 节点增加或移动标识
	NODE_REORDER: 3,

	// 节点移除标识
	NODE_REMOVE: 4,

	// 节点替换标识
	NODE_REPLACE: 5,

	// 添加事件绑定
	EVENTS_ADD: 6
});

/**
    supportCheck ( nodeType: Number, method: String )

    Return Type:
    void

    Description:
    检查vnode的类型是否支持调用某成员方法
    nodeType为1或11时才能操作子节点

    URL doc:
    http://amaple.org/######
*/
function supportCheck(nodeType, method) {
    if (nodeType !== 1 && nodeType !== 11) {
        throw vnodeErr("NotSupport", "\u6B64\u7C7B\u578B\u7684\u865A\u62DF\u8282\u70B9\u4E0D\u652F\u6301" + method + "\u65B9\u6CD5");
    }
}

var entitySymbol = {
    lt: "<",
    gt: ">",
    amp: "&",
    quot: "\"",
    reg: "®",
    copy: "©",
    trade: "™",
    nbsp: " "
};
var rentitySymbol = new RegExp("&(" + Object.keys(entitySymbol).join("|") + "|#[0-9]+);", "g");

/**
    updateParent ( childVNode: Object, parent: Object )

    Return Type:
    void

    Description:
    更换父节点
    如果此子节点已有父节点则将此子节点从父节点中移除

    URL doc:
    http://amaple.org/######
*/
function updateParent(childVNode, parent) {
    if (childVNode && parent && childVNode.parent !== parent) {

        // 如果有父节点，则从父节点中移除
        if (childVNode.parent) {
            childVNode.parent.removeChild(childVNode);
        }

        childVNode.parent = parent;
    }
}

/**
    VNode ( nodeType: Number, parent: Object, node: DOMObject )

    Return Type:
    void

    Description:
    虚拟DOM类

    URL doc:
    http://amaple.org/######
*/
function VNode(nodeType, parent, node) {
    newClassCheck(this, VNode);

    this.nodeType = nodeType;
    this.node = node;

    this.parent = parent || null;
    if (this.parent instanceof VNode && this.parent.children && this.parent.children.indexOf(this) === -1) {
        this.parent.push(this);
    }
}

extend(VNode.prototype, {

    /**
        appendChild ( childVNode: Object )
    
        Return Type:
        void
    
        Description:
        在此vnode的children末尾添加一个子vnode
    
        URL doc:
        http://amaple.org/######
    */
    appendChild: function appendChild(childVNode) {
        var _this = this;

        supportCheck(this.nodeType, "appendChild");

        var children = void 0;
        if (childVNode.nodeType === 11) {
            children = childVNode.children.concat();
            foreach(childVNode.children, function (child) {
                _this.children.push(child);
            });
        } else {
            children = [childVNode];
            this.children.push(childVNode);
        }

        // 更换父节点
        foreach(children, function (child) {
            updateParent(child, _this);
        });
    },


    /**
        removeChild ( childVNode: Object )
    
        Return Type:
        void
    
        Description:
        在此vnode下移除一个子vnode
    
        URL doc:
        http://amaple.org/######
    */
    removeChild: function removeChild(childVNode) {
        supportCheck(this.nodeType, "removeChild");

        if (childVNode.parent === this) {
            this.children.splice(this.children.indexOf(childVNode), 1);
            childVNode.parent = null;
        }
    },
    replaceChild: function replaceChild(newVNode, oldVNode) {
        var _this2 = this;

        supportCheck(this.nodeType, "replaceChild");

        var i = this.children.indexOf(oldVNode);
        if (i >= 0) {
            var children = void 0;
            if (newVNode.nodeType === 11) {
                children = newVNode.children.concat();

                Array.prototype.splice.apply(this.children, [i, 1].concat(children));
            } else {
                children = [newVNode];
                this.children.splice(i, 1, newVNode);
            }

            // 更换父节点
            foreach(children, function (child) {
                updateParent(child, _this2);
            });

            oldVNode.parent = null;
        }
    },


    /**
        insertBefore ( newVNode: Object, existingVNode: Object )
    
        Return Type:
        void
    
        Description:
        在existingVNode前插入一个vnode
    
        URL doc:
        http://amaple.org/######
    */
    insertBefore: function insertBefore(newVNode, existingVNode) {
        var _this3 = this;

        supportCheck(this.nodeType, "insertBefore");

        var i = this.children.indexOf(existingVNode);
        if (i >= 0) {
            var children = void 0;
            if (newVNode.nodeType === 11) {
                children = newVNode.children.concat();
                Array.prototype.splice.apply(this.children, [i, 0].concat(newVNode.children));
            } else {
                children = [newVNode];
                this.children.splice(i, 0, newVNode);
            }

            // 更换父节点
            foreach(children, function (child) {
                updateParent(child, _this3);
            });
        }
    },


    /**
        html ( vnode: Object )
    
        Return Type:
        void
    
        Description:
        将此vnode下的内容替换为vnode
    
        URL doc:
        http://amaple.org/######
    */
    html: function html$$1(vnode) {
        supportCheck(this.nodeType, "html");

        this.clear();
        this.appendChild(vnode);
    },


    /**
        clear ()
    
        Return Type:
        void
    
        Description:
        清空子元素
    
        URL doc:
        http://amaple.org/######
    */
    clear: function clear$$1() {
        foreach(this.children, function (child) {
            child.parent = null;
        });

        this.children = [];
    },


    /**
           nextSibling ()
       
           Return Type:
           void
       
           Description:
           获取此vnode的下一个vnode
       
           URL doc:
           http://amaple.org/######
       */
    nextSibling: function nextSibling() {
        if (this.parent) {
            return this.parent.children[this.parent.children.indexOf(this) + 1];
        }
    },


    /**
        nextElementSibling ()
    
        Return Type:
        void
    
        Description:
        获取此vnode的下一个element vnode
    
        URL doc:
        http://amaple.org/######
    */
    nextElementSibling: function nextElementSibling() {
        if (this.parent) {
            var index = this.parent.children.indexOf(this) + 1,
                nextElem = this.parent.children[index];

            while (nextElem && nextElem.nodeType !== 1) {
                nextElem = this.parent.children[++index];
            }

            return nextElem;
        }
    },


    /**
        prevSibling ()
    
        Return Type:
        void
    
        Description:
        获取此vnode的下一个vnode
    
        URL doc:
        http://amaple.org/######
    */
    prevSibling: function prevSibling() {
        if (this.parent) {
            return this.parent.children[this.parent.children.indexOf(this) - 1];
        }
    },


    /**
        attr ( name: String, val: Object|String|null )
         Return Type:
        void
         Description:
        获取、设置（单个或批量）、移除vnode属性
         URL doc:
        http://amaple.org/######
    */
    attr: function attr$$1(name, val) {
        var _this4 = this;

        supportCheck(this.nodeType, "attr");
        correctParam(name, val).to("string", ["string", "object", null, "boolean"]).done(function () {
            name = this.$1;
            val = this.$2;
        });

        var tval = type$1(val);
        if (tval === "undefined") {
            return this.attrs[name];
        } else if (tval === "null") {
            delete this.attrs[name];
        } else if (tval === "object") {
            foreach(val, function (v, k) {
                _this4.attrs[k] = v;
            });
        } else {
            this.attrs[name] = val;
        }
    },


    /**
        render ()
    
        Return Type:
        DOMObject
        此vnode对应的实际DOM
    
        Description:
        将此vnode渲染为实际DOM
    
        URL doc:
        http://amaple.org/######
    */
    render: function render() {
        var _this5 = this;

        var f = void 0;
        switch (this.nodeType) {
            case 1:
                if (!this.node) {
                    if (this.templateNodes) {
                        this.node = [];
                        foreach(this.templateNodes, function (vnode) {
                            _this5.node.push(vnode.render());
                        });
                    } else {
                        this.node = document.createElement(this.nodeName);
                        foreach(this.attrs, function (attrVal, name) {
                            if (attrAssignmentHook.indexOf(name) === -1) {
                                attr(_this5.node, name, attrVal);
                            } else {
                                _this5.node[name] = attrVal;
                            }
                        });
                        foreach(this.events, function (handlers, type) {
                            foreach(handlers, function (handler) {
                                event.on(_this5.node, type, handler);
                            });
                        });
                    }
                } else {

                    // vnode为组件或template时，node为一个数组，代表了此组件的模板元素
                    // 此时不需要修正属性
                    if (this.templateNodes) {
                        this.node = [];
                        foreach(this.templateNodes, function (vnode) {
                            _this5.node.push(vnode.render());
                        });
                    } else {

                        // 存在对应node时修正node属性
                        foreach(this.attrs, function (attrVal, name) {
                            if (attrAssignmentHook.indexOf(name) === -1) {
                                attr(_this5.node, name, attrVal);
                            } else {
                                _this5.node[name] = attrVal;
                            }
                        });

                        // 移除不存在的属性
                        foreach(slice.call(this.node.attributes), function (attrNode) {
                            if (!Object.prototype.hasOwnProperty.call(_this5.attrs, attrNode.name)) {
                                attr(_this5.node, attrNode.name, null);
                            }
                        });

                        foreach(this.events, function (handlers, type) {
                            foreach(handlers, function (handler) {
                                event.on(_this5.node, type, handler);
                            });
                        });
                    }
                }

                if (this.children.length > 0 && !this.templateNodes) {

                    // 先清除子节点再重新添加
                    while (this.node.firstChild) {
                        this.node.removeChild(this.node.firstChild);
                    }

                    f = document.createDocumentFragment();
                    foreach(this.children, function (child) {
                        f.appendChild(child.render());
                    });

                    this.node.appendChild(f);
                }

                break;
            case 3:

                // 如果nodeValue为string时需将实体符号转换为符号
                if (type$1(this.nodeValue) === "string") {
                    this.nodeValue = this.nodeValue.replace(rentitySymbol, function (match, rep) {
                        var symbol = entitySymbol[rep];

                        // 当实体符号为&#123、&#125之类的unicode编码组成时
                        if (!symbol) {
                            if (rep.substr(0, 1) === "#") {
                                symbol = String.fromCharCode(rep.substr(1)) || match;
                            } else {
                                symbol = match;
                            }
                        }

                        return symbol;
                    });
                }

                if (!this.node) {
                    this.node = document.createTextNode(this.nodeValue);
                } else {
                    if (this.node.nodeValue !== this.nodeValue) {
                        this.node.nodeValue = this.nodeValue;
                    }
                }

                break;
            case 11:
                if (!this.node) {
                    this.node = document.createDocumentFragment();
                }

                f = document.createDocumentFragment();
                foreach(this.children, function (child) {
                    f.appendChild(child.render());
                });

                this.node.appendChild(f);

                break;
        }

        if (type$1(this.node) === "array") {
            f = document.createDocumentFragment();
            foreach(this.node, function (node) {
                f.appendChild(node);
            });

            return f;
        }

        return this.node;
    },


    /**
        clone ( isQuoteDOM: Boolean )
    
        Return Type:
        Object
        此vnode的克隆vnode
    
        Description:
        克隆此vnode
        操作克隆的vnode不会影响此vnode
        如果参数isQuoteDOM为false时，则此vnode不会引用任何node
    
        URL doc:
        http://amaple.org/######
    */
    clone: function clone(isQuoteDOM) {
        var vnode = void 0,
            node = isQuoteDOM === false ? null : this.node;

        switch (this.nodeType) {
            case 1:

                // 复制attrs
                var attrs = {};
                foreach(this.attrs, function (attr$$1, name) {
                    attrs[name] = attr$$1;
                });

                vnode = VElement(this.nodeName, attrs, null, null, node, this.isComponent);
                vnode.key = this.key;

                if (this.events) {
                    foreach(this.events, function (handlers, type) {
                        foreach(handlers, function (handler) {
                            vnode.bindEvent(type, handler);
                        });
                    });
                }

                if (this.templateNodes) {
                    if (vnode.isComponent) {
                        vnode.component = this.component;
                    }

                    vnode.templateNodes = [];
                    foreach(this.templateNodes, function (templateNode, i) {
                        vnode.templateNodes.push(templateNode.clone());
                    });
                }

                break;
            case 3:
                vnode = VTextNode(this.nodeValue, null, node);
                vnode.key = this.key;

                break;
            case 11:
                vnode = VFragment(null, node);
        }

        if (this.children) {
            foreach(this.children, function (child, i) {
                vnode.appendChild(child.clone(isQuoteDOM));
            });
        }

        return vnode;
    },


    /**
        bindEvent ( type: String, listener: Function )
    
        Return Type:
        void
    
        Description:
        为此vnode绑定事件
    
        URL doc:
        http://amaple.org/######
    */
    bindEvent: function bindEvent(type, listener) {
        this.events = this.events || {};
        this.events[type] = this.events[type] || [];

        this.events[type].push(listener);
    },


    /**
        diff ( oldVNode: Object )
    
        Return Type:
        Object
        此vnode与参数oldVNode对比后计算出的NodePatcher对象
    
        Description:
        此vnode与参数oldVNode进行对比，并计算出差异
    
        URL doc:
        http://amaple.org/######
    */
    diff: function diff(oldVNode) {
        var nodePatcher = new NodePatcher();

        if (!oldVNode) {
            nodePatcher.addNode(this, getInsertIndex(this.parent.children.indexOf(this), this.parent.children));
        } else if (this.nodeType === 3 && oldVNode.nodeType === 3) {

            // 防止使用”:if“、”:else-if“指令时相同元素导致无法匹配元素的问题
            if (this.node !== oldVNode.node) {
                this.node = oldVNode.node;
            }
            if (this.nodeValue !== oldVNode.nodeValue) {

                // 文本节点内容不同时更新文本内容
                nodePatcher.replaceTextNode(this, oldVNode);
            }
        } else if (this.nodeName === oldVNode.nodeName && this.key === oldVNode.key) {

            // 如果当前为组件或template vnode，则处理templateNodes
            if (this.templateNodes) {

                // 还未挂载的组件或template是没有templateNodes的
                // 此时需将该templateNodes替换为组件内容
                if (!oldVNode.templateNodes) {
                    nodePatcher.replaceNode(VFragment(this.templateNodes), oldVNode);
                } else {
                    diffChildren(this.templateNodes, oldVNode.templateNodes, nodePatcher);
                }
            } else {

                // 防止使用”:if“、”:else-if“指令时相同元素导致无法匹配元素的问题
                if (this.node !== oldVNode.node) {
                    this.node = oldVNode.node;
                }

                // 通过key对比出节点相同时
                // 对比属性
                diffAttrs(this, oldVNode, nodePatcher);

                // 对比事件
                diffEvents(this, oldVNode, nodePatcher);

                // 比较子节点
                diffChildren(this.children, oldVNode.children, nodePatcher);
            }
        } else {

            // 节点不同，直接替换
            nodePatcher.replaceNode(this, oldVNode);
        }

        return nodePatcher;
    },


    /**
        emit ( type: String )
    
        Return Type:
        void
    
        Description:
        触发事件
    
        URL doc:
        http://amaple.org/######
    */
    emit: function emit(type) {
        if (this.node) {
            event.emit(this.node, type);
        }
    }
});

extend(VNode, {

    /**
        domToVNode ( dom: DOMObject|DOMString, parent: Object )
    
        Return Type:
        Object
        实际DOM转换后的vnode对象
    
        Description:
        将实际DOM或DOM String转换为vnode对象
    
        URL doc:
        http://amaple.org/######
    */
    domToVNode: function domToVNode(dom) {
        if (type$1(dom) === "string") {
            var d = document.createElement("div"),
                f = document.createDocumentFragment();

            d.innerHTML = dom;
            foreach(slice.call(d.childNodes), function (childNode) {
                f.appendChild(childNode);
            });

            dom = f;
        }

        var vnode = void 0;
        switch (dom.nodeType) {
            case 1:
                var attrs = {};
                foreach(slice.call(dom.attributes), function (attr$$1) {
                    attrs[attr$$1.name] = attr$$1.nodeValue;
                });

                vnode = VElement(dom.nodeName, attrs, null, null, dom);

                break;
            case 3:
                vnode = VTextNode(dom.nodeValue, null, dom);

                break;
            case 11:
                vnode = VFragment(null, dom);
        }

        foreach(slice.call(dom.nodeName === "TEMPLATE" ? dom.content.childNodes || dom.childNodes : dom.childNodes), function (child) {

            child = VNode.domToVNode(child);
            if (child instanceof VNode) {
                vnode.appendChild(child);
            }
        });

        return vnode;
    }
});

function VElement(nodeName, attrs, parent, children, elem, isComponent) {
	var vnode = new VNode(1, parent, elem);
	vnode.nodeName = nodeName.toUpperCase();

	vnode.attrs = attrs || {};
	vnode.children = children && children.concat() || [];

	foreach(vnode.children, function (child) {
		updateParent(child, vnode);
	});

	if (isComponent === true) {
		vnode.isComponent = true;
	}

	return vnode;
}

var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var ncname = "[a-zA-Z_][\\w\\-\\.]*";
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
var startTagOpen = new RegExp("^<" + qnameCapture);
var startTagClose = /^\s*(\/?)>/;
var endTag = new RegExp("^<\\/" + qnameCapture + "[^>]*>");
var doctype = /^<!DOCTYPE [^>]+>/i;
var ieNSBug = /^xmlns:NS\d+/;
var ieNSPrefix = /^NS\d+:/;
var comment = /^<!\--/;
var conditionalComment = /^<!\[/;
var isNonPhrasingTag = makeMap("address,article,aside,base,blockquote,body,caption,col,colgroup,dd," + "details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form," + "h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta," + "optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead," + "title,tr,track");
var isUnaryTag = makeMap("area,base,br,col,embed,frame,hr,img,input,isindex,keygen," + "link,meta,param,source,track,wbr");
var isSVG = makeMap("svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face," + "foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern," + "polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view", true);
var canBeLeftOpenTag = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source");
var isPlainTextElement = makeMap("script,style,textarea", true);
var reCache = {};
var decodingMap = {
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": "",
	"&amp;": "&",
	"&#10;": "\n",
	"&#9;": "\t"
};
var encodedAttr = /&(?:lt|gt|quot|amp);/g;
var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g;
var isIgnoreNewlineTag = makeMap("pre,textarea", true);
var shouldIgnoreFirstNewline = function shouldIgnoreFirstNewline(tag, html) {
	return tag && isIgnoreNewlineTag(tag) && html[0] === "\n";
};

var IS_REGEX_CAPTURING_BROKEN = false;
var parent = void 0;
"x".replace(/x(.)?/g, function (m, g) {
	IS_REGEX_CAPTURING_BROKEN = g === "";
});

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap(str, expectsLowerCase) {
	var map = Object.create(null),
	    list = str.split(",");

	foreach(list, function (item) {
		map[item] = true;
	});

	return expectsLowerCase ? function (val) {
		return map[val.toLowerCase()];
	} : function (val) {
		return map[val];
	};
}

function getTagNamespace(tag) {
	if (isSVG(tag)) {
		return "svg";
	}

	// basic support for MathML
	// note it doesn't support other MathML elements being component roots
	if (tag === "math") {
		return "math";
	}
}

function guardIESVGBug(attrs) {
	foreach(attrs, function (val, name, attrs) {
		if (!ieNSBug.test(name)) {
			delete attrs[name];
			attrs[name.replace(ieNSPrefix, "")] = val;
		}
	});
}

function closeElement(vnode) {
	if (vnode.nodeName === "PRE") {
		inPre = false;
	}
}

function startHandler(tagName, attrs, unary, stack, rootVNodes) {

	// handle IE svg bug
	if (getTagNamespace(tagName) === "svg") {
		guardIESVGBug(attrs);
	}

	var vnode = VElement(tagName, attrs);
	if (vnode.nodeName === "PRE") {
		inPre = true;
	}
	if (parent) {
		parent.appendChild(vnode);
	} else {
		rootVNodes.push(vnode);
	}
	if (!unary) {
		stack.push(vnode);
		parent = vnode;
	} else {
		closeElement(vnode);
	}
}

function endHandler(stack) {

	// remove trailing whitespace
	var vnode = stack[stack.length - 1],
	    lastNode = vnode.children[vnode.children.length - 1];
	if (lastNode && lastNode.nodeType === 3 && lastNode.text === " " && !inPre) {
		vnode.children.pop();
	}

	// pop stack
	stack.pop();
	parent = stack[stack.length - 1];
	closeElement(vnode);
}

var inPre = false;
function charsHandler(text, rootVNodes) {

	// IE textarea placeholder bug
	// if ( isIE && parent.tag === "textarea" && parent.attrs.placeholder === text ) {
	// 	return;
	// }

	var children = parent && parent.children || [];
	text = inPre || text.trim() ? text

	// only preserve whitespace if its not right after a starting tag
	// 节点与节点之间的空格与回车会解析为" "的文本节点
	: children.length ? " " : "";
	if (text) {
		var textNode = VTextNode(text);
		if (parent) {
			parent.appendChild(textNode);
		} else {
			rootVNodes.push(textNode);
		}
	}
}

function decodeAttr(value, shouldDecodeNewlines) {
	var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
	return value.replace(re, function (match) {
		return decodingMap[match];
	});
}

function parseHTML(html) {
	var stack = [];
	var index = 0,
	    rootVNodes = [],
	    last = void 0,
	    lastTag = void 0;
	while (html) {
		last = html;

		// Make sure we"re not in a plaintext content element like script/style
		if (!lastTag || !isPlainTextElement(lastTag)) {
			var textEnd = html.indexOf("<");
			if (textEnd === 0) {

				// Comment:
				// 暂忽略注释的解析
				if (comment.test(html)) {
					var commentEnd = html.indexOf("-->");

					if (commentEnd >= 0) {
						// commentHandler ( html.substring ( 4, commentEnd ) );
						advance(commentEnd + 3);
						continue;
					}
				}

				// http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
				if (conditionalComment.test(html)) {
					var conditionalEnd = html.indexOf("]>");

					if (conditionalEnd >= 0) {
						advance(conditionalEnd + 2);
						continue;
					}
				}

				// Doctype:
				var doctypeMatch = html.match(doctype);
				if (doctypeMatch) {
					advance(doctypeMatch[0].length);
					continue;
				}

				// End tag:
				var endTagMatch = html.match(endTag);
				if (endTagMatch) {
					var curIndex = index;
					advance(endTagMatch[0].length);
					parseEndTag(endTagMatch[1], curIndex, index);
					continue;
				}

				// Start tag:
				var startTagMatch = parseStartTag();
				if (startTagMatch) {
					handleStartTag(startTagMatch);
					if (shouldIgnoreFirstNewline(lastTag, html)) {
						advance(1);
					}
					continue;
				}
			}

			var text = void 0,
			    rest = void 0,
			    next = void 0;
			if (textEnd >= 0) {
				rest = html.slice(textEnd);
				while (!endTag.test(rest) && !startTagOpen.test(rest) && !comment.test(rest) && !conditionalComment.test(rest)) {

					// < in plain text, be forgiving and treat it as text
					next = rest.indexOf("<", 1);
					if (next < 0) {
						break;
					}

					textEnd += next;
					rest = html.slice(textEnd);
				}

				text = html.substring(0, textEnd);
				advance(textEnd);
			}

			if (textEnd < 0) {
				text = html;
				html = "";
			}

			if (text) {

				// charsHandler会将文本节点放入children数组中
				charsHandler(text, rootVNodes);
			}
		} else {
			(function () {
				var endTagLength = 0;
				var stackedTag = lastTag.toLowerCase(),
				    reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp("([\\s\\S]*?)(</" + stackedTag + "[^>]*>)", "i")),
				    rest = html.replace(reStackedTag, function (all, text, endTag) {
					endTagLength = endTag.length;
					if (!isPlainTextElement(stackedTag) && stackedTag !== "noscript") {
						text = text.replace(/<!\--([\s\S]*?)-->/g, "$1").replace(/<!\[CDATA\[([\s\S]*?)]]>/g, "$1");
					}
					if (shouldIgnoreFirstNewline(stackedTag, text)) {
						text = text.slice(1);
					}

					charsHandler(text, rootVNodes);
					return "";
				});

				index += html.length - rest.length;
				html = rest;
				parseEndTag(stackedTag, index - endTagLength, index);
			})();
		}

		if (html === last) {
			charsHandler(html, rootVNodes);
			break;
		}
	}

	// Clean up any remaining tags
	parseEndTag();

	function advance(n) {
		index += n;
		html = html.substring(n);
	}

	function parseStartTag() {
		var start = html.match(startTagOpen);
		if (start) {
			var match = {
				tagName: start[1],
				attrs: [],
				start: index
			};
			advance(start[0].length);

			var end = void 0,
			    attr = void 0;
			while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
				advance(attr[0].length);
				match.attrs.push(attr);
			}
			if (end) {
				match.unarySlash = end[1];
				advance(end[0].length);
				match.end = index;
				return match;
			}
		}
	}

	function handleStartTag(match) {
		var tagName = match.tagName,
		    unary = isUnaryTag(tagName) || !!match.unarySlash,
		    attrs = {};

		if (lastTag === "p" && isNonPhrasingTag(tagName)) {
			parseEndTag(lastTag);
		}
		if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
			parseEndTag(tagName);
		}

		foreach(match.attrs, function (args) {

			// hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
			if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf("\"\"") === -1) {
				if (args[3] === "") {
					delete args[3];
				}
				if (args[4] === "") {
					delete args[4];
				}
				if (args[5] === "") {
					delete args[5];
				}
			}

			var value = args[3] || args[4] || args[5] || "",
			    shouldDecodeNewlines = tagName === "a" && args[1] === "href" ? true : false;

			attrs[args[1]] = decodeAttr(value, shouldDecodeNewlines);
		});

		if (!unary) {
			lastTag = tagName;
		}
		startHandler(tagName, attrs, unary, stack, rootVNodes);
	}

	function parseEndTag(tagName, start, end) {
		var pos = void 0;
		var lowerCasedTagName = (tagName || "").toLowerCase();
		if (start === null) {
			start = index;
		}
		if (end === null) {
			end = index;
		}

		// Find the closest opened tag of the same type
		if (tagName) {
			for (pos = stack.length - 1; pos >= 0; pos--) {
				if (stack[pos].nodeName.toLowerCase() === lowerCasedTagName) {
					break;
				}
			}
		} else {

			// If no tag name is provided, clean shop
			pos = 0;
		}

		if (pos >= 0) {

			// Close all the open elements, up the stack
			for (var i = stack.length - 1; i >= pos; i--) {
				if (i > pos || !tagName) {
					throw htmlParserErr("endTag", "tag <" + stack[i].nodeName + "> has no matching end tag.");
				}

				endHandler(stack);
			}

			// Remove the open elements from the stack
			stack.length = pos;
			lastTag = pos && stack[pos - 1].tag;
		} else if (lowerCasedTagName === "br") {
			startHandler(tagName, [], true, stack, rootVNodes);
		} else if (lowerCasedTagName === "p") {
			startHandler(tagName, [], false, stack, rootVNodes);
			endHandler(stack);
		}
	}

	return rootVNodes.length === 1 ? rootVNodes[0] : VFragment(rootVNodes);
}

var rName = /^(?:\\.|[\w\-\u00c0-\uFFFF])+/;
var rEscape = /\\([\da-f]{1,6}\s?|(\s)|.)/ig;
var rAttr = /^\s*((?:\\.|[\w\u00c0-\uFFFF\-])+)\s*(?:(\S?)=\s*(?:(['"])(.*?)\3|(#?(?:\\.|[\w\u00c0-\uFFFF\-])*)|)|)\s*(i)?\]/;
var actionTypes = {
	"undefined": "exists",
	"": "equals",
	"~": "element",
	"^": "start",
	"$": "end",
	"*": "any",
	"!": "not",
	"|": "hyphen"
};
var simpleSelectors = {
	">": "child",
	"<": "parent",
	"~": "sibling",
	"+": "adjacent"
};
var attribSelectors = {
	"#": ["id", "equals"],
	".": ["class", "element"]
};
var unpackPseudos = {
	"has": true,
	"not": true,
	"matches": true
};
var stripQuotesFromPseudos = {
	"contains": true,
	"icontains": true
};
var quotes = {
	"\"": true,
	"'": true
};

//unescape function taken from https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L139
// function funescape ( _, escaped, escapedWhitespace ) {
// 	const high = "0x" + escaped - 0x10000;

// 	// NaN means non-codepoint
// 	// Support: Firefox
// 	// Workaround erroneous numeric interpretation of +"0x"
// 	return high !== high || escapedWhitespace ?
// 		escaped :

// 		// BMP codepoint
// 		high < 0 ?
// 			String.fromCharCode ( high + 0x10000 ) :

// 			// Supplemental Plane codepoint (surrogate pair)
// 			String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
// }

function unescapeCSS(str) {
	return str.replace(rEscape, function (_, escaped, escapedWhitespace) {
		var high = "0x" + escaped - 0x10000;

		// NaN means non-codepoint
		// Support: Firefox
		// Workaround erroneous numeric interpretation of +"0x"
		return escapedWhitespace ? escaped :

		// BMP codepoint
		high < 0 ? String.fromCharCode(high + 0x10000) :

		// Supplemental Plane codepoint (surrogate pair)
		String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00); // eslint-disable-line
	});
}

function isWhitespace(c) {
	return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
}

function actionToParseSelector(subselects, selector) {
	var tokens = [],
	    sawWS = false,
	    data = void 0,
	    firstChar = void 0,
	    name = void 0,
	    quot = void 0;

	function getName() {
		var sub = selector.match(rName)[0];
		selector = selector.substr(sub.length);
		return unescapeCSS(sub);
	}

	function stripWhitespace(start) {
		while (isWhitespace(selector.charAt(start))) {
			start++;
		}

		selector = selector.substr(start);
	}

	stripWhitespace(0);

	while (selector !== "") {
		firstChar = selector.charAt(0);

		if (isWhitespace(firstChar)) {
			sawWS = true;
			stripWhitespace(1);
		} else if (firstChar in simpleSelectors) {
			tokens.push({
				type: simpleSelectors[firstChar]
			});
			sawWS = false;

			stripWhitespace(1);
		} else if (firstChar === ",") {
			if (tokens.length === 0) {
				throw cssParserErr("syntax", "empty sub-selector");
			}

			subselects.push(tokens);
			tokens = [];
			sawWS = false;
			stripWhitespace(1);
		} else {
			if (sawWS) {
				if (tokens.length > 0) {
					tokens.push({
						type: "descendant"
					});
				}
				sawWS = false;
			}

			if (firstChar === "*") {
				selector = selector.substr(1);
				tokens.push({
					type: "universal"
				});
			} else if (firstChar in attribSelectors) {
				selector = selector.substr(1);
				tokens.push({
					type: "attribute",
					name: attribSelectors[firstChar][0],
					action: attribSelectors[firstChar][1],
					value: getName(),
					ignoreCase: false
				});
			} else if (firstChar === "[") {
				selector = selector.substr(1);
				data = selector.match(rAttr);
				if (!data) {
					throw cssParserErr("syntax", "Malformed attribute selector:" + selector);
				}
				selector = selector.substr(data[0].length);
				name = unescapeCSS(data[1]);

				tokens.push({
					type: "attribute",
					name: name,
					action: actionTypes[data[2]],
					value: unescapeCSS(data[4] || data[5] || ""),
					ignoreCase: !!data[6]
				});
			} else if (firstChar === ":") {
				if (selector.charAt(1) === ":") {
					selector = selector.substr(2);
					tokens.push({
						type: "pseudo-element",
						name: getName().toLowerCase()
					});

					continue;
				}

				selector = selector.substr(1);

				name = getName().toLowerCase();
				data = null;

				if (selector.charAt(0) === "(") {
					if (name in unpackPseudos) {
						quot = selector.charAt(1);
						var quoted = quot in quotes;

						selector = selector.substr(quoted + 1);

						data = [];
						selector = actionToParseSelector(data, selector);

						if (quoted) {
							if (selector.charAt(0) !== quot) {
								throw cssParserErr("syntax", "unmatched quotes in :" + name);
							} else {
								selector = selector.substr(1);
							}
						}

						if (selector.charAt(0) !== ")") {
							throw cssParserErr("syntax", "missing closing parenthesis in :" + name + " " + selector);
						}

						selector = selector.substr(1);
					} else {
						var pos = 1,
						    counter = 1;

						for (; counter > 0 && pos < selector.length; pos++) {
							if (selector.charAt(pos) === "(") {
								counter++;
							} else if (selector.charAt(pos) === ")") {
								counter--;
							}
						}

						if (counter) {
							throw cssParserErr("syntax", "parenthesis not matched");
						}

						data = selector.substr(1, pos - 2);
						selector = selector.substr(pos);

						if (name in stripQuotesFromPseudos) {
							quot = data.charAt(0);

							if (quot === data.slice(-1) && quot in quotes) {
								data = data.slice(1, -1);
							}

							data = unescapeCSS(data);
						}
					}
				}

				tokens.push({
					type: "pseudo",
					name: name,
					data: data
				});
			} else if (rName.test(selector)) {
				name = getName();
				tokens.push({
					type: "tag",
					name: name
				});
			} else {
				if (tokens.length && tokens[tokens.length - 1].type === "descendant") {
					tokens.pop();
				}

				addToken(subselects, tokens);
				return selector;
			}
		}
	}

	addToken(subselects, tokens);

	return selector;
}

function addToken(subselects, tokens) {
	if (subselects.length > 0 && tokens.length === 0) {
		throw cssParserErr("syntax", "empty sub-selector");
	}

	subselects.push(tokens);
}

function parseSelector(selector) {
	var subselects = [];
	selector = actionToParseSelector(subselects, selector + "");

	if (selector !== "") {
		throw cssParserErr("syntax", "Unmatched selector: " + selector);
	}

	return subselects;
}

var procedure = {
  universal: 50,
  tag: 30,
  attribute: 1,
  pseudo: 0,
  descendant: -1,
  child: -1,
  parent: -1,
  sibling: -1,
  adjacent: -1
};

/*
	sort the parts of the passed selector,
	as there is potential for optimization
	(some types of selectors are faster than others)
*/

var attributes = {
	exists: 10,
	equals: 8,
	not: 7,
	start: 6,
	end: 6,
	any: 5,
	hyphen: 4,
	element: 4
};

function getProcedure(token) {
	var proc = procedure[token.type];

	if (proc === procedure.attribute) {
		proc = attributes[token.action];

		if (proc === attributes.equals && token.name === "id") {

			//prefer ID selectors (eg. #ID)
			proc = 9;
		}

		if (token.ignoreCase) {

			//ignoreCase adds some overhead, prefer "normal" token
			//this is a binary operation, to ensure it's still an int
			proc >>= 1; // eslint-disable-line
		}
	}

	return proc;
}

function sort(arr) {
	var procs = arr.map(getProcedure);
	for (var i = 1; i < arr.length; i++) {
		var procNew = procs[i];
		if (procNew < 0) {
			continue;
		}

		for (var j = i - 1; j >= 0 && procNew < procs[j]; j--) {
			var token = arr[j + 1];
			arr[j + 1] = arr[j];
			arr[j] = token;
			procs[j + 1] = procs[j];
			procs[j] = procNew;
		}
	}
}

function trueFunc() {
	return true;
}

function falseFunc() {
	return false;
}

//https://github.com/slevithan/XRegExp/blob/master/src/xregexp.js#L469
var rChars = /[-[\]{}()*+?.,\\^$|#\s]/g;

/*
	attribute selectors
*/

var rules = {
	equals: function equals(next, data) {
		var name = data.name;
		var value = data.value;

		if (data.ignoreCase) {
			value = value.toLowerCase();

			return function (elem) {
				var attr = elem.attr(name);
				return attr !== undefined && attr.toLowerCase() === value && next(elem);
			};
		}

		return function (elem) {
			return elem.nodeType === 1 && elem.attr(name) === value && next(elem);
		};
	},
	hyphen: function hyphen(next, data) {
		var value = data.value;
		var name = data.name,
		    len = value.length;

		if (data.ignoreCase) {
			value = value.toLowerCase();

			return function (elem) {
				var attr = elem.nodeType === 1 && elem.attr(name);
				return attr !== undefined && (attr.length === len || attr.charAt(len) === "-") && attr.substr(0, len).toLowerCase() === value && next(elem);
			};
		}

		return function (elem) {
			var attr = elem.nodeType === 1 && elem.attr(name);
			return attr !== undefined && attr.substr(0, len) === value && (attr.length === len || attr.charAt(len) === "-") && next(elem);
		};
	},
	element: function element(next, data) {
		var name = data.name;
		var value = data.value;

		if (/\s/.test(value)) {
			return falseFunc;
		}

		value = value.replace(rChars, "\\$&");

		var pattern = "(?:^|\\s)" + value + "(?:$|\\s)",
		    flags = data.ignoreCase ? "i" : "",
		    regex = new RegExp(pattern, flags);

		return function (elem) {
			var attr = elem.nodeType === 1 && elem.attr(name) || undefined;
			return attr !== undefined && regex.test(attr) && next(elem);
		};
	},
	exists: function exists(next, data) {
		var name = data.name;
		return function (elem) {
			return elem.nodeType === 1 && elem.attrs.hasOwnProperty(name) && next(elem);
		};
	},
	start: function start(next, data) {
		var value = data.value;
		var name = data.name,
		    len = value.length;

		if (len === 0) {
			return falseFunc;
		}

		if (data.ignoreCase) {
			value = value.toLowerCase();

			return function (elem) {
				var attr = elem.nodeType === 1 && elem.attr(name);
				return attr !== undefined && attr.substr(0, len).toLowerCase() === value && next(elem);
			};
		}

		return function (elem) {
			var attr = elem.nodeType === 1 && elem.attr(name);
			return attr !== undefined && attr.substr(0, len) === value && next(elem);
		};
	},
	end: function end(next, data) {
		var value = data.value;
		var name = data.name,
		    len = -value.length;

		if (len === 0) {
			return falseFunc;
		}

		if (data.ignoreCase) {
			value = value.toLowerCase();

			return function (elem) {
				var attr = elem.nodeType === 1 && elem.attr(name);
				return attr !== undefined && attr.substr(len).toLowerCase() === value && next(elem);
			};
		}

		return function (elem) {
			var attr = elem.nodeType === 1 && elem.attr(name);
			return attr !== undefined && attr.substr(len) === value && next(elem);
		};
	},
	any: function any(next, data) {
		var name = data.name;
		var value = data.value;

		if (value === "") {
			return falseFunc;
		}

		if (data.ignoreCase) {
			var regex = new RegExp(value.replace(rChars, "\\$&"), "i");

			return function (elem) {
				var attr = elem.nodeType === 1 && elem.attr(name);
				return attr !== undefined && regex.test(attr) && next(elem);
			};
		}

		return function (elem) {
			var attr = elem.nodeType === 1 && elem.attr(name);
			return attr !== undefined && attr.indexOf(value) >= 0 && next(elem);
		};
	},
	not: function not(next, data) {
		var name = data.name;
		var value = data.value;

		if (value === "") {
			return function (elem) {
				return elem.nodeType === 1 && !!elem.attr(name) && next(elem);
			};
		} else if (data.ignoreCase) {
			value = value.toLowerCase();

			return function (elem) {
				var attr = elem.nodeType === 1 && elem.attr(name);
				return attr !== undefined && attr.toLowerCase() !== value && next(elem);
			};
		}

		return function (elem) {
			return elem.nodeType === 1 && elem.attr(name) !== value && next(elem);
		};
	}
};

function attributes$1 (next, data, options) {
	return rules[data.action](next, data);
}

function getSiblings(elem) {
	return elem.parent ? elem.parent.children : [elem];
}

/*
	all available rules
*/
var general = {
	attribute: attributes$1,

	//tags
	tag: function tag(next, data) {
		var name = data.name;
		return function (elem) {
			return elem.nodeType === 1 && elem.nodeName.toLowerCase() === name && next(elem);
		};
	},


	//traversal
	descendant: function descendant(next, rule, context, acceptSelf) {
		return function (elem) {

			if (acceptSelf && next(elem)) {
				return true;
			}

			var found = false;
			while (!found && (elem = elem.parent)) {
				found = next(elem);
			}

			return found;
		};
	},
	parent: function parent(next, data) {
		// if ( options && options.strict ) {
		// 	throw cssParserErr ( "syntax", "Parent selector isn't part of CSS3" );
		// }

		return function (elem) {
			return elem.children.some(function (elem) {
				return elem.nodeType === 1 && next(elem);
			});
		};
	},
	child: function child(next) {
		return function (elem) {
			var parent = elem.parent;
			return !!parent && next(parent);
		};
	},
	sibling: function sibling(next) {
		return function (elem) {
			var siblings = getSiblings(elem);
			var ret = false;
			foreach(siblings, function (sibling) {
				if (sibling.nodeType === 1) {
					if (sibling === elem) {
						return false;
					}
					if (next(sibling)) {
						ret = true;
						return false;
					}
				}
			});

			return ret;
		};
	},
	adjacent: function adjacent(next) {
		return function (elem) {

			var siblings = getSiblings(elem);
			var lastElement = void 0;
			foreach(siblings, function (sibling) {
				if (sibling.nodeType === 1) {
					if (sibling === elem) {
						return false;
					}

					lastElement = sibling;
				}
			});

			return !!lastElement && next(lastElement);
		};
	},
	universal: function universal(next) {
		return next;
	}
};

/*
	compiles a selector to an executable function
*/

function compileRules(rules, context) {
	var acceptSelf = rules[0].name === "scope" && rules[1].type === "descendant";
	return rules.reduce(function (func, rule, index) {
		if (func === falseFunc) {
			return func;
		}

		return general[rule.type](func, rule, context, acceptSelf && index === 1);
	}, trueFunc);
}

function reduceRules(a, b) {
	if (b === falseFunc || a === trueFunc) {
		return a;
	}
	if (a === falseFunc || b === trueFunc) {
		return b;
	}

	return function (elem) {
		return a(elem) || b(elem);
	};
}

function compileToken(token, context) {

	// 不查找伪类和::selection
	foreach(token, function (t) {
		foreach(t, function (item, i) {
			if (item.type === "pseudo" || item.type === "pseudo-element") {
				t.splice(i, 1);
			}
		});
	});
	token.forEach(sort);

	return token.map(function (rules) {
		return compileRules(rules, context);
	}).reduce(reduceRules, falseFunc);
}

function findNode(test, targetChildren, isWatchCond) {
	var result = [];
	foreach(targetChildren, function (child) {
		if (child.nodeType === 1 && test(child)) {
			result.push(child);
		}

		if (child.conditionElems && child.conditionElems.length > 0 && isWatchCond !== false) {

			// 复制一份数组并移除当前vnode
			var walkElems = child.conditionElems.concat(),
			    index = walkElems.indexOf(child);
			if (index > -1) {
				walkElems.splice(index, 1);
			}
			result = result.concat(findNode(test, walkElems, false));
		}
		if (child.nodeType === 1 && child.children.length > 0) {
			result = result.concat(findNode(test, child.children));
		}
	});

	return result;
}

function query$1(selector, context) {
	if (/^:\w+|::selection$/i.test(selector)) {
		selector = "*" + selector;
	}

	var testFunc = compileToken(parseSelector(selector), context);

	return (context.nodeType === 1 && testFunc(context) ? [context] : []).concat(findNode(testFunc, context.children));
}

/**
	defineReactiveProperty ( key: String, getter: Function, setter: Function, target: Object )

	Return Type:
	void

	Description:
	转换存取器属性

	URL doc:
	http://amaple.org/######
*/
function defineReactiveProperty(key, getter, setter, target) {
	Object.defineProperty(target, key, {
		enumerable: true,
		configurable: true,
		get: getter,
		set: setter
	});
}

/**
	parseGetQuery ( getString: String )

	Return Type:
	Object
	解析后的get参数对象

	Description:
	将形如“?a=1&b=2”的get参数解析为参数对象

	URL doc:
	http://amaple.org/######
*/
function parseGetQuery(getString) {
	var getObject = {};
	if (getString) {
		var kv = void 0;
		foreach((getString.substr(0, 1) === "?" ? getString.substr(1) : getString).split("&"), function (getObjectItem) {
			kv = getObjectItem.split("=");
			getObject[kv[0]] = kv[1] || "";
		});
	}

	return getObject;
}

/**
	getFunctionName ( fn: Function )

	Return Type:
	String
	方法名称

	Description:
	es5兼容模式获取方法名称
	es6下可通过name属性获取类名

	URL doc:
	http://amaple.org/######
*/
function getFunctionName(fn) {
	return type$1(fn) === "function" ? fn.name || (fn.toString().match(/^function\s+([\w_]+)/) || [])[1] : "";
}

/**
	transformCompName ( compName: String, mode?: Boolean )

	Return Type:
	驼峰式或中划线式的组件名

	Description:
	mode不为true时，将中划线风格的组件名转换为驼峰式的组件名
	mode为true时，将驼峰式风格的组件名转换为中划线的组件名

	URL doc:
	http://amaple.org/######
*/
function transformCompName(compName, mode) {
	return mode !== true ? compName.toLowerCase().replace(/^([a-z])|-(.)/g, function (match, rep1, rep2) {
		return (rep1 || rep2).toUpperCase();
	}) : compName.replace(/([A-Z])/g, function (match, rep, i) {
		return (i > 0 ? "-" : "") + rep.toLowerCase();
	});
}

/**
	walkDOM ( vdom: Object, callback: Function, ...extra: Any )

	Return Type:
	void

	Description:
	遍历虚拟节点及子节点
	extra为额外的参数，传入的额外参数将会在第一个遍历项中传入，但不会传入之后遍历的子项中

	URL doc:
	http://amaple.org/######
*/
function walkVDOM(vdom, callback) {
	var vnode = vdom;

	for (var _len = arguments.length, extra = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
		extra[_key - 2] = arguments[_key];
	}

	do {

		// apply不能传递null或undefined，因为在低版本IE下会函数会被普通形式调用
		callback.apply({}, [vnode].concat(extra));

		if (vnode.children && vnode.children[0]) {
			walkVDOM(vnode.children[0], callback);
		}
	} while (vnode = vnode.nextSibling());
}

/**
	queryModuleNode ( moduleName: String, context?: DOMObject )

	Return Type:
	DOMObject

	Description:
	遍历节点及子节点查询对应名称的节点

	URL doc:
	http://amaple.org/######
*/
function queryModuleNode(moduleName, context) {
	var node = context || document.body,
	    targetNode = void 0;

	do {
		if (node.nodeType === 1 && attr(node, amAttr.module) === moduleName) {
			targetNode = node;

			break;
		}

		if (node.firstChild) {
			if (targetNode = queryModuleNode(moduleName, node.firstChild)) {
				break;
			}
		}
	} while (node = node.nextSibling);

	return targetNode;
}

/**
	getReference ( references: Object, refName: String )

	Return Type:
	DOMObject|Object
	被引用的组件行为对象或元素

	Description:
	获取被引用的组件行为对象或元素
	当组件不可见时返回undefined

	URL doc:
	http://amaple.org/######
*/
function getReference(references, refName) {
	var reference = references[refName];
	if (type$1(reference) === "array") {
		var _ref = [];
		foreach(reference, function (refItem) {
			if (refItem.parent) {
				_ref.push(refItem.isComponent ? refItem.component.action : refItem.node);
			}
		});
		reference = isEmpty(_ref) ? undefined : _ref.length === 1 ? _ref[0] : _ref;
	} else {
		reference = reference && reference.parent ? reference.isComponent ? reference.component.action : reference.node : undefined;
	}
	return reference;
}

function buildScopedCss(styles, scopedCssIdentifier, selectors) {
	var styleString = "";
	foreach(styles, function (styleItem) {

		// 为css选择器添加范围属性限制
		// 但需排除如@keyframes的项
		if (styleItem.selector.substr(0, 1) !== "@") {
			var selectorArray = [];
			foreach(styleItem.selector.split(",").map(function (item) {
				return item.trim();
			}), function (selector) {

				// 避免重复css选择器
				if (selectors.indexOf(selector) <= -1) {
					selectors.push(selector);
				}
				var pseudoMatch = selector.match(/:[\w-()\s]+|::selection/i);

				// 如果有设置伪类，则需在伪类前面添加范围样式
				if (pseudoMatch) {
					selectorArray.push(selector.replace(pseudoMatch[0], "[" + scopedCssIdentifier + "]" + pseudoMatch[0]));
				} else {
					selectorArray.push(selector.trim() + "[" + scopedCssIdentifier + "]");
				}
			});
			styleItem.selector = selectorArray.join(",");
		}

		// 当选择器为@media时 表示它内部也是css项，需要去递归调用buildScopedCss函数
		if (/^@media/.test(styleItem.selector) && type$1(styleItem.content) === "array") {
			styleItem.content = buildScopedCss(styleItem.content, scopedCssIdentifier, selectors);
		}

		styleString += styleItem.selector + "{" + styleItem.content + "}";
	});

	return styleString;
}

/**
	stringToVNode ( htmlString: String, styles: Object, scopedCssObject: Object )

	Return Type:
	Object
	转换后的VFragment Object

	Description:
	转换html字符串为vnodes
	并根据局部css选择器为对应vnode添加局部属性
	对应的模块标识会保存到scopedCssObject.identifier中

	URL doc:
	http://amaple.org/######
*/
function stringToVNode(htmlString, styles, scopedCssObject) {
	scopedCssObject = scopedCssObject || {};
	var vstyle = VElement("style");

	var vf = parseHTML(htmlString),
	    styleString = styles;

	// 将解析的vnode转换为VFragment
	vf = vf.nodeType === 11 ? vf : VFragment([vf]);
	if (type$1(styles) === "array") {
		var scopedCssIdentifier = scopedCssObject.identifier = identifierPrefix + guid();
		scopedCssObject.selectors = [];
		styleString = buildScopedCss(styles, scopedCssIdentifier, scopedCssObject.selectors);

		vstyle.attr("scoped", "");
	}

	if (styleString.trim()) {
		vstyle.appendChild(VTextNode(styleString));
		vf.appendChild(vstyle);
	}

	return vf;
}

function appendScopedAttr(vnode, selectors, identifier) {
	foreach(selectors, function (selector) {
		foreach(query$1(selector, vnode), function (velem) {
			velem.attr(identifier, "");
		});
	});
}

/**
	buildPlugin ( pluginDef: Object, context: Object )

	Return Type:
	void

	Description:
	构建插件对象并保存到缓存中

	URL doc:
	http://amaple.org/######
*/
function buildPlugin(pluginDef, context, deps) {
	deps = cache.getDependentPlugin(deps || pluginDef.build);
	cache.pushPlugin(pluginDef.name, pluginDef.build.apply(context, deps));
}

/**
	trimHTML ( htmlString: String )

	Return Type:
	String
	去除空格后的html字符串

	Description:
	去除html标签间的空格与回车
	<pre>内的标签不会被处理

	URL doc:
	http://amaple.org/######
*/
function trimHTML(htmlString) {

	// 表达式1：匹配<pre>/</pre>标签来确定是否在<pre>标签内
	// 表达式2：匹配两个标签间的空格
	var rpreAndBlank = /\s*(\/\s*)?pre\s*|>(\s+)</ig;
	var inPreNum = 0;

	return htmlString.replace(rpreAndBlank, function (match, rep1, rep2) {
		if (match.indexOf("pre") > -1) {

			// firefox稍低版本下没有匹配括号内容时为""
			if (rep1 === undefined || rep1 === "") {
				inPreNum++;
				return match;
			} else if (rep1.substr(0, 1) === "/" && inPreNum > 0) {
				inPreNum--;
				return match;
			}
		} else {
			if (inPreNum > 0) {
				return match;
			} else {
				return match.replace(rep2, "");
			}
		}
	});
}

/**
	Loader ( load: Object )

	Return Type:
	void

	Description:
	依赖加载器

	URL doc:
	http://amaple.org/######
*/
function Loader(load) {

	// 需要加载的依赖，加载完成所有依赖需要遍历此对象上的所有依赖并调用相应回调函数
	this.load = load;

	// 等待加载完成的依赖，每加载完成一个依赖都会将此依赖在waiting对象上移除，当waiting为空时则表示相关依赖已全部加载完成
	this.waiting = [];
	this.loadedModule = {};
}

extend(Loader.prototype, {

	/**
 	putWaiting ( name: String )
 	
 	Return Type:
 	void
 
 	Description:
 	将等待加载完成的依赖名放入context.waiting中
 
 	URL doc:
 	http://amaple.org/######
 */
	putWaiting: function putWaiting(name) {
		this.waiting.push(name);
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
	dropWaiting: function dropWaiting(name) {
		var pointer = this.waiting.indexOf(name);
		if (pointer !== -1) {
			this.waiting.splice(pointer, 1);
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
	inject: function inject() {
		var _this = this;

		var deps = [];
		foreach(this.load.deps, function (depStr) {
			deps.push(_this.loadedModule[depStr]);
		});

		// 返回注入后工厂方法
		return function () {
			_this.load.factory.apply({}, deps);
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
	fire: function fire(factory) {
		factory();
		Loader.isRequiring.splice(Loader.isRequiring.indexOf(this.load.factory), 1);
	}
});

extend(Loader, {

	// 正在加载依赖组件的模块
	isRequiring: [],

	// 文件后缀
	suffix: ".js",

	// js组件的依赖名称属性，通过此属性可以得到加载完成的依赖名
	depName: "data-depName",

	// script加载依赖时用于标识依赖
	loaderID: "loader-ID",

	// 保存正在使用的依赖加载器对象，因为当同时更新多个依赖时将会存在多个依赖加载器对象
	loaderMap: {},

	/**
 	create ( guid: Number, name: String, loadDep: Object )
 
 	Return Type:
 	Object
 
 	Description:
 	创建Loader对象保存于Loader.LoaderMap中
 
 	URL doc:
 	http://amaple.org/######
 */
	create: function create(guid$$1, loadDep) {
		return Loader.loaderMap[guid$$1] = new Loader(loadDep);
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
	getCurrentPath: function getCurrentPath() {
		var anchor = document.createElement("a");
		if (document.currentScript) {

			// Chrome, Firefox, Safari高版本
			anchor.href = document.currentScript.src;
		} else {

			// IE10+, Safari低版本, Opera9
			try {
				____a.____b();
			} catch (e) {
				var stack = e.stack || e.sourceURL || e.stacktrace;
				if (stack) {
					var stackArray = e.stack.match(/(?:http|https|file):\/\/.*?\/.+?\.js/g) || [],
					    length = stackArray.length;
					if (length > 0) {
						anchor.href = stackArray[length - 1];
					}
				} else {

					// IE9
					var scripts = slice.call(document.head.querySelectorAll("script"));
					foreach(scripts, function (script) {
						if (script.readyState === "interactive") {
							anchor.href = script.src;
							return false;
						}
					});
				}
			}
		}

		// IE下的a标签的pathname属性开头没有"/"
		var pathname = (anchor.pathname.match(/^(.*?).js$/) || ["", ""])[1];
		return (pathname.substr(0, 1) === "/" ? "" : "/") + pathname;
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
	onScriptLoaded: function onScriptLoaded(e) {

		var target = e.target,
		    loadID = attr(target, Loader.loaderID),
		    depName = attr(target, Loader.depName),
		    curLoader = Loader.loaderMap[loadID];

		curLoader.loadedModule[depName] = curLoader.getLoadedModule(depName);
		if (curLoader.dropWaiting(depName) === 0) {

			// 调用工厂方法
			curLoader.fire(curLoader.inject());
			delete Loader.loaderMap[loadID];
		}
	}
});

var rconstructor = /^(?:constructor\s*|function\s*)?(?:constructor\s*)?\((.*?)\)\s*(?:=>\s*)?{([\s\S]*)}$/;
var rscriptComment = /\/\/(.*?)\n|\/\*([\s\S]*?)\*\//g;

/**
	newClassCheck ( object: Object, constructor: Function )

	Return Type:
	void

	Description:
	检查一个类不能被当做函数调用，否则会抛出错误

	URL doc:
	http://amaple.org/######
*/
function newClassCheck(object, constructor) {
	if (!(object instanceof constructor)) {
		throw classErr("define", "Cannot call a class as a function");
	}
}

/**
	defineMemberFunction ( constructor: Function, proto: Object )

	Return Type:
	void

	Description:
	为一个类添加原型方法和静态变量

	URL doc:
	http://amaple.org/######
*/
function defineMemberFunction(constructor, proto) {
	foreach(proto, function (prop, name) {
		if (name === "statics") {
			foreach(prop, function (staticProp, staticName) {
				Object.defineProperty(constructor, staticName, {
					value: staticProp,
					enumerable: false,
					configurable: true,
					writable: true
				});
			});
		} else {
			Object.defineProperty(constructor.prototype, name, {
				value: prop,
				enumerable: false,
				configurable: true,
				writable: true
			});
		}
	});
}

function inherits(subClass, superClass) {

	// Object.create第二个参数修复子类的constructor
	subClass.prototype = Object.create(superClass && superClass.prototype, {
		constructor: {
			value: subClass,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});

	if (superClass) {
		Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}
}

function getSuperConstructorReturn(subInstance, constructorReturn) {
	var tcr = type$1(constructorReturn);
	return constructorReturn && (tcr === "function" || tcr === "object") ? constructorReturn : subInstance;
}

function defineSuper(subInstance, superConstructor, superReturn) {
	var _arguments = arguments;

	subInstance.__super = function () {
		superReturn.value = superConstructor.apply(subInstance, _arguments);
		delete subInstance.__super;
	};
}

/**
	Plugin Class
	( clsName?: String )

	Description:
	创建一个类
	clsName为类名，proto为类体

	用法与ES6的类创建相似：
	创建一个类：Class("clsName") ( {
		constructor : function () {
			// 名为”constructor“的方法为此方法构造函数
		},
		statics : {
			// 名为”statics“的对象内为该类的静态变量
		}
	} );

	URL doc:
	http://amaple.org/######
*/
function Class(clsName) {
	var _superClass = void 0;

	function classDefiner(proto) {
		var constructor = proto.hasOwnProperty("constructor") ? proto.constructor : noop;
		var fnBody = "return function " + clsName + " (",
		    mustNew = "newClassCheck(this, " + clsName + ");",
		    constructMatch = rconstructor.exec(proto.constructor.toString() || "") || [],
		    args = constructMatch[1] || "",
		    codeNoComment = (constructMatch[2] || "").replace(rscriptComment, function (match) {
			return "";
		}).trim(),
		    classFn = void 0;

		fnBody += args + "){";

		// 此类有继承另一个类的时候
		if (_superClass !== undefined) {

			fnBody += mustNew + "var __superReturn = {};";

			if (constructMatch[2]) {
				var ruseThisBeforeCallSuper = /[\s{;]this\s*\.[\s\S]+this\.__super/,
				    rsuperCount = /[\s{;]?this.__super\s*\(/;

				if (ruseThisBeforeCallSuper.test(codeNoComment)) {
					throw classErr("constructor", "\"this\" is not allow before call this.__super()");
				}

				var superCallCount = 0;
				codeNoComment = codeNoComment.replace(rsuperCount, function (match) {
					superCallCount++;
					return match;
				});

				if (superCallCount === 0) {
					throw classErr("constructor", "Must call \"this.__super()\" in subclass before accessing \"this\" or returning from subclass constructor");
				} else if (superCallCount > 1) {
					throw classErr("constructor", "\"this.__super()\" may only be called once");
				}

				fnBody += "defineSuper(this,(" + clsName + ".__proto__ || Object.getPrototypeOf(" + clsName + ")), __superReturn);";
			} else {
				fnBody += "__superReturn.value = (" + clsName + ".__proto__ || Object.getPrototypeOf(" + clsName + ")).call(this);";
			}

			fnBody += "constructor.call(this" + (args && "," + args) + ");return getSuperConstructorReturn(this,__superReturn.value);}";

			classFn = new Function("constructor", "newClassCheck", "defineSuper", "getSuperConstructorReturn", fnBody)(constructor, newClassCheck, defineSuper, getSuperConstructorReturn);

			inherits(classFn, _superClass);
		} else {
			fnBody += mustNew + "constructor.call(this" + (args && "," + args) + ");}";
			classFn = new Function("constructor", "newClassCheck", fnBody)(constructor, newClassCheck);
		}

		delete proto.constructor;

		// 定义成员方法
		if (!isEmpty(proto)) {
			defineMemberFunction(classFn, proto);
		}

		// 单页模式下将会临时保存Loader
		if (Loader.isRequiring.length > 0) {
			Loader.currentLoaded = classFn;
			cache.pushComponent(Loader.getCurrentPath(), classFn);
		}

		return classFn;
	}

	// 继承函数
	classDefiner.extends = function (superClass) {

		// superClass需要为函数类型，否则会报错
		if (type$1(superClass) !== "function" && superClass !== null) {
			throw classErr("extends", "Class extends value is not a constructor or null");
		}

		_superClass = superClass;
		return classDefiner;
	};

	return classDefiner;
}

function getLoadedComponent(loadURL, Loader) {
	var loadedCompoennt = Loader.currentLoaded;
	cache.pushModule(loadURL, loadedCompoennt);

	delete Loader.currentLoaded;
	return loadedCompoennt;
}

function getLoadedPlugin(loadURL, Loader) {
	return null;
}

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
function require(deps, factory, moduleType, callbacks) {
	Loader.isRequiring.push(factory);

	// 正在加载的依赖数
	var loadingCount = 0,
	    getCache = null;

	var nguid = guid(),
	    module = {
		deps: deps,
		factory: factory
	},
	    loadObj = Loader.create(nguid, module);

	switch (moduleType) {
		case TYPE_COMPONENT:
			loadObj.getLoadedModule = function (loadURL) {
				return getLoadedComponent(loadURL, Loader);
			};
			getCache = function getCache(depStr) {
				return cache.getComponent(depStr);
			};

			break;
		case TYPE_PLUGIN:
			loadObj.getLoadedModule = function (loadURL) {
				return getLoadedPlugin(loadURL, Loader);
			};
			getCache = noop;

			break;
	}

	// 遍历依赖，如果依赖未被加载，则放入waiting中等待加载完成
	foreach(deps, function (depStr) {
		var dep = getCache(depStr);
		if (!dep) {

			// 放入待加载列表中等待加载
			loadObj.putWaiting(depStr);

			// 加载依赖
			var script = document.createElement("script");

			script.src = depStr + Loader.suffix;
			attr(script, Loader.depName, depStr);
			attr(script, Loader.loaderID, nguid);

			appendScript(script, function (e) {
				(callbacks && callbacks[depStr] || noop)(e);
				Loader.onScriptLoaded(e);
			});

			loadingCount++;
		} else {
			loadObj.loadedModule[depStr] = dep;
		}
	});

	// 如果顶层执行依赖没有待加载的依赖参数，或可以直接触发，则直接执行
	if (loadingCount === 0) {
		loadObj.fire(loadObj.inject());
	}
}

// 目前所支持的状态标记符号，如果所传入的状态标记符号不在此列表中，则会使用默认的状态标记符号@

var defaultParams = {

	// 异步加载时的依赖目录，设置后默认在此目录下查找，此对象下有4个依赖目录的设置，如果不设置则表示不依赖任何目录
	// url请求base路径，设置此参数后则跳转请求都依赖此路径
	baseURL: {
		module: "/",
		plugin: "/",
		component: "/"
	},

	// url地址中的状态标识符，如http://...@login表示当前页面在login的状态
	// stateSymbol : allowState [ 0 ],

	// 模块文件后缀配置
	moduleSuffix: ".html"
};

var paramStore = null;

/**
	configuration ( params: Object )

	Return Type:
	void

	Description:
	处理并存储配置参数

	URL doc:
	http://amaple.org/######
*/
function configuration(params) {

	if (type$1(params.baseURL) === "object") {
		foreach(defaultParams.baseURL, function (base, name) {
			if (params.baseURL.hasOwnProperty(name)) {
				base = params.baseURL[name];
				params.baseURL[name] = base.substr(0, 1) === "/" ? base : "/" + base;
				params.baseURL[name] += base.substr(-1, 1) === "/" ? "" : "/";
			} else {
				params.baseURL[name] = base;
			}
		});
	} else {
		params.baseURL = defaultParams.baseURL;
	}

	if (params.moduleSuffix) {
		params.moduleSuffix = params.moduleSuffix.substr(0, 1) === "." ? params.moduleSuffix : "." + params.moduleSuffix;
	} else {
		params.moduleSuffix = defaultParams.moduleSuffix;
	}

	// params.stateSymbol = allowState.indexOf ( params.stateSymbol ) === -1 ? allowState [ 0 ] : params.stateSymbol;

	paramStore = params;
}

extend(configuration, {

	/**
 	getConfigure ( param: String )
 		Return Type:
 	Any
 		Description:
 	根据配置名获取配置数据
 		URL doc:
 	http://amaple.org/######
 */
	getConfigure: function getConfigure(param) {
		return paramStore[param];
	}
});

var hashHistory = {
	init: function init() {
		var _this = this;

		event.on(window, "hashchange", function (e) {

			// 如果this.pushOrRepalce为true表示为跳转触发
			if (_this.pushOrReplace === true) {
				_this.pushOrReplace = false;
				return;
			}

			var locationGuide = _this.getState();
			if (!locationGuide) {
				var path = _this.getPathname(),
				    extra = {},
				    structure = Router.matchRoutes(path, extra);

				locationGuide = {
					structure: structure,
					param: extra.param,
					get: _this.getQuery(),
					post: {}
				};

				_this.saveState(locationGuide, path);
			}
			var nextStructure = locationGuide.structure.copy();

			// 更新currentPage结构体对象
			// 并根据更新后的页面结构体渲染新视图
			Structure.currentPage.update(nextStructure).render({
				nextStructure: nextStructure,
				param: locationGuide.param,
				get: locationGuide.get,
				post: locationGuide.post,
				action: "POP"
			});
		});

		return this;
	},


	/**
 	replace ( state: Any, url: String )
 	
 	Return Type:
 	void
 	
 	Description:
 	对history.replaceState方法的封装
 	
 	URL doc:
 	http://amaple.org/######
 */
	replace: function replace(state, url) {
		this.pushOrReplace = true;
		window.location.replace("#" + url);

		this.saveState(state, this.getPathname());
	},


	/**
 	push ( state: Any, url: String )
 	
 	Return Type:
 	void
 	
 	Description:
 	对history.pushState方法的封装
 	
 	URL doc:
 	http://amaple.org/######
 */
	push: function push(state, url) {
		this.pushOrReplace = true;
		window.location.hash = "#" + url;

		this.saveState(state, this.getPathname());
	},


	////////////////////////////////////
	/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
	/// 
	states: {},

	/**
 	setState ( state: Any, pathname: String )
 	
 	Return Type:
 	void
 	
 	Description:
 	保存pathname下的状态
 	
 	URL doc:
 	http://amaple.org/######
 */
	saveState: function saveState(state, pathname) {
		this.states[pathname] = state;
	},


	/**
 	getState ( pathname?: String )
 	
 	Return Type:
 	Object
 	
 	Description:
 	获取对应记录
 	
 	URL doc:
 	http://amaple.org/######
 */
	getState: function getState(pathname) {
		return this.states[pathname || this.getPathname()];
	},


	/**
 	buildURL ( path: String, mode: String )
 	
 	Return Type:
 	String
    	构建完成后的新url
 	
 	Description:
 	使用path与hash pathname构建新的pathname
        mode为true时不返回hash的开头“#”
        
    	构建规则与普通跳转的构建相同，当新path以“/”开头时则从原url的根目录开始替换，当新path不以“/”开头时，以原url最后一个“/”开始替换
 		URL doc:
 	http://amaple.org/######
 */
	buildURL: function buildURL(path, mode) {
		var rquery = /\?.*?$/;
		var host = window.location.host,
		    pathname = window.location.hash.replace(rquery, ""),
		    search = "";
		path = path.replace(/\s*http(?:s)?:\/\/(.+?\/|.+)/, function (match, rep) {
			host = rep;
			return "";
		}).replace(rquery, function (match) {
			search = match;
			return "";
		});

		if (path !== "") {
			pathname = (pathname || "#/").replace(path.substr(0, 1) === "/" ? /#(.*)$/ : /\/([^\/]*)$/, function (match, rep) {
				return match.replace(rep, "") + path;
			});
		}

		return {
			host: host,
			search: search,
			pathname: pathname.substr(0, 1) === "#" ? pathname.substr(1) : pathname
		};
	},


	/**
 	getPathname ()
 		Return Type:
 	String
 	pathname
 		Description:
 	获取pathname
 		URL doc:
 	http://amaple.org/######
 */
	getPathname: function getPathname() {
		return (window.location.hash.match(/#([^?]*)/) || ["", "/"])[1];
	},


	/**
 	getQuery ( path?: String )
  	Return Type:
 	String
 	get请求参数
  	Description:
 获取get请求参数
  	URL doc:
 	http://amaple.org/######
 */
	getQuery: function getQuery(path) {
		return ((path || window.location.hash).match(/\?(.*)$/) || [""])[0];
	},


	/**
 	correctLocation ( location: Object )
  	Return Type:
 	String
 	修正后的完整路径
  	Description:
 修正路径为HASH模式下的可用路径
  	URL doc:
 	http://amaple.org/######
 */
	correctLocation: function correctLocation(location) {
		var path = location.protocol + "//" + location.host + "/#",


		// IE下的pathname属性开头没有"/"
		pathname = (location.pathname.substr(0, 1) === "/" ? "" : "/") + location.pathname;

		if (location.search) {
			pathname += pathname.indexOf("?") > -1 ? location.search.replace("?", "&") : location.search;
		}

		return path + pathname;
	}
};

var browserHistory = {

	// window.history对象
	entity: window.history,

	init: function init() {
		var _this = this;

		event.on(window, "popstate", function (e) {
			var locationGuide = _this.getState();

			if (!locationGuide) {
				var path = window.location.pathname,
				    extra = {},
				    structure = Router.matchRoutes(path, extra);

				locationGuide = {
					structure: structure,
					param: extra.param,
					get: window.location.search,
					post: {}
				};

				_this.saveState(locationGuide, path);
			}

			// 复制一份结构对象用于更新当前结构
			// 因为更新当前结构时会改变用于更新的结构对象
			var nextStructure = locationGuide.structure.copy();

			// 更新currentPage结构体对象
			// 并根据更新后的页面结构体渲染新视图
			Structure.currentPage.update(nextStructure).render({
				nextStructure: nextStructure,
				param: locationGuide.param,
				get: locationGuide.get,
				post: locationGuide.post,
				action: "POP"
			});
		});

		return this;
	},


	/**
 	replace ( state: Any, url: String )
 	
 	Return Type:
 	void
 	
 	Description:
 	对history.replaceState方法的封装
 	
 	URL doc:
 	http://amaple.org/######
 */
	replace: function replace(state, url) {
		if (this.entity.pushState) {
			this.entity.replaceState(null, null, url);
			this.saveState(state, window.location.pathname);
		} else {
			throw envErr("history API", "浏览器不支持history新特性，您可以选择AUTO模式或HASH_BROWSER模式");
		}
	},


	/**
 push ( state: Any, url: String )
 	Return Type:
 void
 	Description:
 对history.pushState方法的封装
 	URL doc:
 http://amaple.org/######
 */
	push: function push(state, url) {
		if (this.entity.pushState) {
			this.entity.pushState(null, null, url);
			this.saveState(state, window.location.pathname);
		} else {
			throw envErr("history API", "浏览器不支持history新特性，您可以选择AUTO模式或HASH_BROWSER模式");
		}
	},


	////////////////////////////////////
	/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
	/// 
	states: {},

	/**
 	setState ( state: Any, pathname: String )
 	
 	Return Type:
 	void
 	
 	Description:
 	保存状态记录
 	
 	URL doc:
 	http://amaple.org/######
 */
	saveState: function saveState(state, pathname) {
		this.states[pathname] = state;
	},


	/**
 	getState ( pathname?: String )
 	
 	Return Type:
 	Object
 	
 	Description:
 	获取对应记录
 	
 	URL doc:
 	http://amaple.org/######
 */
	getState: function getState(pathname) {
		return this.states[pathname || window.location.pathname];
	},


	/**
 	buildURL ( path: String, mode: String )
 	
 	Return Type:
 	String
    	构建完成后的新url
 	
 	Description:
 	使用path与当前pathname构建新的pathname
        mode为true时不返回hash的开头“#”
        
    	构建规则与普通跳转的构建相同，当新path以“/”开头时则从原url的根目录开始替换，当新path不以“/”老头时，以原url最后一个“/”开始替换
 		URL doc:
 	http://amaple.org/######
 */
	buildURL: function buildURL(path) {
		var pathAnchor = document.createElement("a");
		pathAnchor.href = path;

		return {

			// IE下给a.href赋值为相对路径时，a.host为空，赋值为全域名路径时能获取值
			host: pathAnchor.host || window.location.host,

			// IE下的a标签的pathname属性开头没有"/"
			pathname: (pathAnchor.pathname.substr(0, 1) === "/" ? "" : "/") + pathAnchor.pathname,
			search: pathAnchor.search
		};
	},


	/**
 getPathname ()
 	Return Type:
 String
 pathname
 	Description:
 获取pathname
 	URL doc:
 http://amaple.org/######
 */
	getPathname: function getPathname() {
		return window.location.pathname;
	},


	/**
    	getQuery ( path?: String )
     	Return Type:
    	String
    	get请求参数对象
     	Description:
 	获取get请求参数
     	URL doc:
    	http://amaple.org/######
    */
	getQuery: function getQuery(path) {
		return path && (path.match(/\?(.*)$/) || [""])[0] || window.location.search;
	}
};

var amHistory = {

	history: null,

	initHistory: function initHistory(historyMode) {
		if (!this.history) {
			this.mode = historyMode;

			this.history = (historyMode === HASH ? hashHistory : historyMode === BROWSER ? browserHistory : { init: noop }).init();
		}
	},


	/**
 supportNewApi ()
 	Return Type:
 Boolean
 是否支持history新特性
 	Description:
 检查是否支持history新特性
 	URL doc:
 http://amaple.org/######
 */
	supportNewApi: function supportNewApi() {
		return !!window.history.pushState;
	},


	/**
 	replace ( state: Any, url: String )
 	
 	Return Type:
 	void
 	
 	Description:
 	对history.replaceState方法的封装
 	
 	URL doc:
 	http://amaple.org/######
 */
	replace: function replace(state, url) {
		if (this.history) {
			this.history.replace(state, url);
		}
	},


	/**
 	push ( state: Any, url: String )
 	
 	Return Type:
 	void
 	
 	Description:
 	对history.pushState方法的封装
 	
 	URL doc:
 	http://amaple.org/######
 */
	push: function push(state, url) {
		if (this.history) {
			this.history.push(state, url);
		}
	},


	/**
 	setState ( state: Any, pathname: String )
 	
 	Return Type:
 	void
 	
 	Description:
 	保存pathname下的状态
 	
 	URL doc:
 	http://amaple.org/######
 */
	saveState: function saveState(state, pathname) {
		this.history.saveState(state, pathname);
	},


	/**
 	getState ( pathname?: String )
 	
 	Return Type:
 	Object
 	
 	Description:
 	获取对应记录
 	
 	URL doc:
 	http://amaple.org/######
 */
	getState: function getState(pathname) {
		return this.history.getState(pathname);
	}
};

function isEnd(match) {
	return (/^}/.test(match)
	);
}

/**
	parseModuleAttr ( moduleStrng: String, parses: Object )

	Return Type:
	String
	解析后的模块字符串

	Description:
	解析出模板根节点的属性值

	URL doc:
	http://amaple.org/######
*/
function parseModuleAttr(moduleString, parses) {
	var rend = /^\s*>/,
	    rmoduleAttr = /^\s*(<module\s+)?(?:([^\s"'<>/=]+))?(?:\s*(?:=)\s*(?:"([^"]*)"|'([^']*)'))?/i;

	var attrMatch = void 0;

	parses.attrs = {};

	// 匹配出module标签内的属性
	while (!rend.test(moduleString)) {
		attrMatch = rmoduleAttr.exec(moduleString);
		if (attrMatch && attrMatch[2]) {
			parses.attrs[attrMatch[2]] = attrMatch[3] || attrMatch[4] || "";
			moduleString = moduleString.substr(attrMatch[0].length);
		} else {
			break;
		}
	}

	return moduleString;
}

/**
	parseTemplate ( moduleString: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板内容

	URL doc:
	http://amaple.org/######
*/
function parseTemplate(moduleString, parses) {
	var rtemplate = /<template>([\s\S]+)<\/template>/i,
	    viewMatch = rtemplate.exec(moduleString);

	var view = void 0;
	if (viewMatch) {
		moduleString = moduleString.replace(viewMatch[0], "");
		view = (viewMatch[1] || "").trim();

		// 去除所有标签间的空格
		parses.view = trimHTML(view);
	}

	return moduleString;
}

/**
	removeCssBlank ( css: String )

	Return Type:
	String
	处理后的css字符串

	Description:
	移除css空白符

	URL doc:
	http://amaple.org/######
*/
function removeCssBlank(css) {
	var rstyleblank = /(>\s*|\s*[{:;}]\s*|\s*<)/g;
	return css.replace(rstyleblank, function (match) {
		return match.replace(/\s+/g, "");
	});
}

/**
	parseSiblingCss ( css: String )

	Return Type:
	Array
	解析后的CSS AST数组

	Description:
	解析单层CSS样式
	当碰到@media时，将会递归调用此函数

	URL doc:
	http://amaple.org/######
*/

function parseSiblingCss(css) {
	var styles = [],
	    rselector = /[^/@{}]+?/,
	    rkeyframes = /@(?:-\w+-)?keyframes\s+\w+/,
	    rmedia = /@media.*?/,
	    rcssparser = new RegExp("\\s*(?:(" + rselector.source + "|" + rkeyframes.source + "|" + rmedia.source + ")\\s*{([\\s\\S]+?)}|})", "g");

	var selectorItem = {},
	    atContext = "",
	    hierarchy = 0;

	try {
		css.replace(rcssparser, function (match, selector, content) {
			if (!atContext) {
				content = content.trim();

				// css选择器为普通选择器时
				if (new RegExp("^" + rselector.source).test(selector)) {
					styles.push({
						selector: selector,
						content: removeCssBlank(content)
					});
				}

				// css选择器为@keyframes或@media时
				else {
						if (rkeyframes.test(selector)) {
							atContext = "keyframes";
						} else if (rmedia.test(selector)) {
							atContext = "media";
						}

						styles.push(selectorItem);
						selectorItem.selector = selector;
						selectorItem.content = removeCssBlank(content + "}");
					}
			} else {
				match = match.trim();
				if (isEnd(match)) {
					if (hierarchy > 0) {
						selectorItem.content += match;
						hierarchy--;
					} else {

						// 当css项为@media时，需对它的内部选择器做范围样式的处理
						if (/media/.test(atContext)) {
							selectorItem.content = parseSiblingCss(selectorItem.content);
						}
						atContext = "";
						selectorItem = {};
					}
					return "";
				}

				// 表示层次，当层级为内层时遇到结束符将不会结束
				if (new RegExp(rkeyframes.source + "|" + rmedia.source).test(selector)) {
					hierarchy++;
				}
				selectorItem.content += removeCssBlank(match);
			}
		});
	} catch (e) {
		throw moduleErr("css-parse", "css解析错误，请检查模块css并确保其语法完全正确");
	}

	return styles;
}

/**
	parseStyle ( moduleString: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板样式

	URL doc:
	http://amaple.org/######
*/
function parseStyle(moduleString, parses) {

	var rstyle = /<style(?:.*?)>([\s\S]*)<\/style>/i,
	    risScoped = /^<style(?:.*?)scoped(?:.*?)/i,
	    rcssComment = /\/\*([\s\S]*?)\*\//g,
	    styleMatch = rstyle.exec(moduleString);

	if (styleMatch) {
		moduleString = moduleString.replace(styleMatch[0], "");

		var style = void 0;
		if (risScoped.test(styleMatch[0])) {
			style = (styleMatch[1] || "").trim().replace(rcssComment, "");

			// 解析每个css项并保存到parsers.style中
			parses.style = parseSiblingCss(style);
		} else {

			// 去除所有标签间的空格
			parses.style = removeCssBlank(styleMatch[1]).trim();
		}
	} else {
		parses.style = "";
	}

	return moduleString;
}

/**
	parseScript ( moduleString: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板脚本

	URL doc:
	http://amaple.org/######
*/
function parseScript(moduleString, scriptPaths, scriptNames, parses) {

	var rscript = /<script(?:.*?)>([\s\S]+)<\/script>/i,
	    rscriptComment = /\/\/(.*?)\r?\n|\/\*([\s\S]*?)\*\//g,
	    rimport = /\s*(?:(?:(?:var|let|const)\s+)?(.+?)\s*=\s*)?import\s*\(\s*["'](.*?)["']\s*\)(?:\s*[,;])?/g,
	    rcomponent = /\s*(?:(?:(?:var|let|const)\s+)?(.+?)\s*=\s*)?am\s*\.\s*class\s*\(\s*["'`].+?["'`]\s*\)\s*\.\s*extends\s*\(\s*am\s*\.\s*Component\s*\)/,
	    rhtmlComment = /<!--(.*?)-->/g,
	    rnewModule = /new\s*am\s*\.\s*Module\s*\(/,
	    rmoduleDef = new RegExp(rnewModule.source + "\\s*([^\\s)]+)?"),


	// 匹配模块生命周期对象为实体
	rlifeCycleEntity = new RegExp(rnewModule.source + "\\s*{"),


	// 匹配模块生命周期对象为一个变量或为空
	rlifeCycleVarOrEmpty = new RegExp(rnewModule.source + "\\s*(.*)?\\s*\\)"),
	    scriptMatch = rscript.exec(moduleString);

	if (scriptMatch) {
		var matchScript = (scriptMatch[1] || "").replace(rscriptComment, function (match) {
			return "";
		});

		// 获取import的script
		parses.script = matchScript.replace(rimport, function (match, scriptName, scriptPath) {
			if (!scriptName) {
				throw moduleErr("import", "import(\"" + scriptPath + "\")\u8FD4\u56DE\u7684\u7EC4\u4EF6\u884D\u751F\u7C7B\u9700\u88AB\u4E00\u4E2A\u53D8\u91CF\u63A5\u6536\uFF0C\u5426\u5219\u53EF\u80FD\u56E0\u83B7\u53D6\u4E0D\u5230\u6B64\u7EC4\u4EF6\u800C\u5BFC\u81F4\u6267\u884C\u51FA\u9519");
			}
			// scripts [ scriptName ] = scriptPath;
			scriptNames.import.push(scriptName);
			scriptPaths.push(scriptPath);
			return "";
		}).trim();

		parses.script = parses.script.replace(rcomponent, function (match, rep) {
			scriptNames.native.push(rep);
			return match.replace(rep, rep + "=window." + rep);
		});

		// 如果有引入组件则将组件传入new am.Module中
		var allScriptNames = scriptNames.native.concat(scriptNames.import);
		if (!isEmpty(allScriptNames)) {

			// 去掉注释的html的代码
			var matchView = parses.view.replace(rhtmlComment, function (match) {
				return "";
			});
			var deps = [];
			foreach(allScriptNames, function (name) {

				// 只有在view中有使用的component才会被此module依赖
				if (new RegExp("<\s*" + transformCompName(name, true)).test(matchView)) {
					deps.push(name);
				}
			});

			// 需要组件时才将组件添加到对应模块中
			if (!isEmpty(deps)) {
				var depString = "depComponents:[" + deps.join(",") + "]";
				var lifeCycleMatch = void 0;
				if (lifeCycleMatch = parses.script.match(rlifeCycleEntity)) {
					parses.script = parses.script.replace(lifeCycleMatch[0], function (match) {
						return match + depString + ",";
					});
				} else if (lifeCycleMatch = parses.script.match(rlifeCycleVarOrEmpty)) {
					if (lifeCycleMatch[1]) {
						parses.script = parses.script.replace(rlifeCycleVarOrEmpty, function (match, rep) {
							return match.replace(rep, "args.extend(" + rep + ", {" + depString + "})");
						});
					} else {
						parses.script = parses.script.replace(rnewModule, function (match) {
							return match + "{" + depString + "}";
						});
					}
				}
			}
		}

		parses.script = parses.script.replace(rmoduleDef, function (match, rep) {
			if (rep) {

				// 适用于“new am.Module ( {...} )”的moduleNode增加
				return match.replace(rep, "args.moduleNode," + rep);
			} else {

				// 适用于“new am.Module ()”的moduleNode增加
				return match + "args.moduleNode";
			}
		});
	} else {
		parses.script = "";
	}

	return moduleString;
}

/**
	compileModule ( moduleString: String )

	Return Type:
	Function

	Description:
	编译模块为可执行的编译函数

	URL doc:
	http://amaple.org/######
*/
function compileModule(moduleString) {

	// 模块编译正则表达式
	var rmodule = /<module[\s\S]+<\/module>/i,
	    scopedCssObject = {};

	var title = "",
	    moduleFragment = void 0;
	if (rmodule.test(moduleString)) {

		var parses = {},
		    scriptNames = { native: [], import: [] },
		    scriptPaths = [];

		// 解析出Module标签内的属性
		moduleString = parseModuleAttr(moduleString, parses);

		// 解析模板
		moduleString = parseTemplate(moduleString, parses);
		title = parses.attrs[amAttr.title] || "";

		// 解析样式
		moduleString = parseStyle(moduleString, parses);

		// 解析js脚本
		moduleString = parseScript(moduleString, scriptPaths, scriptNames, parses);

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 检查参数
		check(parses.view).notBe("").ifNot("module:template", "<module>内的<template>为必须子元素，它的内部DOM tree代表模块的页面布局").do();

		check(parses.script).notBe("").ifNot("module:script", "<module>内的<script>为必须子元素，它的内部js代码用于初始化模块的页面布局").do();

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 编译局部样式
		moduleFragment = stringToVNode(parses.view, parses.style, scopedCssObject);

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 构造编译函数
		var buildView = "args.signCurrentRender();\n\t\t\tvar nt=new args.NodeTransaction().start ();\n\t\t\tnt.collect(args.moduleNode);\n\t\t\targs.moduleNode.html(args.moduleFragment);";
		moduleString = "";
		if (!isEmpty(scriptPaths)) {
			var addToWindow = "",
			    delFromWindow = "";
			foreach(scriptNames.import, function (name) {
				addToWindow += "window." + name + "=" + name + ";";
			});
			foreach(scriptNames.native.concat(scriptNames.import), function (name) {
				delFromWindow += "delete window." + name + ";";
			});

			var componentBaseURL = configuration.getConfigure("baseURL").component;
			foreach(scriptPaths, function (path, i) {
				scriptPaths[i] = "\"" + (componentBaseURL + path) + "\"";
			});

			moduleString += "args.require([" + scriptPaths.join(",") + "],function(" + scriptNames.import.join(",") + "){\n\t\t\t\t" + addToWindow + "\n\t\t\t\t" + buildView + "\n\t\t\t\t" + parses.script + ";\n\t\t\t\t" + delFromWindow + "\n\t\t\t\targs.end();\n\t\t\t}," + TYPE_COMPONENT + ");";
		} else {
			moduleString += buildView + "\n\t\t\t" + parses.script + ";\n\t\t\targs.end();";
		}
	}

	var updateFn = new Function("am", "args", moduleString);
	updateFn.moduleFragment = moduleFragment;
	return { updateFn: updateFn, title: title, scopedCssObject: scopedCssObject };
}

// Promise的三种状态定义
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

/**
	Plugin Promise

	Description:
	Promose实现类，用于以同步的方式去执行回调函数，而不用将回调函数传入执行函数中，更加符合逻辑，且在需要执行多重回调处理时，以链式结构来表示函数处理后的回调
	此类创建的对象，主要有then()、done()、fail()、always()方法
	此实现类符合Promises/A+规范。

	eg:
	1、var p = new Promise(function(resolve, reject) {
			if(success) {
				resolve(value);
			}
			else if(fail) {
				reject(reason);
			}
	});

	p.then(function(value) {
			// do success callback...
		}, function(reason) {
			// do fail callback...
		});

	2. 创建Promise对象如同1
	var p1 = p.then(function(value) {
			// do success callback...
			return new Promise(function(resolve, reject) {
				if(success) {
			 		resolve(value);
			   }
			   else if(fail) {
				  reject(reason);
			   }
		    });
		}, function(reason) {
			// do fail callback...
		});
		
		p1.then(function(value) {
			// do success callback...
		}, function(reason) {
			// do fail callback...
		});

	// 如此这样以链式结构的方式来实现多重回调...

	Promise原理：Promise相当于一个方法的状态机，来管理拥有回调的函数执行。Promise拥有三种状态，分别为Pending、Fulfilled、Rejected，
	Pending：待发生状态，即待命状态
	Fulfilled：成功状态，当状态为Fulfilled时，将会触发成功回调
	Rejected：失败状态，当状态为Rejected时，将会触发失败回调
	Fulfilled和Rejected状态都只能由Pending状态改变过来，且不可逆
	
	如上例子，Promose内部定义有三个最重要的方法，分别为then()、resolve()、reject()。
	then方法用于回调函数的绑定
	resolve方法用于在成功时的回调，它将修改当前Promise对象为Fulfilled状态并执行then方法绑定的成功回调函数
	reject方法用于在失败时的回调，它将修改当前Promise对象为Rejected状态并执行then方法绑定的失败回调函数
	
	第一重函数处理：在创建Promise对象时将会执行第一重处理函数（有回调函数的函数）并将回调函数设为修改此Promise对象状态的函数，也就是resolve和reject方法，然后使用then方法将回调函数绑定到此Promise对象上，当第一重处理函数的回调函数执行时，也就是执行resolve或reject函数时，将会修改当前Promise对象的状态，并执行对应的绑定函数，如果没有绑定回调函数，则这两个方法只改变此Promise对象的状态。
	第二重函数处理时：then方法将返回一个新创建的Promise对象作为第二重回调函数执行的代理对象，在第二次调用then方法时其实是将第二重处理函数的回调函数绑定在了此代理对象上。then方法中有对传入的回调函数（onFulfilled和onRejected）进行封装，以致于能够获取到回调函数的返回值，并判断当回调函数返回值为一个thenable对象时（thenable对象是拥有then方法的对象），则通知Promise代理对象去执行第二重的回调函数，是通过回调函数返回的thenable对象去调用then方法绑定回调函数，此回调函数的内容为通知代理对象执行回调函数做到的
	以此类推第三重、第四重...

	URL doc:
	http://amaple.org/######
*/
function Promise(resolver) {

	// 判断resolver是否为处理函数体
	check(resolver).type("function").ifNot("function Promise", "构造函数需传入一个函数参数").do();

	// 预定义的Promise对象对应的处理函数体信息
	var resolveArgs = void 0,
	    rejectArgs = void 0,
	    state = PENDING,
	    handlers = [];

	/**
 	resolve ( arg1?: any, arg2?: any ... )
 
 	Return Type:
 	void
 
 	Description:
 	改变Promise对象的状态为Fulfilled并执行promise.handlers数组中所有的onFulfilled方法
 	此方法用于执行成功时的回调绑定
 	see Promise注释
 
 	URL doc:
 	http://amaple.org/######
 */
	function resolve() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		if (state === PENDING) {
			state = FULFILLED;
			resolveArgs = args;

			foreach(handlers, function (handler) {
				(handler.onFulfilled || noop).apply(null, args);
			});
		}
	}

	/**
 	reject ( arg1?: any, arg2?: any ... )
 
 	Return Type:
 	void
 
 	Description:
 	改变Promise对象的状态为Rejected并执行promise.handlers数组中所有的onRejected方法
 	此方法用于执行失败时的回调绑定
 	see Promise注释
 
 	URL doc:
 	http://amaple.org/######
 */
	function reject() {
		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		if (state === PENDING) {
			state = REJECTED;
			rejectArgs = args;

			foreach(handlers, function (handler) {
				(handler.onRejected || noop).apply(null, args);
			});
		}
	}

	/**
 	handler ( handler: Object )
 
 	Return Type:
 	void
 
 	Description:
 	根据Promise对象来对回调函数做出相应处理
 	当状态为Pending时，将回调函数保存于promise.handlers数组中待调用
 	当状态为Fulfilled时，执行onFulfilled方法
 	当状态为Rejected时，执行onRejected方法
 
 	URL doc:
 	http://amaple.org/######
 */
	this.handle = function (handler) {
		if (state === PENDING) {
			handlers.push(handler);
		} else if (state === FULFILLED) {
			(handler.onFulfilled || noop).apply(null, resolveArgs);
		} else if (state === REJECTED) {
			(handler.onRejected || noop).apply(null, rejectArgs);
		}
	};

	resolver(resolve, reject);
}

// Promise原型对象
extend(Promise.prototype, {

	/**
 	then ( onFulfilled: Function, onRejected: Function )
 
 	Return Type:
 	Object
 	新创建的Promise代理对象
 
 	Description:
 	Promise的主要方法之一，用于绑定或执行处理函数的回调函数，当成功时的回调函数返回值为thenable对象，则通知代理Promise对象执行回调函数
 	see Promise注释
 
 	URL doc:
 	http://amaple.org/######
 */
	then: function then(_onFulfilled, _onRejected) {
		var _this = this;

		return new Promise(function (resolve, reject) {
			_this.handle({
				onFulfilled: function onFulfilled() {
					for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
						args[_key3] = arguments[_key3];
					}

					var result = type$1(_onFulfilled) === "function" && _onFulfilled.apply(null, args) || args;
					if (Promise.isThenable(result)) {
						result.then(function () {
							for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
								args[_key4] = arguments[_key4];
							}

							resolve.apply(null, args);
						}, function () {
							for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
								args[_key5] = arguments[_key5];
							}

							reject.apply(null, args);
						});
					}
				},
				onRejected: function onRejected() {
					for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
						args[_key6] = arguments[_key6];
					}

					(type$1(_onRejected) === "function" ? _onRejected : noop).apply(null, args);
				}
			});
		});
	},


	/**
 	done ( onFulfilled: Function )
 
 	Return Type:
 	Object
 	当前Promise对象
 
 	Description:
 	成功时的回调函数绑定
 
 	URL doc:
 	http://amaple.org/######
 */
	done: function done(onFulfilled) {
		this.handle({ onFulfilled: onFulfilled });
		return this;
	},


	/**
 	fail ( onRejected: Function )
 
 	Return Type:
 	Object
 	当前Promise对象
 	
 	Description:
 	失败时的回调函数绑定
 
 	URL doc:
 	http://amaple.org/######
 */
	fail: function fail(onRejected) {
		this.handle({ onRejected: onRejected });
		return this;
	},


	/**
 	always ( callback: Function )
 
 	Return Type:
 	Object
 	当前Promise对象
 
 	Description:
 	绑定执行函数成功或失败时的回调函数，即不管执行函数成功与失败，都将调用此方法绑定的回调函数
 
 	URL doc:
 	http://amaple.org/######
 */
	always: function always(callback) {
		this.handle({
			onFulfilled: callback,
			onRejected: callback
		});

		return this;
	}
});

extend(Promise, {

	/**
 	when ( promise1: Object, promise2?: Object, promise3?: Object ... )
 
 	Return Type:
 	void
 
 	Description:
 	存储准备调用的promise对象，用于多个异步请求并发协作时使用。
 	此函数会等待传入的promise对象的状态发生变化再做具体的处理
 	传入参数为不定个数Promise的对象
 
 	URL doc:
 	http://amaple.org/######
 */
	when: function when() {},


	/**
 	isThenable ( value: Object|Function )
 
 	Return Type:
 	Boolean
 	是thenable对象返回true，否则返回false
 
 	Description:
 	用于判断对象是否为thenable对象（即是否包含then方法）
 
 	URL doc:
 	http://amaple.org/######
 */
	isThenable: function isThenable(value) {
		var t = type$1(value);
		if (value && (t === "object" || t === "function")) {
			var then = value.then;
			if (type$1(then) === "function") {
				return true;
			}
		}

		return false;
	}
});

var rheader = /^(.*?):[ \t]*([^\r\n]*)$/mg;

function AmXMLHttpRequest() {

	// 请求传送器，根据不同的请求类型来选择不同的传送器进行请求
	this.transport = null;
}

extend(AmXMLHttpRequest.prototype, {

	/**
 	setRequestHeader ( header: String, value: String )
 
 	Return Type:
 	void
 
 	Description:
 	设置请求头
 
 	URL doc:
 	http://amaple.org/######
 */
	setRequestHeader: function setRequestHeader(header, value) {
		if (!this.transport.completed) {
			this.transport.headers = this.transport.headers || {};
			this.transport.headers[header.toLowerCase()] = value;
		}
	},


	/**
 	getRequestHeader ( header: String )
 
 	Return Type:
 	String
 	对应返回头信息
 
 	Description:
 	获取返回头信息
 
 	URL doc:
 	http://amaple.org/######
 */
	getResponseHeader: function getResponseHeader(header) {

		var match = void 0;

		if (this.transport.completed) {
			if (!this.transport.respohseHeader) {
				this.transport.respohseHeader = {};
				while (match = rheader.exec(this.transport.responseHeadersString || "")) {
					this.transport.respohseHeader[match[1].toLowerCase()] = match[2];
				}
			}

			match = this.transport.responseHeader[header];
		}

		return match || null;
	},


	/**
 	getAllResponseHeaders ()
 
 	Return Type:
 	String
 	所有返回头信息
 
 	Description:
 	获取所有返回头信息
 
 	URL doc:
 	http://amaple.org/######
 */
	getAllResponseHeaders: function getAllResponseHeaders() {
		return this.transport.completed ? this.transport.responseHeadersString : null;
	},


	/**
 	overrideMimeType ( mimetype: String )
 
 	Return Type:
 	void
 
 	Description:
 	设置mimeType
 
 	URL doc:
 	http://amaple.org/######
 */
	overrideMimeType: function overrideMimeType(mimetype) {
		if (!this.transport.completed) {
			options.mimetype = mimetype;
		}
	},


	/**
 	abort ( statusText: String )
 
 	Return Type:
 	void
 
 	Description:
 	触发请求中断
 
 	URL doc:
 	http://amaple.org/######
 */
	abort: function abort(statusText) {
		if (this.transport) {
			this.transport.abortText = statusText || "abort";
			this.transport.abort();
		}
	},


	/**
 	addEventListener ( type: String, callback: Function )
 
 	Return Type:
 	void
 
 	Description:
 	绑定xhr回调事件
 
 	URL doc:
 	http://amaple.org/######
 */
	addEventListener: function addEventListener(type, callback) {
		if (!this.transport.completed) {
			this.transport.callbacks = this.transport.callbacks || {};
			this.transport.callbacks[type] = callback || noop;
		}
	}
});

function text (text) {
	return text;
}

function json (text) {
	return type$1(text) === "object" ? text : JSON.parse(text);
}

function script (text) {
	scriptEval(text);
}

// ajax返回数据转换器
var ajaxConverters = { text: text, json: json, script: script };

/**
    complete ( amXHR: Object )

    Return Type:
    void

    Description:
    请求回调调用

    URL doc:
    http://amaple.org/######
*/
function complete(amXHR) {

	var transport = amXHR.transport;

	if (transport.completed) {
		return;
	}

	transport.completed = true;

	// 如果存在计时ID，则清除此
	if (transport.timeoutID) {
		window.clearTimeout(transport.timeoutID);
	}

	// 如果解析错误也会报错，并调用error
	if (transport.response) {
		try {
			transport.response = ajaxConverters[transport.dataType] && ajaxConverters[transport.dataType](transport.response);
		} catch (e) {
			transport.status = 500;
			transport.statusText = "Parse Error: " + e;
		}
	}

	// 请求成功，调用成功回调，dataType为script时不执行成功回调
	if ((transport.status >= 200 && transport.status < 300 || transport.status === 304) && transport.dataType !== "script") {
		transport.callbacks.success(transport.response, transport.status, transport.statusText, amXHR);
	}

	// 请求错误调用error回调
	else if (transport.status === 404 || transport.status === 500) {
			transport.callbacks.error(amXHR, transport.status, transport.statusText);
		}

	// 调用complete回调
	transport.callbacks.complete(amXHR, transport.statusText);
}

function xhr$1 () {

	return {

		/**
  	send ( options: Object, amXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	ajax请求前设置参数，并发送请求
  
  	URL doc:
  	http://amaple.org/######
  */
		send: function send(options, amXHR) {

			var i = void 0,
			    self = this,


			// 获取xhr对象
			xhr = this.xhr = function () {
				try {
					return new XMLHttpRequest();
				} catch (e) {}
			}();

			if (options.crossDomain && !"withCredentials" in xhr) {
				throw requestErr("crossDomain", "该浏览器不支持跨域请求");
			}

			xhr.open(options.method, options.url, options.async, options.username, options.password);

			// 覆盖原有的mimeType
			if (options.mimeType && xhr.overrideMimeType) {
				xhr.overrideMimeType(options.mimeType);
			}

			xhr.setRequestHeader("X-Requested-With", "XMLHTTPRequest");
			foreach(this.headers, function (header, key) {
				xhr.setRequestHeader(key, header);
			});

			// 绑定请求中断回调
			if (type$1(options.abort) === "function" && event.support("abort", xhr)) {
				xhr.onabort = function () {
					options.abort(this.statusText);
				};
			}

			if (event.support("error", xhr)) {
				xhr.onload = xhr.onerror = function (e) {

					amXHR.transport.status = xhr.status === 1223 ? 204 : xhr.status;

					self.done(amXHR);
				};
			} else {
				xhr.onreadystatechange = function () {
					if (xhr.readyState === XMLHttpRequest.DONE) {

						// 兼容IE有时将204状态变为1223的问题
						amXHR.transport.status = xhr.status === 1223 ? 204 : xhr.status;

						self.done(amXHR);
					}
				};
			}

			// 发送请求
			try {
				xhr.send(options.hasContent && options.data || null);
			} catch (e) {
				throw requestErr("send", e);
			}
		},


		/**
  	done ( amXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	ajax请求完成后的处理
  
  	URL doc:
  	http://amaple.org/######
  */
		done: function done(amXHR) {

			var xhr = this.xhr;

			xhr.onload = xhr.onerror = xhr.onreadystatechange = null;

			// 获取所有返回头信息
			this.responseHeadersString = xhr.getAllResponseHeaders();

			this.status = xhr.status;
			this.statusText = xhr.statusText;
			this.response = xhr.responseText;

			complete(amXHR);
		},


		/**
  	abort ()
  
  	Return Type:
  	void
  
  	Description:
  	ajax请求中断
  
  	URL doc:
  	http://amaple.org/######
  */
		abort: function abort() {
			this.status = 0;
			this.statusText = this.abortText;

			xhr.abort && xhr.abort();
		}
	};
}

// 动态执行script
function script$1 (options) {

	var script = void 0;

	return {

		/**
  	send ( options: Object, amXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	动态执行javascript
  
  	URL doc:
  	http://amaple.org/######
  */
		send: function send(options, amXHR) {
			var self = this;

			script = document.createElement("script");
			script.src = options.url;

			event.on(script, "load error", function (e) {

				if (script.parentNode) {
					script.parentNode.removeChild(script);
				}

				if (e.type === "load") {
					this.status = 200;
					this.statusText = "success";
				} else {
					this.status = 500;
					this.statusText = "error";
				}
				self.done(amXHR);
			});

			document.head.appendChild(script);
		},


		/**
  	done ( amXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	完成或中断后的处理
  
  	URL doc:
  	http://amaple.org/######
  */
		done: function done(amXHR) {

			if (options.dataType === "JSONP") {

				dataType = "json";

				if (type(window[options.jsonpCallback]) !== "function") {
					this.status = 200;
					this.statusText = "success";
					this.response = window[options.jsonpCallback];
				} else {
					this.status = 500;
					this.statusText = "error";
				}
			}

			complete(amXHR);
		},


		/**
  	abort ()
  
  	Return Type:
  	void
  
  	Description:
  	请求中断处理
  
  	URL doc:
  	http://amaple.org/######
  */
		abort: function abort() {
			if (script.parentNode) {
				script.parentNode.removeChild(script);
			}

			this.status = 0;
			this.statusText = this.abortText;

			type(options.abort) === "function" && options.abort(this.statusText);
		}
	};
}

// jsonp跨域请求
function jsonp (options) {

	var scriptExtend = script$1(options),
	    jsonpCallback = options.jsonpCallback = "jsonpCallback" + Date.now();

	window[jsonpCallback] = function (result) {
		window[jsonpCallback] = result;
	};

	options.data += (options.data ? "&" : "") + "callback=" + jsonpCallback;

	return {
		send: function send(options, amXHR) {
			scriptExtend.send(options, amXHR);
		},
		done: function done(amXHR) {
			scriptExtend.done(amXHR);
		},
		abort: function abort() {
			scriptExtend.abort();
		}
	};
}

// 文件异步上传传送器，在不支持FormData的旧版本浏览器中使用iframe刷新的方法模拟异步上传
function upload () {

	var uploadFrame = document.createElement("iframe"),
	    id = "upload-iframe-unique-" + guid();

	attr(uploadFrame, {
		id: id,
		name: id
	});
	uploadFrame.style.position = "absolute";
	uploadFrame.style.top = "9999px";
	uploadFrame.style.left = "9999px";
	(document.body || document.documentElement).appendChild(uploadFrame);

	return {

		/**
  	send ( options: Object, amXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	文件上传请求，在不支持FormData进行文件上传的时候会使用此方法来实现异步上传
   	此方法使用iframe来模拟异步上传
  
  	URL doc:
  	http://amaple.org/######
  */
		send: function send(options, amXHR) {
			var self = this,


			// 备份上传form元素的原有属性，当form提交后再使用备份还原属性
			backup = {
				action: options.data.action || "",
				method: options.data.method || "",
				enctypt: options.data.enctypt || "",
				target: options.data.target || ""
			};

			// 绑定回调
			event.on(uploadFrame, "load", function () {
				self.done(amXHR);
			}, false, true);

			// 设置form的上传属性
			attr(options.data, {
				action: options.url,
				method: "POST",
				target: id
			});

			// 当表单没有设置enctype时自行加上，此时需设置encoding为multipart/form-data才有效
			if (attr(options.data, "enctypt") !== "multipart/form-data") {
				options.data.encoding = "multipart/form-data";
			}

			options.data.submit();

			// 还原form备份参数
			foreach(backup, function (val, attribute) {
				if (val) {
					attr(options.data, attribute, val);
				} else {
					// 移除attribute属性
					attr(options.data, attribute, null);
				}
			});
		},


		/**
  	done ( amXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	上传完成的处理，主要工作是获取返回数据，移除iframe
  
  	URL doc:
  	http://amaple.org/######
  */
		done: function done(amXHR) {

			// 获取返回数据
			var child = void 0,
			    entity = void 0,
			    doc = uploadFrame.contentWindow.document;
			if (doc.body) {

				this.status = 200;
				this.statusText = "success";

				// 当mimeType为 text/javascript或application/javascript时，浏览器会将内容放在pre标签中
				if ((child = doc.body.firstChild) && child.nodeName.toUpperCase() === "PRE" && child.firstChild) {
					this.response = child.innerHTML;
				} else {
					this.response = doc.body.innerHTML;
				}

				// 如果response中包含转义符，则将它们转换为普通字符
				if (/&\S+;/.test(this.response)) {
					entity = {
						lt: "<",
						gt: ">",
						nbsp: " ",
						amp: "&",
						quot: "\""
					};
					this.response = this.response.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
						return entity[t];
					});
				}
			}

			complete(amXHR);

			// 移除iframe
			uploadFrame.parentNode.removeChild(uploadFrame);
		},


		/**
  	abort ()
  
  	Return Type:
  	void
  
  	Description:
  	请求中断处理，此时无法中断
  
  	URL doc:
  	http://amaple.org/######
  */
		abort: function abort() {}
	};
}

/**
	Plugin http
	( method: String )

	Description:
	ajax请求外层包裹函数，该函数返回ajax具体实现的函数（以下简称此返回的函数为ajax函数）
	ajax函数传入的参数与默认参数进行合并操作（开发者参数没有定义的将使用默认参数）
	defaultOptions = 
	{
		method 			: "GET",		// 请求类型，默认为GET，可设置参数为{GET/POST}
	  	url 			: "",			// 请求地址，默认为空
	  	data 			: "",     		// 请求参数，默认为空
	   	async 			: true,			// 是否异步请求，默认为异步，可设置参数为{true/false}
	   	cache 			: true,			// 开启缓存，默认开启，可设置参数为{true/false}
	   	contentType 	: "application/x-www-form-urlencoded; charset=UTF-8",  // 请求为post时设置的Content-Type，一般传入此参数
	   	dataType 		: "TEXT"		// 返回的数据类型，默认文本，可设置参数为{TEXT/JSON/SCRIPT/JSONP}
	}
	此外层包裹方法定义了许多仅供ajax函数使用的内部固定变量，只需编译一次且只能由ajax函数访问即可，所以使用了外层包裹的方式来设计此函数，http中的request、get、post方法调用此外层包裹方法并传入不同参数来获取对应的ajax函数

	URL doc:
	http://amaple.org/######
*/
function request(method) {

	var
	// 相关正则表达式
	r20 = /%20/g,
	    rhash = /#.*$/,
	    rts = /([?&])_=[^&]*/,
	    rquery = /\?/,
	    rnoContent = /^(?:GET|HEAD)$/,


	// ajax支持的返回类型正则表达式
	rtype = /^(?:TEXT|JSON|SCRIPT|JSONP)$/,
	    accepts = {
		"*": ["*/"] + ["*"], // 避免被压缩
		text: "text/plain",
		html: "text/html",
		xml: "application/xml, text/xml",
		json: "application/json, text/javascript"
	},


	// 默认参数对象初始化
	// ajax默认参数对象初始化
	defaultOptions = {
		method: "GET",
		url: "",
		data: "",
		async: true,
		cache: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		dataType: "TEXT",
		headers: {}
	},


	// 返回合并后的参数对象，参数对象的合并根据http.get、http.post、http.request请求方法进行区分
	extendOptions = function (method) {

		return function (options) {

			// request请求时，参数肯定是一个对象，直接返回
			if (method) {

				var _url = options[0],
				    data = options[1],
				    _callback = options[2],
				    _dataType = options[3];

				// 纠正参数
				// 1、如果没有传入data，则将callback的值给dataType，将data的值给callback，data设为undefined，
				// 2、如果没有传入data和dataType，将data的值给callback，data设为undefined
				correctParam(data, _callback, _dataType).to([/=/, "object"], "function", rtype).done(function () {
					data = this.$1;
					_callback = this.$2;
					_dataType = this.$3;
				});

				// get请求参数初始化
				params = { url: _url, data: data, success: _callback, dataType: _dataType, method: method };
			} else {
				params = options[0];
			}

			// 合并参数
			return extend({}, defaultOptions, params);
		};
	}(method),


	//////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////
	// ajax传送器，根据数据类型
	ajaxTransports = { xhr: xhr$1, script: script$1, jsonp: jsonp, upload: upload };

	var // GET、POST时的默认参数
	url = void 0,
	    args = void 0,
	    callback = void 0,
	    dataType = void 0,
	    transportName = void 0,
	    params = void 0,
	    nohashUrl = void 0,
	    hash = void 0;

	/**
 	[anonymous] ()
 
 	Return Type:
 	Object
 	Promise对象
 
 	Description:
 	ajax异步请求方法实现
 
 	URL doc:
 	http://amaple.org/######
 */
	return function () {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		var // 合并参数
		options = extendOptions(args),
		    data = options.data,


		// 自定义xhr对象，用于统一处理兼容问题
		amXHR = new AmXMLHttpRequest();

		// 如果传入的data参数为数据对象，则将{k1: v1, k2: v2}转为以k1=v1&k2=v2
		if (type$1(data) === "object") {

			// 判断是否为表单对象
			// 如果是则使用FormData来提交
			// 如果不支持FormData对象，则判断是否包含上传信息，如果不包含则将参数序列化出来post提交，如果包含，则使用iframe刷新的方法实现
			if (data.nodeName && data.nodeName.toUpperCase() === "FORM") {

				// 如果是表单对象则获取表单的提交方式，默认为POST
				options.method = attr(data, "method") || "POST";

				// 当data为form对象时，如果也提供了src参数则优先使用src参数
				options.url = attr(data, "src") || options.url;

				// 如果支持FormData则使用此对象进行数据提交
				try {
					options.data = new FormData(data);
				} catch (e) {

					var hasFile = void 0;

					// 判断表单中是否含有上传文件
					foreach(data.elements.slice(), function (inputItem) {
						if (inputItem.type === "file") {
							hasFile = true;
							return false;
						}
					});

					if (!hasFile) {

						// 如果表单中不包含上传文件，则序列化表单数据以供xhr提交
						options.data = serialize(data);
					}
				}
			}

			if (isPlainObject(options.data)) {
				var _args = [];
				foreach(options.data, function (_data, index) {
					_args.push(index + "=" + _data);
				});

				options.data = _args.join("&");
			}
		}

		// 将method字符串转为大写以统一字符串为大写，以便下面判断
		// 再将统一后的method传入查看是不是POST提交
		options.hasContent = !rnoContent.test(options.method = options.method.toUpperCase());

		// 将dataType字符串转为大写
		// 如传入的dataType不符合rtype定义的，则默认为TEXT
		options.dataType = rtype.test(options.dataType = (options.dataType || "").toUpperCase()) ? options.dataType : "TEXT";

		// 修正timeout参数
		options.timeout = options.timeout > 0 ? options.timeout : 0;

		// 是否跨域
		if (!options.crossDomain) {
			var originAnchor = document.createElement("a"),
			    urlAnchor = document.createElement("a");

			originAnchor.href = location.href;
			urlAnchor.href = options.url;
			try {
				options.crossDomain = originAnchor.protocol + "//" + originAnchor.host !== urlAnchor.protocol + "//" + urlAnchor.host;
			} catch (e) {
				options.crossDomain = true;
			}
		}

		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		//返回Promise对象
		return new Promise(function (resolve, reject) {

			// 获取传送器名
			// 根据上面判断，上传文件时如果支持FormData则使用此来实现上传，所以当data为form对象时，表示不支持FormData上传，需使用upload传送器实现上传
			if (options.data.nodeName && options.data.nodeName.toUpperCase() === "FORM") {
				transportName = "upload";
			}

			// 如果dataType为script但async为false时，使用xhr来实现同步请求
			else if (options.dataType === "SCRIPT" && options.async === false) {
					transportName = "xhr";
				} else {
					transportName = options.dataType.toLowerCase();
				}

			// 获取传送器对象，当没有匹配到传送器时统一使用xhr
			amXHR.transport = (ajaxTransports[transportName] || ajaxTransports.xhr)(options);

			// 小写dataType
			amXHR.transport.dataType = options.dataType.toLowerCase();

			// 当请求为GET或HEAD时，拼接参数和cache为false时的时间戳
			if (!options.hasContent) {
				nohashUrl = options.url.replace(rhash, "");

				// 获取url中的hash
				hash = options.url.slice(nohashUrl.length);

				// 拼接data
				nohashUrl += options.data ? (rquery.test(nohashUrl) ? "&" : "?") + options.data : "";

				// 处理cache参数，如果为false则需要在参数后添加时间戳参数
				nohashUrl = nohashUrl.replace(rts, "");
				nohashUrl += options.cache === false ? (rquery.test(nohashUrl) ? "&" : "?") + "_=" + Date.now() : "";

				options.url = nohashUrl + (hash || "");
			} else if (options.data && type$1(options.data) === "string" && (options.contentType || "").indexOf("application/x-www-form-urlencoded") === 0) {
				options.data = options.data.replace(r20, "+");
			}

			// 设置Content-Type
			if (options.contentType) {
				amXHR.setRequestHeader("Content-Type", options.contentType);
			}

			// 设置Accept
			amXHR.setRequestHeader("Accept", accepts[amXHR.transport.dataType] ? accepts[amXHR.transport.dataType] + ", */*; q=0.01" : accepts["*"]);

			// haders里面的首部
			foreach(options.headers, function (header, key) {
				amXHR.setRequestHeader(key, header);
			});

			// 调用请求前回调函数
			if (type$1(options.beforeSend) === "function") {
				options.beforeSend(amXHR, options);
			}

			// 将事件绑定在amXHR中
			foreach(["complete", "success", "error"], function (callbackName) {

				// 如果是success或error回调，则使用resolve或reject代替
				if (callbackName === "success") {
					options[callbackName] = options[callbackName] || resolve;
				} else if (callbackName === "error") {
					options[callbackName] = options[callbackName] || reject;
				}

				amXHR.addEventListener(callbackName, options[callbackName]);
			});

			// 处理超时
			if (options.async && options.timeout > 0) {
				amXHR.transport.timeoutID = setTimeout(function () {
					amXHR.abort("timeout");
				}, options.timeout);
			}

			amXHR.transport.send(options, amXHR);
		});
	};
}

// http请求插件方法构造
var http = {

	request: request(),

	/**
 	get ( url: String, args?: String|Object, callback?: Function, dataType?: String )
 
 	Return Type:
 	Object
 	Promise对象
 
 	Description:
 	ajax GET请求，内部调用request方法实现
 
 	URL doc:
 	http://amaple.org/######
 */
	get: request("GET"),

	/**
 	post ( url: String, args?: String|Object, callback?: Function, dataType?: String )
 
 	Return Type:
 	Object
 	Promise对象
 
 	Description:
 	ajax POST请求，内部调用request方法实现
 
 	URL doc:
 	http://amaple.org/######
 */
	post: request("POST")

	// onrequest ( target, callback ) {

	//    },

	// oncomplete ( target, callback ) {

	//    },

	// onsuccess ( target, callback ) {

	//    },

	// onerror ( target, callback ) {

	//    },

	// onabort ( target, callback ) {

	//    },

	// onprogress ( target, callback ) {

	//    },

	// onuploadprogress ( target, callback ) {

	//    },
};

// 指令前缀
var directivePrefix = ":";

/**
	makeFn ( code: String )

	Return Type:
	Function
    代码解析后的方法体

	Description:
	通过解析代码获取的对应vm属性值的方法

	URL doc:
	http://amaple.org/######
*/
function makeFn(code) {
	var fn = new Function("vm", "runtimeErr", "var __this = this, ret;\n\twith ( vm ) {\n\t\ttry {\n\t\t\tret = " + code + ";\n\t\t}\n\t\tcatch ( e ) {\n\t\t\tthrow runtimeErr ( \"vm\", e );\n\t\t}\n\t}\n\treturn ret;");

	return function (vm) {
		return fn.call(this || {}, vm, runtimeErr);
	};
}

/**
	ViewWatcher ( directive: Object, node: DOMObject, expr: String, scoped?: Object, tmpl?: Object )

	Return Type:
	void

	Description:
	视图监听类
	模板中所有需绑定的视图都将依次转换为ViewWacther类的对象
	当数据发生变化时，这些对象负责更新视图

	URL doc:
	http://amaple.org/######
*/
function ViewWatcher(directive, node, expr, scoped, tmpl) {

	this.directive = directive;
	this.node = node;
	this.expr = expr;
	this.tmpl = tmpl;
	this.scoped = scoped;

	(directive.before || noop).call(this);

	// 如果scoped为局部数据对象则将expr内的局部变量名替换为局部变量名
	if (scoped && scoped.regexp instanceof RegExp) {
		this.expr = this.expr.replace(scoped.regexp, function (match) {
			return scoped.prefix + match;
		});
	}

	// 移除相关属性指令表达式
	// 当属性指令表达式与指令名称不同的时候可将对应表达式赋值给this.attrExpr
	if (node.nodeType === 1) {
		node.attr(directivePrefix + (this.attrExpr || directive.name), null);
	}

	var val = this.expr;

	// 当该指令为静态指令时，将不会去对应的vm中获取值，相应的也不会被监听
	if (directive.static !== true) {
		this.getter = makeFn(this.expr);

		// 将获取表达式的真实值并将此watcher对象绑定到依赖监听属性中
		Subscriber.watcher = this;
		val = this.getter(this.tmpl.vm);

		// 局部变量没有设置监听，所以不会调用Subscriber.subscriber()，需手动设置为undefined
		delete Subscriber.watcher;
	}

	directive.update.call(this, val);
}

extend(ViewWatcher.prototype, {

	/**
 	update ()
 
 	Return Type:
 	void
 
 	Description:
 	更新视图
 	通过更新虚拟dom再对比计算出更新差异
 	最后更新视图
 
 	URL doc:
 	http://amaple.org/######
 */
	update: function update() {
		this.tmpl.addScoped(this.scoped && this.scoped.scopedMounts);

		// 当已开启了一个事物时将收集新旧节点等待变更
		// 当没有开启事物时直接处理更新操作
		if (NodeTransaction.acting instanceof NodeTransaction) {
			NodeTransaction.acting.collect(this.tmpl.moduleNode);
			this.directive.update.call(this, this.getter(this.tmpl.vm));
		} else {
			var diffBackup = this.tmpl.moduleNode.clone();
			this.directive.update.call(this, this.getter(this.tmpl.vm));
			this.tmpl.moduleNode.diff(diffBackup).patch();
		}

		this.tmpl.removeScoped(this.scoped && this.scoped.scopedUnmounts);
	},


	/**
 	unmount ( subscribe: Object )
 
 	Return Type:
 
 	Description:
 	卸载此watcher对象
 	当被绑定元素在DOM树上移除后，对应vm属性对此元素的订阅也需移除
 
 	URL doc:
 	http://amaple.org/######
 */
	unmount: function unmount(subscribe) {
		var index = subscribe.watchers.indexOf(this);
		if (index > -1) {
			subscribe.watchers.splice(index, 1);
		}
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
    http://amaple.org/######
*/
function Subscriber() {
    this.watchers = [];
}

extend(Subscriber.prototype, {

    /**
        subscribe ()
    
        Return Type:
        void
    
        Description:
        订阅监听视图
    
        URL doc:
        http://amaple.org/######
    */
    subscribe: function subscribe() {
        var _this = this;

        if (type$1(Subscriber.watcher) === "object") {

            if (Subscriber.watcher instanceof ViewWatcher) {
                var watcher = Subscriber.watcher;

                // 在被订阅的vnode中生成此watcher的卸载函数
                // 用于在不再使用此watcher时在订阅它的订阅者对象中移除，以提高性能
                watcher.node.watcherUnmounts = watcher.node.watcherUnmounts || [];
                watcher.node.watcherUnmounts.push(function () {
                    watcher.unmount(_this);
                });
            }

            this.watchers.push(Subscriber.watcher);
            // Subscriber.watcher = false;
        }
    },


    /**
        notify ()
    
        Return Type:
        void
    
        Description:
        通知所有监听视图进行更新
    
        URL doc:
        http://amaple.org/######
    */
    notify: function notify() {
        foreach(this.watchers, function (watcher) {
            watcher.update();
        });
    }
});

/**
	ValueWatcher ( updateFn: Function, getter: Function )

	Return Type:
	void

	Description:
	计算属性监听类
	vm中所有依赖监听属性的计算属性都将依次创建ComputedWatcher类的对象被对应的监听属性监听
	当监听属性发生变化时，这些对象负责更新对应的计算属性值

	URL doc:
	http://amaple.org/######
*/
function ValueWatcher(updateFn, getter) {

	this.updateFn = updateFn;
	this.getter = getter;

	// 将获取表达式的真实值并将此watcher对象绑定到依赖监听属性中
	Subscriber.watcher = this;
	updateFn(getter());
	delete Subscriber.watcher;
}

extend(ValueWatcher.prototype, {

	/**
 	update ( newVal: Any )
 
 	Return Type:
 	void
 
 	Description:
 	更新视图
 
 	URL doc:
 	http://amaple.org/######
 */
	update: function update() {
		this.updateFn(this.getter());
	}
});

/**
	convertSubState ( value: Any, subs: Object, context: Object )

	Return Type:
	void

	Description:
	转换子状态数据
	当一个状态数据为数组或对象时，它也需要被转换为监听数据

	URL doc:
	http://amaple.org/######
*/
function convertSubState(value, subs, context) {
	if (value && isPlainObject(value)) {
		value = new ViewModel(value, false);
	} else if (type$1(value) === "array") {
		value = initArray(value, subs, context);
	}

	return value;
}

function cloneNodeMaps(originVal, newVal, newValBackup) {
	if (!originVal) {
		return;
	}
	if (originVal.nodeMaps) {
		Object.defineProperty(newVal, "nodeMaps", {
			value: [],
			writable: true,
			configurable: true,
			enumeratable: false
		});
		newVal.nodeMaps.index = 0;

		foreach(originVal.nodeMaps, function () {

			// 需复制不同的多份相同数组
			// 以便对它们的操作都是独立的
			newVal.nodeMaps.push(newValBackup.concat());
		});
	}

	foreach(newValBackup, function (item, i) {
		if (/object|array/.test(type$1(item))) {
			cloneNodeMaps(originVal[i], newVal[i], item);
		}
	});
}

/**
	initMethod ( methods: Array, context: Object )

	Return Type:
	void

	Description:
	初始化绑定事件

	URL doc:
	http://amaple.org/######
*/
function initMethod(methods, context) {
	foreach(methods, function (method, key) {
		context[key] = function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			return method.apply(context, args);
		};
	});
}

/**
	initState ( states: Array, context: Object )

	Return Type:
	void

	Description:
	初始化监听属性

	URL doc:
	http://amaple.org/######
*/
function initState(states, context) {
	foreach(states, function (state, key) {
		var subs = new Subscriber();

		var watch = noop,
		    oldVal = void 0;

		// 如果属性带有watch方法
		if (type$1(state) === "object" && Object.keys(state).length === 2 && state.hasOwnProperty("value") && state.hasOwnProperty("watch") && type$1(state.watch) === "function") {
			watch = state.watch;
			state = state.value;
		}

		state = convertSubState(state, subs, context);

		defineReactiveProperty(key, function () {

			// 绑定视图
			subs.subscribe();
			return state;
		}, function (newVal) {
			if (state !== newVal) {

				// 转换object或数组
				if (isPlainObject(newVal)) {
					newVal = new ViewModel(newVal, false);
				} else if (type$1(newVal) === "array") {
					var newValBackup = newVal;
					newVal = initArray(newVal, subs, context);
					cloneNodeMaps(state, newVal, newValBackup);
				}

				oldVal = state;
				state = newVal;

				watch.call(context, newVal, oldVal);

				// 更新视图
				subs.notify();
			}
		}, context);
	});
}

/**
	initComputed ( computeds: Object, context: Object )

	Return Type:
	void

	Description:
	初始化监听计算属性

	URL doc:
	http://amaple.org/######
*/
function initComputed(computeds, context) {
	foreach(computeds, function (computed, key) {

		if (type$1(computed) !== "function" && type$1(computed) === "object" && type$1(computed.get) !== "function") {
			throw vmComputedErr(key, "计算属性必须包含get函数，可直接定义一个函数或对象内包含get函数");
		}

		var subs = new Subscriber(),
		    getter = function () {
			var computedGetter = type$1(computed) === "function" ? computed : computed.get;
			return function () {
				return computedGetter.call(context);
			};
		}();

		var state = void 0;

		// 创建ComputedWatcher对象供依赖数据监听
		new ValueWatcher(function (newVal) {
			state = newVal;

			// 更新视图
			subs.notify();
		}, getter);

		// 设置计算属性为监听数据
		defineReactiveProperty(key, function () {

			// 绑定视图
			subs.subscribe();

			return state;
		}, type$1(computed.set) === "function" ? function (newVal) {
			if (state !== newVal) {
				computed.set.call(context, newVal);

				// 更新视图
				subs.notify();
			}
		} : noop, context);
	});
}

/**
	initComputed ( array: Array, subs: Object, context: Object )

	Return Type:
	void

	Description:
	初始化监听数组

	URL doc:
	http://amaple.org/######
*/
function initArray(array, subs, context) {

	// 监听数组转换
	array = array.map(function (item) {
		return convertSubState(item, subs, context);
	});

	foreach(["push", "pop", "shift", "unshift", "splice", "sort", "reverse"], function (method) {
		var nativeMethod = Array.prototype[method];

		Object.defineProperty(array, method, {
			value: function value() {
				for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
					args[_key2] = arguments[_key2];
				}

				if (/push|unshift|splice/.test(method)) {

					// 转换数组新加入的项
					args = args.map(function (item) {
						return convertSubState(item, subs, context);
					});
				}
				var res = nativeMethod.apply(this, args);

				// 如果此数组映射了dom元素，则也需对此映射数组做出改变
				if (this.nodeMaps) {
					foreach(this.nodeMaps, function (nodeMap) {
						nativeMethod.apply(nodeMap, args);
					});
				}

				// 更新视图
				subs.notify();

				return res;
			},

			writable: true,
			configurable: true,
			enumeratable: false
		});
	});

	return array;
}

/**
	ViewModel ( vmData: Object, isRoot?: Boolean )

	Return Type:
	void

	Description:
	ViewModel数据监听类
	am.init方法返回的需被监听的数据都使用此类进行实例化

	URL doc:
	http://amaple.org/######
*/
function ViewModel(vmData) {
	var isRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;


	var computedName = "computed";
	var state = {},
	    method = {},
	    computed = {};

	// 将vmData内的属性进行分类
	foreach(vmData, function (value, key) {

		// 转换普通方法
		if (type$1(value) === "function") {
			method[key] = value;
		}

		// 转换计算属性
		// 深层嵌套内的computed属性对象不会被当做计算属性初始化
		else if (key === computedName) {
				if (isPlainObject(value) && isRoot) {
					computed = value;
				} else {
					throw vmComputedErr("DataTyle", "\u8BA1\u7B97\u5C5E\u6027\u5FC5\u987B\u5305\u542B\u5728\u4E00\u4E2Aobject\u5BF9\u8C61\u4E2D\uFF0C\u4E14\u5B50\u72B6\u6001\u5BF9\u8C61\u65E0\u6CD5\u5B9A\u4E49\u8BA1\u7B97\u5C5E\u6027");
				}
			}

			// 转换监听属性，当值为包含value和watch时将watch转换为监听属性	
			// 如果是对象则将此对象也转换为ViewModel的实例
			// 如果是数组则遍历数组将其内部属性转换为对应监听数组
			else {
					state[key] = value;
				}
	});

	// 初始化监听属性
	initMethod(method, this);
	initState(state, this);
	initComputed(computed, this);
}

var dataType$1 = [String, Number, Function, Boolean, Object];

/**
    validateProp ( prop: any, validate: Object )

    Return Type:
    Boolean
    属性值是否通过验证

    Description:
    验证属性值，验证成功返回true，否则返回false

    URL doc:
    http://amaple.org/######
*/
function validateProp(prop, validate) {
    var isPass = false;
    var tvalidate = type$1(validate);

    if (dataType$1.indexOf(validate) >= 0) {

        // 类型验证
        if (prop !== undefined && prop !== null) {

            // 动态props的Object类型数据一般会被转换为ViewModel类型的对象
            isPass = prop.constructor === validate || prop.constructor === ViewModel;
        }
    } else if (validate instanceof RegExp) {

        // 正则表达式验证
        isPass = validate.test(prop);
    } else if (tvalidate === "array") {

        // 多个值的验证
        // 如果验证参数为数组，则满足数组中任意一项即通过
        foreach(validate, function (v) {
            isPass = isPass || !!validateProp(prop, v);
            if (isPass) {
                return false;
            }
        });
    } else if (tvalidate === "function") {

        // 方法验证
        isPass = validate(prop);
    }

    return isPass;
}

var componentConstructor = {

    /**
        initProps ( componentNode: DOMObject, moduleVm: Object, scoped?: Object, moduleTmpl: Object )
    
        Return Type:
        props
        转换后的属性对象
    
        Description:
        获取并初始化属性对象
    
        URL doc:
        http://amaple.org/######
    */
    initProps: function initProps(componentNode, moduleVm, scoped, moduleTmpl) {
        var props = {},
            match = void 0,
            hasStateValue = void 0,
            bindingType = void 0;
        var twoWay = "tw",
            singleWay = "sw",
            rneedBinding = new RegExp(twoWay + "|" + singleWay),
            rpropExpr = new RegExp("^" + rexpr.source + "$");
        foreach(componentNode.attrs, function (attrVal, name) {

            // 属性名需符合变量的命名规则
            if (rvar.test(name)) {
                var expr = "";
                hasStateValue = false;

                // 属性值只有差值表达式，且差值表达式内只有状态变量名的才进行双向绑定
                if (match = attrVal.match(rpropExpr)) {
                    hasStateValue = true;
                    expr = match[1];
                    if (scoped && scoped.regexp) {
                        expr = match[1].replace(scoped.regexp, function (mat) {
                            return scoped.prefix + mat;
                        });
                    }

                    if (expr === match[1] && rvar.test(match[1])) {
                        bindingType = twoWay;
                    } else if (expr !== match[1] && (!scoped.indexName || !scoped.indexName.test(match[1]))) {
                        bindingType = false;
                    } else {
                        bindingType = singleWay;
                    }
                } else {
                    var exprs = [];
                    var hasScopedValue = false;
                    if (!scoped) {
                        expr = attrVal.replace(rexpr, function (mat, rep) {
                            exprs.push(rep);
                            return "\" + (" + rep + ") + \"";
                        });

                        bindingType = exprs.length > 0 ? singleWay : false;
                    } else {
                        expr = attrVal.replace(rexpr, function (mat, rep) {
                            exprs.push(rep);
                            return "\" + (" + rep.replace(scoped.regexp, function (mat) {
                                hasScopedValue = true;
                                return scoped.prefix + mat;
                            }) + ") + \"";
                        });

                        if (exprs.length > 0) {
                            if (!hasScopedValue || scoped.indexName && scoped.indexName.test(exprs.join(" "))) {
                                bindingType = singleWay;
                            } else {
                                bindingType = false;
                            }
                        }
                    }
                    hasStateValue = exprs.length > 0;
                    expr = hasStateValue ? "\"" + expr + "\"" : expr;
                }
                if (rneedBinding.test(bindingType)) {
                    var subs = new Subscriber();
                    var propValue = void 0,
                        getter = void 0;
                    if (bindingType === twoWay) {
                        getter = function getter() {
                            return moduleVm[expr];
                        };
                    } else {
                        var getterFn = makeFn(expr);
                        getter = function getter() {
                            moduleTmpl.addScoped(scoped && scoped.scopedMounts);
                            var value = getterFn(moduleVm);
                            moduleTmpl.removeScoped(scoped && scoped.scopedMounts);

                            return value;
                        };
                    }
                    new ValueWatcher(function (newVal) {
                        propValue = newVal;
                        subs.notify();
                    }, getter);

                    //////////////////////////////
                    //////////////////////////////
                    //////////////////////////////
                    defineReactiveProperty(name, function () {
                        subs.subscribe();
                        return propValue;
                    }, bindingType === twoWay ? function (newVal) {
                        if (newVal !== propValue) {
                            moduleVm[expr] = newVal;
                        }
                    } : function () {
                        throw componentErr("binding type", "\u7EC4\u4EF6'" + componentNode.nodeName.toLowerCase() + "'\u7684'" + name + "'\u5C5E\u6027\u65E0\u6CD5\u4ECE\u7EC4\u4EF6\u5185\u90E8\u8D4B\u503C\u4FEE\u6539\u8BE5\u503C\uFF0C\u8BF7\u5C1D\u8BD5\u5C06\u4FEE\u6539\u5916\u90E8state\u7684\u56DE\u8C03\u51FD\u6570\u4F20\u5165\u8BE5\u7EC4\u4EF6\u5185\u8FDB\u884C\u8C03\u7528\u4FEE\u6539");
                    }, props);
                } else {
                    props[name] = hasStateValue ? makeFn(expr)(moduleVm) : attrVal;
                }
            } else {
                throw componentErr("props variable", "\u7EC4\u4EF6'" + componentNode.nodeName.toLowerCase() + "'\u7684props\u540D'" + name + "'\u987B\u7B26\u5408\u53D8\u91CF\u547D\u540D\u89C4\u8303");
            }
        });

        return props;
    },


    /**
        validateProps ( props: Object, propsValidator: Object )
    
        Return Type:
        void
    
        Description:
        验证props
    
        URL doc:
        http://amaple.org/######
    */
    validateProps: function validateProps(props, propsValidator) {
        foreach(props, function (val, name) {

            // 验证属性值
            var validateItem = propsValidator[name];
            if (validateItem) {
                var validate = isPlainObject(validateItem) ? validateItem.validate : validateItem;
                if (validate && !validateProp(val, validate)) {
                    throw componentErr("prop: " + name, "\u7EC4\u4EF6\u4F20\u9012\u5C5E\u6027'" + name + "'\u7684\u503C\u672A\u901A\u8FC7\u9A8C\u8BC1\uFF0C\u8BF7\u68C0\u67E5\u8BE5\u503C\u7684\u6B63\u786E\u6027\u6216\u4FEE\u6539\u9A8C\u8BC1\u89C4\u5219");
                }
            }
        });

        // 再次检查是否为必须属性值与默认值赋值
        // 默认值不会参与验证，即使不符合验证规则也会赋值给对应属性
        foreach(propsValidator, function (validatorItem, propName) {
            if (!props[propName]) {
                if (validatorItem.require === true && validatorItem.default === undefined) {
                    throw componentErr("prop:" + propName, "\u7EC4\u4EF6\u4F20\u9012\u5C5E\u6027" + propName + "\u4E3A\u5FC5\u987B\u503C");
                } else if (validatorItem.default !== undefined) {
                    props[propName] = validatorItem.default;
                }
            }
        });
    },


    /**
        initLifeCycle ( component: Object )
    
        Return Type:
        void
    
        Description:
        初始化组件对象的生命周期
    
        URL doc:
        http://amaple.org/######
    */
    initLifeCycle: function initLifeCycle(component, componentVNode, moduleObj) {
        var lifeCycleHook = {
            update: noop,
            unmount: function unmount() {

                // 在对应module.components中移除此组件
                moduleObj.components.splice(moduleObj.components.indexOf(component), 1);
                (componentVNode.delRef || noop)();
            }
        };

        component.lifeCycle = {};
        foreach(lifeCycleHook, function (hookFn, cycleName) {
            var cycleFunc = component[cycleName] || noop;
            component.lifeCycle[cycleName] = function () {
                cycleFunc.apply(component, cache.getDependentPlugin(cycleFunc));

                // 钩子函数调用
                hookFn();
            };
        });
    },


    /**
        initTemplate ( template: String, scopedStyle: Object )
    
        Return Type:
        void
    
        Description:
        初始化模板
        为模板添加实际的DOM结构
        为模板DOM结构添加样式
    
        URL doc:
        http://amaple.org/######
    */
    initTemplate: function initTemplate(template, scopedStyle, scopedCssObject) {

        // 去除所有标签间的空格
        template = trimHTML(template.trim());

        // 为对应元素添加内嵌样式
        var num = void 0,
            styleString = void 0;
        var styleObject = [];
        foreach(scopedStyle, function (styles, selector) {
            styleString = "";
            foreach(styles, function (val, styleName) {
                num = window.parseInt(val);
                styleString += styleName + ":" + (val + (type$1(num) === "number" && (num >= 0 || num <= 0) && num.toString() === val.toString() && noUnitHook.indexOf(styleName) === -1 ? "px" : "")) + ";";
            });

            styleObject.push({ selector: selector, content: styleString });
        });

        return stringToVNode(template, styleObject, scopedCssObject);
    },


    /**
        initSubElements ( componentVNode: Object, subElementNames: Object )
    
        Return Type:
        Object
        组件子元素对象
    
        Description:
        获取组件子元素并打包成局部vm的数据对象
    
        URL doc:
        http://amaple.org/######
    */
    initSubElements: function initSubElements(componentVNode, subElementNames) {
        var _subElements = {
            default: ""
        };

        foreach(subElementNames, function (multiple, subElemName) {
            if (multiple === true) {
                _subElements[subElemName] = [];
            }
        });

        var componentName = void 0,
            subElemName = void 0,
            vf = void 0;
        foreach(componentVNode.children.concat(), function (vnode) {
            componentName = transformCompName(vnode.nodeName || "");

            if (subElementNames.hasOwnProperty(componentName)) {
                vf = VFragment();
                foreach(vnode.children.concat(), function (subVNode) {
                    vf.appendChild(subVNode);
                });

                if (subElementNames[componentName] === true) {
                    _subElements[componentName].push(vf);
                } else {
                    _subElements[componentName] = vf;
                }
            } else {
                _subElements.default = _subElements.default || VFragment();
                _subElements.default.appendChild(vnode);
            }
        });

        return { subElements: _subElements };
    },


    /**
        initAction ( component: Object, actions: Object )
        
        Return Type:
        void
    
        Description:
        初始化组件行为
    
        URL doc:
        http://amaple.org/######
    */
    initAction: function initAction(component, actions) {
        component.action = {};
        foreach(actions, function (action, name) {
            if (type$1(action) !== "function") {
                throw componentErr("actionType", "action'" + name + "'\u4E0D\u662F\u65B9\u6CD5\uFF0C\u7EC4\u4EF6action\u8FD4\u56DE\u7684\u5BF9\u8C61\u5C5E\u6027\u5FC5\u987B\u4E3A\u65B9\u6CD5\uFF0C\u5B83\u8868\u793A\u6B64\u7EC4\u4EF6\u7684\u884C\u4E3A");
            } else if (component[name]) {
                throw componentErr("duplicate", "\u6B64\u7EC4\u4EF6\u5BF9\u8C61\u4E0A\u5DF2\u5B58\u5728\u540D\u4E3A'" + name + "'\u7684\u5C5E\u6027\u6216\u65B9\u6CD5");
            }

            component.action[name] = function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                var nt = new NodeTransaction().start();
                action.apply({}, args);
                nt.commit();
            };
        });
    }
};

// 全局组件类
// 所有的模板内都可以在不指定组件的情况下使用
var globalClass = {};

/**
    getGlobal ( name: String )

    Return Type:
    Function|Class
    对应的组件类

    Description:
    通过组件类名获取对应的组件类

    URL doc:
    http://amaple.org/######
*/
function getGlobal(name) {
    return globalClass[name];
}

function Component() {
    if (!this || getFunctionName(this.constructor) === "Component") {
        throw componentErr("create", "Component类只能由另一个类继承，而不允许直接调用或创建对象");
    }

    // check
    check(this.render).type("function").ifNot("component:" + getFunctionName(this.constructor), "component derivative必须定义render方法，因为组件必须存在组件模板HTML").do();
}

extend(Component.prototype, {

    /**
        __init__ ( componentVNode: Object, moduleTmpl: Object, scoped?: Object )
    
        Return Type:
        void
    
        Description:
        初始化一个对应的组件对象
        moduleObj为组件所在的模块对象，它将提供模块状态值，和组件卸载时提供移除操作对象
        scoped为局部状态，它将为组件props提供局部状态值，只有在局部范围内才会存在值
    
        URL doc:
        http://amaple.org/######
    */
    __init__: function __init__(componentVNode, moduleTmpl, scoped) {
        var _this = this;

        var moduleObj = moduleTmpl.module;

        // 初始化props
        this.props = componentConstructor.initProps(componentVNode, moduleObj.state, scoped, moduleTmpl);

        //////////////////////////////////////////
        // 获取init方法返回值并初始化vm数据
        // 构造属性验证获取器获取属性验证参数
        this.propsType = function (validator) {
            componentConstructor.validateProps(_this.props, validator || {});
        };

        var componentVm = new ViewModel((this.init || noop).apply(this, cache.getDependentPlugin(this.init || noop)));
        this.state = componentVm;

        delete this.propsType;

        /////////////////////
        // 转换组件代表元素为实际的组件元素节点
        var componentString = void 0,
            scopedStyle = void 0,
            subElementNames = {};

        // 构造模板和样式的获取器获取模板和样式
        this.template = function (str) {
            componentString = str || "";
            return _this;
        };

        this.style = function (obj) {
            scopedStyle = obj || {};
            return _this;
        };

        this.subElements = function () {
            for (var _len = arguments.length, elemNames = Array(_len), _key = 0; _key < _len; _key++) {
                elemNames[_key] = arguments[_key];
            }

            foreach(elemNames, function (nameObj) {
                if (type$1(nameObj) === "string") {
                    nameObj = { elem: nameObj, multiple: false };
                }
                if (!rcomponentName.test(nameObj.elem)) {
                    throw componentErr("subElements", "组件子元素名\"" + nameObj.elem + "\"定义错误，组件子元素名的定义规则与组件名相同，需遵循首字母大写的驼峰式");
                }
                subElementNames[nameObj.elem] = nameObj.multiple;
            });

            return _this;
        };

        this.render.apply(this, cache.getDependentPlugin(this.render));

        delete this.template;
        delete this.style;
        delete this.subElements;

        // 验证组件类
        this.depComponents = this.depComponents || [];
        foreach(this.depComponents, function (comp) {
            if (comp && getFunctionName(comp.__proto__) !== "Component") {
                throw componentErr("depComponents", "\u7EC4\u4EF6\"" + getFunctionName(_this.constructor) + "\"\u5185\u9519\u8BEF\u7684\u4F9D\u8D56\u7EC4\u4EF6\u5BF9\u8C61\uFF0C\u8BF7\u786E\u4FDD\u4F9D\u8D56\u7EC4\u4EF6\u4E3A\u4E00\u4E2A\u7EC4\u4EF6\u884D\u751F\u7C7B");
            }
        });

        // 处理模块并挂载数据
        var scopedCssObject = {},
            vfragment = componentConstructor.initTemplate(componentString, scopedStyle, scopedCssObject),
            subElements = componentConstructor.initSubElements(componentVNode, subElementNames),
            tmpl = new Tmpl(componentVm, this.depComponents, this);

        // 解析组件并挂载数据
        this.references = {};
        tmpl.mount(vfragment, false, Tmpl.defineScoped(subElements, componentVNode), true);

        // 追加局部属性
        appendScopedAttr(vfragment, scopedCssObject.selectors, scopedCssObject.identifier);

        // 保存组件对象和结构
        componentVNode.component = this;
        componentVNode.templateNodes = vfragment.children.concat();
        tmpl.moduleNode = componentVNode;

        // 初始化action
        if (this.action) {
            var actions = this.action.apply(this, cache.getDependentPlugin(this.action));
            componentConstructor.initAction(this, actions);
        } else {
            this.action = {};
        }

        // 调用mounted钩子函数
        (this.mounted || noop).apply(this, cache.getDependentPlugin(this.mounted || noop));

        // 初始化生命周期
        componentConstructor.initLifeCycle(this, componentVNode, moduleObj);
    },


    /**
        __update__ ()
    
        Return Type:
        void
    
        Description:
        组件生命周期hook
        当该模块位置更新时时调用
    
        URL doc:
        http://amaple.org/######
    */
    __update__: function __update__() {
        var nt = new NodeTransaction().start();
        this.lifeCycle.update();
        nt.commit();
    },


    /**
        __unmount__ ()
    
        Return Type:
        void
    
        Description:
        组件生命周期hook
        当该模块卸载时时调用
    
        URL doc:
        http://amaple.org/######
    */
    __unmount__: function __unmount__() {
        if (!isEmpty(this.components)) {
            foreach(this.components, function (comp) {
                comp.__unmount__();
            });
        }

        this.lifeCycle.unmount();
    },


    /**
        refs ( ref: String )
    
        Return Type:
        DOMObject|Object
        被引用的组件行为对象或元素
        
        Description:
        获取被引用的组件行为对象或元素
        当组件不可见时返回undefined
    
        URL doc:
        http://amaple.org/######
    */
    refs: function refs(ref) {
        return getReference(this.references, ref);
    }
});

extend(Component, {

    /**
        defineGlobal ( componentDerivative: Function|Class )
    
        Return Type:
        void
    
        Description:
        定义一个全局组件
        组件对象必须为一个方法(或一个类)
    
        URL doc:
        http://amaple.org/######
    */
    defineGlobal: function defineGlobal(componentDerivative) {
        check(getFunctionName(componentDerivative.constructor)).be("Component").ifNot("Component.defineGlobal", "参数componentDerivative必须为继承ice.Component的组件衍生类");
        this.globalClass[getFunctionName(componentDerivative)] = componentDerivative;
    }
});

/**
    toString ( val?:any )

    Return Type:
    String

    Description:
    将val变量转换为字符串，当val为undefined或null时转换为空字符串

    URL doc:
    http://amaple.org/######
*/
function toString$1(val) {
    return (val === undefined || val === null ? "" : val).toString();
}

/**
    arrayToClass ( val?:any )

    Return Type:
    String

    Description:
    绑定元素的class时可传入数组和对象，绑定渲染时会自动用空格隔开
    参数为对象时，它将会把值为true的key作为类名

    URL doc:
    http://amaple.org/######
*/
function arrayOrObjectToClass(val) {
    var tval = type$1(val);
    if (tval === "array") {
        return " " + val.join(" ") + " ";
    } else if (tval === "object") {
        var arr = [];
        foreach(val, function (v, k) {
            if (v) {
                arr.push(k);
            }
        });

        return " " + arr.join(" ") + " ";
    }

    return " " + toString$1(val) + " ";
}

/**
    objectToStyle ( val?:any )

    Return Type:
    String

    Description:
    特殊处理
    绑定style属性时可传入对象，键为样式名的驼峰式，值为样式值

    URL doc:
    http://amaple.org/######
*/
function objectToStyle(val) {
    if (type$1(val) !== "object") {
        return toString$1(val);
    }

    var styleArray = [];
    var num = void 0;
    foreach(val, function (v, k) {
        // 将驼峰式变量名转换为横杠式变量名
        k = k.replace(/[A-Z]/g, function (match) {
            return "-" + match.toLowerCase();
        });

        // 如果值为数字并且不是NaN，并且属性名不在noUnitHook中的，需添加”px“
        num = parseInt(v);
        v += type$1(num) === "number" && (num >= 0 || num <= 0) && noUnitHook.indexOf(k) === -1 ? "px" : "";
        styleArray.push(k + ":" + v + ";");
    });

    return ";" + styleArray.join("");
}

var attrExpr = {

    name: "attrExpr",

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://amaple.org/######
    */
    before: function before() {
        var exprMatch = this.expr.match(/^(.*?):(.*)$/),
            rexprMatch = new RegExp(rexpr.source, "g");

        this.attrName = exprMatch[1];
        this.expr = exprMatch[2];
        this.transformFn = this.attrName === "class" ? arrayOrObjectToClass : this.attrName === "style" ? objectToStyle : toString$1;

        // 当表达式只有“{{ expr }}”时直接取出表达式的值
        if (/^{{\s*(\S+)\s*}}$/.test(this.expr)) {
            this.expr = this.expr.replace(rexprMatch, function (match, rep) {
                return "this.transformFn ( " + rep + " )";
            });
        }

        // 当表达式为混合表达式时，将表达式转换为字符串拼接代码
        else {

                // 每个字符串实体使用()括起来，否则在三元表达式等计算中会出错
                this.expr = this.expr.replace(rexprMatch, function (match, rep) {
                    return "\" + (this.transformFn ( " + rep + " )) + \"";
                });
                this.expr = "\"" + this.expr + "\"";
            }
    },


    /**
        update ( val: String )
    
        Return Type:
        void
    
        Description:
        “{{ express }}”表达式对应的视图更新方法
        该表达式用于元素属性表达式的更新
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://amaple.org/######
    */
    update: function update(val) {

        // 去除多余的空格
        if (this.attrName === "class") {
            val = val.trim().replace(/\s{2}/, " ");
        }

        // 去除多余的分号
        else if (this.attrName === "style") {
                val = val.replace(/^;/, "").replace(/;{2}/, ";");
            }

        this.node.attr(this.attrName, val);
    }
};

var cache$1 = {
    name: "cache",

    // static为true时，模板将不会挂载watcher在对应vm下
    static: true,

    before: function before() {
        if (!/^true|false$/.test(this.expr)) {
            throw directiveErr("cache", "cache指令的值只能为'true'或'false'，表示是否缓存此模块内容");
        }
    },


    /**
        update ( isCache: String )
    
        Return Type:
        void
    
        Description:
        将:cache存入vnode中
        此时的isCache参数将会在getter方法中转换为实际的boolean值
    
        URL doc:
        http://amaple.org/######
    */
    update: function update(isCache) {
        this.node.cache = isCache === "true" ? true : false;
    }
};

function createVNode(watcher, arg, index) {
    var f = VFragment(),
        elem = watcher.node,

    // 为itemNode指定新的key值
    key = guid(),


    // 定义范围变量
    scopedDefinition = {};

    if (watcher.index) {
        scopedDefinition[watcher.index] = index;
    }
    scopedDefinition[watcher.item] = arg;

    // 原始元素没有引用实际dom时传入null，表示克隆vnode不引用任何实际dom
    var itemNode = elem.clone(false),
        scopedAuxiliary = Tmpl.defineScoped(scopedDefinition, itemNode, watcher.index),
        nextSibClone = void 0;

    itemNode.key = key;

    if (elem.conditionElems) {
        var conditionElems = [itemNode];
        itemNode.conditionElems = conditionElems;
        foreach(elem.conditionElems, function (nextSib, i) {
            if (i > 0) {
                nextSibClone = nextSib.clone(false);
                nextSibClone.key = key;
                nextSibClone.conditionElems = conditionElems;
                nextSibClone.scoped = itemNode.scoped;

                conditionElems.push(nextSibClone);
            }
        });
        itemNode.conditions = elem.conditions;
    }

    // 再外套一层fragment的原因是在if中处理时不会因为无法获取itemNode.parentNode而报错
    f.appendChild(itemNode);

    // 为遍历克隆的元素挂载数据
    watcher.tmpl.mount(f, true, scopedAuxiliary, true);
    itemNode = f.children[0];

    return itemNode;
}

/**
    unmountWatchers ( vnode: Object, isWatchCond: Boolean )

    Return Type:
    void

    Description:
    卸载对应node的watcher

    URL doc:
    http://amaple.org/######
*/
function unmountWatchers(vnode, isWatchCond) {

    // 移除vnode对应的watcher引用
    foreach(vnode.watcherUnmounts || [], function (unmountFunc) {
        unmountFunc();
    });

    // 被“:if”绑定的元素有些不在vdom树上，需通过此方法解除绑定
    if (vnode.conditionElems && isWatchCond !== false) {
        var conditionElems = vnode.conditionElems;
        foreach(conditionElems, function (conditionElem) {
            if (conditionElem !== vnode) {
                walkVDOM(conditionElem, function (condSubElem, isWatchCond) {
                    unmountWatchers(condSubElem, isWatchCond);
                }, false);
            }
        });
    }
}

var _for = {
    name: "for",

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://amaple.org/######
    */
    before: function before() {
        var forExpr = /^\s*([$\w(),\s]+)\s+in\s+([$\w.\[\]\s]+)\s*$/,
            keyExpr = /^\(\s*([$\w]+)\s*,\s*([$\w]+)\s*\)$/;

        if (!forExpr.test(this.expr)) {
            throw directiveErr("for", "for指令内的循环格式为'item in list'或'(item, index) in list'，且item和index必须符合变量命名规范，请正确使用该指令");
        }
        var variable = this.expr.match(forExpr),
            indexValMatch = variable[1].match(keyExpr);

        if (indexValMatch) {
            this.item = indexValMatch[1];
            this.index = indexValMatch[2];
        } else {
            this.item = variable[1];
        }

        this.expr = variable[2];
        this.startNode = VTextNode("");
        this.startNode.key = guid();

        this.endNode = VTextNode("");
        this.endNode.key = guid();
    },


    /**
        update ( iterator: Array )
    
        Return Type:
        void
    
        Description:
        “:for”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://amaple.org/######
    */
    update: function update(iterator) {
        var _this = this;

        var titerator = type$1(iterator),
            elem = this.node,
            fragment = VFragment();
        var itemNode = void 0;

        if (!/^array|object|number|string$/.test(titerator)) {
            throw directiveErr("for", "for指令只允许绑定Array、Object、Number和String四种类型的值");
        }
        // 如果迭代变量为number或string时需将它转换为array
        if (titerator === "number") {
            var num = iterator;
            iterator = [];
            for (var i = 0; i < num; i++) {
                iterator.push(i);
            }
        } else if (titerator === "string") {
            iterator = iterator.split("");
        }

        // 初始化视图时将模板元素替换为挂载后元素
        if (elem.parent) {
            if (!iterator.nodeMaps) {

                // 创建数组的映射vnodes maps
                Object.defineProperty(iterator, "nodeMaps", { value: [], writable: true, configurable: true, enumeratable: false });
                iterator.nodeMaps.index = 0;
            }

            fragment.appendChild(this.startNode);

            var nodeMap = [];
            foreach(iterator, function (val, i) {
                itemNode = createVNode(_this, val, i);
                nodeMap.push(itemNode);

                fragment.appendChild(itemNode);
            });

            fragment.appendChild(this.endNode);
            elem.parent.replaceChild(fragment, elem);

            iterator.nodeMaps.push(nodeMap);
        } else {
            var _nodeMap = iterator.nodeMaps[iterator.nodeMaps.index++];

            // 循环更新结束后需重置index，以便下次更新时可通过index再次循环更新
            iterator.nodeMaps.index = iterator.nodeMaps.index < iterator.nodeMaps.length ? iterator.nodeMaps.index : 0;

            // 改变数据后更新视图
            foreach(_nodeMap, function (val, index) {
                var itemNode = void 0;

                // 在映射数组中找到对应项时，使用该项的key创建vnode
                if (val.nodeType) {
                    itemNode = val;

                    // 当if和for指令同时使用在一个元素上，且在改变数组重新遍历前改变过if的条件时
                    // nodeMap中的元素非显示的元素，需遍历conditionElems获取当前显示的元素
                    if (itemNode.conditionElems && !itemNode.parent) {
                        foreach(itemNode.conditionElems.concat(itemNode.conditionElems[0].replacement), function (conditionElem) {
                            if (conditionElem.parent) {
                                itemNode = conditionElem;
                            }
                        });
                    }

                    // 更新局部监听数据
                    // 有index时更新index值
                    if (_this.index && itemNode.scoped) {
                        var rindex = new RegExp(_this.index + "$");
                        foreach(itemNode.scoped, function (val, key, scoped) {
                            if (rindex.test(key) && val !== index) {
                                scoped[key] = index;
                            }
                        });
                    }
                } else {
                    itemNode = createVNode(_this, val, index);

                    var scopedCssObject = _this.tmpl.module.scopedCssObject;
                    if (scopedCssObject) {
                        appendScopedAttr(itemNode, scopedCssObject.selectors, scopedCssObject.identifier);
                    }
                    _nodeMap.splice(index, 1, itemNode);
                }

                fragment.appendChild(itemNode);
            });

            var p = this.startNode.parent,
                el = void 0;
            while ((el = this.startNode.nextSibling()) !== this.endNode) {
                p.removeChild(el);

                // 遍历vdom并卸载node绑定的watchers
                walkVDOM(el.isComponent ? VFragment(el.templateNodes) : el, function (vnode, isWatchCond) {
                    unmountWatchers(vnode, isWatchCond);
                });
            }

            p.insertBefore(fragment, this.endNode);
        }
    }
};

var _if = {
    name: "if",

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://amaple.org/######
    */
    before: function before() {
        var elem = this.node;

        this.expr = "[" + elem.conditions.join(",") + "]";
        this.replacement = VTextNode("");
        this.replacement.conditionElems = elem.conditionElems;

        // 如果有key表示此元素为循环遍历元素，需为占位元素设置相同key
        if (elem.key) {
            this.replacement.key = elem.key;
            elem.replacement = this.replacement;
        }
        // 当循环遍历有index时，该元素才有局部变量，此时也需将此赋予
        if (elem.scoped) {
            this.replacement.scoped = elem.scoped;
        }

        // 将elem在DOM结构中去掉，以便在下面循环扫描时不会扫描到elem的nextSibling元素
        elem.parent.replaceChild(this.replacement, elem);
        this.currentNode = this.replacement;

        // 记录需挂载的nodes
        // 当node为显示状态时进行数据挂载
        this.needMount = elem.conditionElems.concat();
    },


    /**
        update ( conditions: Array )
    
        Return Type:
        void
    
        Description:
        “:if”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://amaple.org/######
    */
    update: function update(conditions) {
        var _this = this;

        var elem = this.node,
            conditionElems = elem.conditionElems,
            cNode = this.currentNode,
            parent = cNode.parent,
            needMount = this.needMount;

        var newNode = void 0,
            _cNode = void 0;

        foreach(conditions, function (cond, i) {
            if (cond) {
                newNode = conditionElems[i];

                // 当此显示的node未挂载时进行数据挂载
                var index = needMount.indexOf(newNode);
                if (index > -1) {
                    _this.tmpl.mount(newNode, true, _this.scoped);
                    needMount.splice(index, 1);
                }

                return false;
            }
        });

        // 当新节点为空时表示没有找到符合条件的节点，则不显示任何节点（即显示replacement空文本节点）
        if (!newNode) {
            newNode = this.replacement;
            _cNode = newNode;
        } else {
            _cNode = newNode;
        }

        if (newNode && !newNode.parent) {
            parent.replaceChild(newNode, cNode);

            this.currentNode = _cNode;
        }
    }
};

var model = {

    name: "model",

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://amaple.org/######
    */
    before: function before() {
        var elem = this.node,
            nodeName = elem.nodeName,
            inputType = (elem.attr("type") || "").toLowerCase(),
            expr = this.expr,
            vm = this.tmpl.vm,
            modelArray = vm[expr];
        if (!/INPUT|TEXTAREA|SELECT/.test(nodeName)) {
            throw directiveErr("model", "这个指令只能在包括'<input>'、'<textarea>'、'<select>'在内的表单元素上使用");
        }

        // 绑定checkbox上时，vm属性值必须为array
        if (nodeName === "INPUT" && inputType === "checkbox" && type$1(modelArray) !== "array") {
            throw directiveErr("model", "checkbox表单元素只能绑定一个array类型的变量");
        }

        var support = {
            input: {
                nodeName: "TEXTAREA",
                type: "text, password, color, search, week, date, datetime-local, month, time, email, range, tel, url"
            },
            change: {
                nodeName: "SELECT",
                inputType: "radio, checkbox"
            }
        },


        // 如果是复选框则数据要以数组的形式表现
        handler = nodeName === "INPUT" && inputType === "checkbox" ? function () {

            // 兼容处理，当数组中没有时才加入此数据
            // 因为当node.checked = false时是不触发此事件的
            // 如果不判断则可能导致重复的数据
            if (this.checked && modelArray.indexOf(this.value) === -1) {
                modelArray.push(this.value);
            } else if (!this.checked) {
                var i = modelArray.indexOf(this.value);
                if (i >= 0) {
                    modelArray.splice(i, 1);
                }
            }

            // 同步虚拟dom的值
            elem.attr("checked", this.checked);
        } : function () {
            vm[expr] = this.value;

            // 同步虚拟dom的值
            elem.attr("value", this.value);
        };

        // 判断表单元素需绑定的事件，并为它们绑定不同事件
        if (nodeName === "INPUT" && support.input.type.indexOf(inputType) >= 0 || support.input.nodeName.indexOf(nodeName) >= 0) {

            // 绑定input事件
            elem.bindEvent("input", handler);
        } else if (nodeName === "INPUT" && support.change.inputType.indexOf(inputType) !== -1 || support.change.nodeName.indexOf(nodeName) !== -1) {

            // 当input[radio]元素没有设置name属性时自动为它添加name属性
            if (inputType === "radio" && !elem.attr("name")) {
                elem.attr("name", expr);
            }

            // 绑定input事件
            elem.bindEvent("change", handler);
        }
    },


    /**
        update ( val: String )
    
        Return Type:
        void
    
        Description:
        表单元素双向绑定方法
    
        URL doc:
        http://amaple.org/######
    */
    update: function update(val) {
        var tval = type$1(val),
            elem = this.node,
            nodeName = elem.nodeName,
            inputType = (elem.attr("type") || "").toLowerCase();

        // 对radio的处理
        if (tval === "string" && nodeName === "INPUT" && inputType === "radio") {
            if (elem.attr("value") === val) {
                elem.attr("checked", true);
            } else {
                elem.attr("checked", false);
            }
        }

        // 对checkbox的处理
        else if (tval === "array" && nodeName === "INPUT" && inputType === "checkbox") {
                if (val.indexOf(elem.attr("value")) !== -1) {
                    elem.attr("checked", true);
                } else {
                    elem.attr("checked", false);
                }
            }

            // 其他控件的处理
            else {
                    elem.attr("value", val);
                }
    }
};

var module$2 = {
    name: "module",

    // static为true时，模板将不会挂载watcher在对应vm下
    static: true,

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://amaple.org/######
    */
    before: function before() {
        this.moduleName = this.node.attr(amAttr.module);
    },


    /**
        update ( moduleName: String )
    
        Return Type:
        void
    
        Description:
        将:module子模块元素存入Structure.currentPage对应的结构中, 以便下次直接获取使用
    
        URL doc:
        http://amaple.org/######
    */
    update: function update(moduleName) {
        if (Structure.currentRender && type$1(moduleName) === "string") {
            Structure.saveSubModuleNode(this.node, this.moduleName);
        }
    }
};

var on = {
    name: "on",

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://amaple.org/######
    */
    before: function before() {
        var rfncall = /^\s*([$\w]+)(?:\s*\((.*?)\))?\s*$/,
            exprMatch = this.expr.match(/^(.*?):(.*)$/),
            event$$1 = "__$event__";

        var listener = exprMatch[2];
        if (rfncall.test(listener)) {
            var argMatch = listener.match(rfncall),
                arg = argMatch && argMatch[2] ? argMatch[2].split(",").map(function (item) {
                return item.trim();
            }) : [];

            arg.unshift(event$$1);
            listener = (argMatch ? argMatch[1] : listener) + "(" + arg.join(",") + ")";
        }

        this.type = exprMatch[1];
        this.attrExpr = "on" + this.type;
        this.expr = "function(" + event$$1 + ") {\n            __this.tmpl.addScoped(__this.scoped && __this.scoped.scopedMounts);\n\t\t\t" + listener + ";\n            __this.tmpl.removeScoped(__this.scoped && __this.scoped.scopedUnmounts);\n\t\t}";
    },


    /**
        update ( listener: Function )
    
        Return Type:
        void
    
        Description:
        事件绑定方法
    
        URL doc:
        http://amaple.org/######
    */
    update: function update(listener) {
        this.node.bindEvent(this.type, function (e) {
            var nt = new NodeTransaction().start();
            listener(e);
            nt.commit();
        });
    }
};

var ref = {
    name: "ref",

    // static为true时，模板将不会挂载watcher在对应vm下
    static: true,

    /**
        update ( refName: String )
    
        Return Type:
        void
    
        Description:
        将引用元素/组件保存到对应的模块中
    
        URL doc:
        http://amaple.org/######
    */
    update: function update(refName) {
        var refs = this.tmpl.module.references,
            tref = type$1(refs[refName]),
            node = this.node;

        switch (tref) {
            case "undefined":
                refs[refName] = node;

                break;
            case "object":
                refs[refName] = [refs[refName]];
                refs[refName].push(node);

                break;
            case "array":
                refs[refName].push(node);
        }

        // 保存将引用元素/组件从对应的模块中移除的函数
        node.delRef = function () {
            if (type$1(refs[refName]) === "array") {
                refs[refName].splice(refs[refName].indexOf(node), 1);
            } else {
                delete refs[refName];
            }
        };
    }
};

var textExpr = {

    name: "textExpr",

    /**
        before ()
    
        Return Type:
        void
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://amaple.org/######
    */
    before: function before() {
        var rexpr = /{{\s*(.*?)\s*}}/g;

        // 当表达式只有“{{ expr }}”时直接取出表达式的值
        if (/^{{\s*(\S+)\s*}}$/.test(this.expr)) {
            this.expr = this.expr.replace(rexpr, function (match, rep) {
                return rep;
            });
        } else {

            // 当表达式为混合表达式时，将表达式转换为字符串拼接代码
            // 拼接前先过滤换行符为空格，防止解析出错
            var exprArray = this.expr.replace(/[\r\n]/g, " ").replace(rexpr, function (match, rep) {
                return "\"," + rep + ",\"";
            });

            // 当组件设置了subElements，且在模板中在同一个文本节点连续输出两个subElements，或subElements与普通文本一起使用时，需按subElements进行分割，然后遍历插入其中
            this.expr = "(function(arr){\n                var arr=arr,tempArr=[],ret=[];\n                for(var i=0;i<arr.length;i++){\n                    if(!arr[i]||!arr[i].nodeType){\n                        tempArr.push(arr[i]);\n                    }\n                    else{\n                        ret.push(tempArr.join(\"\"),arr[i]);\n                        tempArr=[];\n                    }\n                }\n                if(tempArr.length>0) {\n                    ret.push(tempArr.join(\"\"));\n                }\n                return ret.length===1?ret[0]:ret;\n            })([\"" + exprArray + "\"])";
        }
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
        http://amaple.org/######
    */
    update: function update(val) {
        var node = this.node;

        if (type$1(val) !== "array") {

            // 定义了组件子元素时，需将组件表达式（nodeType为3）替换为实际传入的dom结构
            if (val && val.nodeType > 0 && node.nodeType === 3) {
                node.parent.replaceChild(val, node);
            } else {
                node.nodeValue = val;
            }
        } else {
            var f = VFragment();
            foreach(val, function (item) {
                if (item.nodeType) {
                    f.appendChild(item);
                } else if (type$1(item) === "string" && item.trim()) {
                    f.appendChild(VTextNode(item));
                }
            });

            node.parent.replaceChild(f, node);
        }
    }
};

// 指令集
var directives = {
	attrExpr: attrExpr,
	cache: cache$1,
	for: _for,
	if: _if,
	model: model,
	module: module$2,
	on: on,
	ref: ref,
	textExpr: textExpr
};

/**
    preTreat ( vnode: Object )

    Return Type:
    Object
    处理后的元素对象

    Description:
    元素预处理
    主要对“:if”、“:for”两个指令的特殊处理

    URL doc:
    http://amaple.org/######
*/
function preTreat(vnode) {

	var _if$$1 = directivePrefix + "if",
	    _elseif = directivePrefix + "else-if",
	    _else = directivePrefix + "else";

	var condition = vnode.attr(_if$$1);

	if (condition && !vnode.conditionElems) {
		var conditionElems = [vnode];
		var nextSib = void 0,
		    parent = void 0;

		vnode.conditions = [condition];
		vnode.conditionElems = conditionElems;
		parent = vnode.parent;
		while (nextSib = vnode.nextElementSibling()) {
			if (condition = nextSib.attr(_elseif)) {
				nextSib.conditionElems = conditionElems;
				vnode.conditions.push(condition);
				vnode.conditionElems.push(nextSib);
				nextSib.attr(_elseif, null);
				parent.removeChild(nextSib);
			} else if (Object.prototype.hasOwnProperty.call(nextSib.attrs, _else)) {
				nextSib.conditionElems = conditionElems;
				vnode.conditions.push("true");
				vnode.conditionElems.push(nextSib);
				nextSib.attr(_else, null);
				parent.removeChild(nextSib);
				break;
			} else {
				break;
			}
		}
	}

	return vnode;
}

/**
    concatHandler ( target: Object, source: Object )

    Return Type:
    Object
    合并后的compileHandlers

    Description:
    合并compileHandlers

    URL doc:
    http://amaple.org/######
*/
function concatHandler(target, source) {
	var concats = {};

	concats.watchers = target.watchers.concat(source.watchers);
	concats.components = target.components.concat(source.components);
	concats.templates = target.templates.concat(source.templates);

	return concats;
}

/**
    mountVNode ( vnode: Object, tmpl: Object, mountModule: Boolean, isRoot: Boolean )

    Return Type:
    Object
	需监听元素，需渲染组件及需转换的template的集合

    Description:
    遍历vnode
    通过遍历获取需监听元素，需渲染组件及需转换的template

    URL doc:
    http://amaple.org/######
*/
function mountVNode(vnode, tmpl, mountModule) {
	var isRoot = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

	var rattr = /^:([\$\w]+)$/;

	var directive = void 0,
	    handler = void 0,
	    targetNode = void 0,
	    expr = void 0,
	    forOrIfExpr = void 0,
	    firstChild = void 0,
	    compileHandlers = {
		watchers: [],
		components: [],
		templates: []
	};

	do {
		if (vnode.nodeType === 1 && mountModule) {

			// 处理:for
			// 处理:if :else-if :else
			// 处理{{ expression }}
			// 处理:on
			// 处理:model
			vnode = preTreat(vnode);
			if (forOrIfExpr = vnode.attr(directivePrefix + "for")) {
				compileHandlers.watchers.push({ handler: directives.for, targetNode: vnode, expr: forOrIfExpr });
			} else if (forOrIfExpr = vnode.attr(directivePrefix + "if")) {
				compileHandlers.watchers.push({ handler: directives.if, targetNode: vnode, expr: forOrIfExpr });
			} else {
				if (vnode.nodeName === "TEMPLATE") {
					compileHandlers.templates.push(vnode);
				} else {

					// 收集组件元素待渲染
					// 局部没有找到组件则查找全局组件
					var componentName = transformCompName(vnode.nodeName),
					    ComponentDerivative = tmpl.getComponent(componentName) || getGlobal(componentName);
					if (ComponentDerivative && getFunctionName(ComponentDerivative.__proto__) === "Component") {
						compileHandlers.components.push({ vnode: vnode, Class: ComponentDerivative });
						vnode.isComponent = true;
					}
				}

				foreach(vnode.attrs, function (attr, name) {
					if (new RegExp("^" + directivePrefix + "(?:else-if|else)$").test(name)) {
						throw directiveErr(name, "\u8FD9\u4E2A\u6307\u4EE4\u5FC5\u987B\u4E0E'" + directivePrefix + "if'\u4E00\u540C\u4F7F\u7528");
					}

					directive = rattr.exec(name);
					if (directive) {
						directive = directive[1];
						if (/^on/.test(directive)) {

							// 事件绑定
							handler = directives.on;
							targetNode = vnode, expr = directive.slice(2) + ":" + attr;
						} else if (directives[directive]) {

							// 模板属性绑定
							handler = directives[directive];
							targetNode = vnode;
							expr = attr;
						} else {

							// 没有找到该指令
							throw runtimeErr("directive", "\u6CA1\u6709\u627E\u5230'" + directive + "'\u6307\u4EE4\u6216\u8868\u8FBE\u5F0F");
						}

						compileHandlers.watchers.push({ handler: handler, targetNode: targetNode, expr: expr });
					} else if (rexpr.test(attr) && !vnode.isComponent) {

						// 属性值表达式绑定
						// 需排除组件上的属性表达式，因为它们会组件在组件初始化内处理
						compileHandlers.watchers.push({ handler: directives.attrExpr, targetNode: vnode, expr: name + ":" + attr });
					}
				});
			}
		} else if (vnode.nodeType === 3) {

			// 文本节点表达式绑定
			if (rexpr.test(vnode.nodeValue)) {
				compileHandlers.watchers.push({ handler: directives.textExpr, targetNode: vnode, expr: vnode.nodeValue });
			}
		}

		firstChild = vnode.children && vnode.children[0];
		if (firstChild && !forOrIfExpr) {
			compileHandlers = concatHandler(compileHandlers, mountVNode(firstChild, tmpl, true, false));
		}
	} while (!isRoot && (vnode = vnode.nextSibling()));

	return compileHandlers;
}

/**
    Plugin Tmpl

    Description:
    模板类
    解析模板

    URL doc:
    http://amaple.org/######
*/
function Tmpl(vm, components, module) {
    var _this = this;

    this.vm = vm;
    this.components = {};
    this.module = module;

    foreach(components, function (comp) {
        _this.components[getFunctionName(comp)] = comp;
    });
}

extend(Tmpl.prototype, {

    /**
        mount ( vnode: Object, mountModule: Boolean, scoped?: Object, addScoped?: Boolean )
    
        Return Type:
        void
    
        Description:
        使用vm对象挂载并动态绑定数据到模板
        addScoped用于控制添加和移除局部变量，否则可能会导致if、for中的调用导致局部变量被移除
    
        URL doc:
        http://amaple.org/######
    */
    mount: function mount(vnode, mountModule, scoped) {
        var _this2 = this;

        var addScoped = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        if (!this.moduleNode) {
            this.moduleNode = vnode;
        }
        var compileHandlers = mountVNode(vnode, this, mountModule);

        //////////////////////////////
        //////////////////////////////
        // 如果有model属性则需将此属性放到最后
        // 因为当前元素的value值为一个"{{ }}"时需先挂载value的表达式，这样在model处理时才能获取到正确的value值
        compileHandlers.watchers.sort(function (a, b) {
            return a.handler.name === "model" ? 1 : 0;
        });

        // 如果有局部状态且不重复，则添加局部状态到state上
        // 防止在if、for中的调用导致局部变量被移除
        if (scoped && addScoped) {
            this.addScoped(scoped.scopedMounts);
        }

        // 为相应模板元素挂载数据
        foreach(compileHandlers.watchers, function (watcher) {
            new ViewWatcher(watcher.handler, watcher.targetNode, watcher.expr, scoped, _this2);
        });

        // 处理template元素
        foreach(compileHandlers.templates, function (vnode) {
            vnode.templateNodes = vnode.children.concat();
        });

        // 渲染组件
        this.module.components = this.module.components || [];
        foreach(compileHandlers.components, function (comp) {
            var instance = new comp.Class();
            _this2.module.components.push(instance);

            instance.__init__(comp.vnode, _this2, scoped);
        });

        // 移除局部数据
        if (scoped && addScoped) {
            this.removeScoped(scoped.scopedUnmounts);
        }
    },


    /**
        getComponent ()
    
        Return Type:
        Function
        对应的组件衍生类
    
        Description:
        获取当前挂载模块依赖的Component衍生类
    
        URL doc:
        http://amaple.org/######
    */
    getComponent: function getComponent(name) {
        return this.components[name];
    },


    /**
        addScoped ( scopedMounts: Object )
    
        Return Type:
        Object
        void
    
        Description:
        为vm增加局部变量
    
        URL doc:
        http://amaple.org/######
    */
    addScoped: function addScoped(scopedMounts) {
        var _this3 = this;

        foreach(scopedMounts || [], function (mountFunc) {
            mountFunc(_this3.vm);
        });
    },


    /**
        removeScoped ( scopedMounts: Object )
    
        Return Type:
        Object
        void
    
        Description:
        移除vm中的局部变量
    
        URL doc:
        http://amaple.org/######
    */
    removeScoped: function removeScoped(scopedUnmounts) {
        var _this4 = this;

        foreach(scopedUnmounts || [], function (unmountFunc) {
            unmountFunc(_this4.vm);
        });
    }
});

extend(Tmpl, {

    /**
        defineScoped ( scopedDefinition: Object, scopedVNode: Object, indexName: String )
    
        Return Type:
        Object
        局部变量操作对象
    
        Description:
        定义模板局部变量
        此方法将生成局部变量操作对象，内含替身变量前缀
        此替身变量名不能为当前vm中已有的变量名，所以需取的生僻些
        在挂载数据时如果有替身则会将局部变量名替换为替身变量名来达到不重复vm中已有变量名的目的
        局部变量vm将保存在当前挂载的vnode上，可直接修改此局部变量修改模板内容
     
        URL doc:
        http://amaple.org/######
    */
    defineScoped: function defineScoped(scopedDefinition, scopedVNode, indexName) {

        var
        /** @type {String} 范围变量前缀，为避免重复而定义得比较复杂 */
        scopedPrefix = "$$__AMAPLE_SCOPED_VARIABLE__$$__",
            scoped = {
            prefix: "" + scopedPrefix + Date.now() + "_",
            scopedMounts: [],
            scopedUnmounts: []
        },
            availableItems = [];

        foreach(scopedDefinition, function (val, varName) {
            var rscopedVar = "\\b" + varName + "\\b",
                scopedVarName = scoped.prefix + varName;
            if (varName === indexName) {
                scoped.indexName = new RegExp(rscopedVar);
                var obj = {};
                obj[scopedVarName] = val;
                scopedVNode.scoped = new ViewModel(obj);

                // 构造局部变量代理变量
                scoped.scopedMounts.push(function (vm) {
                    defineReactiveProperty(scopedVarName, function () {
                        return scopedVNode.scoped[scopedVarName];
                    }, noop, vm);
                });
            } else {

                // 构造静态的局部变量
                scoped.scopedMounts.push(function (vm) {
                    vm[scopedVarName] = val;
                });
            }

            // 构造局部变量卸载函数
            scoped.scopedUnmounts.push(function (vm) {
                delete vm[scopedVarName];
            });

            // 两边添加”\b“表示边界，以防止有些单词中包含局部变量名而错误替换
            availableItems.push(rscopedVar);
        });
        scoped.regexp = new RegExp(availableItems.join("|"), "g");

        return scoped;
    },


    /**
        defineDirective ( directive: Object )
    
        Return Type:
        void
    
        Description:
        定义指令
        指令对象必须包含”name“属性和”update“方法，”before“方法为可选项
    
        URL doc:
        http://amaple.org/######
    */
    defineDirective: function defineDirective(directive) {
        this.directives[directive.name] = directive;
    }
});

/**
    requestToRouting ( pathResolver: Object, method: String, post: Object )

    Return Type:
    void

    Description:
    为最外层模块对象绑定请求动作的事件代理
    参数post为post请求时的数据

    url doc:
    http://amaple.org/######
*/
function requestToRouting(pathResolver, method, post) {
    if (method === "GET") {
        var extra = {},
            nextStructure = Router.matchRoutes(pathResolver.pathname, extra),
            nextStructureBackup = nextStructure.copy();

        pathResolver.pathname = extra.path;
        if (!nextStructure.isEmpty()) {
            var location = {
                path: pathResolver.pathname + pathResolver.search,
                nextStructure: nextStructure,
                param: extra.param,
                get: pathResolver.search,
                post: post.nodeType ? serialize(post, false) : post,
                method: method,
                action: "PUSH"
            };

            // 根据更新后的页面结构体渲染新视图            
            Structure.currentPage.update(nextStructure).render(location, nextStructureBackup);
        } else {

            // 匹配路由后为空时返回false，外层将不阻止此链接
            return false;
        }
    } else if (method === "POST") {

        // post提交数据
        http.post(pathResolver.pathname + pathResolver.search, post, function (redirectPath) {
            if (redirectPath) {
                requestToRouting(amHistory.history.buildURL(redirectPath), "GET", post);
            }
        });
    }
}

function getRoutingElem(elem, rootElem, eventType) {
    var path = null;
    var pathAttr = eventType === "submit" ? amAttr.action : amAttr.href;
    do {
        path = attr(elem, pathAttr);
        if (path) {
            break;
        }
    } while ((elem = elem.parentNode) !== rootElem);

    return { elem: elem, path: path };
}

/**
    routing ( e: Object )
    
    Return Type:
    void
    
    Description:
    路由跳转事件函数
    
    URL doc:
    http://amaple.org/######
*/
function routingHandler(e) {
    var eventType = e.type.toLowerCase(),
        _getRoutingElem = getRoutingElem(e.target, this, eventType),
        elem = _getRoutingElem.elem,
        path = _getRoutingElem.path;

    if (path && !/http(?:s)?:\/\/|mailto:|#/i.test(path)) {

        var method = eventType === "submit" ? (attr(elem, "method") || "POST").toUpperCase() : "GET",
            buildedPath = amHistory.history.buildURL(path),
            target = attr(elem, "target") || "_self";

        if (window.location.host === buildedPath.host && target === "_self") {

            // 如果url相同则不做任何事
            if (buildedPath.pathname === amHistory.history.getPathname && buildedPath.search === amHistory.history.getQuery) {
                e.preventDefault();
            } else if (requestToRouting(buildedPath, method, method === "POST" ? elem : {}) !== false) {
                e.preventDefault();
            }
        }
    } else if (/^#/.test(path) && amHistory.mode === HASH) {
        e.preventDefault();
        throw runtimeErr("redirect", "hash模式下不可使用形如'#...'的锚链接作为href的值");
    }
}

// 模块标识名
var identifierName = "moduleIdentifier";

/**
	getIdentifier ()

	Return Type:
	String
	模块标识字符串

	Description:
	获取模块标识字符串
	用于区分不同模块

	URL doc:
	http://amaple.org/######
*/
function getIdentifier() {
	return "module" + guid();
}

/**
	findParentVm ( elem: DOMObject )

	Return Type:
	Object|Null
	父模块的vm对象
	没有找到则返回null

	Description:
	获取父模块的vm对象

	URL doc:
	http://amaple.org/######
*/
function findParentVm(elem) {
	var parentVm = null;
	while (elem.parentNode) {
		if (elem.__module__) {
			parentVm = elem.__module__.vm;
			break;
		}

		elem = elem.parentNode;
	}

	return parentVm;
}

/**
    initModuleLifeCycle ( module: Object, vmData: Object )
    
    Return Type:
    void
    
    Description:
    初始化模块对象的生命周期
    
    URL doc:
    http://amaple.org/######
*/
function initModuleLifeCycle(module, vmData) {

	// Module生命周期
	var lifeCycle = ["mounted", "queryUpdated", "paramUpdated", "unmount"];

	module.lifeCycle = {};
	foreach(lifeCycle, function (cycleItem) {
		module.lifeCycle[cycleItem] = vmData[cycleItem] || noop;
		delete vmData[cycleItem];
	});
}

/**
    fireModuleLifeCycle ( cycleFunc )
    
    Return Type:
    void
    
    Description:
    调用模块对象的生命周期函数
    该函数主要为封装虚拟DOM更新事物的提交操作
    
    URL doc:
    http://amaple.org/######
*/
function fireModuleLifeCycle(module, cycleName) {
	var nt = new NodeTransaction().start();
	module.lifeCycle[cycleName].apply(module, cache.getDependentPlugin(module.lifeCycle[cycleName]));

	// 提交节点更新事物，更新所有已更改的vnode进行对比
	// 对比新旧vnode计算出差异并根据差异更新到实际dom中
	nt.commit();
}

/**
	Module ( moduleName: String|DOMObject|Object, vmData: Object )

	Return Type:
	Object
	Module对象

	Description:
	创建模块对象初始化模块
    初始化包括转换监听对象，动态绑定数据到视图层
    module可传入：
	1、实际dom和fragment，此方法将直接解析此元素
	2、虚拟dom，只有单页模式时会传入此类参数

	URL doc:
	http://amaple.org/######
*/
function Module(moduleElem) {
	var vmData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	newClassCheck(this, Module);

	var devMode = moduleElem instanceof VNode ? DEVELOP_SINGLE : DEVELOP_COMMON;
	var parent = void 0,
	    moduleElemBackup = void 0;

	// 检查参数
	if (moduleElem) {
		check(moduleElem.nodeType).be(1, 3, 11).ifNot("Module", "module参数可传入模块元素的:module属性值或直接传入需挂在模块元素").do();
	} else {
		if (devMode === DEVELOP_COMMON) {
			throw argErr("Module", "没有指定moduleElem参数，你可直接传入需挂载的模块DOM元素");
		} else if (devMode === DEVELOP_SINGLE) {
			throw argErr("Module", "没有指定moduleElem参数");
		}
	}

	/////////////////////////////////
	/////////////////////////////////
	if (devMode === DEVELOP_SINGLE && Structure.currentPage) {

		// 只有单页模式时Structure.currentPage会有值
		// 单页模式时，使用Structure.getCurrentRender().parent.module.state获取父级的vm
		var currentRender = Structure.getCurrentRender();
		parent = currentRender.parent && currentRender.parent.module;

		this.param = currentRender.param;
		this.get = parseGetQuery(currentRender.get);
		this.post = currentRender.post;
		this.scopedCssObject = currentRender.scopedCssObject;

		// 参数传递过来后可移除，以免与下一次传递的参数混淆
		delete currentRender.param;
		delete currentRender.get;
		delete currentRender.post;
		delete currentRender.scopedCssObject;

		// 将此Module对象保存到页面结构体的对应位置中
		currentRender.module = this;
	} else {

		// 普通模式时，使用向上寻找DOM的形式获取父级vm
		parent = findParentVm(moduleElem);

		// 将当前Module对象保存在对应的模块根节点下，以便子模块寻找父模块的Module对象
		moduleElem.__module__ = this;

		// 将module元素转换为vnode，并拷贝vnode
		moduleElem = VNode.domToVNode(moduleElem);
		moduleElemBackup = moduleElem.clone();

		// 先清空后再添加上去进行对比
		// 避免造成if、else-if、for指令在对比时出错
		moduleElemBackup.clear();
		clear(moduleElemBackup.node);
	}
	this.parent = parent;

	initModuleLifeCycle(this, vmData);

	var
	// 获取后初始化vm的init方法
	// 对数据模型进行转换
	vm = new ViewModel((vmData.init || noop).apply(this, cache.getDependentPlugin(vmData.init || noop)) || {}),


	// 使用vm解析模板
	tmpl = new Tmpl(vm, vmData.depComponents || [], this);

	this.state = vm;
	this.references = {};

	// 解析模板，挂载数据
	// 如果forceMount为true则强制挂载moduleElem
	// 单页模式下未挂载的模块元素将会在ModuleLoader.load完成挂载
	// 普通模式下，如果parent为对象时表示此模块不是最上层模块，不需挂载
	tmpl.mount(moduleElem, Structure.currentPage ? false : !parent);

	/////////////////////////////////
	/////////////////////////////////
	if (devMode === DEVELOP_SINGLE) {

		// 单页模式下对模块内的元素添加局部样式
		// 此操作必须在tmpl.mounted()后执行
		// 以避免"{{ ... }}"作用于class、id等属性上导致无法添加局部属性的错误
		var scopedCssObject = this.scopedCssObject;
		appendScopedAttr(moduleElem, scopedCssObject.selectors, scopedCssObject.identifier);

		NodeTransaction.acting && NodeTransaction.acting.commit();
	} else {

		// Module内对比新旧vnode计算出差异，并根据差异更新到实际dom中
		moduleElem.diff(moduleElemBackup).patch();
	}

	// 调用mounted钩子函数
	this.mounted();
}

extend(Module.prototype, {

	/**
 	refs ( ref: String )
 	
 	Return Type:
 	DOMObject|Object
 	被引用的组件行为对象或元素
 	
 	Description:
 	获取被引用的组件行为对象或元素
 	当组件不可见时返回undefined
 
 	URL doc:
 	http://amaple.org/######
 */
	refs: function refs(ref) {
		return getReference(this.references, ref);
	},


	/**
 mounted ()
 Return Type:
 void
 Description:
 模块生命周期hook
 模块完成挂载并更新实际dom后调用
 URL doc:
 http://amaple.org/######
 */
	mounted: function mounted() {
		fireModuleLifeCycle(this, "mounted");
	},


	/**
 queryUpdated ()
 Return Type:
 void
 Description:
 模块生命周期hook
 当url更新时该模块未重新渲染且query参数更改时调用
 URL doc:
 http://amaple.org/######
 */
	queryUpdated: function queryUpdated() {
		fireModuleLifeCycle(this, "queryUpdated");
	},


	/**
 paramUpdated ()
 Return Type:
 void
 Description:
 模块生命周期hook
 当url更新时该模块未重新渲染且param参数更改时调用
 URL doc:
 http://amaple.org/######
 */
	paramUpdated: function paramUpdated() {
		fireModuleLifeCycle(this, "paramUpdated");
	},


	/**
 unmount ()
 Return Type:
 void
 Description:
 模块生命周期hook
 当该模块卸载时调用
 URL doc:
 http://amaple.org/######
 */
	unmount: function unmount() {
		if (!isEmpty(this.components)) {
			foreach(this.components, function (comp) {
				comp.__unmount__();
			});
		}

		this.lifeCycle.unmount.apply(this, cache.getDependentPlugin(this.lifeCycle.unmount));
	}
});

// 窗口滚动状态为初始化
var SCROLL_INITIALIZATION = 0;

// 模块加载状态为正在执行
var MODULELOADER_EXECUTING = 1;

var status = SCROLL_INITIALIZATION;
var execting = false;
var position = 0;

/**
	executeScrollStatus ()

	Return Type:
	void

	Description:
	将状态更改为模块执行状态


	URL doc:
	http://amaple.org/######
*/
function executeScrollStatus() {
	status = MODULELOADER_EXECUTING;
}

/**
	flushScroll ( scrollPosition: Number )

	Return Type:
	void

	Description:
	刷新窗口滚动位置


	URL doc:
	http://amaple.org/######
*/
function flushScroll(scrollPosition) {
	if (scrollPosition === undefined) {
		status = SCROLL_INITIALIZATION;
		execting = false;
	}

	scrollPosition = window.parseInt(scrollPosition || position) || 0;
	document.documentElement.scrollTop = scrollPosition;
	document.body.scrollTop = scrollPosition;
}

/**
	scrollTo ( position: Number )

	Return Type:
	void

	Description:
	滚动窗口位置
	滚动窗口分别有两种状态：


	URL doc:
	http://amaple.org/######
*/
function scrollTo(scrollPosition) {
	if (status === MODULELOADER_EXECUTING) {
		if (execting === false) {
			execting = true;
			position = scrollPosition;
		}
	}

	if (status === SCROLL_INITIALIZATION) {
		flushScroll(scrollPosition);
	}
}

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
function compareArgs(newArgs, originalArgs) {
	var len = Object.keys(newArgs).length;

	var isChanged = false;
	if (len !== Object.keys(originalArgs).length) {
		isChanged = true;
	} else {
		if (len > 0) {
			foreach(newArgs, function (newVal, key) {
				if (newVal !== originalArgs[key]) {
					isChanged = true;

					return false;
				}
			});
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
function ModuleLoader(nextStructure, param, get, post) {

	this.nextStructure = nextStructure;
	this.param = param;
	this.get = get;
	this.post = post;

	// 等待加载完成的页面模块
	// 每加载完成一个页面模块都会将此页面模块在waiting数组上移除
	// 当waiting为空时则表示相关页面模块已全部加载完成
	this.waiting = [];

	// 等待更新完成的页面模块
	// 每更新完成一个页面模块都会将此页面模块在updated数组上移除
	// 当updated为空时则表示相关页面模块已全部更新完成
	// 此时可做一些模块更新完成的操作
	this.updated = [];

	// 模块更新函数上下文
	// this.moduleUpdateContext = [];

	// 加载错误时会将错误信息保存在此
	this.moduleError = null;

	// 当前跳转的标题
	this.title = "";

	// 已使用的模块节点数组
	// 防止多层使用相同模块名时，子模块获取到的是父模块的模块节点
	this.usedModuleNodes = [];
}

extend(ModuleLoader.prototype, {

	/**
 	addWaiting ( name: String )
 
 	Return Type:
 	void
 
 	Description:
 	将等待的页面模块名放入context.waiting和context.updated中
 	context.waiting为等待加载的队列
 	context.updated为等待更新的队列
 
 	URL doc:
 	http://amaple.org/######
 */
	addWaiting: function addWaiting(name) {
		this.waiting.push(name);
		this.updated.push(name);
	},


	/**
 	delWaiting ( name: String, isWaitLoad )
 
 	Return Type:
 	void
 
 	Description:
 	将已加载或更新完成的页面模块从等待列表中移除
 	如果等待队列已空则立即刷新模块
 		isWaitLoad为true时表示处理等待加载的队列
 	否则表示处理等待更新的队列
 
 	URL doc:
 	http://amaple.org/######
 */
	delWaiting: function delWaiting(name, isWaitLoad) {
		var waitingType = isWaitLoad ? "waiting" : "updated",
		    pointer = this[waitingType].indexOf(name);
		if (pointer !== -1) {
			this[waitingType].splice(pointer, 1);
		}

		// 如果等待队列已空则立即刷新模块
		if (isEmpty(this[waitingType])) {
			isWaitLoad ? this.flush() : ModuleLoader.finish();
		}
	},


	/**
 	updateTitle ( title: String )
 
 	Return Type:
 	void
 
 	Description:
 	更新标题
 	标题按模块从上到下，从外到内的顺序遍历获取第一个有标题的模块进行更新
 
 	URL doc:
 	http://amaple.org/######
 */
	updateTitle: function updateTitle(title) {
		if (!this.title) {
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
	load: function load(structure, param) {
		var _this = this;

		structure = structure || this.nextStructure.entity;
		param = param || this.param;

		foreach(structure, function (route) {
			if (route.hasOwnProperty("notUpdate") && route.modulePath !== null) {

				// 需过滤匹配到的空模块
				// 空模块没有modle对象，也没有param等参数
				if (route.module && param[route.name]) {
					var paramData = param[route.name].data;

					// 比较新旧param和get,post对象中的值，如果有改变则调用paramUpdated和queryUpdated
					if (compareArgs(paramData, route.module.param)) {
						route.module.param = paramData;
						route.module.paramUpdated();
					}

					var getData = parseGetQuery(_this.get);
					if (compareArgs(getData, route.module.get) || compareArgs(_this.post, route.module.post)) {
						route.module.get = getData;
						route.module.post = _this.post;
						route.module.queryUpdated();
					}
				}

				delete route.notUpdate;
			} else {

				// 需更新模块与强制重新渲染模块进行渲染
				var moduleNode = route.moduleNode;

				// 如果结构中没有模块节点则查找DOM树获取节点
				if (!moduleNode) {
					moduleNode = queryModuleNode(route.name === "default" ? "" : route.name, route.parent && route.parent.moduleNode.node || undefined);

					// 模块存在并且不在已使用的模块节点中时可使用
					if (moduleNode && _this.usedModuleNodes.indexOf(moduleNode) === -1) {
						_this.usedModuleNodes.push(moduleNode);

						// 获取到moduleNode时去解析此moduleNode
						moduleNode = VNode.domToVNode(moduleNode);
						var tmpl = new Tmpl({}, [], {});
						tmpl.mount(moduleNode, true);
						moduleNode.render();

						route.moduleNode = moduleNode;
					} else {

						// 没有获取到moduleNode时将moduleNode封装为一个获取函数
						// 此函数将会在它的父模块解析后再调用，此时就能获取到route.moduleNode
						moduleNode = function moduleNode() {
							if (route.moduleNode) {
								return route.moduleNode;
							} else {
								throw moduleErr("moduleNode", "\u627E\u4E0D\u5230\u52A0\u8F7D\u8DEF\u5F84\u4E3A\"" + route.modulePath + "\"\u7684\u6A21\u5757node");
							}
						};
					}
				}

				// 无刷新跳转组件调用来完成无刷新跳转
				ModuleLoader.actionLoad.call(_this, route, moduleNode, param[route.name] && param[route.name].data, _this.get, _this.post);
			}

			// 此模块下还有子模块需更新
			if (type$1(route.children) === "array") {

				// 添加子模块容器并继续加载子模块
				_this.load(route.children, param[route.name].children);
			}
		});
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
	flush: function flush() {
		if (this.moduleError) {

			// 加载模块遇到错误，直接处理错误信息
			var pathResolver = amHistory.history.buildURL(this.moduleError),
			    extra = {},
			    nextStructure = Router.matchRoutes(pathResolver.pathname, extra),
			    nextStructureBackup = nextStructure.copy(),
			    location = {
				path: this.moduleError,
				nextStructure: nextStructure,
				param: extra.param,
				get: pathResolver.search,
				post: {},
				action: "REPLACE" // 暂不确定是不是为"PUSH"???
			};

			// 根据更新后的页面结构体渲染新视图
			Structure.currentPage.update(location.nextStructure).render(location, nextStructureBackup);
		} else {
			executeScrollStatus();
			this.nextStructure.flush();
		}
	}
});

extend(ModuleLoader, {

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
	actionLoad: function actionLoad(currentStructure, moduleNode, param, args, data, method, timeout) {
		var before = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : noop;
		var success = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : noop;

		var _this2 = this;

		var error = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : noop;

		var _abort = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : noop;

		// 给模块元素添加编号属性，此编号是用于模块加载时的模块识别
		var moduleIdentifier = historyModule && historyModule.moduleIdentifier || moduleNode && moduleNode.nodeType === 1 && moduleNode.attr(identifierName),
		    path = currentStructure.modulePath;

		if (!moduleIdentifier) {
			moduleIdentifier = getIdentifier();
		}

		// 加入等待加载队列
		this.addWaiting(moduleIdentifier);

		// path为null时表示此模块为空
		// 此时只需删除模块内元素
		if (path === null) {
			currentStructure.updateFn = function () {
				moduleNode = type$1(moduleNode) === "function" ? moduleNode() : moduleNode;
				var diffBackup = moduleNode.clone();
				moduleNode.clear();
				moduleNode.diff(diffBackup).patch();
			};

			// 获取模块更新函数完成后在等待队列中移除
			// 此操作需异步，否则将会实时更新模块
			setTimeout(function () {
				_this2.delWaiting(moduleIdentifier, true);
			});

			return false;
		}

		//////////////////////////////////////////////////
		//////////////////////////////////////////////////
		//////////////////////////////////////////////////
		var thisLoader = this,
		    baseURL = configuration.getConfigure("baseURL").module,
		    suffix = configuration.getConfigure("moduleSuffix");
		path = path.substr(0, 1) === "/" ? baseURL.substr(0, baseURL.length - 1) : baseURL + path;
		path += suffix + args;

		var historyModule = cache.getModule(path),
		    signCurrentRender = function signCurrentRender(scopedCssObject) {
			return function () {
				Structure.signCurrentRender(currentStructure, param, args, data, scopedCssObject);
			};
		},
		    end = function end(route) {
			return function () {

				// 调用子模块的视图更新函数
				if (type$1(route.children) === "array") {
					foreach(route.children, function (child) {
						if (child.updateFn) {
							child.updateFn();
							delete child.updateFn;
						}
					});
				}

				// 移除已更新的模块
				// 这将用于所有视图更新完成后的操作
				thisLoader.delWaiting(moduleIdentifier, false);
			};
		};

		// 请求不为post
		// 并且已有缓存
		if ((!method || method.toUpperCase() !== "POST") && historyModule) {
			this.updateTitle(historyModule.title);
			currentStructure.updateFn = function () {
				moduleNode = type$1(moduleNode) === "function" ? moduleNode() : moduleNode;
				if (!moduleNode[identifierName]) {
					moduleNode[identifierName] = moduleIdentifier;
				}

				historyModule.updateFn(am, {
					moduleNode: moduleNode,
					moduleFragment: historyModule.updateFn.moduleFragment.clone(),
					NodeTransaction: NodeTransaction,
					require: require,
					signCurrentRender: signCurrentRender(historyModule.scopedCssObject),
					end: end(this),
					extend: extend
				});
			};

			// 获取模块更新函数完成后在等待队列中移除
			// 此操作需异步，否则将会实时更新模块
			setTimeout(function () {
				_this2.delWaiting(moduleIdentifier, true);
			});
		} else {

			// 请求模块跳转页面数据
			http.request({

				url: path,
				method: /^(GET|POST)$/i.test(method) ? method.toUpperCase() : "GET",
				data: data,
				timeout: timeout || 0,
				cache: false,
				beforeSend: function beforeSend() {
					before(moduleNode);
				},
				abort: function abort() {
					_abort(moduleNode);
				}
			}).done(function (moduleString) {

				/////////////////////////////////////////////////////////
				// 编译module为可执行函数
				// 将请求的html替换到module模块中
				// scopedCssObject函数中包含需设置范围属性的选择器和范围属性名，它将在Module中被设置
				var _compileModule = compileModule(moduleString),
				    updateFn = _compileModule.updateFn,
				    title = _compileModule.title,
				    scopedCssObject = _compileModule.scopedCssObject;

				_this2.updateTitle(title);

				currentStructure.updateFn = function () {
					moduleNode = type$1(moduleNode) === "function" ? moduleNode() : moduleNode;

					// 缓存模块
					cache.pushModule(path, {
						title: title,
						updateFn: updateFn,
						moduleIdentifier: moduleIdentifier,
						scopedCssObject: scopedCssObject
					});

					if (!moduleNode[identifierName]) {
						moduleNode[identifierName] = moduleIdentifier;
					}

					updateFn(am, {
						moduleNode: moduleNode,
						moduleFragment: updateFn.moduleFragment.clone(),
						NodeTransaction: NodeTransaction,
						require: require,
						signCurrentRender: signCurrentRender(scopedCssObject),
						end: end(this),
						extend: extend
					});

					// 调用success回调
					success(moduleNode);
				};

				// 获取模块更新函数完成后在等待队列中移除
				_this2.delWaiting(moduleIdentifier, true);
			}).fail(function (amXHR, errorCode) {

				// 保存错误信息并立即刷新
				_this2.moduleError = Router.getError(errorCode);
				_this2.flush();
				error(moduleNode, error);
			});
		}
	},


	/**
 	finish ()
 		Return Type:
 	void
 		Description:
 	所有模块视图更新完成后调用
 		URL doc:
 	http://amaple.org/######
 */
	finish: function finish() {
		scrollTo(0);
		flushScroll();
	}
});

/**
    unmountStructure ( structure: Object )

    Return Type:
    void

    Description:
    卸载结构
    当更新页面时，相应的结构也将会变化
    需将不显示的解雇卸载

    URL doc:
    http://amaple.org/######
*/
function unmountStructure(structure) {
    foreach(structure, function (unmountItem) {
        if (unmountItem.children && unmountItem.children.length > 0) {
            unmountStructure(unmountItem.children);
        }

        if (unmountItem.module) {
            unmountItem.module.unmount();
        }
    });
}

/**
    diffStructure ( newEntity: Object, oldEntity: Object, readyToUnmount: Array )

    Return Type:
    void

    Description:
    对比新旧结构实体的差异
    如果结构未改变则将旧结构的module、moduleNode赋值给对应新结构上
    如果结构改变则记录到readyToUnmountz数组中即将卸载

    URL doc:
    http://amaple.org/######
*/
function diffStructure(newEntity, oldEntity, readyToUnmount) {
    var oldItem = void 0;
    foreach(newEntity, function (newItem, i) {
        oldItem = oldEntity[i];
        if (oldItem && oldItem.name === newItem.name) {

            newItem.moduleNode = oldItem.moduleNode;
            if (oldItem.modulePath === newItem.modulePath && !newItem.hasOwnProperty("forcedRender")) {

                newItem.notUpdate = null;
                newItem.module = oldItem.module;

                // 相同时才去对比更新子结构
                if (type$1(newItem.children) === "array" && type$1(oldItem.children) === "array") {
                    diffStructure(newItem.children, oldItem.children, readyToUnmount);
                }
            } else {
                readyToUnmount.push(oldItem);
            }
        }
    });
}

// [
//  { module: obj1, name: "default", moduleNode: node1, parent: null, children: [
//    { module: obj2, name: "header", moduleNode: node2, parent: parentObj },
//    { module: obj3, name: "main", moduleNode: node3, parent: parentObj },
//    { module: obj4, name: "footer", moduleNode:node4, parent: parentObj }
// ] }
// ]

function Structure(entity) {
    this.entity = entity;
}

extend(Structure.prototype, {
    update: function update(newStructure) {
        var newEntity = newStructure.entity,
            oldEntity = this.entity,
            readyToUnmount = [];

        // 对比新旧结构实体的差异，并在相同结构上继承旧结构的module和moduleNode
        diffStructure(newEntity, oldEntity, readyToUnmount);
        this.entity = newEntity;

        // 调用结构卸载函数
        unmountStructure(readyToUnmount);

        return this;
    },


    /**
        isEmpty ()
    
        Return Type:
        Boolean
        是否为空结构
    
        Description:
        判断此结构对象是否为空
    
        URL doc:
        http://amaple.org/######
    */
    isEmpty: function isEmpty$$1() {
        var empty = true;
        foreach(this.entity, function (entity) {
            if (entity.modulePath !== null) {
                empty = false;

                return false;
            }
        });

        return empty;
    },


    /**
        copy ()
    
        Return Type:
        Object
    
        Description:
        拷贝一个Structure对象
    
        URL doc:
        http://amaple.org/######
    */
    copy: function copy() {
        var _this = this;

        var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.entity;
        var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var copyEntity = [];

        foreach(entity, function (item) {
            var copyItem = {};

            foreach(item, function (v, k) {
                if (k === "children") {
                    copyItem.children = _this.copy(v, copyItem);
                } else if (k === "parent") {
                    copyItem.parent = parent;
                } else {
                    copyItem[k] = v;
                }
            });

            copyEntity.push(copyItem);
        });

        return parent ? copyEntity : new Structure(copyEntity);
    },


    /**
           render ( location: Object )
       
           Return Type:
           void
       
           Description:
           根据location对象渲染出对应的模块
       
           URL doc:
           http://amaple.org/######
       */
    render: function render(location, nextStructureBackup) {

        var locationGuide = {};
        if (location.action !== "POP") {
            locationGuide.structure = nextStructureBackup;
            locationGuide.param = location.param;
            locationGuide.get = location.get;
            locationGuide.post = location.post;
        }

        // 使用模块加载器来加载更新模块
        new ModuleLoader(location.nextStructure, location.param, location.get, location.post).load();

        switch (location.action) {
            case "PUSH":
                amHistory.push(locationGuide, location.path);

                break;
            case "REPLACE":
                amHistory.replace(locationGuide, location.path);

                break;
            case "NONE":
                amHistory.saveState(locationGuide, location.path);

                break;
            case "POP":
            // do nothing
        }
    },


    /**
        flush ( structures: Array )
    
        Return Type:
        void
    
        Description:
        刷新更新后的结构到视图层
    
        URL doc:
        http://amaple.org/######
    */
    flush: function flush(structures) {
        var self = this;
        foreach(structures || this.entity, function (structure) {
            if (structure.updateFn) {
                structure.updateFn();
                delete structure.updateFn;
            }

            // 如果当前structure有updateFn时，它的子结构updateFn将会在它的updateFn内被调用
            // 如果当前structure没有updateFn时，需遍历它的子结构查看是否有updateFn
            else if (structure.children && structure.children.length > 0) {
                    self.flush(structure.children);
                }
        });
    }
});

extend(Structure, {

    /**
        signCurrentRender ( structureItem: Object, param: Object, args: String, data: Object, scopedCssObject: Object )
        
        Return Type:
        void
    
        Description:
        标记当前正在渲染的页面结构项并传递对应的参数到正在渲染的模块内
        这样可以使创建Module对象时获取父级的vm，和保存扫描到的moduleNode
    
        URL doc:
        http://amaple.org/######
    */
    signCurrentRender: function signCurrentRender(structureItem, param, args, data, scopedCssObject) {
        structureItem.param = param;
        structureItem.get = args;
        structureItem.post = data;
        structureItem.scopedCssObject = scopedCssObject;
        Structure.currentRender = structureItem;
    },


    /**
        getCurrentRender ()
    
        Return Type:
        Object
        当前结构项
    
        Description:
        获取当前正在渲染的页面结构项
    
        URL doc:
        http://amaple.org/######
    */
    getCurrentRender: function getCurrentRender() {
        return Structure.currentRender;
    },


    /**
        saveSubModuleNode ( vnode: Object, moduleName: String )
    
        Return Type:
        void
    
        Description:
        保存扫描到的模块节点对象以便下次使用时直接获取
    
        URL doc:
        http://amaple.org/######
    */
    saveSubModuleNode: function saveSubModuleNode(vnode, moduleName) {
        foreach(Structure.currentRender.children, function (child) {
            if (child.name === (moduleName || "default") && !child.moduleNode) {
                child.moduleNode = vnode;
                return false;
            }
        });
    }
});

function Router(finger) {
    this.finger = finger;
}

extend(Router.prototype, {

    /**
        module ()
    
        Return Type:
        Object
        当前Router对象
    
        Description:
        指定当前配置的模块节点
    
        URL doc:
        http://amaple.org/######
    */
    module: function module() {
        var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";

        check(moduleName).type("string").notBe("").ifNot("Router.module", "模块名必须为不为空的字符串，不传入模块名默认为'default'").do();

        foreach(this.finger, function (routeItem) {
            if (routeItem.name === moduleName) {
                throw RouterErr("moduleName", "同级模块的名字不能重复");
            }
        });

        this.routeItem = { name: moduleName, routes: [] };
        this.finger.push(this.routeItem);

        return this;
    },


    /**
        route ()
    
        Return Type:
        Object
        当前Router对象
    
        Description:
        为一个模块节点配置渲染模块路径
    
        URL doc:
        http://amaple.org/######
    */
    route: function route(pathExpr, modulePath, childDefineFn) {
        check(pathExpr).type("string", "array").ifNot("Router.route", "pathExpr参数必须为字符串或数组");

        if (!this.routeItem) {
            throw RouterErr("Router.module", "调用route()前必须先调用module()定义模块路由");
        }

        var route = {
            modulePath: modulePath,
            path: Router.pathToRegexp(pathExpr)
        };
        this.routeItem.routes.push(route);

        if (type$1(childDefineFn) === "function") {
            route.children = [];
            childDefineFn(new Router(route.children));
        }

        return this;
    },


    /**
        defaultRoute ()
    
        Return Type:
        Object
        当前Router对象
    
        Description:
        为一个模块节点配置路由路径为""时的渲染模块路径
    
        URL doc:
        http://amaple.org/######
    */
    defaultRoute: function defaultRoute(modulePath, childDefineFn) {
        this.route("", modulePath, childDefineFn);
        return this;
    },


    /**
        redirect ()
    
        Return Type:
        Object
        当前Router对象
    
        Description:
        在当前模块目录层次定义重定向
    
        URL doc:
        http://amaple.org/######
    */
    redirect: function redirect(from, to) {
        var redirect = void 0;
        foreach(this.finger, function (routeItem) {
            if (routeItem.redirect) {
                redirect = routeItem;
                return false;
            }
        });

        if (!redirect) {
            redirect = {
                redirect: []
            };

            this.finger.push(redirect);
        }

        redirect.redirect.push({ from: Router.pathToRegexp(from, "redirect"), to: to });

        return this;
    },


    /**
        forcedRender ()
    
        Return Type:
        Object
        当前Router对象
    
        Description:
        强制渲染模块
        调用此函数后，部分匹配相同路由的模块也会强制重新渲染
    
        URL doc:
        http://amaple.org/######
    */
    forcedRender: function forcedRender() {
        this.routeItem.forcedRender = null;
        return this;
    },


    /**
        error404 ( path404: String )
    
        Return Type:
        void
    
        Description:
        设置404页面路径
        页面跳转时如果有任何一个模块未找到对应模块文件则会重定向到404路径并重新匹配路由来更新模块。
    
        URL doc:
        http://amaple.org/######
    */
    error404: function error404(path404) {
        Router.errorPaths.error404 = path404;
    },


    /**
        error500 ( path500: String )
    
        Return Type:
        void
    
        Description:
        设置错误500页面路径
        页面跳转时如果有任何一个模块处理出现500错误，则会匹配500路径进行跳转
    
        URL doc:
        http://amaple.org/######
    */
    error500: function error500(path500) {
        Router.errorPaths.error500 = path500;
    }
});

extend(Router, {
    routeTree: [],
    errorPaths: {},

    /**
        getError ( errorCode: Number )
    
        Return Type:
        Object
        错误路径
    
        Description:
        获取错误路径
    
        URL doc:
        http://amaple.org/######
    */
    getError: function getError(errorCode) {
        return this.errorPaths["error" + errorCode];
    },


    /**
        pathToRegexp ()
    
        Return Type:
        Object
        解析后的路径正则表达式与需捕获的参数对象
    
        Description:
        将一个路径解析为路径匹配正则表达式及需捕获的参数
        正则表达式解析示例：
        // /settings => /\/settings/、/settings/:page => /\/settings/([^\\/]+?)/、/settings/:page(\d+)
    
        URL doc:
        http://amaple.org/######
    */
    pathToRegexp: function pathToRegexp(pathExpr, from) {
        var pathObj = { param: {} },
            texpr = type$1(pathExpr);
        var i = 1,


        // 如果path为redirect中的from，则直接添加结束符号
        // ”/doc“可重定向到”/doc/first“，但”/doc/zero“不能重定向，否则可能重定向为”/doc/first/zero“而导致错误
        endRegexp = "(?:\\/)?" + (from === "redirect" ? "$" : "");

        // 如果pathExpr为数组，则需预处理
        if (texpr === "array") {

            // 如果路径表达式为""时需在结尾增加"$"符号才能正常匹配到
            foreach(pathExpr, function (exprItem, i) {
                exprItem = exprItem.substr(-1) === "/" ? exprItem.substr(0, exprItem.length - 1) : exprItem;
                if (exprItem === "" && from !== "redirect") {
                    pathExpr[i] += "$";
                }
            });

            pathExpr = "(" + pathExpr.join("|") + ")";
            i++;
        } else if (texpr === "string") {
            pathExpr = pathExpr.substr(-1) === "/" ? pathExpr.substr(0, pathExpr.length - 1) : pathExpr;

            // 如果路径表达式为""时需在结尾增加"$"符号才能正常匹配到
            endRegexp += pathExpr === "" && from !== "redirect" ? "$" : "";
        }

        pathObj.regexp = new RegExp("^" + pathExpr.replace("/", "\\/").replace(/:([\w$]+)(?:(\(.*?\)))?/g, function (match, rep1, rep2) {
            pathObj.param[rep1] = i++;

            return rep2 || "([^\\/]+)";
        }) + endRegexp, "i");

        return pathObj;
    },


    /**
        matchRoutes ()
    
        Return Type:
        Object
        匹配结果集
    
        Description:
        使用一个path匹配更新模块
        匹配结果示例：
        [ { module: "...", modulePath: "...", parent: ..., param: {}, children: [ {...}, {...} ] } ]
    
        URL doc:
        http://amaple.org/######
    */
    matchRoutes: function matchRoutes(path, extra) {
        var routeTree = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.routeTree;

        var _this = this;

        var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var matchError404 = arguments[4];

        if (parent === null) {

            // 初始化
            extra.param = {};
            extra.path = path;
        }

        var routes = [];
        foreach(routeTree, function (route) {
            if (route.hasOwnProperty("redirect")) {
                var isContinue = true,
                    pathBackup = path;

                foreach(route.redirect, function (redirect) {

                    path = path.replace(redirect.from.regexp, function () {
                        isContinue = false;
                        var to = redirect.to;

                        foreach(redirect.from.param, function (i, paramName) {
                            to = to.replace(":" + paramName, matchPath[i]);
                        });

                        return to;
                    });

                    // 更新extra.path
                    if (pathBackup) {
                        extra.path = extra.path.replace(pathBackup, path);
                    } else {
                        extra.path += (extra.path.substr(-1) === "/" ? "" : "/") + path;
                    }

                    return isContinue;
                });

                return false;
            }
        });

        foreach(routeTree, function (route) {

            // 过滤重定向的项
            if (!route.name) {
                return;
            }

            var entityItem = {
                name: route.name,
                modulePath: null,
                moduleNode: null,
                module: null,
                parent: parent
            };
            var isMatch = false;

            foreach(route.routes, function (pathReg) {
                var matchPath = void 0,
                    modulePath = pathReg.modulePath,
                    isContinue = true;

                if (route.hasOwnProperty("forcedRender")) {
                    entityItem.forcedRender = route.forcedRender;
                }

                if (matchPath = path.match(pathReg.path.regexp)) {
                    isContinue = false;
                    isMatch = true;

                    extra.param[route.name] = { data: {} };
                    foreach(pathReg.path.param, function (i, paramName) {
                        var data = matchPath[i] || "";
                        modulePath = modulePath.replace(new RegExp(":" + paramName, "g"), data);

                        extra.param[route.name].data[paramName] = data;
                    });
                    entityItem.modulePath = modulePath;

                    routes.push(entityItem);
                }

                if (type$1(pathReg.children) === "array") {
                    var _extra = { param: {}, path: extra.path },
                        children = _this.matchRoutes(matchPath ? path.replace(matchPath[0], "") : path, _extra, pathReg.children, entityItem);
                    extra.path = _extra.path;

                    // 如果父路由没有匹配到，但子路由有匹配到也需将父路由添加到匹配项中
                    if (!isEmpty(children)) {
                        if (entityItem.modulePath === null) {
                            isMatch = true;

                            entityItem.modulePath = pathReg.modulePath;
                            routes.push(entityItem);
                            extra.param[route.name] = { data: {} };
                        }

                        entityItem.children = children;
                        extra.param[route.name].children = _extra.param;
                    }
                }

                return isContinue;
            });

            // 如果没有匹配到任何路由但父模块有匹配到则需添加一个空模块信息到匹配路由中
            if (!isMatch && (parent === null || parent.modulePath !== null)) {
                routes.push(entityItem);
            }
        });

        // 最顶层时返回一个Structure对象
        if (parent === null) {

            // 如果没有匹配到任何更新模块则匹配404页面路径
            if (isEmpty(routes) && Router.errorPaths.error404 && !matchError404) {
                return this.matchRoutes(Router.errorPaths.error404, param, undefined, undefined, true);
            } else {
                return new Structure(routes);
            }
        } else {
            return routes;
        }
    }
});

/**
	install ( plugin: Object )
	
	Return Type:
	void
	
	Description:
	安装插件
	插件定义对象必须拥有build方法
	若插件安装后会返回一个对象，则可在模块或组件的生命周期钩子函数中直接使用插件名引入，框架会自动注入对应插件
	
	URL doc:
	http://amaple.org/######
*/
function install(pluginDef) {
	check(pluginDef.name).type("string").notBe("").check(cache.hasPlugin(pluginDef.name)).be(false).ifNot("plugin.name", "plugin安装对象必须定义name属性以表示此插件的名称，且不能与已有插件名称重复").do();

	check(pluginDef.build).type("function").ifNot("plugin.build", "plugin安装对象必须包含build方法").do();

	var path = Loader.getCurrentPath();
	var find = false;
	foreach(pluginBuilder.buildings, function (building) {
		if (building.url === path) {
			building.install = function () {
				buildPlugin(pluginDef, am);
			};
			find = true;
		}
	});

	// 没有找到需安装插件时直接安装此插件
	// 用于普通模式下安装插件
	if (!find) {
		buildPlugin(pluginDef, am);
	}
}

function define(deps, callback) {
	correctParam(deps, callback).to("array", "function").done(function () {
		deps = this.$1 || [];
		callback = this.$2;
	});

	var path = Loader.getCurrentPath();
	foreach(pluginBuilder.buildings, function (building) {
		if (building.url === path) {
			building.install = function () {
				buildPlugin({
					name: building.name,
					build: callback
				}, {}, deps);
			};
		}
	});
}
define.amd = {};

function amd(pluginDef, buildings) {
	if (!window.define) {
		window.define = define;
	}

	buildings.push({
		url: pluginDef.url,
		name: pluginDef.name
	});
}

function getGlobal$1(globalName) {
	var globalObj = window[globalName];
	delete window[globalName];

	return globalObj;
}

function iife(pluginDef, buildings) {

	var building = {};
	buildings.push(building);

	// 该返回的函数将会在script的onload回调函数中执行
	return function () {
		var pluginObj = getGlobal$1(pluginDef.global || pluginDef.name);
		building.install = function () {
			buildPlugin({
				name: pluginDef.name,
				build: function build() {
					return pluginObj;
				}
			}, {});
		};
	};
}

// 支持的插件规范
var formats = { amd: amd, iife: iife };

var pluginBuilder = {
	buildings: [],
	save: function save(pluginDef) {
		var ret = void 0;

		if (type$1(pluginDef) === "string") {
			this.buildings.push({
				url: pluginDef
			});
		} else if (type$1(pluginDef) === "object") {
			if (pluginDef.build) {

				// amaple规范的插件对象
				this.buildings.push({
					install: function install$$1() {
						install(pluginDef);
					}
				});
			} else {
				if (!pluginDef.name) {
					throw pluginErr("name", "必须指定name属性以表示此插件的名称，且不能与已有插件名称重复");
				}

				// 外部插件对象
				var formatFn = formats[pluginDef.format.toLowerCase()];
				if (formatFn) {
					ret = formatFn(pluginDef, this.buildings);
				} else {
					throw pluginErr("format", "\u5BF9\u4E8E\u5916\u90E8\u7684js\u5E93\uFF0Camaple.js\u76EE\u524D\u652F\u6301" + Object.keys(formats).join("、") + "\u89C4\u8303");
				}
			}
		} else {
			throw pluginErr("type", "plugin\u7684\u6784\u5EFA\u5BF9\u8C61\u7C7B\u578B\u53EA\u80FD\u4E3Astring\u6216object\uFF0C\u5F53string\u65F6\u4E00\u5B9A\u4E3Aplugin\u7684\u52A0\u8F7D\u76F8\u5BF9\u8DEF\u5F84\uFF0C\u5F53object\u65F6\u4E3A\u6784\u5EFA\u5BF9\u8C61\u6216" + Object.keys(formats).join("/") + "\u89C4\u8303\u7684plugin\u7684\u52A0\u8F7D\u4FE1\u606F");
		}

		return ret;
	},
	build: function build() {
		foreach(this.buildings, function (building) {
			building.install();
		});

		if (window.define) {
			delete window.define;
		}
	}
};

/**
	start ( routerConfig: Object )
	
	Return Type:
	void
	
	Description:
	启动am路由
	表示启动单页模式
	
	URL doc:
	http://amaple.org/######
*/
function startRouter(routerConfig) {
	check(routerConfig).type("object").ifNot("am.startRouter", "当routerConfig传入参数时，必须为object类型").do();

	// 执行routes配置路由
	(routerConfig.routes || noop)(new Router(Router.routeTree));
	delete routerConfig.routes;

	routerConfig.history = routerConfig.history || AUTO;
	if (routerConfig.history === AUTO) {
		if (amHistory.supportNewApi()) {
			routerConfig.history = BROWSER;
		} else {
			routerConfig.history = HASH;
		}
	}

	amHistory.initHistory(routerConfig.history);

	// 当使用hash模式时纠正路径
	// 这一般会在AUTO模式下起作用，后台设置了跳转映射并在低版本浏览器中访问时有效
	var href = window.location.href,
	    host = window.location.protocol + "//" + window.location.host + "/";
	if (routerConfig.history === HASH && href !== host && href.indexOf(host + "#") === -1) {
		window.location.replace(amHistory.history.correctLocation(window.location));

		// 改变了地址后浏览器会重新请求新地址
		return;
	}
	delete routerConfig.history;
	event.on(document.body, "click submit", routingHandler);

	var plugin = routerConfig.plugin,
	    loadPlugins = [];

	// 将除routes、history、plugin外的配置信息进行处理保存
	delete routerConfig.plugin;
	configuration(routerConfig);

	// 初始化插件列表
	var rexternalURL = /^http(?:s)?:\/\//,
	    pluginBaseURL = configuration.getConfigure("baseURL").plugin,
	    callbacks = {};
	if (type$1(plugin) === "array") {
		foreach(plugin, function (pluginItem) {
			if (type$1(pluginItem) === "string") {

				// 去除请求url的首尾空格
				pluginItem = pluginItem.trim();

				// plugin构建格式为am规范时
				pluginItem = rexternalURL.test(pluginItem) ? pluginItem : pluginBaseURL + pluginItem;
				loadPlugins.push(pluginItem);
			} else if (type$1(pluginItem) === "object" && type$1(pluginItem.url) === "string") {

				// 去除请求url的首尾空格
				pluginItem.url = pluginItem.url.trim();

				// plugin构建格式为amd/iife规范时
				pluginItem.url = rexternalURL.test(pluginItem.url) ? pluginItem.url : pluginBaseURL + pluginItem.url;
				loadPlugins.push(pluginItem.url);
			}

			// 此回调函数用于在iife规范下获取window对象的全局属性
			// 返回的回调函数将会在对应的script的onload函数中执行
			var callback = pluginBuilder.save(pluginItem);
			if (callback) {
				callbacks[pluginItem.url] = callback;
			}
		});
	}

	// 如果存在需加载的插件则待插件加载完成后再执行模块更新操作
	require(loadPlugins, function () {

		// 插件加载完成后构建插件
		pluginBuilder.build();

		var extra = {},
		    path = amHistory.history.getPathname(),
		    location = {
			nextStructure: Router.matchRoutes(path, extra),
			path: extra.path,
			param: extra.param,
			get: amHistory.history.getQuery(),
			post: {},
			method: "GET",
			action: "NONE"
		};

		// 当路由被重定向后需使用replace的方式修改当前的url
		if (path !== location.path) {
			location.action = "REPLACE";
		}

		// Router.matchRoutes()匹配当前路径需要更新的模块
		// 因路由刚启动，故将nextStructure直接赋值给currentPage
		Structure.currentPage = location.nextStructure;

		// 根据更新后的页面结构体渲染新视图
		Structure.currentPage.render(location, location.nextStructure.copy());
	}, TYPE_PLUGIN, callbacks);
}

// 创建插件
cache.pushPlugin("util", { type: type$1, foreach: foreach, isEmpty: isEmpty, isPlainObject: isPlainObject, guid: guid });
cache.pushPlugin("event", {
	on: function on(types, listener, once) {
		event.on(undefined, types, listener, false, once);
	},
	remove: function remove(types, listener) {
		event.remove(undefined, types, listener, false);
	},
	emit: function emit(types) {
		for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			params[_key - 1] = arguments[_key];
		}

		event.emit(undefined, types, params);
	}
});
cache.pushPlugin("http", http);
cache.pushPlugin("Promise", Promise);
cache.pushPlugin("scrollTo", scrollTo);

// 导出amaple主对象
var am = {

	// 路由模式，启动路由时可进行模式配置
	// 默认为自动选择路由模式，即在支持html5 history API时使用新特性，不支持的情况下自动回退到hash模式
	AUTO: AUTO,

	// 强制使用hash模式
	HASH: HASH,

	// 强制使用html5 history API模式
	// 使用此模式时需注意：在不支持新特新的浏览器中是不能正常使用的
	BROWSER: BROWSER,

	// Module对象
	Module: Module,

	// Component对象
	Component: Component,

	// Class类构造器
	// 用于创建组件类
	class: Class,

	// 启动路由
	startRouter: startRouter,

	// 安装插件
	install: install
};

return am;

})));
