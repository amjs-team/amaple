import event from "src/event/core";

describe ( "event", () => {
	it ( "specify DOMObject", () => {
		expect ( event.support ( "readystatechange", new XMLHttpRequest() ) ).toBe ( true );
	} );

	it ( "without specify DOMObject", () => {
		expect ( event.support ( "readystatechange" ) ).toBe ( false );
	} );
} );