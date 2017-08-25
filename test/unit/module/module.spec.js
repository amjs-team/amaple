import ice from "ice";

describe ( "module =>", () => {
	let vm;
	beforeEach ( () => {
		document.body.innerHTML = `<div ice-module="test" ice-src="table"></div><a href="#">444</a>`;
	} );

	it ( "start the icejs", () => {
		ice.configure ( { baseUrl : "module" } );
		ice.start ( "test" );

		// console.log( document.querySelector ("[ice-module=test]") );
	} );
} );