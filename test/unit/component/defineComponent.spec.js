import Component from "src/core/component/core";
import Class from "src/Class";

describe ( "define component", () => {
	it ( "use the function Class to define a component derivative", () => {
		Class ( "TestComp" ).extends ( Component ) ( {
			init () {
				
			}
		} );

		// expect ( u.type ( {} ) ).toBe ( "object" );
	} );
} );