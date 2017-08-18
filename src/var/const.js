
// 表示ice.module()
export const TYPE_MODULE = 2;

// 表示plugin()
export const TYPE_PLUGIN = 3;

// 表示driver()
export const TYPE_DRIVER = 4;

// 连续字符正则表达式
export const rword = /\S+/g;

// 变量正则表达式
export const rvar = /^[^0-9]{1}[a-zA-Z0-9$_]*$/;