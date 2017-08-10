import ice from "ice";

describe ( "depend =>", () => {
	let vm;
	beforeEach ( () => {
		document.body.innerHTML = `<div ice-module="test"></div>`;
	} );

	it ( "deps load asynchronously", done => {
		ice.module ( "test", {
			deps : { demoPlugin : "plugin/demo-plugin" },
			init: function ( demoPlugin ) {
				done ();
				expect ( demoPlugin ).not.toBe ( undefined );
				return {};
			}
		} );
	} );
} );