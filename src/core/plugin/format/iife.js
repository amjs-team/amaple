import { foreach } from "../../../func/util";
import { buildPlugin } from "../../../func/private";
import correctParam from "../../../correctParam";
import pluginBuilder from "../core";
import Loader from "../../../require/Loader";

function getGlobal ( globalName ) {
	const globalObj = window [ globalName ];
	delete window [ globalName ];

	return globalObj;
}

export default function iife ( pluginDef, buildings ) {

	const building = {};
	buildings.push ( building );

	// 该返回的函数将会在script的onload回调函数中执行
	return () => {
		const pluginObj = getGlobal ( pluginDef.global || pluginDef.name );
		building.install = () => {
			buildPlugin ( {
				name: pluginDef.name, 
				build () {
					return pluginObj;
				}
			}, {} );
		};
	};
}