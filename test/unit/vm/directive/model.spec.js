import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";

describe ( "directive :model", () => {
	let d;
	
	beforeEach ( () => {
    	d = document.createElement ( "div" );
    } );
	
	it ( "directive :model will mount in input node", () => {
        d.innerHTML = '<input type="text" :model="text" />';
        let t = new Tmpl ( d ),
            vm = new ViewModel ( {
                text : "hello icejs"
            } );
        t.mount ( vm );
    	expect ( d.firstChild.value ).toBe ( "hello icejs" );

        console.log(d);
    } );
  
} );