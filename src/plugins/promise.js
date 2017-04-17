'use strict';
/* jshint -W030 */
/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/* globals argErr,
	push,
	_forEach,
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported slice,
	splice,
	push,
	toString,
	_extend,
	ice,
	_get,
	_post
 */

/**
 * Promose实现类，用于以同步的方式去执行回调函数，而不用将回调函数传入执行函数中，更加符合逻辑，且在需要执行多重回调处理时，以链式结构来表示函数处理后的回调
 * 此类创建的对象，主要有then()、done()、fail()、always()方法
 * 此实现类符合Promises/A+规范。
 *
 * eg:
 * 1、var p = new Promise(function(resolve, reject) {
 * 		if(success) {
 * 			resolve(value);
 * 		}
 * 		else if(fail) {
 * 			reject(reason);
 * 		}
 * });
 *
 * p.then(function(value) {
 * 		// do success callback...
 * 	}, function(reason) {
 * 		// do fail callback...
 * 	});
 *
 * 2. 创建Promise对象如同1
 * var p1 = p.then(function(value) {
 * 		// do success callback...
 * 		return new Promise(function(resolve, reject) {
 * 			if(success) {
 * 		 		resolve(value);
 * 		   }
 * 		   else if(fail) {
 * 			  reject(reason);
 * 		   }
 * 	    });
 * 	}, function(reason) {
 * 		// do fail callback...
 * 	});
 * 	
 * 	p1.then(function(value) {
 * 		// do success callback...
 * 	}, function(reason) {
 * 		// do fail callback...
 * 	});
 *
 * // 如此这样以链式结构的方式来实现多重回调...
 *
 * Promise原理：Promise相当于一个方法的状态机，来管理拥有回调的函数执行。Promise拥有三种状态，分别为Pending、Fulfilled、Rejected，
 * Pending：待发生状态，即待命状态
 * Fulfilled：成功状态，当状态为Fulfilled时，将会触发成功回调
 * Rejected：失败状态，当状态为Rejected时，将会触发失败回调
 * Fulfilled和Rejected状态都只能由Pending状态改变过来，且不可逆
 * 
 * 如上例子，Promose内部定义有三个最重要的方法，分别为then()、resolve()、reject()。
 * then方法用于回调函数的绑定
 * resolve方法用于在成功时的回调，它将修改当前Promise对象为Fulfilled状态并执行then方法绑定的成功回调函数
 * reject方法用于在失败时的回调，它将修改当前Promise对象为Rejected状态并执行then方法绑定的失败回调函数
 * 
 * 第一重函数处理：在创建Promise对象时将会执行第一重处理函数（有回调函数的函数）并将回调函数设为修改此Promise对象状态的函数，也就是resolve和reject方法，然后使用then方法将回调函数绑定到此Promise对象上，当第一重处理函数的回调函数执行时，也就是执行resolve或reject函数时，将会修改当前Promise对象的状态，并执行对应的绑定函数，如果没有绑定回调函数，则这两个方法只改变此Promise对象的状态。
 * 第二重函数处理时：then方法将返回一个新创建的Promise对象作为第二重回调函数执行的代理对象，在第二次调用then方法时其实是将第二重处理函数的回调函数绑定在了此代理对象上。then方法中有对传入的回调函数（onFulfilled和onRejected）进行封装，以致于能够获取到回调函数的返回值，并判断当回调函数返回值为一个thenable对象时（thenable对象是拥有then方法的对象），则通知Promise代理对象去执行第二重的回调函数，是通过回调函数返回的thenable对象去调用then方法绑定回调函数，此回调函数的内容为通知代理对象执行回调函数做到的
 * 以此类推第三重、第四重...
 *
 * @author JOU
 * @time   2016-07-31T16:34:12+0800
 * @param  {@function}                 resolver 处理函数体
 */
function Promise(resolver) {
	// 判断resolver是否为处理函数体
	if (typeof resolver !== 'function') {
		throw argErr('function Promise', '构造函数需传入一个函数参数');
	}

	/** @type {Number} Promise的三种状态定义 */
	var PENDING 			= 0,
		FULFILLED			= 1,
		REJECTED 			= 2,

		/** 预定义的Promise对象对应的处理函数体信息 */
		_value,
		_reason,
		_state 				= PENDING,
		_handler 			= [];

	/**
	 * 用于判断对象是否为thenable对象（即是否包含then方法）
	 *
	 * @author JOU
	 * @time   2016-07-31T17:27:33+0800
	 * @param  {multi}                 value 被判断的值
	 * @return {Boolean}                     是thenable对象返回true，否则返回false
	 */
	this._isThenable = function(value) {
		var t = typeof value;
			if (value && (t === 'object' || t === 'function')) {
				var then = value.then;
				if (typeof then === 'function') {
					return true;
				}
		  }
		  return false;
	}

	/**
	 * 根据Promise对象来对回调函数做出相应处理
	 * 当状态为Pending时，将回调函数保存于promise._handler数组中待调用
	 * 当状态为Fulfilled时，执行onFulfilled方法
	 * 当状态为Rejected时，执行onRejected方法
	 *
	 * @author JOU
	 * @time   2016-07-31T17:29:22+0800
	 * @param  {[type]}                 handler [description]
	 * @return {[type]}                         [description]
	 */
	this.handle = function(handler) {
		if (_state === PENDING) {
			push.call(_handler, handler);
		}
		else if(_state === FULFILLED && typeof handler.onFulfilled === 'function') {
			handler.onFulfilled.apply(null, _value);
		}
		else if(_state === REJECTED && typeof handler.onRejected === 'function') {
			handler.onRejected(_reason);
		}
	}

	/**
	 * 改变Promise对象的状态为Fulfilled并执行promise._handler数组中所有的onFulfilled方法
	 * 此方法用于执行成功时的回调绑定
	 * see Promise注释
	 *
	 * @author JOU
	 * @time   2016-07-31T17:32:54+0800
	 * @param  {multi}                 value 回调函数参数
	 */
	function _resolve() {
		if (_state === PENDING) {
			_state 		= FULFILLED;
			_value 		= arguments;

			_forEach(_handler, function(item) {
				item.onFulfilled && item.onFulfilled.apply(null, _value);
			});
		}
	}

	/**
	 * 改变Promise对象的状态为Rejected并执行promise._handler数组中所有的onRejected方法
	 * 此方法用于执行失败时的回调绑定
	 * see Promise注释
	 *
	 * @author JOU
	 * @time   2016-07-31T17:36:37+0800
	 * @param  {string}                 reason 失败原因
	 */
	function _reject(reason) {
		if (_state === PENDING) {
			_state 		= REJECTED;
			_reason		= reason;

			_forEach(_handler, function(item) {
				item.onRejected && item.onRejected(_reason);
			});
		}
	}

	resolver(_resolve, _reject);
}

// Promise原型对象
Promise.prototype 		 	= {
	/**
	 * Promise的主要方法之一，用于绑定或执行处理函数的回调函数，当成功时的回调函数返回值为thenable对象，则通知代理Promise对象执行回调函数
	 * see Promise注释
	 *
	 * @author JOU
	 * @time   2016-07-31T17:38:34+0800
	 * @param  {function}                 onFulfilled 成功时的回调函数
	 * @param  {function}                 onRejected  失败时的回调函数
	 * @return {object}                               新创建的Promise代理对象
	 */
	then: function(onFulfilled, onRejected) {
		var __this = this;
		return new Promise(function(resolve, reject) {
			__this.handle({
				onFulfilled: function() {
								var result = typeof onFulfilled === 'function' && onFulfilled.apply(null, arguments) || arguments;
								if (__this._isThenable(result)) {
									result.then(
										function() {
											resolve();
										},
										function(reason) {
											reject(reason);
										});
								}
							},


				onRejected: function(reason) {
								var result = typeof onRejected === 'function' && onRejected(reason) || reason;
								reject(result);
							}
			});
		});
	},

	/**
	 * 成功时的回调函数绑定
	 *
	 * @author JOU
	 * @time   2016-07-31T17:41:59+0800
	 * @param  {function}                 onFulfilled 回调函数
	 * @return {object}                               当前Promise对象
	 */
	done: function(onFulfilled) {
		this.handle({
			onFulfilled: onFulfilled
		});

		return this;
	},

	/**
	 * 失败时的回调函数绑定
	 *
	 * @author JOU
	 * @time   2016-07-31T17:43:20+0800
	 * @param  {function}                 onRejected 回调函数
	 * @return {object}                              当前Promise对象
	 */
	fail: function(onRejected) {
		this.handle({
			onRejected: onRejected
		});

		return this;
	},

	/**
	 * 绑定执行函数成功或失败时的回调函数，即不管执行函数成功与失败，都将调用此方法绑定的回调函数
	 *
	 * @author JOU
	 * @time   2016-07-31T17:44:07+0800
	 * @param  {function}               callback 回调函数
	 */
	always: function(callback) {
		this.handle({
			onFulfilled: callback,
			onRejected: callback
		});
	}

}

/**
 * 存储准备调用的promise对象，用于多个异步请求并发协作时使用。
 * 此函数会等待传入的promise对象的状态发生变化再做具体的处理
 *
 * @author JOU
 * @time   2016-07-28T17:31:10+0800
 * @param  {object} 		promise[1-n] 不定个数Promise对象
 * @return {object}                 	 promise对象
 */
Promise.when 		= function() {

}