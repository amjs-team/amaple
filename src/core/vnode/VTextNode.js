import VNode from "./VNode";

export default function VTextNode ( nodeValue, key, parent, node ) {
	const vnode = new VNode ( 3, key, parent, node );
	vnode.nodeValue = nodeValue;
	
	return vnode;
}