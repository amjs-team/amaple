import { foreach, type } from "../../func/util";
import { pluginErr } from "../../error";
import install from "./install";
import amd from "./format/amd";
import iife from "./format/iife";

// 支持的插件规范
const formats = { amd, iife };

export default {
	buildings: [],
	save ( pluginDef ) {
		let ret;

		if ( type ( pluginDef ) === "string" ) {
			this.buildings.push ( {
				url: pluginDef
			} );
		}
		else if ( type ( pluginDef ) === "object" ) {
			if ( pluginDef.build ) {

				// amaple规范的插件对象
				this.buildings.push ( {
					install () {
						install ( pluginDef );
					}
				} );
			}
			else {
				if ( !pluginDef.name ) {
					throw pluginErr ( "name", "必须指定name属性以表示此插件的名称，且不能与已有插件名称重复" );
				}

				// 外部插件对象
				const formatFn = formats [ pluginDef.format.toLowerCase () ];
				if ( formatFn ) {
					ret = formatFn ( pluginDef, this.buildings );
				}
				else {
					throw pluginErr ( "format", `对于外部的js库，amaple.js目前支持${ Object.keys ( formats ).join ( "、" ) }规范` );
				}
			}
		}
		else {
			throw pluginErr ( "type", `plugin的构建对象类型只能为string或object，当string时一定为plugin的加载相对路径，当object时为构建对象或${ Object.keys ( formats ).join ( "/" ) }规范的plugin的加载信息` );
		}

		return ret;
	},
	build () {
		foreach ( this.buildings, building => {
			building.install ();
		} );

		if ( window.define ) {
			delete window.define;
		}
	}
};