import { foreach } from "../../../func/util";
import { buildPlugin } from "../../../func/private";
import correctParam from "../../../correctParam";
import pluginBuilder from "../core";
import Loader from "../../../require/Loader";

function define ( deps, callback ) {
	correctParam ( deps, callback ).to ( "array", "function" ).done ( function () {
		deps = this.$1 || [];
		callback = this.$2;
	} );

	const path = Loader.getCurrentPath ();
	foreach ( pluginBuilder.buildings, building => {
		if ( building.url === path ) {
			building.install = () => {
				buildPlugin ( {
					name: building.name, 
					build: callback
				}, {}, deps );
			};
		}
	} );
}
define.amd = {};

export default function amd ( pluginDef, buildings ) {
	if ( !window.define ) {
		window.define = define;
	}

	buildings.push ( {
		url: pluginDef.url,
		name: pluginDef.name
	} );
}