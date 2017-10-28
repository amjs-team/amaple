import { attr } from "src/func/node";
import VNode from "core/vnode/VNode";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";
import VFragment from "core/vnode/VFragment";

describe ( "vnode functions => ", () => {

	let vf, vnode1, vtext;
	beforeEach ( () => {
		vnode1 = VElement ( "div", { id: "the-div", "ice-module": "root" } ),
		vtext = VTextNode ( "hello icejs" );

		vf = VFragment ( [ vnode1, vtext ] );
	} );

	it ( "Call the function 'appendChild'", () => {
		vf.appendChild ( VElement ( "div", { id: "the-div", "ice-module": "root2" } ) );

		expect ( vf.children [ vf.children.length - 1 ].nodeName ).toBe ( "DIV" );
		expect ( vf.children [ vf.children.length - 1 ].parent ).toBe ( vf );
	} );

	it ( "Call the function 'removeChild'", () => {
		vf.removeChild ( vnode1 );

		expect ( vf.children.length ).toBe ( 1 );
		expect ( vf.children [ vf.children.length - 1 ].nodeValue ).toBe ( "hello icejs" );
		expect ( vnode1.parent ).toBeNull ();
	} );

	it ( "Call the function 'replaceChild'", () => {
		const vnode2 = VElement ( "div", { id: "the-div", "ice-module": "root2" } );

		vf.replaceChild ( vnode2, vnode1 );

		expect ( vf.children.length ).toBe ( 2 );
		expect ( vf.children [ 0 ] ).toBe ( vnode2 );
		expect ( vf.children [ 0 ].parent ).toBe ( vf );
		expect ( vnode1.parent ).toBeNull ();
	} );

	it ( "Call the function 'insertBefore'", () => {
		const vnode2 = VElement ( "div", { id: "the-div", "ice-module": "root2" } );

		vf.insertBefore ( vnode2, vnode1 );

		expect ( vf.children.length ).toBe ( 3 );
		expect ( vf.children [ 0 ] ).toBe ( vnode2 );
		expect ( vf.children [ 0 ].parent ).toBe ( vf );
		expect ( vnode1.parent ).toBe ( vf );
	} );

	it ( "Call the function 'html'", () => {
		const vnode2 = VElement ( "div", { id: "the-div", "ice-module": "root2" } );

		vf.html ( vnode2 );

		expect ( vf.children.length ).toBe ( 1 );
		expect ( vf.children [ 0 ] ).toBe ( vnode2 );
		expect ( vf.children [ 0 ].parent ).toBe ( vf );
		expect ( vnode1.parent ).toBeNull ();
		expect ( vtext.parent ).toBeNull ();
	} );

	it ( "Call the function 'nextSibling'", () => {
		expect ( vnode1.nextSibling () ).toBe ( vtext );
		expect ( vtext.nextSibling () ).toBe ( undefined );
	} );

	it ( "Call the function 'attr'", () => {
		expect ( vnode1.attr ( "ice-module" ) ).toBe ( "root" );

		vnode1.attr ( "ice-module", "root2" );
		expect ( vnode1.attr ( "ice-module" ) ).toBe ( "root2" );

		vnode1.attr ( "ice-module", null );
		expect ( vnode1.attr ( "ice-module" ) ).toBeUndefined ();

		vnode1.attr ( {
			id : "the-div2",
			"ice-module" : "root3"
		} );
		expect ( vnode1.attr ( "id" ) ).toBe ( "the-div2" );
		expect ( vnode1.attr ( "ice-module" ) ).toBe ( "root3" );
	} );

	it ( "Call the function 'render'", () => {
		
		let fragment = vf.render ();

		expect ( fragment.nodeType ).toBe ( 11 );
		expect ( vf.node ).toBe ( fragment );
		expect ( fragment.childNodes.length ).toBe ( 2 );
		expect ( fragment.childNodes.item ( 0 ).nodeName ).toBe ( "DIV" );
		expect ( fragment.childNodes.item ( 0 ) ).toBe ( vf.children [ 0 ].node );
		expect ( fragment.childNodes.item ( 0 ).getAttribute ( "id" ) ).toBe ( "the-div" );
		expect ( fragment.childNodes.item ( 0 ).getAttribute ( "ice-module" ) ).toBe ( "root" );
		expect ( fragment.childNodes.item ( 1 ).nodeType ).toBe ( 3 );
		expect ( fragment.childNodes.item ( 1 ).nodeValue ).toBe ( "hello icejs" );
		expect ( fragment.childNodes.item ( 1 ) ).toBe ( vf.children [ 1 ].node );


		vnode1.appendChild ( VTextNode ( "hello icejs2" ) );
		fragment = vf.render ();

		expect ( fragment.nodeType ).toBe ( 11 );
		expect ( vf.node ).toBe ( fragment );
		expect ( fragment.childNodes.length ).toBe ( 2 );
		expect ( fragment.childNodes.item ( 0 ).nodeName ).toBe ( "DIV" );
		expect ( fragment.childNodes.item ( 0 ).getAttribute ( "id" ) ).toBe ( "the-div" );
		expect ( fragment.childNodes.item ( 0 ).getAttribute ( "ice-module" ) ).toBe ( "root" );
		expect ( fragment.childNodes.item ( 0 ) ).toBe ( vf.children [ 0 ].node );
		expect ( fragment.childNodes.item ( 0 ).childNodes.item ( 0 ).nodeType ).toBe ( 3 );
		expect ( fragment.childNodes.item ( 0 ).childNodes.item ( 0 ).nodeValue ).toBe ( "hello icejs2" );
		expect ( fragment.childNodes.item ( 0 ).childNodes.item ( 0 ) ).toBe ( vf.children [ 0 ].children [ 0 ].node );
		expect ( fragment.childNodes.item ( 1 ).nodeType ).toBe ( 3 );
		expect ( fragment.childNodes.item ( 1 ).nodeValue ).toBe ( "hello icejs" );
		expect ( fragment.childNodes.item ( 1 ) ).toBe ( vf.children [ 1 ].node );
	} );

	it ( "Call the function 'clone'", () => {
		vnode1.appendChild ( VTextNode ( "hello icejs2" ) );

		const vf2 = vf.clone ();

		expect ( vf2.nodeType ).toBe ( 11 );
		expect ( vf2.children.length ).toBe ( 2 );
		expect ( vf2 ).not.toBe ( vf );
		expect ( vf2.children [ 0 ].nodeName ).toBe ( "DIV" );
		expect ( vf2.children [ 0 ].attrs ).toEqual ( vnode1.attrs );
		expect ( vf2.children [ 0 ].attrs ).not.toBe ( vnode1.attrs );
		expect ( vf2.children [ 0 ].key ).toBe ( vnode1.key );
		expect ( vf2.children [ 0 ].parent ).toBe ( vf2 );
		expect ( vf2.children [ 1 ].nodeValue ).toBe ( vtext.nodeValue );
		expect ( vf2.children [ 1 ].key ).toBe ( vtext.key );
		expect ( vf2.children [ 1 ] ).not.toBe ( vtext );
		expect ( vf2.children [ 1 ].parent ).toBe ( vf2 );
	} );

	it ( "Call the function 'bindEvent'", () => {
		const clickHandler = function () {};
		vnode1.bindEvent ( "click", clickHandler );

		expect ( vnode1.events.click ).toEqual ( jasmine.any ( Array ) );
		expect ( vnode1.events.click.length ).toBe ( 1 );
		expect ( vnode1.events.click [ 0 ] ).toBe ( clickHandler );
	} );

	it ( "Call the function 'VNode.domToVNode'", () => {
		const div = document.createElement ( "div" );
		attr ( div, {
			class : "cls123",
			id : "id321"
		} );
		div.appendChild ( document.createElement ( "span" ) );
		div.appendChild ( document.createTextNode ( "hello icejs" ) );

		const vDiv = VNode.domToVNode ( div );
		expect ( vDiv.nodeType ).toBe ( 1 );
		expect ( vDiv.attrs ).toEqual ( { class: "cls123", id: "id321" } );
		expect ( vDiv.parent ).toBeNull ();
		expect ( vDiv.children.length ).toBe ( 2 );
		expect ( vDiv.children [ 0 ].nodeType ).toBe ( 1 );
		expect ( vDiv.children [ 0 ].parent ).toBe ( vDiv );
		expect ( vDiv.children [ 0 ].children ).toEqual ( [] );
		expect ( vDiv.children [ 1 ].nodeType ).toBe ( 3 );
		expect ( vDiv.children [ 1 ].parent ).toBe ( vDiv );
		expect ( vDiv.children [ 1 ].nodeValue ).toEqual ( "hello icejs" );
	} );
} );