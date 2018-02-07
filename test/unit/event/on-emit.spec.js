import event from "src/event/core";
import cache from "src/cache/core";

describe ( "event.on-emit =>", () => {
	let d, expando;
	// jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
	beforeEach ( () => {
		d = document.createElement ( "div" );

		// IE11下，有parentNodes的元素才能触发事件
		document.createElement ( "div" ).appendChild ( d );
	} );
	afterEach ( () => {
		d = null;
	} );

	it ( "element's listener bind", () => {
		function listener () {};
		event.on ( d, "change", listener );
		expect ( listener.guid ).toEqual ( jasmine.any ( String ) );
		expando = Object.keys ( d ).filter ( val => /^eventExpando/.test ( val ) ) [ 0 ];
		expect ( d [ expando ] [ "change" ] ).toEqual ( jasmine.any ( Array ) );
	} );

	it ( "element's listener emit", done => {
		event.on ( d, "click", e => {
			expect ( e.type ).toBe ( "click" );
			done ();
		} );
		event.emit ( d, "click" );
	} );

	it ( "element's listener remove", () => {
		function listener () {};
		event.on ( d, "click", listener );
		event.remove ( d, "click", listener );
		expando = Object.keys ( d ).filter ( val => /^eventExpando/.test ( val ) ) [ 0 ];
		expect ( d [ expando ] [ "click" ].length ).toBe ( 0 );
	} );

	it ( "Non element listener bind and emit", done => {
		event.on ( undefined, "click", () => {
			done ();
		} );
		expect ( cache.getEvent ( "click" ).length ).toBe ( 1 );

		event.emit ( undefined, "click" );
	} );

	it ( "Non element listener bind and emit with params", done => {
		event.on ( undefined, "click", ( a, b ) => {
			expect ( a ).toBe ( "param1" );
			expect ( b ).toBe ( "param2" );
			done ();
		} );

		event.emit ( undefined, "click", [ "param1", "param2" ] );
	} );

	it ( "Non element listener remove", () => {
		function listener () {};
		event.on ( undefined, "trig", listener );
		expect ( cache.getEvent ( "trig" ).length ).toBe ( 1 );

		event.remove ( undefined, "trig", listener );
		expect ( cache.getEvent ( "trig" ).length ).toBe ( 0 );
	} );
} );