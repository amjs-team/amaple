
// 表示ice.module()
export const TYPE_MODULE = 0;

// 表示plugin()
export const TYPE_PLUGIN = 1;

// 表示driver()
export const TYPE_DRIVER = 2;

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