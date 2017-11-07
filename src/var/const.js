// 开发模式常量
// 普通开发模式
export const DEVELOP_COMMON = 0;

// 单页开发模式
export const DEVELOP_SINGLE = 1;

// 连续字符正则表达式
export const rword = /\S+/g;

// 变量正则表达式
export const rvar = /[^0-9][\w$]*/;

// 模板表达式匹配正则
export const rexpr = /{{\s*(.*?)\s*}}/;

// 组件名正则表达式
export const rcomponentName = /^[A-Z][a-zA-Z0-9]*/;

// 模块事件常量
export const MODULE_UPDATE = "update";
export const MODULE_REQUEST = "request";
export const MODULE_RESPONSE = "response";

// viewModel更新数组时的虚拟DOM处理类型
export const VNODE_ADD = 0;
export const VNODE_REMOVE = 1;
export const VNODE_MOVE = 2;

// 重复利用的常量
// 样式值为数字时不添加单位“px”的样式名
export const noUnitHook = [ "z-index" ];

// 直接赋值的元素属性，如果不在此的属性将会使用setAttribute设置属性
export const attrAssignmentHook = [ "value", "checked" ];