import { type, foreach } from "../func/util";

export default {

	directions : {},

	/**
		direction

		push ( name: String, direction: DOMString|DOMObject )
	
		Return Type:
		void
	
		Description:
		添加跳转缓存模块
	
		URL doc:
		http://icejs.org/######
	*/
	push : function ( name, direction ) {

		if (!this.directions.hasOwnProperty ( name ) ) {
			this.directions [ name ] = direction;
		}
		else {
			throw moduleErr ( "module", name + "页面模块已存在" );
		}
	},

	/**
		get ( name: String )
	
		Return Type:
		DOMString|DOMObject
		缓存模块
	
		Description:
		获取跳转缓存模块，没有找打则返回null
	
		URL doc:
		http://icejs.org/######
	*/
	get : function ( name ) {
		return this.directions [ name ] || null;
	}
};