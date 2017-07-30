const babel = require ( "rollup-plugin-babel" );
const version = require ( "../package.json" ).version;
const path = require ( "path" );

const banner 	= `/**
 * iceJS v${version}
 * (c) 2017-${ new Date ().getFullYear () } JOU http://icejs.org
 * License: MIT
 */`;

module.exports = {
	entry: path.resolve ( __dirname, "../src/core/core.js" ),
	format: "umd",
	dest: path.resolve ( __dirname, "../dist/ice." + version + ".js" ),
	moduleName: "ice",
	plugins: [
		babel ( {
			exclude: "node_modules/**"
		} )
	],
	banner
	// sourceMap: true,
};