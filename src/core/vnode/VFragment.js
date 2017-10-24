import VNode, { changeParent } from "./VNode";
import { foreach } from "../../func/util";

export default function VFragment ( children, docFragment ) {
	const vnode = new VNode ( 11, null, null, docFragment );
	vnode.children = children && children.concat () || [];

	foreach ( vnode.children, child => {
		changeParent ( child, vnode );
	} );
	
	return vnode;
}