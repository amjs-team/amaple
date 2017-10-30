import Component from "src/core/component/core";
import ViewModel from "src/core/ViewModel";
import Class from "src/Class";
import Tmpl from "src/core/tmpl/Tmpl";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";
import VFragment from "core/vnode/VFragment";

describe ( "render component => ", () => {
	let TestComp;

	beforeEach ( () => {
		TestComp = Class ( "TestComp" ).extends ( Component ) ( {
			init () {
				return {
			    	btnText : "test-btn",
			    	console : ""
			    };
			},
			render () {
				this.template (
			    	"<button>{{ btnText }}</button><div class='console'>{{ console }}</div>{{ subElements.SubComp }}<ul id='SubComp2'><li :for='item in subElements.SubComp2'>{{ item }}</li></ul><div id='default'>{{ subElements.default }}</div>"
			    )
			    .style ( {
			    	".console" : {
			        	color : "#00aae6"
			        }
			    } )
			    .subElements ( "SubComp", { elem: "SubComp2", multiple: true } );
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
		

		expect ( div.children [ 0 ].componentNodes [ 0 ].nodeName ).toBe ( "BUTTON" );
		expect ( div.children [ 0 ].componentNodes [ 1 ].nodeName ).toBe ( "DIV" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.firstChild.nodeName ).toBe ( "BUTTON" );
		expect ( realDOM.firstChild.nextElementSibling.nodeName ).toBe ( "DIV" );
	} );

	it ( "render a component with sub elements", () => {
		let 
			moduleObj = {},
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

		console.log ( div );
		expect ( div.children [ 0 ].componentNodes.length ).toBe ( 5 );
		expect ( div.children [ 0 ].componentNodes [ 2 ].nodeName ).toBe ( "SPAN" );
		expect ( div.children [ 0 ].componentNodes [ 2 ].children [ 0 ].nodeValue ).toBe ( "SubComp" );
		div.diff ( dBackup ).patch ();
		expect ( realDOM.childNodes.length ).toBe ( 5 );
		expect ( realDOM.childNodes.item ( 2 ).nodeName ).toBe ( "SPAN" );
		expect ( realDOM.childNodes.item ( 2 ).firstChild.nodeValue ).toBe ( "SubComp" );

		///////////////////////////////////
		///////////////////////////////////
		///////////////////////////////////
		// div = document.createElement ( "div" ),
		// tmpl = new Tmpl ( {}, [ TestComp ], moduleObj );

		// div.innerHTML = "<test-comp><span>default</span></test-comp>";
		// tmpl.mount ( div, true );

		// expect ( div.querySelector ( "#default" ).firstChild.nodeName ).toBe ( "SPAN" );
		// expect ( div.querySelector ( "#default" ).firstChild.firstChild.nodeValue ).toBe ( "default" );
	} );

	xit ( "render a component with directive ':if'", () => {
		const 
			div = document.createElement ( "div" ),
			vm = new ViewModel ( {
				visible: false
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.innerHTML = "<test-comp :if='visible'></test-comp>";
		tmpl.mount ( div, true );

		expect ( div.childNodes.length ).toBe ( 1 );
		expect ( div.firstChild.nodeValue ).toBe ( "" );

		vm.visible = true;
		expect ( div.firstChild.nodeName ).toBe ( "BUTTON" );

		tmpl.compInstances [ 0 ].action.print ( "test-comp" );
		expect ( div.querySelector ( ".console" ).firstChild.nodeValue ).toBe ( "test-comp" );
	} );

	xit ( "render a component with directive ':for'", () => {
		const 
			div = document.createElement ( "div" ),
			vm = new ViewModel ( {
				list: [ "a", "b","c" ]
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.innerHTML = "<test-comp :for='i in list'>{{ i }}</test-comp>";
		tmpl.mount ( div, true );

		expect ( div.children.length ).toBe ( 12 );
		expect ( div.children.item ( 0 ).nodeName ).toBe ( "BUTTON" );
		expect ( div.children.item ( 4 ).nodeName ).toBe ( "BUTTON" );
		expect ( div.children.item ( 8 ).nodeName ).toBe ( "BUTTON" );

		vm.list.splice ( 0, 1 );
		expect ( div.children.length ).toBe ( 8 );
		expect ( div.children.item ( 3 ).firstChild.nodeValue ).toBe ( "b" );
		expect ( div.children.item ( 7 ).firstChild.nodeValue ).toBe ( "c" );

		vm.list.unshift ( "aa" );
		expect ( div.children.length ).toBe ( 12 );
		expect ( div.children.item ( 3 ).firstChild.nodeValue ).toBe ( "aa" );
		expect ( div.children.item ( 7 ).firstChild.nodeValue ).toBe ( "b" );
		expect ( div.children.item ( 11 ).firstChild.nodeValue ).toBe ( "c" );
	} );

	xit ( "render a component with both ':if' and ':for'", () => {
		const 
			div = document.createElement ( "div" ),
			vm = new ViewModel ( {
				list: [ "a", "b","c" ],
				item: "b"
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.innerHTML = "<test-comp :for='i in list' :if=\"i === item\">{{ i }}</test-comp>";
		tmpl.mount ( div, true );

		expect ( div.children.length ).toBe ( 4 );
		expect ( div.children.item ( 3 ).firstChild.nodeValue ).toBe ( "b" );

		vm.item = "a";
		expect ( div.children.length ).toBe ( 4 );
		expect ( div.children.item ( 3 ).firstChild.nodeValue ).toBe ( "a" );
	} );

	xit ( "ender a component that sub elements with express", () => {
		const 
			div = document.createElement ( "div" ),
			vm = new ViewModel ( {
				expr: "hello icejs"
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.innerHTML = "<test-comp>{{ expr }}</test-comp>";
		tmpl.mount ( div, true );

		expect ( div.querySelector ( "#default" ).firstChild.nodeValue ).toBe ( "hello icejs" );
	} );

	xit ( "render a component that sub elements with ':if', ':else-if', ':else'", () => {
		const 
			div = document.createElement ( "div" ),
			vm = new ViewModel ( {
				visible: "a"
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.innerHTML = "<test-comp><span :if='visible === \"a\"'>a</span><span :else-if='visible === \"b\"'>b</span><span :else>c</span></test-comp>";
		tmpl.mount ( div, true );
		
		expect ( div.querySelector ( "#default" ).firstChild.firstChild.nodeValue ).toBe ( "a" );

		vm.visible = "b";
		expect ( div.querySelector ( "#default" ).firstChild.firstChild.nodeValue ).toBe ( "b" );

		vm.visible = "c";
		expect ( div.querySelector ( "#default" ).firstChild.firstChild.nodeValue ).toBe ( "c" );
	} );

	xit ( "render a component that sub elements with ':for'", () => {
		const 
			div = document.createElement ( "div" ),
			vm = new ViewModel ( {
				list: [ "a", "b", "c" ]
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.innerHTML = "<test-comp><span :for='i in list'>{{ i }}</span></test-comp>";
		tmpl.mount ( div, true );

		expect ( div.querySelector ( "#default" ).children.length ).toBe ( 3 );
		expect ( div.querySelector ( "#default" ).children.item ( 0 ).firstChild.nodeValue ).toBe ( "a" );
		expect ( div.querySelector ( "#default" ).children.item ( 1 ).firstChild.nodeValue ).toBe ( "b" );
		expect ( div.querySelector ( "#default" ).children.item ( 2 ).firstChild.nodeValue ).toBe ( "c" );
	} );

	xit ( "render multiple components", () => {
		const 
			div = document.createElement ( "div" ),
			tmpl = new Tmpl ( {}, [ TestComp ], moduleObj );

		div.innerHTML = "<test-comp>a<sub-comp2>1</sub-comp2></test-comp><test-comp>b<sub-comp2>2</sub-comp2><sub-comp2>3</sub-comp2></test-comp>";
		tmpl.mount ( div, true );

		expect ( div.children.length ).toBe ( 8 );
		expect ( div.children.item ( 3 ).firstChild.nodeValue ).toBe ( "a" );
		expect ( div.children.item ( 7 ).firstChild.nodeValue ).toBe ( "b" );
		expect ( div.children.item ( 2 ).children.length ).toBe ( 1 );
		expect ( div.children.item ( 2 ).children.item ( 0 ).firstChild.nodeValue ).toBe ( "1" );
		expect ( div.children.item ( 6 ).children.length ).toBe ( 2 );
		expect ( div.children.item ( 6 ).children.item ( 0 ).firstChild.nodeValue ).toBe ( "2" );
		expect ( div.children.item ( 6 ).children.item ( 1 ).firstChild.nodeValue ).toBe ( "3" );
	} );

	xit ( "render multiple components with directive ':if',':else-if',':else'", () => {
		const 
			div = document.createElement ( "div" ),
			vm = new ViewModel ( {
				visible: "a"
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ], moduleObj );

		div.innerHTML = "<test-comp :if='visible === \"a\"'>a</test-comp><test-comp :else-if='visible === \"b\"'>b</test-comp><template :else><span>template</span></template>";
		tmpl.mount ( div, true );
		
		expect ( div.children.length ).toBe ( 4 );
		expect ( div.querySelector ( "#default" ).firstChild.nodeValue ).toBe ( "a" );

		vm.visible = "b";
		expect ( div.children.length ).toBe ( 4 );
		expect ( div.querySelector ( "#default" ).firstChild.nodeValue ).toBe ( "b" );

		vm.visible = "c";
		expect ( div.children.length ).toBe ( 1 );
		expect ( div.firstChild.firstChild.nodeValue ).toBe ( "template" );
	} );
} );