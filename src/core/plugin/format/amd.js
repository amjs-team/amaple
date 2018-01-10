import { foreach } from "../../../func/util";
import correctParam from "../../../correctParam";
import pluginBuilder from "../core";
import Loader from "../../require/Loader";

function define ( deps, callback ) {
	correctParam ( deps, callback ).to ( "array", "function" ).done ( function () {
		deps = this.$1 || [];
		callback = this.$2;
	} );

	const path = Loader.getCurrentPath ();
	foreach ( pluginBuilder.buildings, building => {
		if ( building.url === path ) {
			building.install = () => {

				// 如果amd库依赖其他库，则需先获取
				deps.map ( dep => {
					return cache.getPlugin ( dep );
				} );
				cache.pushPlugin ( building.name, callback.apply ( {}, deps ) );
			};
		}
	} );
}
define.amd = {};

export default amd ( pluginDef, buildings ) {
	if ( !window.define ) {
		window.define = define;
	}

	buildings.push ( {
		url: pluginDef.url,
		name: pluginDef.name
	} );
}