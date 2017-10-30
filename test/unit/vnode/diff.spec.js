import VNode from "core/vnode/VNode";
import VElement from "core/vnode/VElement";
import VTextNode from "core/vnode/VTextNode";
import VFragment from "core/vnode/VFragment";
import NodePatcher from "core/vnode/NodePatcher";

describe ( "diff vnode => ", () => {

	let vnode1, vnode2;
	beforeEach ( () => {
		vnode1 = VElement ( "div" ),
		vnode2 = VElement ( "div" );
	} );

	it ( "Diff two vnodes that have different attributes", () => {
		vnode1.attr ( {
			id : "the-div", 
			"ice-module": "root"
		} );

		vnode2.attr ( {
			id : "the-div2", 
			"ice-module2": "root2" 
		} );
		
		const patcher = vnode2.diff ( vnode1 );
		expect ( patcher.patches.length ).toBe ( 3 );
		expect ( patcher.patches [ 0 ].type ).toBe ( NodePatcher.ATTR_REORDER );
		expect ( patcher.patches [ 0 ].name ).toBe ( "id" );
		expect ( patcher.patches [ 0 ].val ).toBe ( "the-div2" );
		expect ( patcher.patches [ 1 ].type ).toBe ( NodePatcher.ATTR_REORDER );
		expect ( patcher.patches [ 1 ].name ).toBe ( "ice-module2" );
		expect ( patcher.patches [ 1 ].val ).toBe ( "root2" );
		expect ( patcher.patches [ 2 ].type ).toBe ( NodePatcher.ATTR_REMOVE );
		expect ( patcher.patches [ 2 ].name ).toBe ( "ice-module" );
	} );

	it ( "Diff a vnode which contains a different text node", () => {
		vnode1.appendChild ( VTextNode ( "hello icejs" ) );
		vnode2.appendChild ( VTextNode ( "hello icejs2" ) );

		const patcher = vnode2.diff ( vnode1 );
		expect ( patcher.patches.length ).toBe ( 1 );
		expect ( patcher.patches [ 0 ].type ).toBe ( NodePatcher.TEXTNODE );
		expect ( patcher.patches [ 0 ].replaceNode.nodeValue ).toBe ( "hello icejs" );
		expect ( patcher.patches [ 0 ].item.nodeValue ).toBe ( "hello icejs2" );
	} );

	it ( "Diff two different vnode", () => {
		vnode2.nodeName = "SPAN";
		const patcher = vnode2.diff ( vnode1 );
		expect ( patcher.patches.length ).toBe ( 1 );
		expect ( patcher.patches [ 0 ].type ).toBe ( NodePatcher.NODE_REPLACE );
		expect ( patcher.patches [ 0 ].item ).toBe ( vnode2 );
	} );

	it ( "Diff tow vnodes that have different children with vnode key", () => {
		vnode1.appendChild ( VElement ( "div" ) );
		vnode1.appendChild ( VElement ( "span" ) );
		let childNode = VElement ( "div" );
		childNode.key = 1;
		vnode1.appendChild ( childNode );
		childNode = VElement ( "div" );
		childNode.key = 2;
		vnode1.appendChild ( childNode );
		childNode = VElement ( "div" );
		childNode.key = 3;
		vnode1.appendChild ( childNode );
		childNode = VElement ( "div" );
		childNode.key = 4;
		vnode1.appendChild ( childNode );
		vnode1.appendChild ( VElement ( "div" ) );
		vnode1.appendChild ( VElement ( "span" ) );

		vnode2.appendChild ( VElement ( "div" ) );
		vnode2.appendChild ( VElement ( "p" ) );
		childNode = VElement ( "div" );
		childNode.key = 5;
		vnode2.appendChild ( childNode );
		childNode = VElement ( "div" );
		childNode.key = 2;
		vnode2.appendChild ( childNode );
		childNode = VElement ( "div" );
		childNode.key = 4;
		vnode2.appendChild ( childNode );
		childNode = VElement ( "div" );
		childNode.key = 1;
		vnode2.appendChild ( childNode );
		childNode = VElement ( "div" );
		childNode.key = 6;
		vnode2.appendChild ( childNode );
		vnode2.appendChild ( VElement ( "div" ) );
		vnode2.appendChild ( VElement ( "p" ) );

		const patcher = vnode2.diff ( vnode1 );

		expect ( patcher.patches.length ).toBe ( 7 );
		expect ( patcher.patches [ 0 ].type ).toBe ( NodePatcher.NODE_REPLACE );
		expect ( patcher.patches [ 0 ].item.nodeName ).toBe ( "P" );
		expect ( patcher.patches [ 1 ].type ).toBe ( NodePatcher.NODE_REORDER );
		expect ( patcher.patches [ 1 ].item.key ).toBe ( 5 );
		expect ( patcher.patches [ 1 ].index ).toBe ( 2 );
		expect ( patcher.patches [ 2 ].type ).toBe ( NodePatcher.NODE_REORDER );
		expect ( patcher.patches [ 2 ].item.key ).toBe ( 6 );
		expect ( patcher.patches [ 2 ].index ).toBe ( 6 );
		expect ( patcher.patches [ 3 ].type ).toBe ( NodePatcher.NODE_REMOVE );
		expect ( patcher.patches [ 3 ].item.key ).toBe ( 3 );
		expect ( patcher.patches [ 4 ].type ).toBe ( NodePatcher.NODE_REORDER );
		expect ( patcher.patches [ 4 ].item.key ).toBe ( 4 );
		expect ( patcher.patches [ 4 ].index ).toBe ( 5 );
		expect ( patcher.patches [ 5 ].type ).toBe ( NodePatcher.NODE_REORDER );
		expect ( patcher.patches [ 5 ].item.key ).toBe ( 1 );
		expect ( patcher.patches [ 5 ].index ).toBe ( 5 );
		expect ( patcher.patches [ 6 ].type ).toBe ( NodePatcher.NODE_REPLACE );
		expect ( patcher.patches [ 6 ].item.nodeName ).toBe ( "P" );
	} );

	it ( "Diff tow vnodes that old vnode's children more than new vnode's children and they are without key", () => {
		let childNode = VElement ( "div" );
		vnode1.appendChild ( childNode );
		childNode = VElement ( "div", { class: "wrap-bd" } );
		vnode1.appendChild ( childNode );
		childNode = VElement ( "div" );
		vnode1.appendChild ( childNode );
		childNode = VElement ( "div" );
		vnode1.appendChild ( childNode );
		childNode = VElement ( "div" );
		vnode1.appendChild ( childNode );

		childNode = VElement ( "div", { id: "icejs-666" } );
		vnode2.appendChild ( childNode );
		childNode = VElement ( "div" );
		vnode2.appendChild ( childNode );
		childNode = VElement ( "span" );
		vnode2.appendChild ( childNode );

		const patcher = vnode2.diff ( vnode1 );
		
		expect ( patcher.patches.length ).toBe ( 5 );
		expect ( patcher.patches [ 0 ].type ).toBe ( NodePatcher.ATTR_REORDER );
		expect ( patcher.patches [ 0 ].item.nodeName ).toBe ( "DIV" );
		expect ( patcher.patches [ 0 ].name ).toBe ( "id" );
		expect ( patcher.patches [ 0 ].val ).toBe ( "icejs-666" );
		expect ( patcher.patches [ 1 ].type ).toBe ( NodePatcher.ATTR_REMOVE );
		expect ( patcher.patches [ 1 ].name ).toBe ( "class" );
		expect ( patcher.patches [ 2 ].type ).toBe ( NodePatcher.NODE_REPLACE );
		expect ( patcher.patches [ 2 ].item.nodeName ).toBe ( "SPAN" );
		expect ( patcher.patches [ 3 ].type ).toBe ( NodePatcher.NODE_REMOVE );
		expect ( patcher.patches [ 3 ].item.nodeName ).toBe ( "DIV" );
		expect ( patcher.patches [ 4 ].type ).toBe ( NodePatcher.NODE_REMOVE );
		expect ( patcher.patches [ 4 ].item.nodeName ).toBe ( "DIV" );
	} );

	it ( "Diff tow vnodes that old vnode's children less than new vnode's children and they are without key", () => {
		let childNode = VElement ( "div" );
		vnode1.appendChild ( childNode );
		childNode = VElement ( "div", { class: "wrap-bd" } );
		vnode1.appendChild ( childNode );
		childNode = VElement ( "div" );
		vnode1.appendChild ( childNode );

		childNode = VElement ( "div", { id: "icejs-666" } );
		vnode2.appendChild ( childNode );
		childNode = VElement ( "div" );
		vnode2.appendChild ( childNode );
		childNode = VElement ( "span" );
		vnode2.appendChild ( childNode );
		childNode = VElement ( "div" );
		vnode2.appendChild ( childNode );
		childNode = VElement ( "div" );
		vnode2.appendChild ( childNode );

		const patcher = vnode2.diff ( vnode1 );
		
		expect ( patcher.patches.length ).toBe ( 5 );
		expect ( patcher.patches [ 0 ].type ).toBe ( NodePatcher.ATTR_REORDER );
		expect ( patcher.patches [ 0 ].item.nodeName ).toBe ( "DIV" );
		expect ( patcher.patches [ 0 ].name ).toBe ( "id" );
		expect ( patcher.patches [ 0 ].val ).toBe ( "icejs-666" );
		expect ( patcher.patches [ 1 ].type ).toBe ( NodePatcher.ATTR_REMOVE );
		expect ( patcher.patches [ 1 ].name ).toBe ( "class" );
		expect ( patcher.patches [ 2 ].type ).toBe ( NodePatcher.NODE_REPLACE );
		expect ( patcher.patches [ 2 ].item.nodeName ).toBe ( "SPAN" );
		expect ( patcher.patches [ 3 ].type ).toBe ( NodePatcher.NODE_REORDER );
		expect ( patcher.patches [ 3 ].item.nodeName ).toBe ( "DIV" );
		expect ( patcher.patches [ 4 ].type ).toBe ( NodePatcher.NODE_REORDER );
		expect ( patcher.patches [ 4 ].item.nodeName ).toBe ( "DIV" );
	} );

	// 测试一个vnode中同时使用‘:for’和‘:if’指令时，在改变‘:if’值时的差异对比
	it ( "Diff tow vnodes that use both directive ':for' and ':if' in the same vnode", () => {
		
	} );
} );