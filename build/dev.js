const babel 	= require ( "rollup-plugin-babel" );
const version 	= require ( "../package.json" ).version;

const banner 	= `/**
 * iceJS v${version}
 * (c) 2017-${Date.prototype.getFullYear()} JOU http://icejs.org
 * License: MIT
 */`;

const devConfig = {
	entry: "src/core.js",
	format: "umd",
	dest: "dist/ice." + version + ".js",
	moduleName: "ice",
	plugins: [
		babel ( {
			exclude: "node_modules/**"
		} )
	],
	banner
	// sourceMap: true,
};

module.exports = devConfig;