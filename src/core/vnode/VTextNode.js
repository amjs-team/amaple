import VNode from "./VNode";

export default function VTextNode ( nodeValue, parent, node ) {
	const vnode = new VNode ( 3, parent, node );
	vnode.nodeValue = nodeValue;
	
	return vnode;
}