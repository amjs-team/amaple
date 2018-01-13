import allowState from "./allowState";
import defaultParams from "./defaultParams";
import { type, foreach, extend } from "../../func/util";

let paramStore = null;

/**
	configuration ( params: Object )

	Return Type:
	void

	Description:
	处理并存储配置参数

	URL doc:
	http://amaple.org/######
*/
export default function configuration ( params ) {

	if ( type ( params.baseURL ) === "object" ) {
		foreach ( defaultParams.baseURL, ( base, name ) => {
			if ( params.baseURL.hasOwnProperty ( name ) ) {
				base = params.baseURL [ name ];
				params.baseURL [ name ] = base.substr ( 0, 1 ) === "/" ? base : "/" + base;
				params.baseURL [ name ] += base.substr ( -1, 1 ) === "/" ? "" : "/";
			}
			else {
				params.baseURL [ name ] = base;
			}
		} );
	}
	else {
		params.baseURL = defaultParams.baseURL;
	}

	if ( params.moduleSuffix ) {
		params.moduleSuffix = params.moduleSuffix.substr ( 0, 1 ) === "." ? params.moduleSuffix : "." + params.moduleSuffix;
	}
	else {
		params.moduleSuffix = defaultParams.moduleSuffix;
	}

	// params.stateSymbol = allowState.indexOf ( params.stateSymbol ) === -1 ? allowState [ 0 ] : params.stateSymbol;

	paramStore = params;
}

extend ( configuration, {

	/**
		getConfigure ( param: String )

		Return Type:
		Any

		Description:
		根据配置名获取配置数据

		URL doc:
		http://amaple.org/######
	*/
	getConfigure ( param ) {
		return paramStore [ param ];
	}
} );