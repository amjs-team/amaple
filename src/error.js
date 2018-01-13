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
function error ( errorType ) {
	return function ( errorCode, errorText ) {

		// 打印的错误信息
		let errMsg = `[amaple:${ ( errorType ? errorType + "-" : "" ) }${ errorCode }]${ errorText }`;
		return new Error ( errMsg );
	};
}

export const envErr = error ( "env" );	// 环境错误
export const argErr = error ( "arg" );	// 参数错误
export const checkErr = error ( "check" );	// 参数检查错误
export const requestErr = error ( "request" );	// 请求错误
export const configErr = error ( "config" );		// 配置错误
export const moduleErr = error ( "module" );		// 模块错误
export const runtimeErr = error ( "runtime" );	// 运行时错误
export const vmComputedErr = error ( "vm-computed" );		// 模块错误
export const classErr = error ( "class" );		// 类定义错误
export const RouterErr = error ( "router" );		// 路由定义错误
export const directiveErr = error ( "directive" );		// 指令使用错误
export const componentErr = error ( "component" );		// 组件错误
export const pluginErr = error ( "plugin" );		// 插件错误
export const vnodeErr = error ( "vnode" );		// 虚拟节点错误
export const htmlParserErr = error ( "HTMLParser" );		// html解析错误
export const cssParserErr = error ( "CSSParser" );		// css解析错误