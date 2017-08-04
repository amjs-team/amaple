import { foreach } from "../../../func/util";
import { attr } from "../../../func/node";
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
    	
    	let variable   = rforWord.exec ( this.expr ),
            elem       = this.node;
  
		this.startNode = elem.ownerDocument.createTextNode ( "" );
		this.endNode   = this.startNode.cloneNode ();
		
        this.item      = variable [ 1 ];
        this.expr      = variable [ 2 ];
       	this.key       = attr ( elem, ":key" );
    
    	if ( this.key ) {
            attr ( elem, ":key", null );
        }
    
    	attr ( elem, ":for", null );
    },

    /**
        update ( iterator: Array )
    
        Return Type:
        void
    
        Description:
        “:for”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
	update ( iterator ) {
		let elem         = this.node,
            vm           = this.vm,
            parent       = elem.parentNode,
            fragment     = elem.ownerDocument.createDocumentFragment(),
            itemNode,

            // 局部变量定义
            scopedDefinition = {};
  		
        foreach ( iterator, ( item, key ) => {

            // 定义范围变量
            scopedDefinition [ this.item ] = item;
            scopedDefinition [ this.key ] = key;

            itemNode = elem.cloneNode ( true );

            // 为遍历克隆的元素挂载数据
        	new Tmpl ( itemNode ).mount ( vm, this.defineScoped ( scopedDefinition, vm ) );

        	fragment.appendChild ( itemNode );
        } );
    	
      	// 初始化视图时将模板元素替换为挂载后元素
    	if ( parent ) {
        	fragment.insertBefore ( this.startNode, fragment.firstChild );
        	fragment.appendChild ( this.endNode );
          
        	parent.replaceChild ( fragment, elem );
        }
    	
    	// 改变数据后更新视图
    	else {
        	let el = this.startNode,
                p = el.parentNode,
                removes = [];
        	while ( ( el = el.nextSibling ) !== this.endNode ) {
            	removes.push ( el );
            }
        	reomves.map ( item => {
            	p.removeChild ( item );
            } );
        	
        	p.insertBefore ( fragment, this.endNode );
        }
    }
};