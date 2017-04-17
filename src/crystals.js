'use strict';

/* 声明此文件在jshint检测时的变量不报 'variable' is not defined. */
/*  
 */

/* 声明此文件在jshint检测时的变量不报 'variable' is defined but never used */
/* exported crystals,

 */

/** @type {Function} 贯穿整个框架的对象。crystals提供了外部环境与ice内部环境的交互的接口，开发者可在此对象上设置一些参数来供内部查找调用，同时也提供内部封装属性给开发者进行调用 */
function crystals() {

}


function crystals_refreshModule() {

}

_extend(crystals, {
	refreshModule 	: crystals_refreshModule
});