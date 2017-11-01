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

		fragment.appendChild ( div );
		const realDOM = fragment.render ();
		let fBackup = fragment.clone ();

		div.isComponent = true;
		tc.__init__ ( div, {} );

		expect ( fragment.children [ 0 ].nodeName ).toBe ( "DIV" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].nodeName ).toBe ( "BUTTON" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "test-btn" );
		expect ( fragment.children [ 0 ].templateNodes [ 1 ].children [ 0 ].nodeValue ).toBe ( "" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.nodeName ).toBe ( "BUTTON" );
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "test-btn" );

		fBackup = fragment.clone ();
		tc.action.print ( "hello icejs" );
		expect ( fragment.children [ 0 ].templateNodes [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello icejs" );
		expect ( fragment.children [ 0 ].templateNodes [ 1 ].attr ( "style" ) ).toEqual ( "color: rgb(0, 170, 230);" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.nextElementSibling.firstChild.nodeValue ).toBe ( "hello icejs" );
		expect ( realDOM.firstChild.nextElementSibling.style.color ).toBe ( "rgb(0, 170, 230)" );
	} );

	it ( "validate component props without vm data", () => {
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
			fragment = VFragment (),
			div = VElement ( "div" );

		fragment.appendChild ( div );
		let realDOM = fragment.render (),
			fBackup = fragment.clone ();

		div.isComponent = true;
		expect ( function () {
			tc.__init__ ( div, {} );
		} ).toThrow ();
		div.attr ( "suffix", ".ice" );
		tc.__init__ ( div, {} );


		expect ( fragment.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "default button.ice" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "href" ) ).toBe ( "javascript:;" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "class" ) ).toBe ( "" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "default button.ice" );
		expect ( realDOM.firstChild.href ).toBe ( "javascript:;" );
		expect ( realDOM.firstChild.className ).toBe ( "" );
		
		////////////////////////////////////////
		////////////////////////////////////////
		////////////////////////////////////////
		tc = new TestComp ();
		fragment = VFragment ();
		div = VElement ( "div" );
		div.attr ( "text", "external button" );
		div.attr ( "suffix", ".ice" );

		fragment.appendChild ( div );
		realDOM = fragment.render ();
		fBackup = fragment.clone ();

		div.isComponent = true;
		expect ( function () {
			div.attr ( "link", "./a" );
			tc.__init__ ( div, {} );
		} ).toThrow ();

		//////////////////////////////////////////
		//////////////////////////////////////////
		//////////////////////////////////////////
		div.attr ( "link", "./a/b/c" );
		tc.__init__ ( div, {} );

		expect ( fragment.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "external button.ice" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "href" ) ).toBe ( "./a/b/c" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "external button.ice" );
		expect ( realDOM.firstChild.pathname ).toBe ( "/a/b/c" );
		

		// ////////////////////////////////////////
		// ////////////////////////////////////////
		// ////////////////////////////////////////
		tc = new TestComp ();
		fragment = VFragment ();
		div = VElement ( "div" );
		div.attr ( "suffix", ".ice" );

		fragment.appendChild ( div );
		realDOM = fragment.render ();
		fBackup = fragment.clone ();

		div.isComponent = true;
		expect ( function () {
			div.attr ( "classname", "abde" );
			tc.__init__ ( div, {} );
		} ).toThrow ();

		div.attr ( "classname", "abcde" );
		tc.__init__ ( div, {} );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "class" ) ).toBe ( "abcde" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.className ).toBe ( "abcde" );
	} );

	it ( "validate the Two-way binding props of component with vm data", () => {
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
			fragment = VFragment (),
			div = VElement ( "div" ),
			vm = new ViewModel ( { text : "button", link : "./b" } );

		fragment.appendChild ( div );
		let realDOM = fragment.render (),
			fBackup = fragment.clone ();

		div.isComponent = true;
		div.attr ( {
			text : "{{ text }}",
			link : "{{ link }}"
		} );
		tc.__init__ ( div, { state : vm } );

		expect ( fragment.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "button" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "href" ) ).toBe ( "./b" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "button" );
		expect ( realDOM.firstChild.pathname ).toBe ( "/b" );

		////////////////////////////////////////
		////////////////////////////////////////
		//模块ViewModel传入props的值是双向绑定的
		fBackup = fragment.clone ();
		vm.text = "button2";
		//未使用计算属性做props代理的时候，vm的属性改变不会影响组件内使用该组件的绑定
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "button" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "button" );

		//使用计算属性做props代理后，vm的属性改变会影响组件内使用该组件的绑定
		fBackup = fragment.clone ();
		vm.link = "./c";
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "href" ) ).toBe ( "./c" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.pathname ).toBe ( "/c" );

		fBackup = fragment.clone ();
		tc.action.changeLink ( "./d" );
		expect ( vm.link ).toBe ( "./d" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "href" ) ).toBe ( "./d" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.pathname ).toBe ( "/d" );
	} );
} );