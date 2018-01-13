// 开发模式常量
// 普通开发模式
export const DEVELOP_COMMON = 0;

// 单页开发模式
export const DEVELOP_SINGLE = 1;

// 连续字符正则表达式
export const rword = /\S+/g;

// 变量名正则表达式
export const rvar = /[A-Za-z$_][\w$]*/;

// 模板表达式匹配正则
export const rexpr = /{{\s*(.*?)\s*}}/;

// 组件名正则表达式
export const rcomponentName = /^[A-Z][a-zA-Z0-9]*/;

// 局部属性标识前缀
export const identifierPrefix = "data-no-";

// 模块类型常量
export const TYPE_COMPONENT = 0;
export const TYPE_PLUGIN = 1;

// 重复利用的常量
// 样式值为数字时不添加单位“px”的样式名
export const noUnitHook = [ "z-index" ];

// 直接赋值的元素属性，如果不在此的属性将会使用setAttribute设置属性
export const attrAssignmentHook = [ "value", "checked" ];

export const amAttr = {
	module : ":module",
	title : ":title",

	href : "href",
	action : "action"
};