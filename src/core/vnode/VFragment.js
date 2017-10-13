import VNode from "./VNode";

export default function VFragment ( key, parent, children, elem ) {
	const vnode = new VNode ( 11, key, parent, elem );
	vnode.children = children || [];
	
	return vnode;
}