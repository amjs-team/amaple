import VNode from "./VNode";

export default function VElement ( nodeName, attrs, key, parent, children, elem, isComponent ) {
	const vnode = new VNode ( 1, key, parent, elem );
	vnode.nodeName = nodeName.toUpperCase ();

	vnode.attrs = attrs || {};
	vnode.children = children && children.concat () || [];
	
	if ( isComponent === true ) {
    	vnode.isComponent = true;
    }
	
	return vnode;
}