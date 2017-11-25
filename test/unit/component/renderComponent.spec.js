import Component from "src/core/component/core";
import ViewModel from "src/core/ViewModel";
import Class from "src/Class";
import Tmpl from "src/core/tmpl/Tmpl";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";
import VFragment from "core/vnode/VFragment";

describe ( "render component => ", () => {
	let TestComp, updateSpy, mountedSpy;

	beforeEach ( () => {
		updateSpy = jasmine.createSpy ( "updateSpy" );
		mountedSpy = jasmine.createSpy ( "mountedSpy" );

		TestComp = Class ( "TestComp" ).extends ( Component ) ( {
			init () {
				return {
			    	btnText : "test-btn",
			    	console : ""
			    };
			},
			render () {
				this.template (
			    	`<button>{{ btnText }}</button>
			    	<div class='console'>{{ console }}</div>{{ subElements.SubComp }}<ul id='SubComp2'>
			    		<li :for='item in subElements.SubComp2'>{{ item }}</li>
			    	</ul>
			    	<div id='default'>{{ subElements.default }}</div>`
			    )
			    .style ( {
			    	".console" : {
			        	color : "#00aae6"
			        }
			    } )
			    .subElements ( "SubComp", { elem: "SubComp2", multiple: true } );
			},
			mounted () {
				mountedSpy ();
			},
			update () {
				updateSpy ();
			},
			action () {
				return {
					print ( con ) {
						this.state.console = con;
					}
				};
			}
		} );
	} );

	it ( "render a simple component", () => {
		const 
			moduleObj = {},
			div = VElement ( "div" ),
			tmpl = new Tmpl ( {}, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp" ) );
		let realDOM = div.render (),
			dBackup = div.clone ();

		tmpl.mount ( div, true );
		

		expect ( div.children [ 0 ].templateNodes [ 0 ].nodeName ).toBe ( "BUTTON" );
		expect ( div.children [ 0 ].templateNodes [ 1 ].nodeName ).toBe ( "DIV" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.firstChild.nodeName ).toBe ( "BUTTON" );
		expect ( realDOM.firstChild.nextElementSibling.nodeName ).toBe ( "DIV" );
	} );

	it ( "render a component with sub elements", () => {
		let moduleObj = {},
			div = VElement ( "div" ),
			tmpl = new Tmpl ( {}, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp", {}, null, [
			VElement ( "sub-comp", {}, null, [
				VElement ( "span", {}, null, [ VTextNode ( "SubComp" ) ] )
			] )
		] ) );
		let realDOM = div.render (),
			dBackup = div.clone ();
		tmpl.mount ( div, true );

		expect ( div.children [ 0 ].templateNodes.length ).toBe ( 5 );
		expect ( div.children [ 0 ].templateNodes [ 2 ].nodeName ).toBe ( "SPAN" );
		expect ( div.children [ 0 ].templateNodes [ 2 ].children [ 0 ].nodeValue ).toBe ( "SubComp" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.childNodes.length ).toBe ( 5 );
		expect ( realDOM.childNodes.item ( 2 ).nodeName ).toBe ( "SPAN" );
		expect ( realDOM.childNodes.item ( 2 ).firstChild.nodeValue ).toBe ( "SubComp" );

		///////////////////////////////////
		///////////////////////////////////
		///////////////////////////////////
		div = VElement ( "div" ),
		tmpl = new Tmpl ( {}, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp", {}, null, [
			VElement ( "span", {}, null, [ VTextNode ( "default" ) ] )
		] ) );
		realDOM = div.render ();
		dBackup = div.clone ();
		tmpl.mount ( div, true );

		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 0 ].nodeName ).toBe ( "SPAN" );
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "default" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.querySelector ( "#default" ).firstChild.nodeName ).toBe ( "SPAN" );
		expect ( realDOM.querySelector ( "#default" ).firstChild.firstChild.nodeValue ).toBe ( "default" );
	} );

	it ( "render a component with directive ':if'", () => {
		const 
			moduleObj = {},
			div = VElement ( "div" ),
			vm = new ViewModel ( {
				visible: false
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp", { ":if" : "visible" } ) );
		let realDOM = div.render (),
			dBackup = div.clone ();
		tmpl.mount ( div, true );

		expect ( div.children.length ).toBe ( 1 );
		expect ( div.children [ 0 ].nodeValue ).toBe ( "" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.childNodes.length ).toBe ( 1 );
		expect ( realDOM.firstChild.nodeValue ).toBe ( "" );


		vm.visible = true;
		expect ( div.children [ 0 ].templateNodes [ 0 ].nodeName ).toBe ( "BUTTON" );
		expect ( realDOM.firstChild.nodeName ).toBe ( "BUTTON" );


		vm.visible = false;
		expect ( div.children.length ).toBe ( 1 );
		expect ( div.children [ 0 ].nodeValue ).toBe ( "" );
		expect ( realDOM.childNodes.length ).toBe ( 1 );
		expect ( realDOM.firstChild.nodeValue ).toBe ( "" );


		vm.visible = true;
		expect ( div.children [ 0 ].templateNodes [ 0 ].nodeName ).toBe ( "BUTTON" );
		expect ( realDOM.firstChild.nodeName ).toBe ( "BUTTON" );


		moduleObj.components [ 0 ].action.print ( "test-comp" );
		expect ( div.children [ 0 ].templateNodes [ 1 ].children [ 0 ].nodeValue ).toBe ( "test-comp" );
		expect ( realDOM.querySelector ( ".console" ).firstChild.nodeValue ).toBe ( "test-comp" );
	} );

	it ( "render a component with directive ':for'", () => {
		const 
			moduleObj = {},
			div = VElement ( "div" ),
			vm = new ViewModel ( {
				list: [ "a", "b", "c" ]
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp", { ":for" : "i in list" }, null, [
			VTextNode ( "{{ i }}" )
		] ) );
		let realDOM = div.render (),
			dBackup = div.clone ();
		tmpl.mount ( div, true );

		expect ( div.children.length ).toBe ( 5 );
		expect ( div.children [ 1 ].templateNodes [ 0 ].nodeName ).toBe ( "BUTTON" );
		expect ( div.children [ 1 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "a" );
		expect ( div.children [ 2 ].templateNodes [ 0 ].nodeName ).toBe ( "BUTTON" );
		expect ( div.children [ 2 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "b" );
		expect ( div.children [ 3 ].templateNodes [ 0 ].nodeName ).toBe ( "BUTTON" );
		expect ( div.children [ 3 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "c" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.children.length ).toBe ( 12 );
		expect ( realDOM.children.item ( 0 ).nodeName ).toBe ( "BUTTON" );
		expect ( realDOM.children.item ( 4 ).nodeName ).toBe ( "BUTTON" );
		expect ( realDOM.children.item ( 8 ).nodeName ).toBe ( "BUTTON" );


		vm.list.splice ( 0, 1 );
		expect ( div.children.length ).toBe ( 4 );
		expect ( div.children [ 1 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "b" );
		expect ( div.children [ 2 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "c" );
		expect ( realDOM.children.length ).toBe ( 8 );
		expect ( realDOM.children.item ( 3 ).firstChild.nodeValue ).toBe ( "b" );
		expect ( realDOM.children.item ( 7 ).firstChild.nodeValue ).toBe ( "c" );
		expect ( mountedSpy.calls.count () ).toBe ( 3 );
		

		vm.list.unshift ( "aa" );
		expect ( div.children.length ).toBe ( 5 );
		expect ( div.children [ 1 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "aa" );
		expect ( div.children [ 2 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "b" );
		expect ( div.children [ 3 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "c" );
		expect ( realDOM.children.length ).toBe ( 12 );
		expect ( realDOM.children.item ( 3 ).firstChild.nodeValue ).toBe ( "aa" );
		expect ( realDOM.children.item ( 7 ).firstChild.nodeValue ).toBe ( "b" );
		expect ( realDOM.children.item ( 11 ).firstChild.nodeValue ).toBe ( "c" );

		vm.list.reverse ();
		expect ( realDOM.children.item ( 3 ).firstChild.nodeValue ).toBe ( "c" );
		expect ( realDOM.children.item ( 7 ).firstChild.nodeValue ).toBe ( "b" );
		expect ( realDOM.children.item ( 11 ).firstChild.nodeValue ).toBe ( "aa" );
		expect ( updateSpy.calls.count() ).toBe ( 2 );


		div.children [ 1 ].component.action.print ( "reverse test" );
		expect ( realDOM.children.item ( 1 ).firstChild.nodeValue ).toBe ( "reverse test" );
	} );

	it ( "render a component with both ':if' and ':for'", () => {
		const 
			moduleObj = {},
			div = VElement ( "div" ),
			vm = new ViewModel ( {
				list: [ "a", "b", "c" ],
				item: "b"
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp", { ":for" : "i in list", ":if" : "i === item" }, null, [
			VTextNode ( "{{ i }}" )
		] ) );
		let realDOM = div.render (),
			dBackup = div.clone ();
		tmpl.mount ( div, true );

		expect ( div.children.length ).toBe ( 5 );
		expect ( div.children [ 2 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "b" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.children.length ).toBe ( 4 );
		expect ( realDOM.children.item ( 3 ).firstChild.nodeValue ).toBe ( "b" );

		vm.item = "a";
		expect ( div.children.length ).toBe ( 5 );
		expect ( div.children [ 1 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "a" );
		expect ( realDOM.children.length ).toBe ( 4 );
		expect ( realDOM.children.item ( 3 ).firstChild.nodeValue ).toBe ( "a" );

		vm.item = "d";
		expect ( div.children.length ).toBe ( 5 );
		expect ( div.children [ 1 ].nodeType ).toBe ( 3 );
		expect ( div.children [ 2 ].nodeType ).toBe ( 3 );
		expect ( div.children [ 3 ].nodeType ).toBe ( 3 );
		expect ( realDOM.childNodes.item ( 1 ).nodeType ).toBe ( 3 );
		expect ( realDOM.childNodes.item ( 2 ).nodeType ).toBe ( 3 );
		expect ( realDOM.childNodes.item ( 3 ).nodeType ).toBe ( 3 );

		vm.item = "c";
		expect ( div.children.length ).toBe ( 5 );
		expect ( div.children [ 3 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "c" );
		expect ( realDOM.children.length ).toBe ( 4 );
		expect ( realDOM.children.item ( 3 ).firstChild.nodeValue ).toBe ( "c" );
	} );

	it ( "render a component that sub elements with express", () => {
		const 
			moduleObj = {},
			div = VElement ( "div" ),
			vm = new ViewModel ( {
				expr: "hello icejs"
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp", {}, null, [
			VTextNode ( "{{ expr }}" )
		] ) );
		let realDOM = div.render (),
			dBackup = div.clone ();
		tmpl.mount ( div, true );

		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "hello icejs" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.querySelector ( "#default" ).firstChild.nodeValue ).toBe ( "hello icejs" );
	} );

	it ( "render a component that sub elements with ':if', ':else-if', ':else'", () => {
		const 
			moduleObj = {},
			div = VElement ( "div" ),
			vm = new ViewModel ( {
				visible: "a"
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp", {}, null, [
			VElement ( "span", { ":if" : "visible === 'a'" }, null, [
				VTextNode ( "a" )
			] ),
			VElement ( "span", { ":else-if" : "visible === 'b'" }, null, [
				VTextNode ( "b" )
			] ),
			VElement ( "span", { ":else" : "" }, null, [
				VTextNode ( "c" )
			] ),
		] ) );
		let realDOM = div.render (),
			dBackup = div.clone ();
		tmpl.mount ( div, true );
		
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "a" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.querySelector ( "#default" ).firstChild.firstChild.nodeValue ).toBe ( "a" );

		dBackup = div.clone ();
		vm.visible = "b";
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "b" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.querySelector ( "#default" ).firstChild.firstChild.nodeValue ).toBe ( "b" );

		dBackup = div.clone ();
		vm.visible = "c";
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 0 ].children [ 0 ].nodeValue ).toBe ( "c" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.querySelector ( "#default" ).firstChild.firstChild.nodeValue ).toBe ( "c" );
	} );

	it ( "render a component that sub elements with ':for'", () => {
		const 
			moduleObj = {},
			div = VElement ( "div" ),
			vm = new ViewModel ( {
				list: [ "a", "b", "c" ]
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp", {}, null, [
			VElement ( "span", { ":for" : "i in list" }, null, [ VTextNode ( "{{ i }}" ) ] )
		] ) );
		let realDOM = div.render (),
			dBackup = div.clone ();
		tmpl.mount ( div, true );

		// 附带startNode、endNode两个标识节点
		expect ( div.children [ 0 ].templateNodes [ 4 ].children.length ).toBe ( 5 );
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "a" );
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 2 ].children [ 0 ].nodeValue ).toBe ( "b" );
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 3 ].children [ 0 ].nodeValue ).toBe ( "c" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.querySelector ( "#default" ).children.length ).toBe ( 3 );
		expect ( realDOM.querySelector ( "#default" ).children.item ( 0 ).firstChild.nodeValue ).toBe ( "a" );
		expect ( realDOM.querySelector ( "#default" ).children.item ( 1 ).firstChild.nodeValue ).toBe ( "b" );
		expect ( realDOM.querySelector ( "#default" ).children.item ( 2 ).firstChild.nodeValue ).toBe ( "c" );


		vm.list.shift ();
		// 附带startNode、endNode两个标识节点
		expect ( div.children [ 0 ].templateNodes [ 4 ].children.length ).toBe ( 4 );
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "b" );
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 2 ].children [ 0 ].nodeValue ).toBe ( "c" );
		expect ( realDOM.querySelector ( "#default" ).children.length ).toBe ( 2 );
		expect ( realDOM.querySelector ( "#default" ).children.item ( 0 ).firstChild.nodeValue ).toBe ( "b" );
		expect ( realDOM.querySelector ( "#default" ).children.item ( 1 ).firstChild.nodeValue ).toBe ( "c" );
		
		vm.list.reverse ();
	} );

	it ( "render multiple components", () => {
		const 
			moduleObj = {},
			div = VElement ( "div" ),
			tmpl = new Tmpl ( {}, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp", {}, null, [
			VTextNode ( "a" ),
			VElement ( "sub-comp2", {}, null, [ VTextNode ( "1" ) ] )
		] ) );
		div.appendChild ( VElement ( "test-comp", {}, null, [
			VTextNode ( "b" ),
			VElement ( "sub-comp2", {}, null, [ VTextNode ( "2" ) ] ),
			VElement ( "sub-comp2", {}, null, [ VTextNode ( "3" ) ] )
		] ) );
		let realDOM = div.render (),
			dBackup = div.clone ();
		tmpl.mount ( div, true );

		expect ( div.children.length ).toBe ( 2 );
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "a" );
		// 附带startNode、endNode两个标识节点
		expect ( div.children [ 0 ].templateNodes [ 3 ].children.length ).toBe ( 3 );
		expect ( div.children [ 0 ].templateNodes [ 3 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "1" );
		expect ( div.children [ 1 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "b" );
		// 附带startNode、endNode两个标识节点
		expect ( div.children [ 1 ].templateNodes [ 3 ].children.length ).toBe ( 4 );
		expect ( div.children [ 1 ].templateNodes [ 3 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "2" );
		expect ( div.children [ 1 ].templateNodes [ 3 ].children [ 2 ].children [ 0 ].nodeValue ).toBe ( "3" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.children.length ).toBe ( 8 );
		expect ( realDOM.children.item ( 3 ).firstChild.nodeValue ).toBe ( "a" );
		expect ( realDOM.children.item ( 7 ).firstChild.nodeValue ).toBe ( "b" );
		expect ( realDOM.children.item ( 2 ).children.length ).toBe ( 1 );
		expect ( realDOM.children.item ( 2 ).children.item ( 0 ).firstChild.nodeValue ).toBe ( "1" );
		expect ( realDOM.children.item ( 6 ).children.length ).toBe ( 2 );
		expect ( realDOM.children.item ( 6 ).children.item ( 0 ).firstChild.nodeValue ).toBe ( "2" );
		expect ( realDOM.children.item ( 6 ).children.item ( 1 ).firstChild.nodeValue ).toBe ( "3" );
	} );

	it ( "render multiple components with directive ':if',':else-if',':else'", () => {
		const 
			moduleObj = {},
			div = VElement ( "div" ),
			vm = new ViewModel ( {
				visible: "a"
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.appendChild ( VElement ( "test-comp", { ":if" : "visible === 'a'" }, null, [
			VTextNode ( "a" )
		] ) );
		div.appendChild ( VElement ( "test-comp", { ":else-if" : "visible === 'b'" }, null, [
			VTextNode ( "b" )
		] ) );
		div.appendChild ( VElement ( "template", { ":else" : "" }, null, [
			VElement ( "span", {}, null, [ VTextNode ( "b" ) ] )
		] ) );
		let realDOM = div.render (),
			dBackup = div.clone ();
		tmpl.mount ( div, true );
		
		expect ( div.children [ 0 ].templateNodes.length ).toBe ( 5 );
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "a" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.children.length ).toBe ( 4 );
		expect ( realDOM.querySelector ( "#default" ).firstChild.nodeValue ).toBe ( "a" );


		vm.visible = "b";
		expect ( div.children [ 0 ].templateNodes.length ).toBe ( 5 );
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "b" );
		expect ( realDOM.children.length ).toBe ( 4 );
		expect ( realDOM.querySelector ( "#default" ).firstChild.nodeValue ).toBe ( "b" );


		vm.visible = "c";
		expect ( div.children.length ).toBe ( 1 );
		expect ( div.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "b" );
		expect ( realDOM.children.length ).toBe ( 1 );
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "b" );


		vm.visible = "b";
		expect ( div.children [ 0 ].templateNodes.length ).toBe ( 5 );
		expect ( div.children [ 0 ].templateNodes [ 4 ].children [ 0 ].nodeValue ).toBe ( "b" );
		expect ( realDOM.children.length ).toBe ( 4 );
		expect ( realDOM.querySelector ( "#default" ).firstChild.nodeValue ).toBe ( "b" );
	} );

	it ( "render a component that dependent on other components", () => {
		const 
			unmountSpy = jasmine.createSpy ( "unmountSpy" ),
			ParentComp = Class ( "ParentComp" ).extends ( Component ) ( {
			constructor () {
				this.__super ();
				this.depComponents = [ TestComp ];
			},
			init () {
				return {
			    	console : ""
			    };
			},
			render () {
				this.template ( "<div><test-comp>default</test-comp><span>{{ console }}</span></div>" )
			},
			unmount () {
				unmountSpy ();
			},
			action () {
				return {
					console ( text ) {
						this.state.console = text;
					}
				};
			}
		} );

		const 
			moduleObj = { references : {} },
			div = VElement ( "div" ),
			vm = new ViewModel ( {
				visible: "a"
			} ),
			tmpl = new Tmpl ( vm, [ ParentComp ], moduleObj );

		div.appendChild ( VElement ( "parent-comp", { ":ref" : "pc" } ) );
		let realDOM = div.render (),
			dBackup = div.clone ();
		tmpl.mount ( div, true );

		expect ( div.children [ 0 ].isComponent ).toBeTruthy ();
		expect ( div.children [ 0 ].templateNodes [ 0 ].children [ 0 ].isComponent ).toBeTruthy ();
		expect ( div.children [ 0 ].templateNodes [ 0 ].children [ 0 ].templateNodes.length ).toBe ( 5 );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.firstChild.childNodes.length ).toBe ( 6 );
		expect ( realDOM.firstChild.firstChild.nodeName ).toBe ( "BUTTON" );

		moduleObj.references.pc.component.action.console ( "parent console" );
		expect ( div.children [ 0 ].templateNodes [ 0 ].children [ 1 ].children [ 0 ].nodeValue ).toBe ( "parent console" );
		expect ( realDOM.firstChild.childNodes.item ( 5 ).firstChild.nodeValue ).toBe ( "parent console" );

		moduleObj.references.pc.component.__unmount__ ();
		expect ( unmountSpy.calls.count () ).toBe ( 1 );
		expect ( moduleObj.components.length ).toBe ( 0 );
		expect ( Object.keys ( moduleObj.references ).length ).toBe ( 0 );
	} );
} );