import VNode, { updateParent } from "./VNode";
import { foreach } from "../../func/util";

export default function VFragment ( children, docFragment ) {
	const vnode = new VNode ( 11, null, docFragment );
	vnode.children = children && children.concat () || [];

	foreach ( vnode.children, child => {
		updateParent ( child, vnode );
	} );
	
	return vnode;
}