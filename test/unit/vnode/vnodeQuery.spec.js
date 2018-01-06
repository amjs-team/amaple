import parseHTML from "src/compiler/htmlParser/parseHTML";

describe ( "vnode query => ", () => {

	let vnode;
	beforeEach ( () => {
		vnode = parseHTML ( `
			<div>
				<span class="selector1">.class</span>
				<span id="selector2">#id</span>
			</div>
		` );
	} );

	it ( ".class", () => {
		vnode.query ( ".selector1" );
	} );

	// it ( "#id", () => {

	// } );
} );