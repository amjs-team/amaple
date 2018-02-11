import { extend, foreach } from "../../func/util";

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
		http://amaple.org/######
	*/
	start () {
		NodeTransaction.acting = this;
		return this;
	},

	/**
		collect ( moduleNode: Object )
	
		Return Type:
		void
	
		Description:
		收集对比的新旧虚拟节点
	
		URL doc:
		http://amaple.org/######
	*/
	collect ( moduleNode ) {
		let find = false;

		// 可能在一个生命周期函数中会有多个模块的视图更新
		foreach ( this.transactions, transaction => {
			if ( transaction [ 0 ] === moduleNode ) {
				find = true;
				return false;
			}
		} );

		if ( !find ) {
			this.transactions.push ( [ moduleNode, moduleNode.clone () ] );
		}
	},

	/**
		commit ()
	
		Return Type:
		void
	
		Description:
		提交事物更新关闭已开启的事物
	
		URL doc:
		http://amaple.org/######
	*/
	commit () {
		foreach ( this.transactions, transaction => {
			transaction [ 0 ].diff ( transaction [ 1 ] ).patch ();
		} );
		NodeTransaction.acting = undefined;
	}
} );