const 
	babel = require ( "rollup-plugin-babel" ),
	path = require ( "path" );
let { name, version } = require ( "../package.json" );

version = process.env.VERSION || version;
const banner = `/**
 * AmapleJS v${version}
 * (c) 2018-${ new Date ().getFullYear () } JOU https://amaple.org
 * License: MIT
 */`;

module.exports = {
	input: path.resolve ( __dirname, "../src/core/core.js" ),
	output: {
		file: path.resolve ( __dirname, `../dist/${ name }.umd.js` ),
		format: "umd",
		name: "am",
		banner,
	},
	plugins: [
		babel ( {
    		exclude: "node_modules/**"
    	} ),
	]
	// sourceMap: true,
};