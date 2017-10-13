import VNode from "./VNode";

export default function VFragment ( children, elem ) {
	const vnode = new VNode ( 11, null, null, elem );
	vnode.children = children.concat () || [];
	
	return vnode;
}