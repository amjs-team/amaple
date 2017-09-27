import Component from "src/core/component/core";
import ViewModel from "src/core/ViewModel";
import Class from "src/Class";
import Tmpl from "src/core/tmpl/Tmpl";

describe ( "render component", () => {
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
			    	"<button>{{ btnText }}</button><div class='console'>{{ console }}</div>{{ subElements.SubComp }}<div id='default'>{{ subElements.default }}</div>"
			    )
			    .style ( {
			    	".console" : {
			        	color : "#00aae6"
			        }
			    } )
			    .subElements ( "SubComp" );
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
			div = document.createElement ( "div" ),
			tmpl = new Tmpl ( {}, [ TestComp ] );

		div.innerHTML = "<test-comp></test-comp>";

		tmpl.mount ( div );

		expect ( div.firstChild.nodeName ).toBe ( "BUTTON" );
		expect ( div.firstChild.nextElementSibling.nodeName ).toBe ( "DIV" );
	} );

	it ( "render a component with sub elements", () => {
		let 
			div = document.createElement ( "div" ),
			tmpl = new Tmpl ( {}, [ TestComp ] );

		div.innerHTML = "<test-comp><sub-comp><span>SubComp</span></sub-comp></test-comp>";
		tmpl.mount ( div );

		expect ( div.childNodes.length ).toBe ( 4 );
		expect ( div.childNodes.item ( 2 ).nodeName ).toBe ( "SPAN" );
		expect ( div.childNodes.item ( 2 ).firstChild.nodeValue ).toBe ( "SubComp" );

		///////////////////////////////////
		///////////////////////////////////
		///////////////////////////////////
		div = document.createElement ( "div" ),
		tmpl = new Tmpl ( {}, [ TestComp ] );

		div.innerHTML = "<test-comp><span>default</span></test-comp>";
		tmpl.mount ( div );

		expect ( div.querySelector ( "#default" ).firstChild.nodeName ).toBe ( "SPAN" );
		expect ( div.querySelector ( "#default" ).firstChild.firstChild.nodeValue ).toBe ( "default" );
	} );

	it ( "render a component with directive ':if'", () => {
		const 
			div = document.createElement ( "div" ),
			vm = new ViewModel ( {
				visible: false
			} ),
			tmpl = new Tmpl ( vm, [ TestComp ] );

		div.innerHTML = "<test-comp :if='visible'></test-comp>";
		tmpl.mount ( div );

		console.log(div);
	} );

	it ( "render a component with directive ':for'", () => {

	} );

	it ( "render a component with both ':if' and ':for'", () => {

	} );

	it ( "ender a component that sub elements with express", () => {

	} );

	it ( "render a component that sub elements with ':if', ':else-if', ':else'", () => {

	} );

	it ( "ender a component that sub elements with ':for'", () => {

	} );

	it ( "render multiple components", () => {

	} );

	it ( "render multiple components with directive ':if',':else-if',':else'", () => {

	} );
} );