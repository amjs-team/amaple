const 
	babel = require ( "rollup-plugin-babel" ),
	{ name, version } = require ( "../package.json" ),
	path = require ( "path" ),
	banner = `/**
 * iceJS v${version}
 * (c) 2017-${ new Date ().getFullYear () } JOU http://icejs.org
 * License: MIT
 */`;

module.exports = {
	input: path.resolve ( __dirname, "../src/core/core.js" ),
	output: {
		file: path.resolve ( __dirname, "../dist/ice." + version + ".js" ),
		format: "umd",
		name,
		banner,
	},
	plugins: [
		babel ( {
    		exclude: "node_modules/**" // 仅仅转译我们的源码
    	} ),
	]
	// sourceMap: true,
};