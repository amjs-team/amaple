import allowState from "./allowState";
import defaultParams from "./defaultParams";
import { type, extend } from "../../func/util";

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

	const _type = type ( params.baseURL );

	params.baseURL = _type === "string" ? params.baseURL : 
				   _type === "function" ? params.baseURL () : "";
	params.baseURL = params.baseURL.substr ( 0, 1 ) === "/" ? params.baseURL : "/" + params.baseURL;
	params.baseURL = params.baseURL.substr ( -1, 1 ) === "/" ? params.baseURL : params.baseURL + "/";

	// params.stateSymbol = allowState.indexOf ( params.stateSymbol ) === -1 ? allowState [ 0 ] : params.stateSymbol;
	params.moduleSuffix = params.moduleSuffix.substr ( 0, 1 ) === "." ? params.moduleSuffix : "." + params.moduleSuffix;

	paramStore = extend ( paramStore, params );
}

extend ( configuration, {
	getConfigure ( param ) {
		return paramStore [ param ];
	}
} );