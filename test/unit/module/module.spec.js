import ice from "ice";

describe ( "module =>", () => {
	let vm;
	beforeEach ( () => {
		document.body.innerHTML = `<div ice-module="test" ice-src="table"></div>`;
	} );

	it ( "start the icejs", () => {
		ice.configure ( { baseUrl : "module/module-files" } );
		ice.start ( "test" );
	} );
} );