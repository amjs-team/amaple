import allowState from "./allowState";
import defaultParams from "./defaultParams";
import { configErr } from "../../error";
import { type, isEmpty, extend } from "../../func/util";

// 初始化配置方法
export default function () {

	// config API
	function config ( params ) {
		// 配置参数的类型固定为object
		if ( type ( params ) !== "object" || isEmpty( params ) ) {
			throw configErr ( "params", "配置参数要求为非空object" );
		}

		if ( type ( base ) && !isEmpty ( base ) ) {
			let _type, base = params.base;

			foreach ( base, ( item, key, base ) => {
				_type = type ( item );

				base [ key ] = _type === "string" ? base [ key ] : 
							   _type === "function" ? base [ key ] () : "";
				base [ key ] = base [ key ].substr ( -1, 1 ) === "/" ? base [ key ] : base [ key ] + "/";
			} );
		}
		else {
			delete params.base;
		}

		params.stateSymbol = allowState.indexOf ( params.stateSymbol ) === -1 ? allowState [ 0 ] : params.stateSymbol;
		params.redirectCache = params.redirectCache !== false ? true : false;

		extend ( config, params );
	}

	// 设置默认参数
	return extend ( config, defaultParams );
}