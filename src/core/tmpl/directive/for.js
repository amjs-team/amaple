import { foreach } from "../../../func/util";
import { attr } from "../../../func/attr";
import Tmpl from "../Tmpl";

const rforWord = /^\s*([$\w]+)\s+in\s+([$\w]+)\s*$/;

export default {

    /**
        before ()
    
        Return Type:
        void|Boolean
        返回false时停止往下执行
    
        Description:
        更新视图前调用（即update方法调用前调用）
        此方法只会在初始化挂载数据时调用一次
    
        URL doc:
        http://icejs.org/######
    */
	before () {
    	attr ( this.elem, ":for", null );
    	
    	let doc = this.elem.ownerDocument,
        	variable = rforWord.exec ( this.expr );
  
		this.startNode = doc.createTextNode ( "" );
		this.endNode = this.startNode.cloneNode ();
		

        this.item = variable [ 1 ];
        this.expr = variable [ 2 ];
    },

    /**
        update ( array: Array )
    
        Return Type:
        void
    
        Description:
        “:for”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
	update ( array ) {
		let elem = this.node,
            doc = elem.ownerDocument;
            f = doc.createDocumentFragment(),
            scopedVm = {},
            keyName = attr ( elem, ":key" ),
            itemNode;

        if ( keyName ) {
            attr ( elem, ":key", null );
        }
  		
		f.appendChild ( this.startNode );
        foreach ( array, ( item, key ) => {

            // 如果指定了:key属性，则为此属性值赋值
            if ( keyName ) {
                scopedVm [ keyName ] = key;
            }

            // 为遍历项赋值
            scopedVm [ this.item ] = item;

            itemNode = elem.cloneNode ( true );
            Tmpl.mountElem ( itemNode, scopedVm );
            Tmpl.mountElem ( itemNode, this.vm );

        	f.appendChild ( itemNode );
        } );
        
        f.appendChild ( this.endNode );
    }
};