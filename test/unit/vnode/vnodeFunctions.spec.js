import VNode from "core/vnode/VNode";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";
import VFragment from "core/vnode/VFragment";

describe ( "vnode functions => ", () => {

	let vf;
	beforeEach ( () => {
		const 
			vnode1 = VElement ( "div", { id: "the-div", "ice-module": "root" }, 1 ),
			vtext = VTextNode ( "hello icejs", 2 );

		vf = VFragment ( [ vnode1, vtext ] );
	} );

	it ( "call the function 'appendChild'", () => {
		vf.appendChild ( VElement ( "div", { id: "the-div", "ice-module": "root2" }, 3 ) );

		console.log ( vf );

	} );
} );