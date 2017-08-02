import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";

describe ( "directive if => ", () => {
	let d;
	
	beforeEach ( () => {
    	d = document.createElement ( "div" );
    } );
	
	it ( "directive :if in element attribute with single variable", () => {
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
                show2: 0,
                show3: -1,
            } );
        t.mount ( vm );
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "hello icejs1" );
        expect ( d.firstChild.nextElementSibling.firstChild.nodeValue ).toBe ( "hello icejs3" );

        vm.show1 = 0;
        vm.show2 = 1;
        expect ( d.firstChild.nodeValue ).toBe ( "" );
        expect ( d.firstChild.nextSibling.firstChild.nodeValue ).toBe ( "hello icejs2" );
    } );

    it ( "directive :if in element attribute with functions fire", () => {
        d.innerHTML = '<p :if="show.toString() == \'1,2,3\'">hello icejs</p>';

        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                show : [1, 2, 3]
            } );
        t.mount ( vm );
        
        expect ( d.firstChild.firstChild.nodeValue ).toBe ( "hello icejs" );

        vm.show = "1";
        expect ( d.firstChild.nodeValue ).toBe ( "" );
    } );

    
} );