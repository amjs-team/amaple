import Component from "core/component/core";
import Class from "src/Class";
import ViewModel from "src/core/ViewModel";
import { attr } from "src/func/node";
import VElement from "core/vnode/VElement";
import VFragment from "core/vnode/VFragment";

describe ( "define component =>", () => {
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

		const 
			tc = new TestComp (),
			fragment = VFragment (),
			div = VElement ( "div" );

		div.isComponent = true;
		fragment.appendChild ( div );
		tc.__init__ ( div, {} );

		// expect ( fragment.node.firstChild.nodeName ).toBe ( "BUTTON" );
		// expect ( fragment.node.firstChild.firstChild.nodeValue ).toBe ( "test-btn" );

		// tc.action.print ( "hello icejs" );
		// expect ( fragment.firstChild.nextElementSibling.firstChild.nodeValue ).toBe ( "hello icejs" );
		// expect ( fragment.firstChild.nextElementSibling.style.color ).toBe ( "rgb(0, 170, 230)" );
	} );

	xit ( "validate component props without vm data", () => {
		const TestComp = Class ( "TestComp" ).extends ( Component ) ( {
			init () {
				this.propsType ( {
					text : {
						validate : String,
						require : true,
						default : "default button",
					},
					link : {
						validate ( val ) {
							return val.length > 5;
						},
						default : "javascript:;"
					},
					suffix : {
						require : true,
					},
					classname : [ /abc/, function ( val ) { return val.length > 4; } ]
				} );
				
				const self = this;
				return {
					btn : self.props.text,
					link : self.props.link,
					classname : self.props.classname,
					computed : {
						suffix () {
							return self.props.suffix;
						}
					}
				};
			},
			render () {
				this.template (
			    	'<a href="{{ link }}" class="{{ classname }}">{{ btn }}{{ suffix }}</a>'
			    )
			    .style ( {
			    	"a" : {
			        	fontSize : 20,
			        }
			    } );
			}
		} );

		let tc = new TestComp (),
			fragment = document.createDocumentFragment (),
			div = document.createElement ( "div" );

		fragment.appendChild ( div );
		
		expect ( function () {
			tc.__init__ ( div, {} );
		} ).toThrow ();
		attr ( div, "suffix", ".ice" );
		tc.__init__ ( div, {} );
		expect ( fragment.firstChild.firstChild.nodeValue ).toBe ( "default button.ice" );
		expect ( fragment.firstChild.href ).toBe ( "javascript:;" );
		
		////////////////////////////////////////
		////////////////////////////////////////
		////////////////////////////////////////
		tc = new TestComp ();
		fragment = document.createDocumentFragment ();
		div = document.createElement ( "div" );
		attr ( div, "text", "external button" );
		attr ( div, "suffix", ".ice" );

		fragment.appendChild ( div );
		expect ( function () {
			attr ( div, "link", "./a" );
			tc.__init__ ( div, {} );
		} ).toThrow ();

		////////////////////////////////////////
		////////////////////////////////////////
		////////////////////////////////////////
		attr ( div, "link", "./a/b/c" );
		tc.__init__ ( div, {} );
		expect ( fragment.firstChild.firstChild.nodeValue ).toBe ( "external button.ice" );
		expect ( fragment.firstChild.pathname ).toBe ( "/a/b/c" );

		////////////////////////////////////////
		////////////////////////////////////////
		////////////////////////////////////////
		tc = new TestComp ();
		fragment = document.createDocumentFragment ();
		div = document.createElement ( "div" );
		attr ( div, "suffix", ".ice" );

		fragment.appendChild ( div );
		expect ( function () {
			attr ( div, "classname", "abde" );
			tc.__init__ ( div, {} );
		} ).toThrow ();

		attr ( div, "classname", "abcde" );
		tc.__init__ ( div, {} );
		expect ( fragment.firstChild.className ).toBe ( "abcde" );
	} );

	xit ( "validate the Two-way binding props of component with vm data", () => {
		const TestComp = Class ( "TestComp" ).extends ( Component ) ( {
			init () {
				const self = this;
				return {
					btn : self.props.text,
					computed : {
						link : {
							get: () => {
								return self.props.link;
							},
							set: ( val ) => {
								self.props.link = val;
							}
						}
					}
				};
			},
			render () {
				this.template (
			    	'<a href="{{ link }}">{{ btn }}</a>'
			    )
			    .style ( {
			    	"a" : {
			        	fontSize : 20,
			        }
			    } );
			},
			action () {
				return {
					changeLink ( link ) {
						this.props.link = link;
					}
				}
			}
		} );

		////////////////////////////////////////
		////////////////////////////////////////
		//vm模拟模块ViewModel，测试vm将值传入组件props中
		let tc = new TestComp (),
			fragment = document.createDocumentFragment (),
			div = document.createElement ( "div" ),
			vm = new ViewModel ( { text : "button", link : "./b" } );

		fragment.appendChild ( div );
		attr ( div, {
			text : "{{ text }}",
			link : "{{ link }}"
		} );
		tc.__init__ ( div, vm );

		expect ( fragment.firstChild.firstChild.nodeValue ).toBe ( "button" );
		expect ( fragment.firstChild.pathname ).toBe ( "/b" );

		////////////////////////////////////////
		////////////////////////////////////////
		//模块ViewModel传入props的值是双向绑定的
		vm.text = "button2";
		expect ( fragment.firstChild.firstChild.nodeValue ).toBe ( "button" );

		vm.link = "./c";
		expect ( fragment.firstChild.pathname ).toBe ( "/c" );

		tc.action.changeLink ( "./d" );
		expect ( vm.link ).toBe ( "./d" );
	} );
} );