import correctParam from "src/correctParam";

describe ( "correctParam", () => {
	xit ( "based type", () => {
		let a = 1,
			b = "",
			c = [];
		correctParam ( a, b, c ).to ( "number", "string", "array" ).done ( args => {
			expect ( args[ 0 ] ).toBe ( 1 );
			expect ( args[ 1 ] ).toBe ( "" );
			expect ( args[ 2 ] ).toEqual ( [] );
		} );
	} );

	xit ( "event args correct", () => {
		( function ( elem, types, listener, useCapture ) {
			correctParam ( elem, types, listener, useCapture ).to ( "object", "string" ).done ( ( elem, types, listener, useCapture ) => {
				expect ( elem ).toBeUndefined ();
				expect ( types ).toBe ( "change" );
				expect ( typeof listener ).toBe ( "function" );
				expect ( useCapture ).toBe ( false );
			} );
		} ) ( "change", () => {}, false );
	} );

	xit ( "http args correct", () => {
		( function ( url, args, callback, dataType ) {
			correctParam ( url, args, callback, dataType ).to ( "string", [ /=/, "object" ], "function", /^(?:TEXT|JSON|SCRIPT|JSONP)$/i ).done ( ( url, args, callback, dataType ) => {
				expect ( url ).toBe ( "index.html" );
				expect ( args ).toBeUndefined ();
				expect ( typeof callback ).toBe ( "function" );
			} );
		} ) ( "index.html", function () {} );
	} );

	it ( "http args correct without receive arg", () => {
		( function ( url, args, callback, dataType ) {
			correctParam ( url, args, callback, dataType ).to ( "string", [ /=/, "object" ], "function", /^(?:TEXT|JSON|SCRIPT|JSONP)$/i ).done ( function () {
				expect ( this.$1 ).toBe ( "index.html" );
				expect ( this.$2 ).toBeUndefined ();
				expect ( typeof this.$3 ).toBe ( "function" );
			} );
		} ) ( "index.html", function () {} );
	} );
} );