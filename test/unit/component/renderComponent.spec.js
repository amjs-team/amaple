import Component from "src/core/component/core";
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
			    	"<button>{{ btnText }}</button><div class='console'>{{ console }}</div>"
			    )
			    .style ( {
			    	".console" : {
			        	color : "#00aae6"
			        }
			    } );
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

	it ( "render a component with subElements", () => {

	} );

	it ( "render a component with directive ':if'", () => {

	} );

	it ( "render a component with directive ':for'", () => {

	} );

	it ( "render a component with both ':if' and ':for'", () => {

	} );

	it ( "render multiple components", () => {

	} );

	it ( "render multiple components with directive ':if',':else-if',':else'", () => {

	} );
} );