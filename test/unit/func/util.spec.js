import * as u from "func/util";

describe ( "type test", () => {
	it ( "type", () => {
		expect ( u.type ( {} ) ).toBe ( "object" );
	} );

	it ( "type", () => {
		expect ( u.type ( [] ) ).toBe ( "array" );
	} );
} );

describe ( "foreach test", () => {
	it ( "foreach", () => {
		u.foreach ( ["a"], ( item, i ) => {
			expect ( item ).toBe ( "a" );
			expect ( i ).toBe ( 0 );
		} );
	} );
} );