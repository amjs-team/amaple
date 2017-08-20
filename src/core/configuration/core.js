import allowState from "./allowState";
import defaultParams from "./defaultParams";
import { configErr } from "../../error";
import { type, isEmpty, extend } from "../../func/util";

let paramStore = defaultParams;

/**
	configuration ( params: Object )

	Return Type:
	void

	Description:
	处理并存储配置参数

	URL doc:
	http://icejs.org/######
*/
export default function configuration ( params ) {

	// 配置参数的类型固定为object
	if ( type ( params ) !== "object" || isEmpty( params ) ) {
		throw configErr ( "params", "配置参数要求为非空object" );
	}

	let _type = type ( params.baseUrl );

	params.baseUrl = _type === "string" ? params.baseUrl : 
				   _type === "function" ? params.baseUrl () : "";
	params.baseUrl = params.baseUrl.substr ( -1, 1 ) === "/" ? params.baseUrl : params.baseUrl + "/";


	params.stateSymbol = allowState.indexOf ( params.stateSymbol ) === -1 ? allowState [ 0 ] : params.stateSymbol;
	params.redirectCache = params.redirectCache !== false ? true : false;

	paramStore = extend ( params, paramStore );
}

extend ( configuration, {
	getConfigure ( param ) {
		return paramStore [ param ] || null;
	}
} );