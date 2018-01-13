import { extend, foreach } from "../../func/util";
import { walkVDOM } from "../../func/private";

export default function NodeTransaction () {
	this.transactions = null;
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
		if ( !this.transactions ) {
			this.transactions = [ moduleNode, moduleNode.clone () ];
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
		if ( this.transactions ) {
			this.transactions [ 0 ].diff ( this.transactions [ 1 ] ).patch ();
		}
		NodeTransaction.acting = undefined;
	}
} );