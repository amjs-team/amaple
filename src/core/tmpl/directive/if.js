import { attr } from "../../../func/node";

export default {
	before () {
    	let elem = this.elem;
    	if ( attr ( elem, ":for" ) {
            return false;
        }
            
        attr ( elem, ":if", null );
    	this.parent = this.elem.parentNode;
    	this.replacement = this.elem.ownerDocument.createTextNode ( "" );
    },
	update ( val ) {
		let parent = this.parent,
            elem = this.elem;
        	
        if ( val && !elem.parentNode ) {
            parent.replaceChild ( this.replacement, elem );
        }
    	else if ( !val && this.elem.parentNode == parent ) {
        	parent.replaceChild ( elem, replacement );
        }
    }
};