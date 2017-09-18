import Component from "src/core/component/core";
import Class from "src/Class";

describe ( "define component", () => {
	it ( "use the function Class to define a component derivative", () => {
		const TestComp = Class ( "TestComp" ).extends ( Component ) ( {
			init () {
				return {
			    	btnText : "test-btn",
			    	console : ""
			    };
			},
			render () {
				this.template (
			    	"<button>{{ btnText }}</button><div class='console'>{{ console }}</div>"
			    );

				this.style ( {
			    	".console" : {
			        	color : "#00aae6"
			        }
			    } );
			},
			action () {
				return {
					print ( con ) {
						console.log(this);
						this.state.console = con;
					}
				};
			}
		} );

		const tc = new TestComp ();
		let div = document.createElement ( "div" );

		document.createDocumentFragment ().appendChild ( div );
		div.appendChild ( tc.__init__ ( div, {} ).content );

		expect ( div.firstChild.nodeName ).toBe ( "BUTTON" );
		expect ( div.firstChild.firstChild.nodeValue ).toBe ( "test-btn" );

		tc.caller.action.print ( "hello icejs" );
		expect ( div.firstChild.nextElementSibling.firstChild.nodeValue ).toBe ( "hello icejs" );
		expect ( div.firstChild.nextElementSibling.style.color ).toBe ( "rgb(0, 170, 230)" );

		console.log ( div, tc );
	} );
} );