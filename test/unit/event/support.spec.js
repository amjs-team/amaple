import event from "src/event/core";

describe ( "event.support", () => {
	it ( "specify DOMObject", () => {
		expect ( event.support ( "readystatechange", new XMLHttpRequest () ) ).toBe ( true );
	} );

	it ( "without specify DOMObject", () => {
		expect ( event.support ( "customevent" ) ).toBe ( false );
		expect ( event.support ( "click" ) ).toBe ( true );
	} );
} );