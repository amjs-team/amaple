import text from "./converter/text";
import json from "./converter/json";
import script from "./converter/script";

// ajax返回数据转换器
const ajaxConverters  = { text, json, script };

/**
    complete ( amXHR: Object )

    Return Type:
    void

    Description:
    请求回调调用

    URL doc:
    http://amaple.org/######
*/
export default function complete ( amXHR ) {

	let transport = amXHR.transport;

	if ( transport.completed ) {
		return;
	}

	transport.completed = true;

	// 如果存在计时ID，则清除此
	if ( transport.timeoutID ) {
		window.clearTimeout ( transport.timeoutID );
	}

	// 如果解析错误也会报错，并调用error
	if ( transport.response ) {
		try {
			transport.response = ajaxConverters [ transport.dataType ] && ajaxConverters [ transport.dataType ] ( transport.response );
		}
		catch ( e ) {
			transport.status = 500;
			transport.statusText = "Parse Error: " + e;
		}
	}

	// 请求成功，调用成功回调，dataType为script时不执行成功回调
	if ( ( ( transport.status >= 200 && transport.status < 300 ) || transport.status === 304 ) && transport.dataType !== "script" ) {
		transport.callbacks.success ( transport.response, transport.status, transport.statusText, amXHR );
	}

	// 请求错误调用error回调
	else if ( transport.status === 404 || transport.status === 500 ) {
		transport.callbacks.error ( amXHR, transport.status, transport.statusText );
	}

	// 调用complete回调
	transport.callbacks.complete ( amXHR, transport.statusText );
}