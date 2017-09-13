import { foreach, type } from "./util";

/**
	urlTransform ( str: String, mode: Boolean )

	Return Type:
	String

	Description:
	将url中的"/"和"."做调换，此方法用于设置请求路径与模块定义时的依赖注入。
	当mode不传或传入null、false时表示false，即字符串将.替换为/
	当mode有值时表示true，即字符串将/替换为.

	URL doc:
	http://icejs.org/######
*/
export function urlTransform ( str, mode ) {
	mode = !!mode;

	let rpoint = /\./g,
		rsep = /\//g,
		point = ".",
		separation = "/";

	return mode ? str.replace( rsep, point) : str.replace ( rpoint, separation );
}

/**
	matchFnArgs ( fn: Function )

	Return Type:
	Array
	方法参数数组

	Description:
	获取方法中传入的参数
	以数组形式返回
	可匹配以下四种方法的参数：
	① function xxx (a,b,c) { // ... }
	② function (a,b,c) { // ... }
	③ (a,b,c) => { // ... }
	④ xxx (a,b,c) { // ... }

	URL doc:
	http://icejs.org/######
*/
export function matchFnArgs ( fn ) {
	let fnStr = fn.toString ();

	return type ( fn ) === "function" ? 
			( ( 
				/^function(?:\s+\w+)?\s*\((.*)\)\s*/.exec ( fnStr ) || /^\(?(.*?)\)?\s*=>/.exec ( fnStr ) || /^\S+\s*\((.*?)\)/.exec ( fnStr ) || [] ) [ 1 ]
				|| "" )
			.split ( "," ).filter ( item => !!item ).map ( item => item.trim () )
    		: [];
}

/**
	serialize ( form: DOMObject )

	Return Type:
	Object
	序列化后表单信息对象

	Description:
	将表单内的信息序列化为表单信息对象

	URL doc:
	http://icejs.org/######
*/
export function serialize ( form ) {
	if ( !form.nodeName || form.nodeName.toUpperCase () !== "FORM" ) {
		return form;
	}

	const 
		rcheckableType 	= ( /^(?:checkbox|radio)$/i ),
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable 	= /^(?:input|select|textarea|keygen)/i,
		rCRLF 			= /\r?\n/g,

		inputs 			= form.elements.slice (),
		formObject 		= {};

	// 判断表单中是否含有上传文件
	foreach ( inputs, inputItem => {
		if ( inputItem.name && !attr ( inputItem, "disabled" ) && rsubmittable.test( inputItem.nodeName ) && !rsubmitterTypes.test( inputItem.type ) && ( inputItem.checked || !rcheckableType.test( inputItem.type ) ) ) {

			formObject [ name ] = inputItem.value.replace ( rCRLF, "\r\n" );
		}
	} );

	return formObject;
}

/**
	parseGetQuery ( getString: String )

	Return Type:
	Object
	解析后的get参数对象

	Description:
	将形如“?a=1&b=2”的get参数解析为参数对象

	URL doc:
	http://icejs.org/######
*/
export function parseGetQuery ( getString ) {
    	const getObject = {};
    	let kv;
    	foreach ( ( getString.substr( 0, 1 ) === "?" ? getString.substr( 1 ) : getString ).split ( "&" ), getObjectItem => {
        	kv = getObjectItem.split ( "=" );
        	getObject [ kv [ 0 ] ] = kv [ 1 ] || "";
        } );
    
    	return getObject;
    }