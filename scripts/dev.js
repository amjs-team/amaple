const 
	babel = require ( "rollup-plugin-babel" ),
	{ name, version } = require ( "../package.json" );

const banner 	= `/**
 * AmapleJS v${version}
 * (c) 2017-${ Date.prototype.getFullYear () } JOU http://amaple.org
 * License: MIT
 */`;

const devConfig = {
	entry: "src/core/core.js",
	format: "umd",
	dest: `dist/${ name }.${ version }.js`,
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