import VNode from "./VNode";

export default function VFragment ( children, docFragment ) {
	const vnode = new VNode ( 11, null, null, docFragment );
	vnode.children = children && children.concat () || [];
	
	return vnode;
}