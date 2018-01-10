// 路由模式，启动路由时可进行模式配置
// 自动选择路由模式(默认)
// 在支持html5 history API时使用新特性，不支持的情况下自动回退到hash模式
export const AUTO = 0;

// 强制使用hash模式
export const HASH = 1;

// 强制使用html5 history API模式
// 使用此模式时需注意：在不支持新特新的浏览器中是不能正常使用的
export const BROWSER = 2;