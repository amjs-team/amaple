import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";

describe ( "directive event bind => ", () => {
    let d;
    
    beforeEach ( () => {
        d = document.createElement ( "div" );
    } );
    
    it ( "directive :on without function param", ( done ) => {
        d.innerHTML = '<p :onclick="click">btn</p>';

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                click : function ( event ){
                    done ();
                    expect ( event.type ).toBe ( "click" );
                }
            } );
        t.mount ( vm );

        d.firstChild.click ();
    } );

    it ( "directive :on with function param", ( done ) => {
        d.innerHTML = `<p :onclick="click ( 666, '555' )">btn</p>`;

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                click : function ( event, arg, arg2 ){
                    done ();
                    expect ( event.type ).toBe ( "click" );
                    expect ( arg ).toBe ( 666 );
                    expect ( arg2 ).toBe ( "555" );
                }
            } );
        t.mount ( vm );

        d.firstChild.click ();
    } );

    it ( "directive :on with function listener param", ( done ) => {
        d.innerHTML = `<p :onclick="click ( text )">btn</p>`;

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                text: "hello icejs",
                click : function ( event, arg ){
                    done ();
                    expect ( event.type ).toBe ( "click" );
                    expect ( arg ).toBe ( "hello icejs" );
                }
            } );
        t.mount ( vm );

        d.firstChild.click ();
    } );

    it ( "directive :on with function listener param", ( done ) => {
        d.innerHTML = `<p :for="item in list" :key="key" :onclick="click ( item, key )">btn</p>`;

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                list : [ "hello icejs0", "hello icejs1", "hello icejs2" ],
                click : function ( event, arg, key ) {
                    done ();
                    expect ( event.type ).toBe ( "click" );
                    expect ( arg ).toBe ( "hello icejs" + key );
                }
            } );
        t.mount ( vm );

        d.children[0].click ();
        d.children[1].click ();
        d.children[2].click ();
    } );
} );