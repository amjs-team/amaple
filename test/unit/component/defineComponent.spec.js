import am from "am";
import ViewModel from "src/core/ViewModel";
import { attr } from "src/func/node";
import VElement from "core/vnode/VElement";
import VFragment from "core/vnode/VFragment";

describe ( "define component =>", () => {
	it ( "use the function Class to define a component derivative", () => {
		const TestComp = am.class ( "TestComp" ).extends ( am.Component ) ( {
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
				const _this = this;
				return {
					print ( con ) {
						_this.state.console = con;
					}
				};
			}
		} );

		const 
			tc = new TestComp (),
			fragment = VFragment (),
			testComp = VElement ( "test-comp" );

		fragment.appendChild ( testComp );
		const realDOM = fragment.render ();
		let fBackup = fragment.clone ();

		testComp.isComponent = true;
		tc.__init__ ( testComp, {
			module: { state: {} }
		} );

		expect ( fragment.children [ 0 ].nodeName ).toBe ( "TEST-COMP" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].nodeName ).toBe ( "BUTTON" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "test-btn" );
		expect ( fragment.children [ 0 ].templateNodes [ 1 ].children [ 0 ].nodeValue ).toBe ( "" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.nodeName ).toBe ( "BUTTON" );
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "test-btn" );

		tc.action.print ( "hello amjs" );
		expect ( fragment.children [ 0 ].templateNodes [ 1 ].children [ 0 ].nodeValue ).toBe ( "hello amjs" );
		expect ( realDOM.firstChild.nextElementSibling.firstChild.nodeValue ).toBe ( "hello amjs" );
		expect ( realDOM.lastChild.firstChild.nodeValue ).toMatch ( /^\.console\[data-no-\d+\]{color:#00aae6;}$/ );
	} );

	it ( "validate component props without vm data", () => {
		const TestComp = am.class ( "TestComp" ).extends ( am.Component ) ( {
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
					classname : [ /abc/,  val => {
						return val.length > 4;
					} ]
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
			    	`<a href="{{ link }}" class="{{ classname }}">{{ btn }}{{ suffix }}</a>`
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
			testComp = VElement ( "test-comp" );

		fragment.appendChild ( testComp );
		let realDOM = fragment.render (),
			fBackup = fragment.clone ();

		testComp.isComponent = true;
		expect ( function () {
			tc.__init__ ( testComp, {} );
		} ).toThrow ();
		testComp.attr ( "suffix", ".am" );
		tc.__init__ ( testComp, {
			module: { state: {} }
		} );


		expect ( fragment.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "default button.am" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "href" ) ).toBe ( "javascript:;" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "class" ) ).toBe ( "" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "default button.am" );
		expect ( realDOM.firstChild.href ).toBe ( "javascript:;" );
		expect ( realDOM.firstChild.className ).toBe ( "" );
		
		////////////////////////////////////////
		////////////////////////////////////////
		////////////////////////////////////////
		tc = new TestComp ();
		fragment = VFragment ();
		testComp = VElement ( "test-comp" );
		testComp.attr ( "text", "external button" );
		testComp.attr ( "suffix", ".am" );

		fragment.appendChild ( testComp );
		realDOM = fragment.render ();
		fBackup = fragment.clone ();

		testComp.isComponent = true;
		expect ( function () {
			testComp.attr ( "link", "./a" );
			tc.__init__ ( testComp, {} );
		} ).toThrow ();

		//////////////////////////////////////////
		//////////////////////////////////////////
		//////////////////////////////////////////
		testComp.attr ( "link", "/a/b/c" );
		tc.__init__ ( testComp, {
			module: { state: {} }
		} );

		expect ( fragment.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "external button.am" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "href" ) ).toBe ( "/a/b/c" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "external button.am" );

		// IE下的a标签的pathname属性开头没有"/"
		expect ( ( realDOM.firstChild.pathname.substr ( 0, 1 ) === "/" ? "" : "/" ) + realDOM.firstChild.pathname ).toBe ( "/a/b/c" );
		

		// ////////////////////////////////////////
		// ////////////////////////////////////////
		// ////////////////////////////////////////
		tc = new TestComp ();
		fragment = VFragment ();
		testComp = VElement ( "test-comp" );
		testComp.attr ( "suffix", ".am" );

		fragment.appendChild ( testComp );
		realDOM = fragment.render ();
		fBackup = fragment.clone ();

		testComp.isComponent = true;
		expect ( function () {
			testComp.attr ( "classname", "abde" );
			tc.__init__ ( testComp, {} );
		} ).toThrow ();

		testComp.attr ( "classname", "abcde" );
		tc.__init__ ( testComp, {
			module: { state: {} }
		} );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "class" ) ).toBe ( "abcde" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.className ).toBe ( "abcde" );
	} );

	it ( "validate the Two-way binding props of component with vm data", () => {
		const TestComp = am.class ( "TestComp" ).extends ( am.Component ) ( {
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
			    	`<a href="{{ link }}">{{ btn }}</a>`
			    )
			    .style ( {
			    	"a" : {
			        	fontSize : 20,
			        }
			    } );
			},
			action () {
				const _this = this;
				return {
					changeLink ( link ) {
						_this.props.link = link;
					}
				};
			}
		} );

		////////////////////////////////////////
		////////////////////////////////////////
		//vm模拟模块ViewModel，测试vm将值传入组件props中
		let tc = new TestComp (),
			fragment = VFragment (),
			compEntity = VElement ( "test-comp" ),
			vm = new ViewModel ( { text : "button", link : "/b" } );

		fragment.appendChild ( compEntity );
		let realDOM = fragment.render (),
			fBackup = fragment.clone ();

		compEntity.isComponent = true;
		compEntity.attr ( {
			text : "{{ text }}",
			link : "{{ link }}"
		} );
		tc.__init__ ( compEntity, {
			module: { state : vm }
		 } );

		expect ( fragment.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "button" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "href" ) ).toBe ( "/b" );
		fragment.diff ( fBackup ).patch ();
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "button" );

		// IE下的a标签的pathname属性开头没有"/"
		expect ( ( realDOM.firstChild.pathname.substr ( 0, 1 ) === "/" ? "" : "/" ) + realDOM.firstChild.pathname ).toBe ( "/b" );

		////////////////////////////////////////
		////////////////////////////////////////
		//模块ViewModel传入props的值是双向绑定的
		vm.text = "button2";
		//未使用计算属性做props代理的时候，vm的属性改变不会影响组件内使用该组件的绑定
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].children [ 0 ].nodeValue ).toBe ( "button" );
		expect ( realDOM.firstChild.firstChild.nodeValue ).toBe ( "button" );

		//使用计算属性做props代理后，vm的属性改变会影响组件内使用该组件的绑定
		vm.link = "/c";
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "href" ) ).toBe ( "/c" );

		// IE下的a标签的pathname属性开头没有"/"
		expect ( ( realDOM.firstChild.pathname.substr ( 0, 1 ) === "/" ? "" : "/" ) + realDOM.firstChild.pathname ).toBe ( "/c" );

		tc.action.changeLink ( "/d" );
		expect ( vm.link ).toBe ( "/d" );
		expect ( fragment.children [ 0 ].templateNodes [ 0 ].attr ( "href" ) ).toBe ( "/d" );

		// IE下的a标签的pathname属性开头没有"/"
		expect ( ( realDOM.firstChild.pathname.substr ( 0, 1 ) === "/" ? "" : "/" ) + realDOM.firstChild.pathname ).toBe ( "/d" );
	} );
} );