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
function error ( errorType ) {
	return function ( errorCode, errorText ) {

		// 打印的错误信息
		let errMsg = "[ice:" + ( errorType ? errorType + "-" : "" ) + errCode + "] " + err;
		return new Error ( errMsg );
	};
}

export let envErr = error ( "env" );	// 环境错误
export let argErr = error ( "arg" );	// 参数错误
export let checkErr = error ( "check" );	// 参数检查错误
export let requestErr = error ( "request" );	// 请求错误
export let configErr = error ( "config" );		// 配置错误
export let runtimeErr = error ( "runtime" );	// 运行时错误
export let vmComputedErr = error ( "vm-computed" );		// 模块错误