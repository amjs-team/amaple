import parseSelector from "src/compiler/cssParser/parseSelector";

describe ( "query vnodes by selector => ", () => {

	it ( "parse css selector", () => {
		const 
			classSelector = "p, .console",
			token = parseSelector ( classSelector );

		console.log ( token );
		// expect ( va.nodeName ).toBe ( "A" );
		// expect ( va.attrs.href ).toBe ( "aa.html" );
		// expect ( va.children [ 0 ].nodeValue ).toBe ( "link" );
	} );
} );