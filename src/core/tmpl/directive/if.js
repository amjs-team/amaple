import { attr } from "../../../func/node";
import { foreach, type } from "../../../func/util";
import slice from "../../../var/slice";
import Tmpl from "../Tmpl";

Tmpl.defineDirective ( {
	name : "if",

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
		let elem = this.node;
		
    	this.expr = "[" + elem.conditions.join ( "," ) + "]";
    	this.replacement = elem.ownerDocument.createTextNode ( "" );

        // 将elem在DOM结构中去掉，以便在下面循环扫描时不会扫描到elem的nextSibling元素
        elem.parentNode.replaceChild ( this.replacement, elem );
        this.currentNode = this.replacement;
      
    	foreach ( elem.conditionElems, nextSib => {
            if ( nextSib !== elem ) {
                this.tmpl.mount ( nextSib, true, this.scoped );
            }
        } );
    },

    /**
        update ( conditions: Array )
    
        Return Type:
        void
    
        Description:
        “:if”属性对应的视图更新方法
        初始化挂载数据时和对应数据更新时将会被调用
    
        URL doc:
        http://icejs.org/######
    */
	update ( conditions ) {

        // 当元素为组件元素时纠正当前节点的指向问题
        // 因为在组件初始化时替换了当前在DOM树上的组件元素导致当前节点变量指向错误
        if ( this.node.isComponent && this.currentNode === this.node && !this.node.parentNode ) {
            this.currentNode = this.node.templateNodes;
        }

		const 
            elem = this.node,
            conditionElems = elem.conditionElems,
            cNode = this.currentNode,
            tcurNode = type ( cNode ) === "array",
            parent = ( tcurNode ? cNode [ 0 ] : cNode ).parentNode;

        let newNode, _cNode;

        foreach ( conditions, ( cond, i ) => {
        	if ( cond ) {
                if ( conditionElems [ i ].templateNodes ) {
                    const f = elem.ownerDocument.createDocumentFragment ();
                    foreach ( conditionElems [ i ].templateNodes, node => {
                        if ( node.parentNode !== parent ) {
                            f.appendChild ( node );
                        }
                        else {
                            return false;
                        }
                    } );

                    newNode = f;
                }
                else {
                    newNode = conditionElems [ i ];
                }
            	return false;
            }
        } );
        
        // 当新节点为fragment对象但没有子节点时表示已显示节点即为需显示节点
        // 当新节点为空时表示没有找到符合条件的节点，则不显示任何节点（即显示replacement空文本节点）
        if ( newNode && newNode.nodeType === 11 ) {
            if ( newNode.childNodes.length <= 0 ) {
                newNode = null;
            }
            else {
                _cNode = slice.call ( newNode.childNodes );
            }
        }
        else if ( !newNode ) {
            newNode = this.replacement;
            _cNode = newNode;
        }
        else {
            _cNode = newNode;
        }
    
    	if ( newNode && !newNode.parentNode ) {

            // 当前显示节点为<template>内容
            if ( tcurNode ) {
                parent.insertBefore ( newNode, cNode [ 0 ] );
                foreach ( cNode, node => {
                    parent.removeChild ( node );
                } );
            }
            else {
                parent.replaceChild ( newNode, cNode );
            }

            this.currentNode = _cNode;
        }
    }
} );