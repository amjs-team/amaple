import Tmpl from "core/tmpl/Tmpl";
import ViewModel from "core/ViewModel";

describe ( "directive expr", () => {
	let d;
	
	beforeEach ( () => {
    	d = document.createElement ( "div" );
    	d.innerHTML = '<span>{{ expr }}<span><p id="{{ id }}">expr test</p>';
    } );
	
	it ( "directive expression will mount in text node", () => {
    	let t = new Tmpl ( d ),
            vm = new ViewModel ( {
            	expr : "success",
            } );
      
      	t.mount ( vm );
      
    	expect ( d.firstChild.firstChild.nodeValue ).toBe ( "success" );
    } );
  
	it ( "directive expression will mount in attribute node", () => {
    	let t = new Tmpl ( d ),
            vm = new ViewModel ( {
            	id : "text",
            } );
      
      	t.mount ( vm );
      
    	expect ( d.querySelector ( "p" ).getAttribute ( "id" ) ).toBe ( "text" );
    } );
} );