import VNode from "core/vnode/VNode";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";
import VFragment from "core/vnode/VFragment";

describe ( "define vnode => ", () => {
	it ( "Define a basic velement", () => {
		const vnode1 = VElement ( "div", { id: "the-div", "am-module": "root" } );

		expect ( vnode1.nodeName ).toBe ( "DIV" );
		expect ( vnode1.nodeType ).toBe ( 1 );
		expect ( Object.keys ( vnode1.attrs ).length ).toBe ( 2 );
		expect ( vnode1.key ).toBeUndefined ();
		expect ( vnode1.children ).toEqual ( [] );
		expect ( vnode1.parent ).toBe ( null );
	} );

	it ( "Define a basic vtextnode", () => {
		const vtext = VTextNode ( "hello amaplejs" );

		expect ( vtext.nodeType ).toBe ( 3 );
		expect ( vtext.nodeValue ).toBe ( "hello amaplejs" );
		expect ( vtext.key ).toBeUndefined ();
	} );

	it ( "Define a basic vfragment", () => {
		let vfragment = VFragment ();

		expect ( vfragment.nodeType ).toBe ( 11 );
		expect ( vfragment.children ).toEqual ( [] );

		// ----------------
		vfragment = VFragment ( [ VElement ( "div", { id: "the-div", "am-module": "root" } ) ] );

		expect ( vfragment.children.length ).toBe ( 1 );
		expect ( vfragment.children [ 0 ].nodeName ).toBe ( "DIV" );
	} );
} );