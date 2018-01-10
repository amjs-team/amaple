import { type, foreach } from "../../func/util";
import { pluginErr } from "../../error";

export default {
	buildings: [],
	save ( plugins ) {
		foreach ( plugins, plugin => {
			const t = type ( plugin );
			if ( t === "string" ) {
				this.buildings ( {
					
				} )
			}
			else if ( t === "object" ) {

			}
			else {
				throw pluginErr ( "type", "plugin的构建对象类型只能为string或object，当string时一定为plugin的加载相对路径，当object时为构建对象或amd/iife格式的plugin的加载信息" );
			}
		} );
	},
	install () {

	}
};