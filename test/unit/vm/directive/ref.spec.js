import ice from "ice";

describe ( "directive ref => ", () => {
	it ( "directive :ref in common element", () => {
        const d = document.createElement ( "div" );
        d.innerHTML = `<p :ref="ref_p">{{ text }}</p>`

        const module = new ice.Module ( d, {
            init () {
                return {
                    text: "hello icejs"
                };
            }
        } );

        expect ( module.refs ( "ref_p" ) ).toBe ( d.firstChild );
    } );

    it ( "directive :ref in common element with :if", () => {
        const d = document.createElement ( "div" );
        d.innerHTML = `<p :ref="ref_p" :if="show">{{ text }}</p>`

        const module = new ice.Module ( d, {
            init () {
                return {
                    show: 0,
                    text: "hello icejs"
                };
            }
        } );

        expect ( module.refs ( "ref_p" ) ).toBeUndefined ();
        module.state.show = 1;
        expect ( module.refs ( "ref_p" ) ).toBe ( d.firstChild );
    } );

    it ( "directive :ref in common element with :for", () => {
        const d = document.createElement ( "div" );
        d.innerHTML = `<p :ref="ref_p" :for="i in list">{{ i }}</p>`

        const module = new ice.Module ( d, {
            init () {
                return {
                    list: [ "a", "b", "c" ]
                };
            }
        } );

        expect ( module.refs ( "ref_p" ).length ).toBe ( 3 );
        expect ( module.refs ( "ref_p" ) [ 0 ] ).toBe ( d.children.item ( 0 ) );
        expect ( module.refs ( "ref_p" ) [ 1 ] ).toBe ( d.children.item ( 1 ) );
        expect ( module.refs ( "ref_p" ) [ 2 ] ).toBe ( d.children.item ( 2 ) );

        module.state.list.push ( "d" );
        expect ( module.refs ( "ref_p" ).length ).toBe ( 4 );
        expect ( module.refs ( "ref_p" ) [ 0 ] ).toBe ( d.children.item ( 0 ) );
        expect ( module.refs ( "ref_p" ) [ 1 ] ).toBe ( d.children.item ( 1 ) );
        expect ( module.refs ( "ref_p" ) [ 2 ] ).toBe ( d.children.item ( 2 ) );
        expect ( module.refs ( "ref_p" ) [ 3 ] ).toBe ( d.children.item ( 3 ) );

        module.state.list.splice ( 1, 1 );
        expect ( module.refs ( "ref_p" ).length ).toBe ( 3 );
        expect ( module.refs ( "ref_p" ) [ 0 ] ).toBe ( d.children.item ( 0 ) );
        expect ( module.refs ( "ref_p" ) [ 1 ] ).toBe ( d.children.item ( 1 ) );
        expect ( module.refs ( "ref_p" ) [ 2 ] ).toBe ( d.children.item ( 2 ) );
    } );

    it ( "directive :ref in component element", () => {
        const TestComp = ice.class ( "TestComp" ).extends ( ice.Component ) ( {
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

        const d = document.createElement ( "div" );
        d.innerHTML = `<test-comp :ref="ref_comp"></test-comp>`;

        const module = new ice.Module ( d, {
            init () {
                return {
                    text: ""
                };
            },
            depComponents : [ TestComp ]
        } );

        expect ( module.refs ( "ref_comp" ) ).toBe ( module.components [ 0 ].action );
    } );

    it ( "directive :ref in component element with :if", () => {
        const TestComp = ice.class ( "TestComp" ).extends ( ice.Component ) ( {
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

        const d = document.createElement ( "div" );
        d.innerHTML = `<test-comp :ref="ref_comp" :if="show"></test-comp>`;

        const module = new ice.Module ( d, {
            init () {
                return {
                    show: 0
                };
            },
            depComponents : [ TestComp ]
        } );
        

        expect ( module.refs ( "ref_comp" ) ).toBeUndefined ();
        module.state.show = 1;
        expect ( module.refs ( "ref_comp" ) ).toBe ( module.components [ 0 ].action );
    } );

    it ( "directive :ref in component element with :for", () => {
        const TestComp = ice.class ( "TestComp" ).extends ( ice.Component ) ( {
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
            unmount () {
                console.log( "testComp unmount" );
            },
            action () {
                return {
                    print ( con ) {
                        this.state.console = con;
                    }
                };
            }
        } );

        const d = document.createElement ( "div" );
        d.innerHTML = `<test-comp :ref="ref_comp" :for="i in list"></test-comp>`;

        const module = new ice.Module ( d, {
            init () {
                return {
                    list: [ "a", "b", "c" ]
                };
            },
            depComponents : [ TestComp ]
        } );

        expect ( module.refs ( "ref_comp" ).length ).toBe ( 3 );
        expect ( module.refs ( "ref_comp" ) [ 0 ] ).toBe ( module.components [ 0 ].action );
        expect ( module.refs ( "ref_comp" ) [ 1 ] ).toBe ( module.components [ 1 ].action );
        expect ( module.refs ( "ref_comp" ) [ 2 ] ).toBe ( module.components [ 2 ].action );

        module.state.list.push ( "d" );
        expect ( module.refs ( "ref_comp" ).length ).toBe ( 4 );
        expect ( module.refs ( "ref_comp" ) [ 0 ] ).toBe ( module.components [ 0 ].action );
        expect ( module.refs ( "ref_comp" ) [ 1 ] ).toBe ( module.components [ 1 ].action );
        expect ( module.refs ( "ref_comp" ) [ 2 ] ).toBe ( module.components [ 2 ].action );
        expect ( module.refs ( "ref_comp" ) [ 3 ] ).toBe ( module.components [ 3 ].action );

        module.state.list.splice ( 1, 1 );
        expect ( module.refs ( "ref_comp" ).length ).toBe ( 3 );
        expect ( module.refs ( "ref_comp" ) [ 0 ] ).toBe ( module.components [ 0 ].action );
        expect ( module.refs ( "ref_comp" ) [ 1 ] ).toBe ( module.components [ 1 ].action );
        expect ( module.refs ( "ref_comp" ) [ 2 ] ).toBe ( module.components [ 2 ].action );
        module.refs ( "ref_comp" ) [ 1 ].print ( 666 );
    } );

} );