import { extend, foreach } from "../../func/util";
import { attr } from "../../func/node";
import { attrAssignmentHook } from "../../var/const";
import event from "../../event/core";

export default function NodeTransaction () {
	this.transactions = [];
}

extend ( NodeTransaction.prototype, {

	/**
		start ()
	
		Return Type:
		Object
		当前开启的事物对象
	
		Description:
		开启当前的事物对象
	
		URL doc:
		http://icejs.org/######
	*/
	start () {
		NodeTransaction.acting = this;
		return this;
	},

	/**
		collect ( newVNode: Object, oldVNode: Object )
	
		Return Type:
		void
	
		Description:
		收集对比的新旧虚拟节点
	
		URL doc:
		http://icejs.org/######
	*/
	collect ( newVNode, oldVNode ) {
		this.transactions.push ( {
			backup : oldVNode,
			update : newVNode
		} );
	},

	/**
		commit ()
	
		Return Type:
		void
	
		Description:
		提交事物更新关闭已开启的事物
	
		URL doc:
		http://icejs.org/######
	*/
	commit () {
		foreach ( this.transactions, comparedVNodes => {
			comparedVNodes.update.diff ( comparedVNodes.backup ).patch ();
		} );

		NodeTransaction.acting = undefined;
	}
} );