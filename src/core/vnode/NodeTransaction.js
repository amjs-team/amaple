import { extend, foreach } from "../../func/util";
import { walkVDOM } from "../../func/private";

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
		if ( this.transactions.length === 0 ) {
			this.transactions.push ( {
				backup : oldVNode,
				update : newVNode
			} );
		}
		else {
			let comparedVNode = newVNode,
				isFind = false;

			// 为了避免重复对比节点，需对将要保存的节点向上寻找
			// 如果在已保存数组中找到相同节点或祖先节点则不保存此对比节点
			do {
				foreach ( this.transactions, item => {
					if ( item.update === comparedVNode ) {
						isFind = true;
						return false;
					}
				} );
				
				if ( !isFind ) {
					comparedVNode = comparedVNode.parent;
				}
				else {
					break;
				}
			} while ( comparedVNode )

			// 如果在以保存数组中没有找到相同节点或祖先节点则需要保存此对比节点
			// 此时需再向下寻找子孙节点，如果有子孙节点需移除此子孙节点的对比项
			if ( !isFind ) {
				walkVDOM ( newVNode, vnode => {
					foreach ( this.transactions, ( item, i ) => {
						if ( item.update === vnode ) {
							this.transactions.splice ( i, 1 );
						}
					} );
				} );

				this.transactions.push ( {
					backup : oldVNode, 
					update : newVNode
				} );
			}
		}
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