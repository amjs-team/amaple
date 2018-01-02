import VNode, { updateParent } from "./VNode";
import { foreach } from "../../func/util";

export default function VElement ( nodeName, attrs, parent, children, elem, isComponent ) {
	const vnode = new VNode ( 1, parent, elem );
	vnode.nodeName = nodeName.toUpperCase ();

	vnode.attrs = attrs || {};
	vnode.children = children && children.concat () || [];

	foreach ( vnode.children, child => {
		updateParent ( child, vnode );
	} );
	
	if ( isComponent === true ) {
    	vnode.isComponent = true;
    }
	
	return vnode;
}