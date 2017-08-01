import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";

describe ( "directive expr", () => {
	let d;
	
	beforeEach ( () => {
    	d = document.createElement ( "div" );
    } );
	
	xit ( "directive :if in element attribute with single variable", () => {
        d.innerHTML = '<p :if="show">hello icejs</p>';

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                show: 0
            } );
        t.mount ( vm );

        expect ( d.querySelector ( "p" ) ).toBeNull ();

        vm.show = 1;
        expect ( d.querySelector ( "p" ).firstChild.nodeValue ).toBe ( "hello icejs" );
    } );

    it ( "directive :if in element attribute with comparison symbol", () => {
        d.innerHTML = '<p :if="show1 > 1">hello icejs1</p><p :if="show2 === 1">hello icejs2</p><p :if="show3 <= 0">hello icejs3</p>';

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                show1: 2,
                show2: 2,
                show3: -1,
            } );
        t.mount ( vm );

        console.log(d);
    } );
} );