import { foreach } from "../../../func/util";
import { attr } from "../../../func/attr";
import Tmpl from "../Tmpl";

const rforWord = /^\s*([$\w]+)\s+in\s+([$\w]+)\s*$/;

export default {
	before () {
    	attr ( this.elem, ":for", null );
    	
    	let doc = this.elem.ownerDocument,
        	variable = rforWord.exec ( this.expr );
  
		this.startNode = doc.createTextNode ( "" );
		this.endNode = this.startNode.cloneNode ();
		
    },
	update ( array ) {
		let elem = this.elem,
            doc = elem.ownerDocument;
            f = doc.createDocumentFragment();
  		
		f.appendChild ( this.startNode );
        foreach ( array, item => {
        	f.appendChild ( Tmpl.mountElem ( elem.cloneNode ( true ), this.vm );
        } );
        
        f.appendChild ( this.endNode );
    }
};