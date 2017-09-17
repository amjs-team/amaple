
// 表示ice.module()
export const TYPE_MODULE = 2;

// 表示plugin()
export const TYPE_PLUGIN = 3;

// 表示driver()
export const TYPE_DRIVER = 4;

// 连续字符正则表达式
export const rword = /\S+/g;

// 变量正则表达式
export const rvar = /[^0-9]{1}[\w$]*/;

// 模板表达式匹配正则
export const rexpr = /{{\s*(.*?)\s*}}/;

// 模块事件常量
export const MODULE_UPDATE = "update";
export const MODULE_REQUEST = "request";
export const MODULE_RESPONSE = "response";

// 重复利用的常量
// 样式值为数字时不添加单位“px”的样式名
export const noUnitHook = [ "z-index" ];

