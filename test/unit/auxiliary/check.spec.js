import check from "src/check";

describe ( "check", () => {
	it ( "type", () => {
		check ( {} ).type ( "object" ).ifNot ( "error", "type" ).do ();
	} );

	it ( "multi or", () => {
		check ( [] ).type ( "object", "array" ).ifNot ( "error", "multi or" ).do ();
	} );

	it ( "be", () => {
		check ( "s" ).be ( "s" ).ifNot ( "error", "string" ).do ();
	} );

	it ( "or", () => {
		let arr = [];
		check ( arr ).type ( "object" ).or ().type ( "string" ).or ().be ( arr ).ifNot ( "error", "or()" ).do ();
	} );
	
	it ( "check", () => {
		check ( [] ).type ( "array" ).check ( {} ).notType ( "array" ).ifNot ( "error", "check" ).do ();
	} );

	it ( "prior", () => {
		check ( [] ).type ( "array" ).prior ( ( _this ) => {
			_this.check ( 100 ).be ( 200 ).or ().be ( 100 );
		} ).ifNot ( "error", "prior" ).do ();
	} );
} );