import { append, clear, html, query } from "../func/node";

/**
	NodeLite ( node: DOMObject|DOMString )

	Return Type:
	void

	Description:
	模块对象封装类
	在模块定义中的init方法和apply方法中会自动注入一个NodeLite的对象

	URL doc:
	http://icejs.org/######
*/
export default function NodeLite ( node ) {
	this.originNode = node;
}

extend ( NodeLite.prototype, {
	append ( node ) {
		append ( this.originNode, node );
		return this;
	},

	clear () {
		clear ( this.originNode );
		return this;
	},

	html ( node ) {
		html ( this.originNode, node );
		return this;
	},

	query ( selector, all ) {
		query ( selector, this.originNode, all );
		return this;
	},
	
	attr ( name, val ) {
		
    },
} );