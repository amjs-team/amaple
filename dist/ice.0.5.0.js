/**
 * iceJS v0.5.0
 * (c) 2017-2017 JOU http://icejs.org
 * License: MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ice = factory());
}(this, (function () { 'use strict';

var slice = Array.prototype.slice;

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
		var errMsg = "[ice:" + (errorType ? errorType + "-" : "") + errorCode + "] " + errorText;
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
 // 指令使用错误
var componentErr = error("component"); // 组件错误
var vnodeErr = error("vnode"); // 虚拟节点错误

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
        http://icejs.org/######
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
           http://icejs.org/######
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
        http://icejs.org/######
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
        http://icejs.org/######
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
        http://icejs.org/######
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
        http://icejs.org/######
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
        http://icejs.org/######
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
        http://icejs.org/######
    */
    type: function type() {
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
        http://icejs.org/######
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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
	return arg !== null ? arg instanceof Array ? "array" : typeof arg === "undefined" ? "undefined" : _typeof(arg) : "null";
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
	foreach ( target: Array|Object|ArrayLike, callback: Function )

	Return Type:
	Boolean
	是否继续跳出外层循环，如果返回false，则继续跳出循环

	Description:
	遍历数组或对象
    可遍历带有length的类数组对象如NodeList对象，如果遍历对象为空或不可遍历，则直接返回
    
    回调函数中返回false跳出此循环，且此返回值会在foreach中返回，在需跳出多层循环时return foreach (...)实现

	URL doc:
	http://icejs.org/######
*/
function foreach(target, callback) {

	// 判断目标变量是否可被变量
	if (!target || (target.length || Object.keys(target).length) <= 0) {
		return;
	}

	var isContinue = void 0,
	    i = void 0,
	    tTarget = type$1(target),
	    tCallback = type$1(callback);

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
	http://icejs.org/######
*/
function isEmpty(object) {

	check(object).type("array", "object").ifNot("object", "参数类型必须为array或object").do();

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
function extend() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var target = args[0],
	    ttarget = type$1(target),
	    targ = void 0;

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
	return object.__proto__.constructor === Object && object.__proto__.toString && object.__proto__.valueOf;
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

/**
	timestamp ()

	Return Type:
	Number
	当前时间戳

	Description:
	获取当前时间戳

	URL doc:
	http://icejs.org/######
*/
function timestamp() {
	return Math.floor(Date.now() / 1000);
}

var map = {
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
	http://icejs.org/######
*/
var cache = {
	getDependentPlugin: function getDependentPlugin(fn) {
		var _this = this;

		var fnStr = fn.toString();
		return ((/^function(?:\s+\w+)?\s*\((.*)\)\s*/.exec(fnStr) || /^\(?(.*?)\)?\s*=>/.exec(fnStr) || /^\S+\s*\((.*?)\)/.exec(fnStr) || [])[1] || "").split(",").filter(function (item) {
			return !!item;
		}).map(function (item) {
			return _this.getPlugin(item.trim());
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

// 表示ice.module()


// 表示plugin()


// 表示driver()


// 连续字符正则表达式
var rword = /\S+/g;

// 变量正则表达式
var rvar = /[^0-9][\w$]*/;

// 模板表达式匹配正则
var rexpr = /{{\s*(.*?)\s*}}/;

// 组件名正则表达式
var rcomponentName = /^[A-Z][a-zA-Z0-9]*/;

// 模块事件常量
var MODULE_UPDATE = "update";
var MODULE_REQUEST = "request";
var MODULE_RESPONSE = "response";

// viewModel更新数组时的虚拟DOM处理类型




// 重复利用的常量
// 样式值为数字时不添加单位“px”的样式名
var noUnitHook = ["z-index"];

// 直接赋值的元素属性，如果不在此的属性将会使用setAttribute设置属性
var attrAssignmentHook = ["value", "checked"];

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
            http://icejs.org/######
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
            http://icejs.org/######
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

var eventMap = map;
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
	http://icejs.org/######
*/
function handler(e) {
	var _this = this;

	var _listeners = this ? this[expando] ? this[expando][e.type] : [] : cache.getEvent(e.type);

	foreach(_listeners || [], function (listener) {
		listener.call(_this, e);

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
	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
 */
	on: function on(elem, types, listener, useCapture, once) {
		var _this2 = this;

		// 纠正参数
		correctParam(elem, types, listener, useCapture).to("object", "string").done(function () {
			elem = this.$1;
			types = this.$2;
			listener = this.$3;
			useCapture = this.$4;
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
			listener.once = once;
			listener.useCapture = !!useCapture;
		}

		var events = void 0;

		// 多个事件拆分绑定
		(types || "").replace(rword, function (type) {

			if (elem) {
				elem[expando] = elem[expando] || {};
				events = elem[expando][type] = elem[expando][type] || [];
				events.push(listener);
			} else {
				cache.pushEvent(type, listener);
			}

			// 元素对象存在，且元素支持浏览器事件时绑定事件，以方便浏览器交互时触发事件
			// 元素不支持时属于自定义事件，需手动调用event.emit()触发事件
			// IE.version >= 9
			if (elem && _this2.support(type, elem) && elem.addEventListener) {
				handler.event = _this2;
				elem.addEventListener(type, handler, !!useCapture);
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
 	http://icejs.org/######
 */
	remove: function remove(elem, types, listener, useCapture) {
		var _this3 = this;

		// 纠正参数
		correctParam(elem, types, listener, useCapture).to("object", "string").done(function (args) {
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
 	emit ( elem?: DOMObject, types: String )
 
 	Return Type:
 	void
 
 	Description:
 	触发事件
 
 	URL doc:
 	http://icejs.org/######
 */
	emit: function emit(elem, types) {
		var _this4 = this;

		// 纠正参数
		var args = correctParam(elem, types).to("object", "string").done(function () {
			elem = this.$1;
			types = this.$2;
		});

		if (elem) {
			check(elem.nodeType).notBe(3).notBe(8).ifNot("function event.emit:elem", "elem参数不能为文本节点或注释节点").do();
		}
		check(types).type("string").ifNot("function event.emit:types", "types参数类型必须为string").do();

		(types || "").replace(rword, function (t) {
			if (elem && _this4.support(t, elem)) {

				// 使用creaeEvent创建事件
				var e = void 0,
				    eventType = void 0;
				foreach(eventMap, function (k, v) {
					if (v.indexOf(t) !== -1) {
						eventType = k;
					}
				});
				e = document.createEvent(eventType || "CustomEvent");
				e.initEvent(t, true, false);

				elem.dispatchEvent(e);
			} else {
				handler.event = _this4;
				handler.call(elem, { type: t });
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
	return all ? slice.call(elem) : elem;
}

/**
	appendScript ( node: DOMObject, success?: Function, error?: Function )

	Return Type:
	void

	Description:
	异步动态加载js文件

	URL doc:
	http://icejs.org/######
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
		event.on(script, "load readystatechange", function (event$$1) {
			if (!this.readyState || this.readyState === "loaded" || this.raeadyState === "complete") {
				success(event$$1);
			}

			script.parentNode.removeChild(script);
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
	http://icejs.org/######
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
	http://icejs.org/######
*/


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


/**
	html ( context: DOMObject, node: DOMObject|DOMString|DocumentFragmentObject|String, callback?: Function )

	Return Type:
	DOMObject
	处理后的节点元素

	Description:
	使用node替换context的内容
	如果node内有script元素则会在插入元素后执行包含的script

	URL doc:
	http://icejs.org/######
*/


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
	serialize ( form: DOMObject )

	Return Type:
	Object
	序列化后表单信息对象

	Description:
	将表单内的信息序列化为表单信息对象

	URL doc:
	http://icejs.org/######
*/
function serialize(form) {
	if (!form.nodeName || form.nodeName.toUpperCase() !== "FORM") {
		return form;
	}

	var rcheckableType = /^(?:checkbox|radio)$/i,
	    rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	    rsubmittable = /^(?:input|select|textarea|keygen)/i,
	    rCRLF = /\r?\n/g,
	    inputs = slice.call(form.elements),
	    formObject = {};

	// 判断表单中是否含有上传文件
	foreach(inputs, function (inputItem) {
		if (inputItem.name && !attr(inputItem, "disabled") && rsubmittable.test(inputItem.nodeName) && !rsubmitterTypes.test(inputItem.type) && (inputItem.checked || !rcheckableType.test(inputItem.type))) {

			formObject[name] = inputItem.value.replace(rCRLF, "\r\n");
		}
	});

	return formObject;
}

// 目前所支持的状态标记符号，如果所传入的状态标记符号不在此列表中，则会使用默认的状态标记符号@
var allowState = ["@", "$", "^", "*", "|", ":", "~", "!"];

var defaultParams = {
	// 异步加载时的依赖目录，设置后默认在此目录下查找，此对象下有4个依赖目录的设置，如果不设置则表示不依赖任何目录
	// url请求base路径，设置此参数后则跳转请求都依赖此路径
	// 此参数可传入string类型的路径字符串，也可传入一个方法，当传入方法时必须返回一个路径字符串，否则使用""
	baseURL: "",

	// url地址中的状态标识符，如http://...@login表示当前页面在login的状态
	// stateSymbol : allowState [ 0 ],

	// 模块相关配置
	module: {

		// 是否开启跳转缓存，默认开启。跳转缓存是当页面无刷新跳转时的缓存跳转数据，当此页面实时性较低时建议开启，以提高相应速度
		cache: true,
		expired: 0
	},

	moduleSuffix: ".ice"
};

var paramStore = defaultParams;

/**
	configuration ( params: Object )

	Return Type:
	void

	Description:
	处理并存储配置参数

	URL doc:
	http://icejs.org/######
*/
function configuration(params) {

	var _type = type$1(params.baseURL);

	params.baseURL = _type === "string" ? params.baseURL : _type === "function" ? params.baseURL() : "";
	params.baseURL = params.baseURL.substr(-1, 1) === "/" ? params.baseURL : params.baseURL + "/";

	params.stateSymbol = allowState.indexOf(params.stateSymbol) === -1 ? allowState[0] : params.stateSymbol;
	params.redirectCache = params.redirectCache !== false ? true : false;

	paramStore = extend(paramStore, params);
}

extend(configuration, {
	getConfigure: function getConfigure(param) {
		return paramStore[param];
	}
});

var iceAttr = {
	module: "ice-module",
	title: "ice-title",

	href: "href",
	action: "action"
};

/**
	ComponentLoader ( load: Object )

	Return Type:
	void

	Description:
	依赖加载器

	URL doc:
	http://icejs.org/######
*/
function ComponentLoader(load) {

	// 需要加载的依赖，加载完成所有依赖需要遍历此对象上的所有依赖并调用相应回调函数
	this.load = load;

	// 等待加载完成的依赖，每加载完成一个依赖都会将此依赖在waiting对象上移除，当waiting为空时则表示相关依赖已全部加载完成
	this.waiting = [];

	this.factory;
}

extend(ComponentLoader.prototype, {

	/**
 	putWaiting ( name: String )
 
 	Return Type:
 	void
 
 	Description:
 	将等待加载完成的依赖名放入context.waiting中
 
 	URL doc:
 	http://icejs.org/######
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
 	http://icejs.org/######
 */
	dropWaiting: function dropWaiting(name) {
		var pointer = this.waiting.indexOf(name);
		if (pointer !== -1) {
			this.waiting.splice(pointer, 1);
		}

		return this.waiting.length;
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
	inject: function inject() {
		var _this = this;

		var deps = [];

		foreach(this.load.deps, function (dep) {

			// 查找插件
			deps[dep] = cache.getComponent(dep);
		});

		// 返回注入后工厂方法
		this.factory = function () {
			_this.load.factory.apply(null, deps);
		};
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
	fire: function fire() {
		this.factory();
	}
});

extend(ComponentLoader, {

	// 文件后缀
	suffix: ".js",

	// js插件的依赖名称属性，通过此属性可以得到加载完成的依赖名
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
 	http://icejs.org/######
 */
	create: function create(guid$$1, loadDep) {
		return ComponentLoader.loaderMap[guid$$1] = new ComponentLoader(loadDep);
	},


	/**
 	getCurrentPath ()
 
 	Return Type:
 	Object
 
 	Description:
 	获取当前正在执行的依赖名与对应的依赖加载器编号
  	此方法使用报错的方式获取错误所在路径，使用正则表达式解析出对应依赖信息
 
 	URL doc:
 	http://icejs.org/######
 */
	getCurrentPath: function getCurrentPath() {
		if (document.currentScript) {

			// Chrome, Firefox, Safari高版本
			return document.currentScript.src;
		} else {

			// IE10+, Safari低版本, Opera9
			try {
				____a.____b();
			} catch (e) {
				var stack = e.stack || e.sourceURL || e.stacktrace;
				if (stack) {
					return (e.stack.match(/(?:http|https|file):\/\/.*?\/.+?\.js/) || [""])[0];
				} else {

					// IE9
					var scripts = slice.call(document.querySelectorAll("script"));
					for (var i = scripts.length - 1, script; script = script[i--];) {
						if (script.readyState === "interative") {
							return script.src;
						}
					}
				}
			}
		}
	},


	/**
 	onScriptLoaded ( event: Object, : , :  )
 
 	Return Type:
 	void
 
 	Description:
 	js依赖加载onload事件回调函数
 	此函数不是直接在其他地方调用，而是赋值给script的onload事件的，所以函数里的this都需要使用ComponentLoader来替代
 
 	URL doc:
 	http://icejs.org/######
 */
	onScriptLoaded: function onScriptLoaded(e) {

		var loadID = e.target[ComponentLoader.loaderID],
		    curLoader = ComponentLoader.loaderMap[loadID];

		// 执行
		if (curLoader.dropWaiting(e.target[ComponentLoader.depName]) === 0) {

			// 依赖注入后的工厂方法
			curLoader.inject();

			// 调用工厂方法
			curLoader.fire(factory);

			delete ComponentLoader.loaderMap[loadID];
		}
	}
});

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
function require(deps, factory) {

	// 正在加载的依赖数
	var loadingCount = 0;

	var nguid = guid(),
	    module = {
		deps: deps,
		factory: factory
	},
	    loadObj = ComponentLoader.create(nguid, module);

	// 遍历依赖，如果依赖未被加载，则放入waiting中等待加载完成
	foreach(deps, function (depStr) {
		if (!cache.getComponent(depStr)) {

			// 放入待加载列表中等待加载
			loadObj.putWaiting(depStr);

			// 加载依赖
			var script = document.createElement("script");

			script.src = depStr + ComponentLoader.suffix;
			script[ComponentLoader.depName] = depStr;
			script[ComponentLoader.ComponentLoaderID] = nguid;

			appendScript(script, ComponentLoader.onScriptLoaded);

			loadingCount++;
		}
	});

	// 如果顶层执行依赖没有待加载的依赖参数，或可以直接触发，则直接执行
	if (loadingCount === 0 && name === ComponentLoader.topName) {
		loadObj.inject();
		loadObj.fire();
	}
}

// 转换存取器属性
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
	http://icejs.org/######
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
	transformCompName ( compName: String, mode?: Boolean )

	Return Type:
	驼峰式或中划线式的组件名

	Description:
	mode不为true时，将中划线风格的组件名转换为驼峰式的组件名
	mode为true时，将驼峰式风格的组件名转换为中划线的组件名

	URL doc:
	http://icejs.org/######
*/
function transformCompName(compName, mode) {
	return mode !== true ? compName.toLowerCase().replace(/^([a-z])|-(.)/g, function (match, rep1, rep2) {
		return (rep1 || rep2).toUpperCase();
	}) : compName.replace(/([A-Z])/g, function (match, rep, i) {
		return (i > 0 ? "-" : "") + rep.toLowerCase();
	});
}

/**
	unmountWatchers ( vnode: Object, isWatchCond: Boolean )

	Return Type:
	void

	Description:
	watcher卸载函数遍历调用

	URL doc:
	http://icejs.org/######
*/

var rconstructor = /^(?:constructor\s*|function\s*)?(?:constructor\s*)?\((.*?)\)\s*(?:=>\s*)?{([\s\S]*)}$/;
var rscriptComment = /\/\/(.*?)\n|\/\*([\s\S]*?)\*\//g;

/**
	newClassCheck ( object: Object, constructor: Function )

	Return Type:
	void

	Description:
	检查一个类不能被当做函数调用，否则会抛出错误

	URL doc:
	http://icejs.org/######
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
	http://icejs.org/######
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
	http://icejs.org/######
*/
function Class(clsName) {
	var _superClass = void 0;

	function classDefiner(proto) {
		var customConstructor = proto.constructor;
		var constructor = function constructor() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			try {
				(customConstructor || noop).apply(this, args);
			} catch (e) {
				customConstructor = new Function("return " + customConstructor.toString().replace(/this\.depComponents\s*\((.+?)\)/, function (match, rep) {
					return match.replace(rep, rep.split(",").map(function (item) {
						return "\"" + item.trim() + "\"";
					}).join(","));
				}))();

				customConstructor.apply(this, args);
			}
		};
		// proto.constructor = proto.constructor || noop;

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
				    rsuperCount = /[\s{;]?this.__super\s*\(/,
				    _rscriptComment = /\/\/(.*?)\n|\/\*(.*?)\*\//g;

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

		// 将此组件类保存至缓存中
		cache.pushComponent(ComponentLoader.getCurrentPath(), classFn);

		return classFn;
	}

	// 继承函数
	classDefiner.extends = function (superClass) {
		// superClass需要为函数类型，否则会报错
		if (type$1(superClass) !== 'function' && superClass !== null) {
			throw classErr("extends", "Class extends value is not a constructor or null");
		}

		_superClass = superClass;
		return classDefiner;
	};

	return classDefiner;
}

/**
	ValueWatcher ( updateFn: Function, getter: Function )

	Return Type:
	void

	Description:
	计算属性监听类
	vm中所有依赖监听属性的计算属性都将依次创建ComputedWatcher类的对象被对应的监听属性监听
	当监听属性发生变化时，这些对象负责更新对应的计算属性值

	URL doc:
	http://icejs.org/######
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
 	http://icejs.org/######
 */
	update: function update() {
		this.updateFn(this.getter());
	}
});

/**
    getInsertIndex ( index: Number, children: Array )

    Return Type:
    Number
    插入元素的位置索引

    Description:
    获取元素插入的位置索引
    因为插入前的元素中可能有组件元素，组件元素渲染为对应实际dom时可能有多个，所以需判断前面的组件元素，并加上他们的模板元素数量

    URL doc:
    http://icejs.org/######
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
    http://icejs.org/######
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
        if (!newVNode.attrs.hasOwnProperty(name)) {
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
    http://icejs.org/######
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
    http://icejs.org/######
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
    http://icejs.org/######
*/
function diffChildren(newChildren, oldChildren, nodePatcher) {

    if (oldChildren && oldChildren.length > 0 && (!newChildren || newChildren.length <= 0)) {
        foreach(oldChildren, function (oldChild) {
            nodePatcher.removeNode(oldChild);
        });
    } else if (newChildren && newChildren.length > 0 && (!oldChildren || oldChildren.length <= 0)) {
        foreach(newChildren, function (newChild, i) {
            nodePatcher.addNode(newChild, i);
        });
    } else if (newChildren && newChildren.length > 0 && oldChildren && oldChildren.length > 0) {

        var keyType = newChildren[0] && newChildren[0].key === undefined ? 0 : 1,
            obj = { keyType: keyType, children: [] };

        var newNodeClassification = [obj],
            oldNodeClassification = [];
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
                foreach(newItem.children, function (newChild, j) {
                    if (indexOf(oldChildrenCopy, newChild) === -1) {
                        nodePatcher.addNode(newChild, getInsertIndex(j, newItem.children) + offset);

                        oldChildrenCopy.splice(j, 0, newChild);
                    }
                });

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
                                list: oldChildrenCopy.concat()
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

/**
    optimizeSteps ( patches: Array )

    Return Type:
    void

    Description:
    优化步骤
    主要优化为子节点的移动步骤优化

    URL doc:
    http://icejs.org/######
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

function VElement(nodeName, attrs, parent, children, elem, isComponent) {
	var vnode = new VNode(1, parent, elem);
	vnode.nodeName = nodeName.toUpperCase();

	vnode.attrs = attrs || {};
	vnode.children = children && children.concat() || [];

	foreach(vnode.children, function (child) {
		changeParent(child, vnode);
	});

	if (isComponent === true) {
		vnode.isComponent = true;
	}

	return vnode;
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
		changeParent(child, vnode);
	});

	return vnode;
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
 */
	patch: function patch() {
		var p = void 0;
		foreach(this.patches, function (patchItem) {
			patchItem.item.render();

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
					p = patchItem.item.parent.node;
					if (patchItem.item.templateNodes) {
						var f = document.createDocumentFragment();
						foreach(patchItem.item.templateNodes, function (vnode) {
							f.appendChild(vnode.node);
						});

						if (patchItem.index < p.childNodes.length) {

							// 在template或组件元素移动的情况下是先将移动的元素取出到fragment中，再根据对应位置将fragment插入，不同于普通元素的移动，故不需要+1
							p.insertBefore(f, p.childNodes.item(patchItem.index));
						} else {
							p.appendChild(f);
						}

						// 移动操作的组件需调用组件的update生命周期函数
						if (patchItem.isMove && patchItem.item.isComponent) {
							patchItem.item.component.update();
						}
					} else {
						if (patchItem.index < p.childNodes.length) {
							p.insertBefore(patchItem.item.node, p.childNodes.item(patchItem.index + (
							// 在移动操作时的index对应的操作为先移除元素再将此元素插入对应位置
							// 但在此是直接调用insertBefore进行位置调换的，省去了移除原位置的动作，故在移动元素的情况下需+1
							patchItem.isMove ? 1 : 0)));
						} else {
							p.appendChild(patchItem.item.node);
						}
					}

					break;
				case NodePatcher.NODE_REMOVE:
					var unmountNodes = void 0;
					if (patchItem.item.templateNodes) {
						foreach(patchItem.item.templateNodes, function (vnode) {
							vnode.node.parentNode.removeChild(vnode.node);
						});

						// 移除的组件需调用unmount生命周期函数
						if (patchItem.item.isComponent) {
							patchItem.item.component.unmount();
						}
					} else {
						patchItem.item.node.parentNode.removeChild(patchItem.item.node);
					}

					break;
				case NodePatcher.NODE_REPLACE:
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
    http://icejs.org/######
*/
function supportCheck(nodeType, method) {
    if (nodeType !== 1 && nodeType !== 11) {
        throw vnodeErr("NotSupport", "\u6B64\u7C7B\u578B\u7684\u865A\u62DF\u8282\u70B9\u4E0D\u652F\u6301" + method + "\u65B9\u6CD5");
    }
}

/**
    changeParent ( childVNode: Object, parent: Object )

    Return Type:
    void

    Description:
    更换父节点
    如果此子节点已有父节点则将此子节点从父节点中移除

    URL doc:
    http://icejs.org/######
*/
function changeParent(childVNode, parent) {
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
    http://icejs.org/######
*/
function VNode(nodeType, parent, node) {
    newClassCheck(this, VNode);

    this.nodeType = nodeType;
    this.parent = parent || null;
    this.node = node;
}

extend(VNode.prototype, {

    /**
        appendChild ( childVNode: Object )
    
        Return Type:
        void
    
        Description:
        在此vnode的children末尾添加一个子vnode
    
        URL doc:
        http://icejs.org/######
    */
    appendChild: function appendChild(childVNode) {
        var _this = this;

        supportCheck(this.nodeType, "appendChild");

        changeParent(childVNode, this);

        if (childVNode.nodeType === 11) {
            foreach(childVNode.children, function (child) {
                _this.children.push(child);
            });
        } else {
            this.children.push(childVNode);
        }
    },


    /**
        removeChild ( childVNode: Object )
    
        Return Type:
        void
    
        Description:
        在此vnode下移除一个子vnode
    
        URL doc:
        http://icejs.org/######
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
                changeParent(child, _this2);
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
        http://icejs.org/######
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
                changeParent(child, _this3);
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
        http://icejs.org/######
    */
    html: function html$$1(vnode) {
        supportCheck(this.nodeType, "html");

        foreach(this.children, function (child) {
            child.parent = null;
        });

        this.children = [vnode];
        changeParent(vnode, this);
    },


    /**
           nextSibling ()
       
           Return Type:
           void
       
           Description:
           获取此vnode的下一个vnode
       
           URL doc:
           http://icejs.org/######
       */
    nextSibling: function nextSibling() {
        if (this.parent) {
            return this.parent.children[this.parent.children.indexOf(this) + 1];
        }
    },


    /**
        prevSibling ()
    
        Return Type:
        void
    
        Description:
        获取此vnode的下一个vnode
    
        URL doc:
        http://icejs.org/######
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
        http://icejs.org/######
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
        http://icejs.org/######
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

                    // vnode为组件时，node为一个数组，代表了此组件的模板元素
                    // 此时不需要修正属性
                    if (this.node.nodeType) {

                        // 存在对应node时修正node属性
                        attr(this.node, this.attrs);

                        // 移除不存在的属性
                        foreach(slice.call(this.node.attributes), function (attrNode) {
                            if (!_this5.attrs.hasOwnProperty(attrNode.name)) {
                                attr(_this5.node, attrNode.name, null);
                            }
                        });
                    }
                }

                if (this.children.length > 0 && !this.templateNodes) {
                    f = document.createDocumentFragment();
                    foreach(this.children, function (child) {
                        f.appendChild(child.render());
                    });

                    this.node.appendChild(f);
                }

                break;
            case 3:
                if (!this.node) {
                    this.node = document.createTextNode(this.nodeValue || "");
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

        // if ( type ( this.node ) === "array" ) {
        //     f = document.createDocumentFragment ();
        //     foreach ( this.node, node => {
        //         f.appendChild ( node );
        //     } );

        //     return f;
        // }

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
        http://icejs.org/######
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
        http://icejs.org/######
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
        http://icejs.org/######
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
        http://icejs.org/######
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
        http://icejs.org/######
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
 	http://icejs.org/######
 */
	start: function start() {
		NodeTransaction.acting = this;
		return this;
	},


	/**
 	collect ( newVNode: Object, oldVNode: Object )
 
 	Return Type:
 	void
 
 	Description:
 	收集对比的新旧虚拟节点
 
 	URL doc:
 	http://icejs.org/######
 */
	collect: function collect(newVNode, oldVNode) {
		this.transactions.push({
			backup: oldVNode,
			update: newVNode
		});
	},


	/**
 	commit ()
 
 	Return Type:
 	void
 
 	Description:
 	提交事物更新关闭已开启的事物
 
 	URL doc:
 	http://icejs.org/######
 */
	commit: function commit() {
		foreach(this.transactions, function (comparedVNodes) {
			comparedVNodes.update.diff(comparedVNodes.backup).patch();
		});

		NodeTransaction.acting = undefined;
	}
});

var dataType$1 = [String, Number, Function, Boolean, Object];

/**
    validateProp ( prop: any, validate: Object )

    Return Type:
    Boolean
    属性值是否通过验证

    Description:
    验证属性值，验证成功返回true，否则返回false

    URL doc:
    http://icejs.org/######
*/
function validateProp(prop, validate) {
    var isPass = false;
    var tvalidate = type$1(validate);

    // 类型验证
    if (dataType$1.indexOf(validate) >= 0) {
        isPass = prop.constructor === validate;
    }

    // 正则表达式验证
    else if (validate instanceof RegExp) {
            isPass = validate.test(prop);
        }

        // 多个值的验证
        else if (tvalidate === "array") {

                // 如果验证参数为数组，则满足数组中任意一项即通过
                foreach(validate, function (v) {
                    isPass = isPass || !!validateProp(prop, v);
                    if (isPass) {
                        return false;
                    }
                });
            }

            // 方法验证
            else if (tvalidate === "function") {
                    isPass = validate(prop);
                }

    return isPass;
}

var componentConstructor = {

    /**
        initProps ( componentNode: DOMObject, moduleVm: Object, propsValidator: Object )
    
        Return Type:
        props
        转换后的属性对象
    
        Description:
        获取并初始化属性对象
    
        URL doc:
        http://icejs.org/######
    */
    initProps: function initProps(componentNode, moduleVm, propsValidator) {
        var props = {},
            match = void 0;

        foreach(componentNode.attrs, function (attrVal, name) {

            // 属性名需符合变量的命名规则
            if (rvar.test(name)) {
                if (match = attrVal.match(rexpr)) {
                    var subs = new Subscriber(),
                        propName = match[1],
                        getter = function getter() {
                        return moduleVm[propName];
                    };

                    var propValue = void 0;

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
                    }, function (newVal) {
                        if (newVal !== propValue) {
                            moduleVm[propName] = propValue = newVal;

                            subs.notify();
                        }
                    }, props);
                } else {
                    props[name] = attrVal;
                }

                // 验证属性值
                var validateItem = propsValidator && propsValidator[name];
                if (validateItem) {
                    var validate = isPlainObject(validateItem) ? validateItem.validate : validateItem;
                    if (validate && !validateProp(props[name], validate)) {
                        throw componentErr("prop: " + name, "\u7EC4\u4EF6\u4F20\u9012\u5C5E\u6027'" + name + "'\u7684\u503C\u672A\u901A\u8FC7\u9A8C\u8BC1\uFF0C\u8BF7\u68C0\u67E5\u8BE5\u503C\u7684\u6B63\u786E\u6027\u6216\u4FEE\u6539\u9A8C\u8BC1\u89C4\u5219");
                    }
                }
            }
        });

        // 再次检查是否为必须属性值与默认值赋值
        // 默认值不会参与验证，即使不符合验证规则也会赋值给对应属性
        foreach(propsValidator, function (validatorItem, propName) {
            if (!props[propName]) {
                if (validatorItem.require === true && validatorItem.default === undefined) {
                    throw componentErr("prop:" + propName, "组件传递属性" + propName + "为必须值");
                } else if (validatorItem.default !== undefined) {
                    props[propName] = validatorItem.default;
                }
            }
        });

        return props;
    },


    /**
        initLifeCycle ( component: Object )
    
        Return Type:
        void
    
        Description:
        初始化组件对象的生命周期
    
        URL doc:
        http://icejs.org/######
    */
    initLifeCycle: function initLifeCycle(component, moduleObj) {
        var lifeCycleHook = {
            update: noop,
            unmount: function unmount() {

                // 在对应module.components中移除此组件
                moduleObj.components.splice(moduleObj.components.indexOf(component), 1);
            }
        };

        foreach(lifeCycleHook, function (hookFn, cycleName) {
            var cycleFunc = component[cycleName];
            component[cycleName] = function () {
                var nt = new NodeTransaction().start();
                (cycleFunc || noop).apply(component, cache.getDependentPlugin(cycleFunc || noop));
                nt.commit();

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
        http://icejs.org/######
    */
    initTemplate: function initTemplate(template, scopedStyle) {
        var d = document.createElement("div"),
            f = document.createDocumentFragment();

        d.innerHTML = template;

        // 为对应元素添加内嵌样式
        var num = void 0;
        foreach(scopedStyle, function (styles, selector) {
            foreach(query(selector, d, true), function (elem) {
                foreach(styles, function (val, styleName) {
                    num = parseInt(val);
                    elem.style[styleName] += val + (type$1(num) === "number" && (num >= 0 || num <= 0) && noUnitHook.indexOf(styleName) === -1 ? "px" : "");
                });
            });
        });

        foreach(slice.call(d.childNodes), function (child) {
            f.appendChild(child);
        });

        return VNode.domToVNode(f);
    },


    /**
        initSubElements ( componentVNode: Object, subElementNames: Object )
    
        Return Type:
        Object
        组件子元素对象
    
        Description:
        获取组件子元素并打包成局部vm的数据对象
    
        URL doc:
        http://icejs.org/######
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
                foreach(vnode.children, function (subVNode) {
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
        http://icejs.org/######
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
                action.apply(component, args);
                nt.commit();
            };
        });

        // caller.action = actions;
    }
};

function Component() {

    // check
    check(this.init).type("function").ifNot("component:" + this.constructor.name, "component derivative必须定义init方法").do();
    check(this.render).type("function").ifNot("component:" + this.constructor.name, "component derivative必须定义render方法，因为组件必须存在组件模板HTML").do();
}

extend(Component.prototype, {

    /**
        __init__ ( componentVNode: Object, moduleObj: Object )
    
        Return Type:
        void
    
        Description:
        初始化一个对应的组件对象
    
        URL doc:
        http://icejs.org/######
    */
    __init__: function __init__(componentVNode, moduleObj) {
        var _this = this;

        var isCallPropsType = false;

        //////////////////////////////////////////
        // 获取init方法返回值并初始化vm数据
        // 构造属性验证获取器获取属性验证参数
        this.propsType = function (validator) {
            isCallPropsType = true;

            // 获取props，如果有需要则验证它们
            _this.props = componentConstructor.initProps(componentVNode, moduleObj.state, validator || {});
        };

        // 没有验证时手动调用初始化props
        if (!isCallPropsType) {
            this.propsType();
        }

        var componentVm = new ViewModel(this.init.apply(this, cache.getDependentPlugin(this.init)));
        delete this.propsType;

        this.state = componentVm;

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

        // 处理模块并挂载数据
        var vfragment = componentConstructor.initTemplate(componentString, scopedStyle),
            subElements = componentConstructor.initSubElements(componentVNode, subElementNames),
            tmpl = new Tmpl(componentVm, this.components || [], this),
            vfragmentBackup = vfragment.clone();

        tmpl.mount(vfragment, false, Tmpl.defineScoped(subElements, componentVNode, false));

        // 保存组件对象和结构
        componentVNode.component = this;
        componentVNode.templateNodes = vfragment.children.concat();

        // 调用mounted钩子函数
        (this.mounted || noop).apply(this, cache.getDependentPlugin(this.mounted || noop));

        // 初始化action
        if (this.action) {
            var actions = this.action.apply(this, cache.getDependentPlugin(this.action));
            componentConstructor.initAction(this, actions);
        }

        // 如果有saveRef方法则表示此组件需被引用
        (componentVNode.saveRef || noop)(this.action) || noop;

        // 初始化生命周期
        componentConstructor.initLifeCycle(this, moduleObj);

        // 组件初始化完成，调用apply钩子函数
        (this.apply || noop).apply(this, cache.getDependentPlugin(this.apply || noop));

        vfragment.diff(vfragmentBackup).patch();
    },


    /**
        depComponents ( comps: Array )
    
        Return Type:
        void
    
        Description:
        指定此组件模板内的依赖组件类
    
        URL doc:
        http://icejs.org/######
    */
    depComponents: function depComponents() {
        var _this2 = this;

        this.components = [];

        for (var _len2 = arguments.length, comps = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            comps[_key2] = arguments[_key2];
        }

        foreach(comps, function (comp) {
            if (comp && comp.__proto__.name === "Component") {
                _this2.components.push(comp);
            } else if (type$1(comp) === "string") {
                var compObj = cache.getComponent(comp);
                if (compObj && compObj.__proto__.name === "Component") {
                    _this2.components.push(compObj);
                }
            }
        });
    }
});

extend(Component, {

    // 全局组件类
    // 所有的模板内都可以在不指定组件的情况下使用
    globalClass: {},

    /**
        defineGlobal ( componentDerivative: Function|Class )
    
        Return Type:
        void
    
        Description:
        定义一个全局组件
        组件对象必须为一个方法(或一个类)
    
        URL doc:
        http://icejs.org/######
    */
    defineGlobal: function defineGlobal(componentDerivative) {
        globalClass[componentDerivative.name] = componentDerivative;
    },


    /**
        getGlobal ( name: String )
    
        Return Type:
        Function|Class
        对应的组件类
    
        Description:
        通过组件类名获取对应的组件类
    
        URL doc:
        http://icejs.org/######
    */
    getGlobal: function getGlobal(name) {
        return this.globalClass[name];
    }
});

/**
    preTreat ( vnode: Object )

    Return Type:
    Object
    处理后的元素对象

    Description:
    元素预处理
    主要对“:if”、“:for”两个指令的特殊处理

    URL doc:
    http://icejs.org/######
*/
function preTreat(vnode) {

    var _if = Tmpl.directivePrefix + "if",
        _elseif = Tmpl.directivePrefix + "else-if",
        _else = Tmpl.directivePrefix + "else";

    var nextSib = void 0,
        parent = void 0,
        condition = vnode.attr(_if);

    if (condition && !vnode.conditionElems) {
        var conditionElems = [vnode];

        vnode.conditions = [condition];
        vnode.conditionElems = conditionElems;
        parent = vnode.parent;
        while (nextSib = vnode.nextSibling()) {
            if (condition = nextSib.attr(_elseif)) {
                nextSib.conditionElems = conditionElems;
                vnode.conditions.push(condition);
                vnode.conditionElems.push(nextSib);
                nextSib.attr(_elseif, null);
                parent.removeChild(nextSib);
            } else if (nextSib.attrs.hasOwnProperty(_else)) {
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

function concatHandler(target, source) {
    var concats = {};

    concats.watchers = target.watchers.concat(source.watchers);
    concats.components = target.components.concat(source.components);
    concats.templates = target.templates.concat(source.templates);

    return concats;
}

/**
    Plugin Tmpl

    Description:
    模板类
    解析模板

    URL doc:
    http://icejs.org/######
*/
function Tmpl(vm, components, module) {
    var _this = this;

    this.vm = vm;
    this.components = {};
    this.module = module;

    foreach(components, function (comp) {
        _this.components[comp.name] = comp;
    });
}

extend(Tmpl.prototype, {

    /**
        mount ( vnode: Object, mountModule: Boolean, scoped?: Object )
    
        Return Type:
        void
    
        Description:
        使用vm对象挂载并动态绑定数据到模板
    
        URL doc:
        http://icejs.org/######
    */
    mount: function mount(vnode, mountModule, scoped) {
        var _this2 = this;

        var isRoot = !vnode.parent,
            rattr = /^:([\$\w]+)$/;

        var directive = void 0,
            handler = void 0,
            targetNode = void 0,
            expr = void 0,
            forAttrValue = void 0,
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
                vnode = preTreat.call(this, vnode);
                if (forAttrValue = vnode.attr(Tmpl.directivePrefix + "for")) {
                    compileHandlers.watchers.push({ handler: Tmpl.directives.for, targetNode: vnode, expr: forAttrValue });
                } else {

                    if (vnode.nodeName === "TEMPLATE") {
                        compileHandlers.templates.push(vnode);
                    } else {

                        // 收集组件元素待渲染
                        // 局部没有找到组件则查找全局组件
                        var componentName = transformCompName(vnode.nodeName),
                            ComponentDerivative = this.getComponent(componentName) || Component.getGlobal(componentName);
                        if (ComponentDerivative && ComponentDerivative.__proto__.name === "Component") {
                            compileHandlers.components.push({ vnode: vnode, Class: ComponentDerivative });

                            vnode.isComponent = true;
                        }
                    }

                    foreach(vnode.attrs, function (attr$$1, name) {
                        directive = rattr.exec(name);
                        if (directive) {
                            directive = directive[1];
                            if (/^on/.test(directive)) {

                                // 事件绑定
                                handler = Tmpl.directives.on;
                                targetNode = vnode, expr = directive.slice(2) + ":" + attr$$1;
                            } else if (Tmpl.directives[directive]) {

                                // 模板属性绑定
                                handler = Tmpl.directives[directive];
                                targetNode = vnode;
                                expr = attr$$1;
                            } else {

                                // 没有找到该指令
                                throw runtimeErr("directive", "没有找到\"" + directive + "\"指令或表达式");
                            }

                            compileHandlers.watchers.push({ handler: handler, targetNode: targetNode, expr: expr });
                        } else if (rexpr.test(attr$$1)) {

                            // 属性值表达式绑定
                            compileHandlers.watchers.push({ handler: Tmpl.directives.attrExpr, targetNode: vnode, expr: name + ":" + attr$$1 });
                        }
                    });
                }
            } else if (vnode.nodeType === 3) {

                // 文本节点表达式绑定
                if (rexpr.test(vnode.nodeValue)) {
                    compileHandlers.watchers.push({ handler: Tmpl.directives.textExpr, targetNode: vnode, expr: vnode.nodeValue });
                }
            }

            firstChild = vnode.children && vnode.children[0];
            if (firstChild && !forAttrValue) {
                compileHandlers = concatHandler(compileHandlers, this.mount(firstChild, true, scoped, false));
            }
        } while (!isRoot && (vnode = vnode.nextSibling()));

        if (!isRoot) {
            return compileHandlers;
        } else {

            //////////////////////////////
            //////////////////////////////
            // 为相应模板元素挂载数据
            foreach(compileHandlers.watchers, function (watcher) {
                new ViewWatcher(watcher.handler, watcher.targetNode, watcher.expr, _this2, scoped);
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

                instance.__init__(comp.vnode, _this2.module);
            });
        }
    },
    getViewModel: function getViewModel() {
        return this.vm;
    },
    getComponent: function getComponent(name) {
        return this.components[name];
    }
});

extend(Tmpl, {

    // 指令前缀
    directivePrefix: ":",

    /**
       	defineScoped ( scopedDefinition: Object, scopedVNode: Object, isStatic: Object )
       
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
       	http://icejs.org/######
       */
    defineScoped: function defineScoped(scopedDefinition, scopedVNode, isStatic) {

        var scopedVars = {},
            scoped = {
            prefix: "ICE_FOR_" + Date.now() + "_",
            scopedMounts: [],
            scopedUnmounts: []
        },
            availableItems = [];

        foreach(scopedDefinition, function (val, varName) {
            if (varName) {
                scopedVars[scoped.prefix + varName] = val;

                // 两边添加”\b“表示边界，以防止有些单词中包含局部变量名而错误替换
                availableItems.push("\\b" + varName + "\\b");
            }
        });

        if (isStatic !== false) {
            scopedVNode.scoped = new ViewModel(scopedVars);
            foreach(scopedVars, function (scopedVar, name) {

                // 构造局部变量代理变量
                scoped.scopedMounts.push(function (vm) {
                    defineReactiveProperty(name, function () {
                        return scopedVNode.scoped[name];
                    }, noop, vm);
                });

                // 构造代理变量卸载函数
                scoped.scopedUnmounts.push(function (vm) {
                    delete vm[name];
                });
            });
        } else {
            foreach(scopedVars, function (scopedVar, name) {

                // 构造静态的局部变量
                scoped.scopedMounts.push(function (vm) {
                    vm[name] = scopedVar;
                });

                // 静态局部变量卸载函数
                scoped.scopedUnmounts.push(function (vm) {
                    delete vm[name];
                });
            });
        }

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
        http://icejs.org/######
    */
    defineDirective: function defineDirective(directive) {
        this.directives = this.directives || {};
        this.directives[directive.name] = directive;
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
	return new Function("runtimeErr", "var self = this,\n\t\t ret;\n\tself.addScoped ();\n\twith ( self.tmpl.getViewModel () ) {\n\t\ttry {\n\t\t\tret = " + code + ";\n\t\t}\n\t\tcatch ( e ) {\n\t\t\tthrow runtimeErr ( \"vm\", e );\n\t\t}\n\t}\n\tself.removeScoped ();\n\treturn ret;");
}

/**
	getDiffNode ( watcher: Object )

	Return Type:
	Object
	进行对比的vnode

	Description:
	获取节点更新后进行对比的节点，一般为更新node的父节点

	URL doc:
	http://icejs.org/######
*/
function getDiffNode(watcher) {

	var diffVNode = watcher.parent;
	if (diffVNode && diffVNode.nodeType !== 1 && watcher.node.conditionElems) {
		foreach(watcher.node.conditionElems.concat(watcher.replacement), function (conditionElem) {
			if (conditionElem.parent && conditionElem.parent.nodeType === 1) {
				diffVNode = conditionElem.parent;
			}
		});
	}

	return diffVNode;
}

/**
	ViewWatcher ( directive: Object, node: DOMObject, expr: String, tmpl?: Object, scoped?: Object )

	Return Type:
	void

	Description:
	视图监听类
	模板中所有需绑定的视图都将依次转换为ViewWacther类的对象
	当数据发生变化时，这些对象负责更新视图

	URL doc:
	http://icejs.org/######
*/
function ViewWatcher(directive, node, expr, tmpl, scoped) {

	this.directive = directive;
	this.node = node;
	this.parent = node.parent || node;
	this.expr = expr;
	this.tmpl = tmpl;
	this.scoped = scoped;

	(directive.before || noop).call(this);

	// 如果scoped为局部数据对象则将expr内的局部变量名替换为局部变量名
	if (type$1(scoped) === "object" && scoped.regexp instanceof RegExp) {
		this.expr = this.expr.replace(scoped.regexp, function (match) {
			return scoped.prefix + match;
		});
	}

	// 移除相关属性指令表达式
	// 当属性指令表达式与指令名称不同的时候可将对应表达式赋值给this.attrExpr
	if (node.nodeType === 1) {
		node.attr(Tmpl.directivePrefix + (this.attrExpr || directive.name), null);
	}

	var val = this.expr;

	// 当该指令为静态指令时，将不会去对应的vm中获取值，相应的也不会被监听
	if (directive.static !== true) {
		this.getter = makeFn(this.expr);

		// 将获取表达式的真实值并将此watcher对象绑定到依赖监听属性中
		Subscriber.watcher = this;
		val = this.getter(runtimeErr);

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
 	http://icejs.org/######
 */
	update: function update() {
		var diffVNode = getDiffNode(this),
		    diffBackup = diffVNode.clone();
		this.directive.update.call(this, this.getter(runtimeErr));

		// 当已开启了一个事物时将收集新旧节点等待变更
		// 当没有开启事物时直接处理更新操作
		if (NodeTransaction.acting instanceof NodeTransaction) {
			NodeTransaction.acting.collect(diffVNode, diffBackup);
		} else {
			diffVNode.diff(diffBackup).patch();
		}
	},


	/**
    	addScoped ()
    
    	Return Type:
    	Object
    	void
    
    	Description:
 	为vm增加局部变量
    
    	URL doc:
    	http://icejs.org/######
    */
	addScoped: function addScoped() {
		var _this = this;

		// 增加局部变量
		foreach(this.scoped && this.scoped.scopedMounts || [], function (mountFunc) {
			mountFunc(_this.tmpl.getViewModel());
		});
	},


	/**
    	removeScoped ()
    
    	Return Type:
    	Object
    	void
    
    	Description:
 	移除vm中的局部变量
    
    	URL doc:
    	http://icejs.org/######
    */
	removeScoped: function removeScoped() {
		var _this2 = this;

		// 移除局部变量
		foreach(this.scoped && this.scoped.scopedUnmounts || [], function (unmountFunc) {
			unmountFunc(_this2.tmpl.getViewModel());
		});
	},


	/**
 	unmount ( subscribe: Object )
 
 	Return Type:
 	void
 
 	Description:
 	卸载此watcher对象
 	当被绑定元素在DOM树上移除后，对应vm属性对此元素的订阅也需移除
 
 	URL doc:
 	http://icejs.org/######
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
    http://icejs.org/######
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
        http://icejs.org/######
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
        http://icejs.org/######
    */
    notify: function notify() {
        foreach(this.watchers, function (watcher) {
            watcher.update();
        });
    }
});

function convertState(value, subs, context) {
	return type$1(value) === "object" && isPlainObject(value) ? new ViewModel(value, false) : type$1(value) === "array" ? initArray(value, subs, context) : value;
}

// 初始化绑定事件
function initMethod(methods, context) {
	foreach(methods, function (method, key) {
		context[key] = function () {
			var nt = new NodeTransaction().start();

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			method.apply(context, args);

			// 提交节点更新事物，更新所有已更改的vnode进行对比
			nt.commit();
		};
	});
}

// 初始化监听属性
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

		state = convertState(state, subs, context);

		defineReactiveProperty(key, function () {

			// 绑定视图
			subs.subscribe();
			return state;
		}, function (newVal) {
			if (state !== newVal) {
				oldVal = state;
				state = newVal;

				watch.call(context, newVal, oldVal);

				// 更新视图
				subs.notify();
			}
		}, context);
	});
}

// 初始化监听计算属性
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

// 初始化监听数组
function initArray(array, subs, context) {

	// 监听数组转换
	array = array.map(function (item) {
		return convertState(item, subs, context);
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
						return convertState(item, subs, context);
					});
				}
				var res = nativeMethod.apply(this, args);

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
	ice.init方法返回的需被监听的数据都使用此类进行实例化

	URL doc:
	http://icejs.org/######
*/
function ViewModel(vmData) {
	var isRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

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
		else if (key === "computed" && type$1(value) === "object" && isRoot) {
				computed = value;
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

/**
	findParentVm ( elem: DOMObject )

	Return Type:
	Object|Null
	父模块的vm对象
	没有找到则返回null

	Description:
	获取父模块的vm对象

	URL doc:
	http://icejs.org/######
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
    initModuleLifeCycle ( module: Object, lifeCycle: Array, vm: Object, moduleElem: Object )
    
    Return Type:
    void
    
    Description:
    初始化模块对象的生命周期
    
    URL doc:
    http://icejs.org/######
*/
function initModuleLifeCycle(module, vm, moduleElem) {
	var
	// Module生命周期
	lifeCycle = ["queryChanged", "paramChanged", "unmount"],
	    lifeCycleContainer = {};

	foreach(lifeCycle, function (cycleItem) {
		lifeCycleContainer[cycleItem] = vm[cycleItem] || noop;
		module[cycleItem] = function () {

			var nt = new NodeTransaction().start();
			lifeCycleContainer[cycleItem].apply(module, cache.getDependentPlugib(lifeCycleContainer[cycleItem]));

			// 提交节点更新事物，更新所有已更改的vnode进行对比
			// 对比新旧vnode计算出差异并根据差异更新到实际dom中
			nt.commit();
		};

		delete vm[cycleItem];
	});
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
	1、module属性名，普通模式时的模块名，此方法将会根据模块名获取dom元素
	2、实际dom和fragment，此方法将直接解析此元素

	URL doc:
	http://icejs.org/######
*/
function Module(module) {
	var _this = this;

	var vmData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { init: function init() {
			return {};
		} };


	newClassCheck(this, Module);

	var moduleElem = {};
	if (type$1(module) === "string") {
		moduleElem = query("*[" + iceAttr.module + "=" + module + "]");
	} else if (module.nodeType === 1 || module.nodeType === 3 || module.nodeType === 11) {
		moduleElem = module;
	}

	// 检查参数
	check(moduleElem.nodeType).be(1, 3, 11).ifNot("ice.Module", "module参数可传入模块元素的ice-module属性值或直接传入需挂在模块元素").do();
	check(vmData).type("object").check(vmData.init).type("function").ifNot("ice.Module", "vmData参数必须为带有init方法的的object").do();

	/////////////////////////////////
	/////////////////////////////////

	var parent = void 0;
	if (Structure$1.currentPage) {

		// 只有单页模式时Structure.currentPage会有值
		// 单页模式时，使用Structure.currentPage.getCurrentParentVm()获取父级的vm
		var currentRender = Structure$1.currentPage.getCurrentRender();
		parent = currentRender.parent && currentRender.parent.module.vm;

		this.params = currentRender.param;
		this.get = parseGetQuery(currentRender.get);
		this.post = currentRender.post;

		// 参数传递过来后可移除，以免与下一次传递的参数混淆
		delete currentRender.param;
		delete currentRender.get;
		delete currentRender.post;

		// 将此Module对象保存到页面结构体的对应位置中
		currentRender.module = this;
	} else {

		// 普通模式时，使用向上寻找DOM的形式获取父级vm
		parent = findParentVm(moduleElem);

		// 将当前Module对象保存在对应的模块根节点下，以便子模块寻找父模块的Module对象
		moduleElem.__module__ = this;
	}
	this.parent = parent;

	moduleElem = VNode.domToVNode(moduleElem);
	initModuleLifeCycle(this, vmData, moduleElem);

	var moduleElemBackup = moduleElem.clone(),
	    components = function () {
		var compFn = vmData.depComponents,
		    deps = cache.getDependentPlugin(compFn || noop);

		try {
			return (compFn || noop).apply(_this, deps);
		} catch (e) {
			var depStrs = (compFn.toString().match(/return\s+\[(.+?)\]/) || ["", ""])[1].split(",").map(function (item) {
				return item.trim();
			}),
			    depComps = [];

			foreach(depStrs, function (depObj) {
				depComps.push(depObj);
			});

			return depComps;
		}
	}(),


	// 获取后初始化vm的init方法
	// 对数据模型进行转换
	vm = new ViewModel(vmData.init.apply(this, cache.getDependentPlugin(vmData.init))),


	// 使用vm解析模板
	tmpl = new Tmpl(vm, components, this);

	// this.view = slice.call ( moduleElem.childNodes ) || [];
	this.state = vm;

	// 解析模板，挂载数据
	// 如果forceMount为true则强制挂载moduleElem
	// 单页模式下未挂载的模块元素将会在ModuleLoader.load完成挂载
	// 普通模式下，如果parent为对象时表示此模块不是最上层模块，不需挂载
	tmpl.mount(moduleElem, Structure$1.currentPage ? false : !parent);

	// 调用apply方法
	(vmData.apply || noop).apply(this, cache.getDependentPlugin(vmData.apply || noop));

	// 对比新旧vnode计算出差异
	// 并根据差异更新到实际dom中
	moduleElem.diff(moduleElemBackup).patch();
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
 	http://icejs.org/######
 */
	refs: function refs(ref) {
		var refObj = this.refs[ref];
		if (refObj.parent) {
			refObj = refObj.isComponent ? refObj.component.action : refObj.node;
		} else {
			refObj = undefined;
		}
		return refObj;
	}
});

extend(Module, {
	identifier: "ice-identifier",

	/**
 	getIdentifier ()
 
 	Return Type:
 	String
 	模块标识字符串
 
 	Description:
 	获取模块标识字符串
 	用于区分不同模块
 
 	URL doc:
 	http://icejs.org/######
 */
	getIdentifier: function getIdentifier() {
		return "module" + guid();
	}
});

/**
	parseModuleAttr ( moduleStrng: String, parses: Object )

	Return Type:
	String
	解析后的模块字符串

	Description:
	解析出模板根节点的属性值

	URL doc:
	http://icejs.org/######
*/
function parseModuleAttr(moduleString, parses) {
	var rend = /^\s*>/,
	    rmoduleAttr = /^\s*(<Module\s+)?(?:([^\s"'<>/=]+))?(?:\s*(?:=)\s*(?:"([^"]*)"|'([^']*)'))?/;

	var attrMatch = void 0;

	parses.attrs = {};

	// 匹配出Module标签内的属性
	while (!rend.test(moduleString)) {
		attrMatch = rmoduleAttr.exec(moduleString);
		if (attrMatch) {
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
	http://icejs.org/######
*/
function parseTemplate(moduleString, parses) {
	var rtemplate = /<template>([\s\S]+)<\/template>/,
	    rblank = />(\s+)</g,
	    rtext = /["'\/&]/g,
	    viewMatch = rtemplate.exec(moduleString);

	if (viewMatch) {
		moduleString = moduleString.replace(viewMatch[0], "");
		parses.view = (viewMatch[1] || "").trim();

		// 去除所有标签间的空格，并转义"和'符号
		parses.view = parses.view.replace(rblank, function (match, rep) {
			return match.replace(rep, "");
		}).replace(rtext, function (match) {
			return "\\" + match;
		});
	}

	return moduleString;
}

/**
	parseStyle ( moduleString: String, identifier: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板样式

	URL doc:
	http://icejs.org/######
*/
function parseStyle(moduleString, identifier, parses) {

	var rstyle = /<style(?:.*?)>([\s\S]*)<\/style>/,
	    risScoped = /^<style(?:.*?)scoped(?:.*?)/i,
	    raddScoped = /\s*([^/@%{}]+)\s*{[^{}]+}/g,
	    rnoscoped = /^(from|to)\s*$/i,
	    rstyleblank = /(>\s*|\s*[{:;}]\s*|\s*<)/g,
	    styleMatch = rstyle.exec(moduleString);

	if (styleMatch) {
		moduleString = moduleString.replace(styleMatch[0], "");

		if (risScoped.test(styleMatch[0])) {
			var placeholder = "{{style}}";

			parses.style = (styleMatch[1] || "").trim();
			styleMatch[0] = styleMatch[0].replace(styleMatch[1], placeholder);

			// 为每个样式添加模块前缀以达到控制范围的作用
			parses.style = parses.style.replace(raddScoped, function (match, rep) {
				return match.replace(rep, rnoscoped.test(rep) ? rep : "[" + Module.identifier + "=" + identifier + "] " + rep);
			});

			parses.style = styleMatch[0].replace(placeholder, parses.style);
		} else {
			parses.style = styleMatch[0];
		}

		// 去除所有标签间的空格
		parses.style = parses.style.replace(rstyleblank, function (match) {
			return match.replace(/\s+/g, "");
		});
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
	http://icejs.org/######
*/
function parseScript(moduleString, scriptPaths, scriptNames, parses) {

	var rscript = /<script(?:.*?)>([\s\S]+)<\/script>/,
	    rscriptComment = /\/\/(.*?)\n|\/\*([\s\S]*?)\*\//g,
	    rimport = /(?:(?:var|let|const)\s+)?([A-Za-z$_][\w$]+)\s*=\s*import\s*\(\s*"(.*?)"\s*\)\s*(?:,|;)/g,
	    rhtmlComment = /<!--(.*?)-->/g,
	    rmoduleDef = /new\s*ice\s*\.\s*Module\s*\(/,
	    raddComponents = new RegExp(rmoduleDef.source + "\\s*\\{"),
	    scriptMatch = rscript.exec(moduleString),
	    scripts = {};

	if (scriptMatch) {

		var matchScript = (scriptMatch[1] || "").replace(rscriptComment, function (match) {
			return "";
		});

		// 获取import的script
		parses.script = matchScript.replace(rimport, function (match, rep1, rep2) {
			scripts[rep1] = rep2;
			return "";
		}).trim();

		// 如果有引入组件则将组件传入new ice.Module中
		if (!isEmpty(scripts)) {

			// 去掉注释的html的代码
			var matchView = parses.view.replace(rhtmlComment, function (match) {
				return "";
			});

			foreach(scripts, function (path, name) {

				// 只有在view中有使用的component才会被使用
				if (new RegExp("<\s*" + transformCompName(name, true)).test(matchView)) {
					scriptPaths.push("\"" + path + "\"");
					scriptNames.push(name);
				}
			});

			// 需要组件时才将组件添加到对应模块中
			if (!isEmpty(scriptNames)) {
				parses.script = parses.script.replace(raddComponents, function (match) {
					return match + ("depComponents:function(){return [" + scriptNames.join(",") + "];},");
				});
			}
		}

		parses.script = parses.script.replace(rmoduleDef, function (match) {
			return match + "moduleNode,";
		});
	}

	return moduleString;
}

/**
	compileModule ( moduleString: String, identifier: String )

	Return Type:
	Function

	Description:
	编译模块为可执行的编译函数

	URL doc:
	http://icejs.org/######
*/
function compileModule(moduleString, identifier) {

	// 模块编译正则表达式
	var rmodule = /^<Module[\s\S]+<\/Module>/;
	if (rmodule.test(moduleString)) {

		var parses = {},
		    scriptNames = [],
		    scriptPaths = [];

		// 解析出Module标签内的属性
		moduleString = parseModuleAttr(moduleString, parses);

		// 解析模板
		moduleString = parseTemplate(moduleString, parses);

		// 解析样式
		moduleString = parseStyle(moduleString, identifier, parses);

		// 解析js脚本
		moduleString = parseScript(moduleString, scriptPaths, scriptNames, parses);

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 检查参数
		check(parses.view).notBe("").ifNot("module:template", "<Module>内的<template>为必须子元素，它的内部DOM tree代表模块的页面布局").do();

		check(parses.script).notBe("").ifNot("module:script", "<Module>内的<script>为必须子元素，它的内部js代码用于初始化模块的页面布局").do();

		var buildView = "moduleNode.html(VNode.domToVNode(view));";

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 构造编译函数
		moduleString = "var title=\"" + (parses.attrs[iceAttr.title] || "") + "\",view=\"" + parses.view + parses.style + "\";";

		if (!isEmpty(scriptPaths)) {
			moduleString += "require([" + scriptPaths.join(",") + "],function(" + scriptNames.join(",") + "){" + buildView + parses.script + ";});";
		} else {
			moduleString += "" + buildView + parses.script + ";";
		}

		moduleString += "return title;";
	}

	return new Function("ice", "moduleNode", "VNode", "require", moduleString);
}

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
	http://icejs.org/######
*/
function Promise(resolver) {

	// 判断resolver是否为处理函数体
	check(resolver).type("function").ifNot("function Promise", "构造函数需传入一个函数参数").do();

	// 预定义的Promise对象对应的处理函数体信息
	var resolveArgs = void 0,
	    rejectArgs = void 0,
	    state = Promise.PENDING,
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
 	http://icejs.org/######
 */
	function resolve() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		if (state === Promise.PENDING) {
			state = Promise.FULFILLED;
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
 	http://icejs.org/######
 */
	function reject() {
		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		if (state === Promise.PENDING) {
			state = Promise.REJECTED;
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
 	http://icejs.org/######
 */
	this.handle = function (handler) {
		if (state === Promise.PENDING) {
			handlers.push(handler);
		} else if (state === Promise.FULFILLED) {
			(handler.onFulfilled || noop).apply(null, resolveArgs);
		} else if (state === Promise.REJECTED) {
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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

	// Promise的三种状态定义
	PENDING: 0,
	FULFILLED: 1,
	REJECTED: 2,

	/**
 	when ( promise1: Object, promise2?: Object, promise3?: Object ... )
 
 	Return Type:
 	void
 
 	Description:
 	存储准备调用的promise对象，用于多个异步请求并发协作时使用。
 	此函数会等待传入的promise对象的状态发生变化再做具体的处理
 	传入参数为不定个数Promise的对象
 
 	URL doc:
 	http://icejs.org/######
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
 	http://icejs.org/######
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

function ICEXMLHttpRequest() {

	// 请求传送器，根据不同的请求类型来选择不同的传送器进行请求
	this.transport = null;
}

extend(ICEXMLHttpRequest.prototype, {

	/**
 	setRequestHeader ( header: String, value: String )
 
 	Return Type:
 	void
 
 	Description:
 	设置请求头
 
 	URL doc:
 	http://icejs.org/######
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
 	获取返回头
 
 	URL doc:
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
 */
	addEventListener: function addEventListener(type, callback) {
		if (!this.transport.completed) {
			this.transport.callbacks = this.transport.callbacks || {};
			this.transport.callbacks[type] = callback || noop;
		}
	}
});

var text = function (text) {
	return text;
};

var json = function (text) {
	return type$1(text) === "object" ? text : JSON.parse(text);
};

var script = function (text) {
	scriptEval(text);
};

// ajax返回数据转换器
var ajaxConverters = { text: text, json: json, script: script };

/**
    complete ( iceXHR: Object )

    Return Type:
    void

    Description:
    请求回调调用

    URL doc:
    http://icejs.org/######
*/
function complete(iceXHR) {

	var transport = iceXHR.transport;

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
		transport.callbacks.success(transport.response, transport.status, transport.statusText, iceXHR);
	}

	// 请求错误调用error回调
	else if (transport.status === 404 || transport.status === 500) {
			transport.callbacks.error(iceXHR, transport.status, transport.statusText);
		}

	// 调用complete回调
	transport.callbacks.complete(iceXHR, transport.statusText);
}

var xhr$1 = function () {

	return {

		/**
  	send ( options: Object, iceXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	ajax请求前设置参数，并发送请求
  
  	URL doc:
  	http://icejs.org/######
  */
		send: function send(options, iceXHR) {

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

					iceXHR.transport.status = xhr.status === 1223 ? 204 : xhr.status;

					self.done(iceXHR);
				};
			} else {
				xhr.onreadystatechange = function () {
					if (xhr.readyState === XMLHttpRequest.DONE) {

						// 兼容IE有时将204状态变为1223的问题
						iceXHR.transport.status = xhr.status === 1223 ? 204 : xhr.status;

						self.done(iceXHR);
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
  	done ( iceXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	ajax请求完成后的处理
  
  	URL doc:
  	http://icejs.org/######
  */
		done: function done(iceXHR) {

			var xhr = this.xhr;

			xhr.onload = xhr.onerror = xhr.onreadystatechange = null;

			// 获取所有返回头信息
			this.responseHeadersString = xhr.getAllResponseHeaders();

			this.status = xhr.status;
			this.statusText = xhr.statusText;
			this.response = xhr.responseText;

			complete(iceXHR);
		},


		/**
  	abort ()
  
  	Return Type:
  	void
  
  	Description:
  	ajax请求中断
  
  	URL doc:
  	http://icejs.org/######
  */
		abort: function abort() {
			this.status = 0;
			this.statusText = this.abortText;

			xhr.abort && xhr.abort();
		}
	};
};

// 动态执行script
var script$1 = function (options) {

	var script = void 0;

	return {

		/**
  	send ( options: Object, iceXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	动态执行javascript
  
  	URL doc:
  	http://icejs.org/######
  */
		send: function send(options, iceXHR) {
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
				self.done(iceXHR);
			});

			document.head.appendChild(script);
		},


		/**
  	done ( iceXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	完成或中断后的处理
  
  	URL doc:
  	http://icejs.org/######
  */
		done: function done(iceXHR) {

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

			complete(iceXHR);
		},


		/**
  	abort ()
  
  	Return Type:
  	void
  
  	Description:
  	请求中断处理
  
  	URL doc:
  	http://icejs.org/######
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
};

// jsonp跨域请求
var jsonp = function (options) {

	var scriptExtend = script$1(options),
	    jsonpCallback = options.jsonpCallback = "jsonpCallback" + Date.now();

	window[jsonpCallback] = function (result) {
		window[jsonpCallback] = result;
	};

	options.data += (options.data ? "&" : "") + "callback=" + jsonpCallback;

	return {
		send: function send(options, iceXHR) {
			scriptExtend.send(options, iceXHR);
		},
		done: function done(iceXHR) {
			scriptExtend.done(iceXHR);
		},
		abort: function abort() {
			scriptExtend.abort();
		}
	};
};

// 文件异步上传传送器，在不支持FormData的旧版本浏览器中使用iframe刷新的方法模拟异步上传
var upload = function () {

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
  	send ( options: Object, iceXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	文件上传请求，在不支持FormData进行文件上传的时候会使用此方法来实现异步上传
   	此方法使用iframe来模拟异步上传
  
  	URL doc:
  	http://icejs.org/######
  */
		send: function send(options, iceXHR) {
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
				self.done(iceXHR);
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
  	done ( iceXHR: Object )
  
  	Return Type:
  	void
  
  	Description:
  	上传完成的处理，主要工作是获取返回数据，移除iframe
  
  	URL doc:
  	http://icejs.org/######
  */
		done: function done(iceXHR) {

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

			complete(iceXHR);

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
  	http://icejs.org/######
  */
		abort: function abort() {}
	};
};

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
	http://icejs.org/######
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

				var _url = options[0];
				args = options[1];
				callback = options[2];
				dataType = options[3];

				// 纠正参数
				// 1、如果没有传入args，则将callback的值给dataType，将args的值给callback，args设为undefined，
				// 2、如果没有传入args和dataType，将args的值给callback，args设为undefined
				correctParam(args, callback, dataType).to([/=/, "object"], "function", rtype).done(function () {
					args = this.$1;
					callback = this.$2;
					dataType = this.$3;
				});

				// get请求参数初始化
				params = {
					url: _url,
					args: args,
					success: callback,
					dataType: dataType,
					method: method
				};
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
 	http://icejs.org/######
 */
	return function () {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		var // 合并参数
		options = extendOptions(args),
		    data = options.data,


		// 自定义xhr对象，用于统一处理兼容问题
		iceXHR = new ICEXMLHttpRequest();

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
			iceXHR.transport = (ajaxTransports[transportName] || ajaxTransports.xhr)(options);

			// 小写dataType
			iceXHR.transport.dataType = options.dataType.toLowerCase();

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
				iceXHR.setRequestHeader("Content-Type", options.contentType);
			}

			// 设置Accept
			iceXHR.setRequestHeader("Accept", accepts[iceXHR.transport.dataType] ? accepts[iceXHR.transport.dataType] + ", */*; q=0.01" : accepts["*"]);

			// haders里面的首部
			foreach(options.headers, function (header, key) {
				iceXHR.setRequestHeader(key, header);
			});

			// 调用请求前回调函数
			if (type$1(options.beforeSend) === "function") {
				options.beforeSend(iceXHR, options);
			}

			// 将事件绑定在iceXHR中
			foreach(["complete", "success", "error"], function (callbackName) {

				// 如果是success或error回调，则使用resolve或reject代替
				if (callbackName === "success") {
					options[callbackName] = options[callbackName] || resolve;
				} else if (callbackName === "error") {
					options[callbackName] = options[callbackName] || reject;
				}

				iceXHR.addEventListener(callbackName, options[callbackName]);
			});

			// 处理超时
			if (options.async && options.timeout > 0) {
				iceXHR.transport.timeoutID = setTimeout(function () {
					iceXHR.abort("timeout");
				}, options.timeout);
			}

			iceXHR.transport.send(options, iceXHR);
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
 	http://icejs.org/######
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
 	http://icejs.org/######
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

function loopFlush(moduleUpdateContext) {

	var title = void 0,
	    _title = void 0;
	foreach(moduleUpdateContext, function (moduleUpdateItem) {
		_title = moduleUpdateItem.updateFn();
		title = title || _title;

		if (type$1(moduleUpdateItem.children) === "array") {
			_title = loopFlush(moduleUpdateItem.children);
			title = title || _title;
		}
	});

	return title;
}

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
	http://icejs.org/######
*/
function ModuleLoader() {

	// 等待加载完成的页面模块，每加载完成一个页面模块都会将此页面模块在waiting对象上移除，当waiting为空时则表示相关页面模块已全部加载完成
	this.waiting = [];

	// 模块更新函数上下文
	this.moduleUpdateContext = [];

	// 加载错误时会将错误信息保存在此
	this.moduleError = null;
}

extend(ModuleLoader.prototype, {

	/**
 	addWaiting ( name: String )
 
 	Return Type:
 	void
 
 	Description:
 	将等待加载完成的页面模块名放入context.waiting中
 
 	URL doc:
 	http://icejs.org/######
 */
	addWaiting: function addWaiting(name) {
		this.waiting.push(name);
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
	delWaiting: function delWaiting(name) {
		var pointer = this.waiting.indexOf(name);
		if (pointer !== -1) {
			this.waiting.splice(pointer, 1);
		}

		// 如果等待队列已空则立即刷新模块
		if (isEmpty(this.waiting)) {
			this.flush();
		}
	},
	signModuleHierarchy: function signModuleHierarchy(currentHierarchy) {
		this.currentHierarchy = currentHierarchy;
	},
	saveModuleUpdateFn: function saveModuleUpdateFn(updateFn) {
		var moduleUpdateItem = { updateFn: updateFn };

		// 标记当前处理模块
		this.moduleUpdateItem = moduleUpdateItem;
		this.currentHierarchy.push(moduleUpdateItem);
	},
	addChildrenContext: function addChildrenContext() {
		var children = [];
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
	load: function load(structure, args) {
		var _this = this;

		var currentHierarchy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.moduleUpdateContext;


		var toRender = false,
		    param = void 0;

		foreach(structure.entity, function (route) {
			if (route.hasOwnProperty("notUpdate")) {
				if (route.hasOwnProperty("forcedRender")) {
					toRender = true;
				} else {
					param = args.param[route.name];

					// 比较新旧param和get,post对象中的值，如果有改变则调用paramChanged和queryChanged
					if (compareArgs(param, route.module.param)) {
						route.module.param = param;
						(route.module.paramChanged || noop).apply(route.module, cache.getDependentPlugin(route.module.paramChanged || noop));
					}

					if (compareArgs(args.get, route.module.get) || compareArgs(args.post, route.module.post)) {
						route.module.get = args.get;
						route.module.post = args.post;
						(route.module.queryhanged || noop).apply(route.module, cache.getDependentPlugin(route.module.queryhanged || noop));
					}
				}

				delete route.notUpdate;
			} else {
				toRender = true;
			}

			// 需更新模块与强制重新渲染模块进行渲染
			if (toRender) {

				// 如果结构中没有模块节点则查找DOM树获取节点
				if (!route.moduleNode) {
					var moduleNode = VNode.domToVNode(query("[" + iceAttr.module + "=" + (route.name === "default" ? "''" : route.name) + "]", route.parent && route.parent.moduleNode.node || undefined)),
					    tmpl = new Tmpl();
					tmpl.mount(moduleNode, true);

					if (moduleNode) {
						route.moduleNode = moduleNode;
					} else {
						throw moduleErr("moduleNode", "\u627E\u4E0D\u5230\u52A0\u8F7D\u8DEF\u5F84\u4E3A\"" + route.modulePath + "\"\u7684\u6A21\u5757node");
					}
				}

				// 给模块元素添加编号属性，此编号有两个作用：
				// 1、用于模块加载时的模块识别
				// 2、使用此属性作为子选择器限制样式范围
				var moduleIdentifier = route.moduleNode.attr(Module.identifier);
				if (!moduleIdentifier) {
					moduleIdentifier = Module.getIdentifier();
					route.moduleNode.attr(Module.identifier, moduleIdentifier);
				}

				// 加入等待加载队列
				_this.addWaiting(moduleIdentifier);

				// 将基于当前相对路径的路径统一为相对于根目录的路径
				// const pathAnchor = document.createElement ( "a" );
				// pathAnchor.href = route.modulePath || "";

				// 标记模块更新函数容器的层级
				// 这样在actionLoad函数中调用saveModuleUpdateFuncs保存更新函数时可以保存到对应的位置
				_this.signModuleHierarchy(currentHierarchy);

				// 无刷新跳转组件调用来完成无刷新跳转
				ModuleLoader.actionLoad.call(_this, route.modulePath, route.moduleNode, route, args.param[route.name], args.get, args.post);
			}

			// 此模块下还有子模块需更新
			if (type$1(route.children) === "array") {

				// 添加子模块容器并继续加载子模块
				_this.load(route.children, args, _this.addChildrenContext());
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
 	http://icejs.org/######
 */
	flush: function flush() {
		if (this.moduleError) {

			// 加载模块遇到错误，直接处理错误信息
			var location = {
				path: this.moduleError,
				nextStructure: Router.matchRoutes(this.path, this.param),
				param: {},
				search: Router.matchSearch(getSearch()),
				action: "PUSH" // 暂不确定是不是为"PUSH"???
			};

			// Router.matchRoutes()匹配当前路径需要更新的模块
			// 更新currentPage结构体对象，如果为空表示页面刚刷新，将nextStructure直接赋值给currentPage
			Structure$1.currentPage = Structure$1.currentPage ? Structure$1.currentPage.update(location.nextStructure) : location.nextStructure;

			// 根据更新后的页面结构体渲染新视图
			Structure$1.currentPage.render(location);
		} else {

			// 正常加载，将调用模块更新函数更新模块
			var title = loopFlush(this.moduleUpdateContext);

			// 更新页面title
			if (title && document.title !== title) {
				document.title = title;
			}
		}
	}
});

extend(ModuleLoader, {

	/**
 	actionLoad ( url: String|Object, moduleNode: DMOObject, currentStructure: Object, param?: Object, args?: Object, data?: Object, method?:String, timeout?: Number, before?: Function, success?: Function, error?: Function, abort?: Function )
 		Return Type:
 	void
 		Description:
 	根据path请求跳转模块数据并更新对应的moduleNode（moduleNode为模块节点）
 	param为路径匹配到的参数
 	args参数为get请求参数，会将此参数添加到path后
 	data为post参数，直接提交给http的data
 		URL doc:
 	http://icejs.org/######
 */
	actionLoad: function actionLoad(path, moduleNode, currentStructure, param, args, data, method, timeout) {
		var before = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : noop;
		var success = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : noop;

		var _this2 = this;

		var error = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : noop;

		var _abort = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : noop;

		var moduleConfig = configuration.getConfigure("module");

		//////////////////////////////////////////////////
		//////////////////////////////////////////////////
		//////////////////////////////////////////////////
		path += configuration.getConfigure("moduleSuffix") + args;

		var historyModule = cache.getModule(path);

		// 并且请求不为post
		// 并且已有缓存
		// 并且缓存未过期
		// cache已有当前模块的缓存时，才使用缓存
		if ((!method || method.toUpperCase() !== "POST") && historyModule && (moduleConfig.expired === 0 || historyModule.time + moduleConfig.expired > timestamp())) {
			this.saveModuleUpdateFn(function () {
				Structure$1.currentPage.signCurrentRender(currentStructure, param, args, isPlainObject(data) ? data : serialize(data));

				var title = historyModule.updateFn(ice, moduleNode, VNode, require);
				moduleNode.emit(MODULE_UPDATE);

				return title;
			});

			// 获取模块更新函数完成后在等待队列中移除
			this.delWaiting(moduleNode.attr(Module.identifier));
		} else {

			// 触发请求事件回调
			moduleNode.emit(MODULE_REQUEST);

			// 请求模块跳转页面数据
			http.request({

				url: path,
				method: /^(GET|POST)$/i.test(method) ? method.toUpperCase() : "GET",
				data: data,
				timeout: timeout || 0,
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
				var updateFn = compileModule(moduleString, moduleNode.attr(Module.identifier));

				// 满足缓存条件时缓存模块更新函数
				if (moduleConfig.cache === true && moduleNode.cache !== false) {
					cache.pushModule(path, { updateFn: updateFn, time: timestamp() });
				}

				_this2.saveModuleUpdateFn(function () {
					moduleNode.emit(MODULE_RESPONSE);

					Structure$1.currentPage.signCurrentRender(currentStructure, param, args, isPlainObject(data) ? data : serialize(data));

					var title = updateFn(ice, moduleNode, VNode, require);
					moduleNode.emit(MODULE_UPDATE);

					// 调用success回调
					success(moduleNode);

					return title;
				});

				// 获取模块更新函数完成后在等待队列中移除
				_this2.delWaiting(moduleNode.attr(Module.identifier));
			}).fail(function (iceXHR, errorCode) {

				// 保存错误信息并立即刷新
				_this2.moduleError = Router.getError(errorCode);
				_this2.flush();
				error(moduleNode, error);
			});
		}
	}
});

// 路由模式，启动路由时可进行模式配置
// 自动选择路由模式(默认)
// 在支持html5 history API时使用新特性，不支持的情况下自动回退到hash模式
var AUTO = 0;

// 强制使用hash模式
var HASH_HISTORY = 1;

// 强制使用html5 history API模式
// 使用此模式时需注意：在不支持新特新的浏览器中是不能正常使用的
var BROWSER_HISTORY = 2;

var browserHistory = {

	// window.history对象
	entity: window.history,

	init: function init() {
		var _this = this;

		event.on(window, "popstate", function (e) {
			var locationGuide = _this.getState();

			// 更新currentPage结构体对象，如果为空表示页面刚刷新，将nextStructure直接赋值给currentPage
			Structure$1.currentPage.update(locationGuide.structure);

			// 根据更新后的页面结构体渲染新视图
			Structure$1.currentPage.render({
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
 	http://icejs.org/######
 */
	replace: function replace(state, url) {
		if (this.entity.pushState) {
			this.entity.replaceState(null, null, url);
			this.saveState(window.location.pathname, state);
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
 http://icejs.org/######
 */
	push: function push(state, url) {
		if (this.entity.pushState) {
			this.entity.pushState(null, null, url);
			this.saveState(window.location.pathname, state);
		} else {
			throw envErr("history API", "浏览器不支持history新特性，您可以选择AUTO模式或HASH_BROWSER模式");
		}
	},


	////////////////////////////////////
	/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
	/// 
	states: {},

	/**
 	setState ( pathname: String, state: Any )
 	
 	Return Type:
 	void
 	
 	Description:
 	保存状态记录
 	
 	URL doc:
 	http://icejs.org/######
 */
	saveState: function saveState(pathname, state) {
		this.states[pathname] = state;
	},


	/**
 	getState ( pathname?: String )
 	
 	Return Type:
 	Object
 	
 	Description:
 	获取对应记录
 	
 	URL doc:
 	http://icejs.org/######
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
 	http://icejs.org/######
 */
	buildURL: function buildURL(path) {
		var pathAnchor = document.createElement("a");
		pathAnchor.href = path;

		return pathAnchor.pathname;
	},


	/**
 getPathname ()
 	Return Type:
 String
 pathname
 	Description:
 获取pathname
 	URL doc:
 http://icejs.org/######
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
    	http://icejs.org/######
    */
	getQuery: function getQuery(path) {
		return path && (path.match(/\?(.*)$/) || [""])[0] || window.location.search;
	}
};

var hashHistory = {
	init: function init() {
		var _this = this;

		event.on(window, "hashchange", function (e) {

			// 如果this.pushOrRepalce为true表示为跳转触发
			if (_this.pushOrReplace === true) {
				_this, pushOrReplace = false;
				return;
			}

			var locationGuide = _this.getState();

			// 更新currentPage结构体对象，如果为空表示页面刚刷新，将nextStructure直接赋值给currentPage
			Structure.currentPage.update(locationGuide.structure);

			// 根据更新后的页面结构体渲染新视图
			Structure.currentPage.render({
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
 	http://icejs.org/######
 */
	replace: function replace(state, url) {
		this.pushOrReplace = true;

		var hashPathname = this.buildURL(url);
		window.location.replace(hashPathname);

		this.saveState(this.getPathname(), state);
	},


	/**
 	push ( state: Any, url: String )
 	
 	Return Type:
 	void
 	
 	Description:
 	对history.pushState方法的封装
 	
 	URL doc:
 	http://icejs.org/######
 */
	push: function push(state, title, url) {
		this.pushOrReplace = true;

		var hashPathname = this.buildURL(url);
		window.location.hash = hashPathname;

		this.saveState(this.getPathname(), state);
	},


	////////////////////////////////////
	/// 页面刷新前的状态记录，浏览器前进/后退时将在此记录中获取相关状态信息，根据这些信息刷新页面
	/// 
	states: {},

	/**
 	setState ( pathname: String, state: Any )
 	
 	Return Type:
 	void
 	
 	Description:
 	保存pathname下的状态
 	
 	URL doc:
 	http://icejs.org/######
 */
	saveState: function saveState(pathname, state) {
		this.states[pathname] = state;
	},


	/**
 	getState ( pathname?: String )
 	
 	Return Type:
 	Object
 	
 	Description:
 	获取对应记录
 	
 	URL doc:
 	http://icejs.org/######
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
        
    	构建规则与普通跳转的构建相同，当新path以“/”开头时则从原url的根目录开始替换，当新path不以“/”老头时，以原url最后一个“/”开始替换
 		URL doc:
 	http://icejs.org/######
 */
	buildURL: function buildURL(path, mode) {
		var pathname = (window.location.hash || "#/").replace(path.substr(0, 1) === "/" ? /#(.*)$/ : /(?:\/)([^\/]*)?$/, function (match, rep) {
			return match.replace(rep, "") + path;
		});

		return mode === true ? pathname.substr(0, 1) : pathname;
	},


	/**
 	getPathname ()
 		Return Type:
 	String
 	pathname
 		Description:
 	获取pathname
 		URL doc:
 	http://icejs.org/######
 */
	getPathname: function getPathname() {
		return (window.location.hash.match(/#([^?]*)$/) || ["", ""])[1];
	},


	/**
 	getQuery ( path?: String )
  	Return Type:
 	String
 	get请求参数
  	Description:
 获取get请求参数
  	URL doc:
 	http://icejs.org/######
 */
	getQuery: function getQuery(path) {
		return ((path || window.location.hash).match(/\?(.*)$/) || [""])[0];
	}
};

var iceHistory = {

	history: null,

	initHistory: function initHistory(historyMode) {
		if (!this.history) {

			this.history = (historyMode === HASH_HISTORY ? hashHistory : historyMode === BROWSER_HISTORY ? browserHistory : { init: noop }).init();
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
 http://icejs.org/######
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
 	http://icejs.org/######
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
 	http://icejs.org/######
 */
	push: function push(state, url) {
		if (this.history) {
			this.history.push(state, url);
		}
	},


	/**
 	setState ( pathname: String, state: Any )
 	
 	Return Type:
 	void
 	
 	Description:
 	保存pathname下的状态
 	
 	URL doc:
 	http://icejs.org/######
 */
	saveState: function saveState(pathname, state) {
		this.history.saveState(pathname, state);
	},


	/**
 	getState ( pathname?: String )
 	
 	Return Type:
 	Object
 	
 	Description:
 	获取对应记录
 	
 	URL doc:
 	http://icejs.org/######
 */
	getState: function getState(pathname) {
		return this.history.getState(pathname);
	}
};

// [
//  { module: obj1, name: "default", moduleNode: node1, parent: null, children: [
//    { module: obj2, name: "header", moduleNode: node2, parent: parentObj },
//    { module: obj3, name: "main", moduleNode: node3, parent: parentObj },
//    { module: obj4, name: "footer", moduleNode:node4, parent: parentObj }
// ] }
// ]


function Structure$1(entity) {
    this.entity = entity;
}

extend(Structure$1.prototype, {
    update: function update(structure) {
        var _this = this;

        var x = this.entity,
            y = structure.entity,
            find = void 0;
        var unmountModule = [];

        if (x && !y || !x && y) {
            foreach(x, function (xItem) {
                unmountModule.push(xItem.module);
            });
            x = y;
        } else if (x && y) {
            foreach(y, function (yItem, i) {
                foreach(x, function (xItem, j) {
                    find = false;
                    if (xItem.name === yItem.name) {
                        find = true;
                        if (xItem.modulePath !== yItem.modulePath) {

                            unmountModule.push(xItem.module);

                            // 模块名相同但模块内容不同的时候表示此模块需更新为新模块及子模块内容
                            xItem.modulePath = yItem.modulePath;
                            xItem.module = null;
                        } else {

                            // 模块名和模块内容都相同的时候只表示此模块不需更新，还需进一步比较子模块
                            // 标记为不更新
                            xItem.notUpdate = null;
                            if (!(!xItem.children && !yItem.children)) {
                                xItem.children = _this.update.call({
                                    entity: xItem.children,
                                    update: _this.update
                                }, {
                                    entity: yItem.children
                                });
                            }
                        }

                        return false;
                    }
                });

                if (!find) {

                    // 在原结构体中没有匹配到此更新模块，表示此模块为新模块，直接push进原结构体对应位置中
                    x.push(yItem);
                }
            });
        }

        // call unmount
        foreach(unmountModule, function (mod) {
            foreach(mod.components, function (comp) {
                comp.unmount();
            });

            mod.unmount();
        });

        if (!this instanceof Structure$1) {
            return x;
        }
    },


    /**
        isEmptyStructure ()
    
        Return Type:
        Boolean
        是否为空结构
    
        Description:
        判断此结构对象是否为空
    
        URL doc:
        http://icejs.org/######
    */
    isEmptyStructure: function isEmptyStructure() {
        return isEmpty(this.entity);
    },


    /**
        signCurrentRender ( structureItem: Object, param: Object, args: String, data: Object )
        
        Return Type:
        void
    
        Description:
        标记当前正在渲染的页面结构项并传递对应的参数到正在渲染的模块内
        这样可以使创建Module对象时获取父级的vm，和保存扫描到的moduleNode
    
        URL doc:
        http://icejs.org/######
    */
    signCurrentRender: function signCurrentRender(structureItem, param, args, data) {
        structureItem.param = param;
        structureItem.get = args;
        structureItem.post = data;
        this.currentRender = structureItem;
    },


    /**
        getCurrentRender ()
    
        Return Type:
        Object
        当前结构项
    
        Description:
        获取当前正在渲染的页面结构项
    
        URL doc:
        http://icejs.org/######
    */
    getCurrentRender: function getCurrentRender() {
        return this.currentRender;
    },


    /**
        saveSubModuleNode ( node: DOMObject )
    
        Return Type:
        void
    
        Description:
        保存扫描到的模块节点对象以便下次使用时直接获取
    
        URL doc:
        http://icejs.org/######
    */
    saveSubModuleNode: function saveSubModuleNode(node) {
        foreach(this.currentRender.children, function (child) {
            if (child.name === (node.attr(iceAttr.module) || "default") && !child.moduleNode) {
                child.moduleNode = elem;

                return false;
            }
        });
    },


    /**
        copy ()
    
        Return Type:
        Object
    
        Description:
        拷贝一个Structure对象
    
        URL doc:
        http://icejs.org/######
    */
    copy: function copy() {
        var _this2 = this;

        var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.entity;
        var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var copyEntity = [];

        foreach(entity, function (item) {
            var copyItem = {};

            foreach(item, function (v, k) {
                if (k === "children") {
                    copyItem.children = _this2.copy(v, copyItem);
                } else if (k === "parent") {
                    copyItem.parent = parent;
                } else {
                    copyItem[k] = v;
                }
            });

            copyEntity.push(copyItem);
        });

        return parent ? copyEntity : new Structure$1(copyEntity);
    },


    /**
           render ( location: Object )
       
           Return Type:
           void
       
           Description:
           根据location对象渲染出对应的模块
       
           URL doc:
           http://icejs.org/######
       */
    render: function render(location) {

        var locationGuide = {
            structure: location.nextStructure,
            param: location.param,
            get: location.get,
            post: serialize(location.post)
        },


        // 使用模块加载器来加载更新模块
        moduleLoader = new ModuleLoader();

        moduleLoader.load(this, { param: location.param, get: location.get, post: location.post });

        switch (location.action) {
            case "PUSH":
                iceHistory.push(locationGuide, location.path);

                break;
            case "REPLACE":
                iceHistory.replace(locationGuide, location.path);

                break;
            case "NONE":
                iceHistory.saveState(location.path, locationGuide);

                break;
            case "POP":
            // do nothing
        }
    }
});

function Router(finger) {
    this.finger = finger;
}

extend(Router.prototype, {
    module: function module() {
        var moduleName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "default";

        check(moduleName).type("string").notBe("").ifNot("Router.module", "模块名必须为不为空的字符串").do();

        foreach(this.finger, function (routeItem) {
            if (routeItem.name === moduleName) {
                throw RouterErr("moduleName", "同级模块的名字不能重复");
            }
        });

        this.routeItem = {
            name: moduleName,
            routes: []
        };
        this.finger.push(this.routeItem);

        return this;
    },
    route: function route(pathExpr, modulePath, childDefineFunc) {
        check(pathExpr).type("string", "array").ifNot("Router.route", "pathExpr参数必须为字符串或数组");

        if (!this.routeItem) {
            throw RouterErr("Router.module", "调用route()前必须先调用module()定义模块路由");
        }

        var route = {
            modulePath: modulePath,
            path: Router.pathToRegexp(pathExpr)
        };
        this.routeItem.routes.push(route);

        if (type$1(childDefineFunc) === "function") {
            route.children = [];
            childDefineFunc(new Router(route.children));
        }

        return this;
    },
    defaultRoute: function defaultRoute(modulePath) {
        this.route("", modulePath);

        return this;
    },
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
    forcedRender: function forcedRender() {
        this.routeItem.forcedRender = null;
        return this;
    },
    error404: function error404(path404) {
        Router.errorPaths.error404 = path404;
    },
    error500: function error500(path500) {
        Router.errorPaths.error500 = path500;
    }
});

extend(Router, {
    routeTree: [],
    errorPaths: {},

    getError: function getError(errorCode) {
        return this.errorPaths["error" + errorCode];
    },
    pathToRegexp: function pathToRegexp(pathExpr, from) {
        var i = 1,
            pathObj = { param: {} },


        // 如果path为redirect中的from，则不需加结尾的“/”匹配式
        endRegexp = from === "redirect" ? "" : "(?:\\/)?";

        // 如果路径表达式为""时需在结尾增加"$"符号才能正常匹配到
        endRegexp += pathExpr === "" || pathExpr === "/" ? "$" : "";

        // 如果pathExpr为数组，则需预处理
        if (type$1(pathExpr) === "array") {
            pathExpr = "(" + pathExpr.join("|") + ")";
            i++;
        }

        pathObj.regexp = new RegExp("^" + pathExpr.replace("/", "\\/").replace(/:([\w$]+)(?:(\(.*?\)))?/g, function (match, rep1, rep2) {
            pathObj.param[rep1] = i++;

            return rep2 || "([^\\/]+)";
        }) + endRegexp, "i");

        return pathObj;
    },


    // 路由路径嵌套模型
    // /settings => /\/settings/、/settings/:page => /\/settings/([^\\/]+?)/、/settings/:page(\d+)
    matchRoutes: function matchRoutes(path, param) {
        var routeTree = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.routeTree;

        var _this = this;

        var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var matchError404 = arguments[4];

        // [ { module: "...", modulePath: "...", parent: ..., param: {}, children: [ {...}, {...} ] } ]
        var routes = [],
            entityItem = void 0;

        foreach(routeTree, function (route) {
            if (route.hasOwnProperty("redirect")) {
                var isContinue = true;

                foreach(route.redirect, function (redirect) {

                    path = path.replace(redirect.from.regexp, function () {
                        isContinue = false;
                        var to = redirect.to;

                        foreach(redirect.from.param, function (i, paramName) {
                            to = to.replace(":" + paramName, matchPath[i]);
                        });

                        return to;
                    });

                    return isContinue;
                });

                return false;
            }
        });

        foreach(routeTree, function (route) {
            foreach(route.routes, function (pathReg) {
                var matchPath = void 0,
                    isContinue = true;

                entityItem = {
                    name: route.name,
                    modulePath: pathReg.modulePath,
                    moduleNode: null,
                    module: null,
                    parent: parent
                };

                if (route.hasOwnProperty("forcedRender")) {
                    entityItem.forcedRender = route.forcedRender;
                }

                if (matchPath = path.match(pathReg.path.regexp)) {
                    isContinue = false;

                    param[route.name] = param[route.name] || {};
                    foreach(pathReg.path.param, function (i, paramName) {
                        param[route.name][paramName] = matchPath[i];
                    });

                    routes.push(entityItem);
                }

                if (type$1(pathReg.children) === "array") {
                    var children = _this.matchRoutes(matchPath ? path.replace(matchPath[0], "") : path, param, pathReg.children, entityItem);

                    if (!isEmpty(children)) {
                        entityItem.children = children;
                        if (routes.indexOf(entityItem) <= -1) {
                            routes.push(entityItem);
                        }
                    }
                }

                return isContinue;
            });
        });

        // 最顶层时返回一个Structure对象
        if (parent === null) {

            // 如果没有匹配到任何更新模块则匹配404页面路径
            if (isEmpty(routes) && Router.errorPaths.error404 && !matchError404) {
                return this.matchRoutes(Router.errorPaths.error404, param, undefined, undefined, true);
            } else {
                return new Structure$1(routes);
            }
        } else {
            return routes;
        }
    }
});

/**
    requestEventBind ( e: Object )

    Return Type:
    void

    Description:
    为最外层模块对象绑定请求动作的事件代理

    url doc:
    http://icejs.org/######
*/
function requestEventHandler(path, method, post) {

    if (method === "GET") {

        var param = {},
            nextStructure = Router.matchRoutes(path, param);

        if (!nextStructure.isEmptyStructure()) {
            var location = {
                path: path,
                nextStructure: nextStructure.copy(),
                param: param,
                get: iceHistory.history.getQuery(path),
                post: post,
                method: method,
                action: "PUSH"
            };

            // 更新currentPage结构体对象
            Structure$1.currentPage.update(location.nextStructure);

            // 根据更新后的页面结构体渲染新视图
            Structure$1.currentPage.render(location);
        }
    } else if (method === "POST") {
        // post提交数据
        http.post(path, post, function (redirectPath) {
            if (redirectPath) {
                redirectPath = iceHistory.history.buildURL(redirectPath);

                requestEventHandler(redirectPath, "GET", {});
            }
        });
    }
}

/////////////////////////////////
var ice = {

				// 路由模式，启动路由时可进行模式配置
				// 自动选择路由模式(默认)
				// 在支持html5 history API时使用新特性，不支持的情况下自动回退到hash模式
				AUTO: AUTO,

				// 强制使用hash模式
				HASH_HISTORY: HASH_HISTORY,

				// 强制使用html5 history API模式
				// 使用此模式时需注意：在不支持新特新的浏览器中是不能正常使用的
				BROWSER_HISTORY: BROWSER_HISTORY,

				// Module对象
				Module: Module,

				// Component对象
				Component: Component,

				// Class类构造器
				// 用于创建组件类
				Class: Class,

				/**
    	start ( rootModuleName: String, routerConfig: Object )
    	
    	Return Type:
    	void
    	
    	Description:
    	以一个module作为起始点启动ice
    	
    	URL doc:
    	http://icejs.org/######
    */
				startRouter: function startRouter() {
								var routerConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


								// 纠正参数
								// correctParam ( rootModuleName, routerConfig ).to ( "string", "object" ).done ( function () {
								// 	this.$1 = rootModuleName;
								// 	this.$2 = routerConfig;
								// } );

								// if ( rootModuleName !== undefined ) {
								// 	check ( rootModuleName ).type ( "string" ).notBe ( "" ).ifNot ( "ice.startRouter", "当rootModuleName传入参数时，必须是不为空的字符串" ).do ();
								// }

								check(routerConfig).type("object").ifNot("ice.startRouter", "当routerConfig传入参数时，必须为object类型").do();

								// 执行routes配置路由
								(routerConfig.routes || noop)(new Router(Router.routeTree));
								delete routerConfig.routes;

								routerConfig.history = routerConfig.history || AUTO;
								if (routerConfig.history === AUTO) {
												if (iceHistory.supportNewApi()) {
																routerConfig.history = BROWSER_HISTORY;
												} else {
																routerConfig.history = HASH_HISTORY;
												}
								}

								iceHistory.initHistory(routerConfig.history);

								// 当使用hash模式时纠正路径
								var href = window.location.href,
								    host = window.location.protocol + "//" + window.location.host + "/";

								if (routerConfig.history === HASH_HISTORY && href !== host && href.indexOf(host + "#") === -1) {
												if (window.location.hash) {
																window.location.hash = "";
												}

												window.location.replace(href.replace(host, host + "#/"));
								}

								delete routerConfig.history;

								// 将除routes、history外的配置信息进行保存
								configuration(routerConfig);

								// 绑定元素请求或提交表单的事件到body元素上
								event.on(document.body, "click submit", function (e) {

												var target = e.target,
												    path = attr(target, e.type.toLowerCase() === "submit" ? iceAttr.action : iceAttr.href),
												    method = e.type.toLowerCase() === "submit" ? attr(target, "method").toUpperCase() : "GET";

												if (path) {
																e.preventDefault();

																requestEventHandler(iceHistory.history.buildURL(path), method, method.toLowerCase() === "post" ? target : {});
												}
								});

								var param = {},
								    path = iceHistory.history.getPathname(),
								    location = {
												path: path,
												nextStructure: Router.matchRoutes(path, param),
												param: param,
												get: iceHistory.history.getQuery(),
												post: {},
												method: "GET",
												action: "NONE"
								};

								// Router.matchRoutes()匹配当前路径需要更新的模块
								// 因路由刚启动，故将nextStructure直接赋值给currentPage
								Structure$1.currentPage = location.nextStructure.copy();

								// 根据更新后的页面结构体渲染新视图
								Structure$1.currentPage.render(location);
				},


				/**
    install ( pluginDefinition: Object )
    
    Return Type:
    void
    
    Description:
    安装插件
    插件定义对象必须拥有build方法
    若插件安装后会返回一个对象，则可在模块或组件的生命周期钩子函数中直接使用插件名引入，框架会自动注入对应插件
    
    URL doc:
    http://icejs.org/######
    */
				install: function install(pluginDefiniton) {
								check(pluginDefiniton.name).type("string").notBe("").check(cache.hasPlugin(pluginDefiniton.name)).be(false).ifNot("pluginDefiniton.name", "plugin安装对象必须定义name属性以表示此插件的名称，且不能与已有插件名称重复").do();

								check(pluginDefiniton.build).type("function").ifNot("pluginDefiniton.build", "plugin安装对象必须包含build方法").do();

								var deps = cache.getDependentPlugin(pluginDefiniton.build);

								cache.pushPlugin(pluginDefiniton.name, pluginDefiniton.build.apply(this, deps));
				}
};

return ice;

})));
