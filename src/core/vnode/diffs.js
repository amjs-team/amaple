import { foreach } from "../../func/util";
import optimizeSteps from "./optimizeSteps";

/**
    createChildrenList ( oldChildren: Array, newChildren: Array )

    Return Type:
    Number
    以新节点构成的每一步生成的节点列表

    Description:
    为移动节点信息创建当前移动步骤所生成的以新节点构成（如果有的话）的list数组
    移动节点所输出的移动信息中的list需使用新节点（如果有的话）
    因为在移动步骤优化中合并步骤时将在list数组中获取合并信息
    当list中的信息为oldChildren中的信息时，如果移动节点内部也有更新dom就会导致更新无法看见

    URL doc:
    http://amaple.org/######
*/
function createChildrenList ( oldChildren, newChildren ) {
    const list = [];
    foreach ( oldChildren, oldChild => {
        let isFind = false;
        foreach ( newChildren, newChild => {
            if ( oldChild.key === newChild.key ) {
                isFind = true;
                list.push ( newChild );
                return false;
            }
        } );

        if ( !isFind ) {
            list.push ( oldChild );
        }
    } );

    return list;
}

/**
    getInsertIndex ( index: Number, children: Array )

    Return Type:
    Number
    插入元素的位置索引

    Description:
    获取元素插入的位置索引
    因为插入前的元素中可能有组件元素，组件元素渲染为对应实际dom时可能有多个，所以需判断前面的组件元素，并加上他们的模板元素数量

    URL doc:
    http://amaple.org/######
*/
export function getInsertIndex ( index, children ) {
    let insertIndex = 0;

    for ( let i = 0; i < index; i ++ ) {
        if ( children [ i ].templateNodes ) {
            insertIndex += children [ i ].templateNodes.length;
        }
        else {
            insertIndex ++;
        }
    }

    return insertIndex;
}

/**
    diffAttrs ( newVNode: Object, oldVNode: Object, nodePatcher: Object )

    Return Type:
    void

    Description:
    对比新旧vnode的属性，将差异存入nodePatcher中

    URL doc:
    http://amaple.org/######
*/
export function diffAttrs ( newVNode, oldVNode, nodePatcher ) {
	foreach ( newVNode.attrs, ( attr, name ) => {
        if ( oldVNode.attrs [ name ] !== attr ) {

            // 新旧节点的属性对比出来后的差异需在新vnode上修改，移除时同理
            nodePatcher.reorderAttr ( newVNode, name, attr );
        }
    } );

    //找出移除的属性
    foreach ( oldVNode.attrs, ( attr, name ) => {
        if ( !Object.prototype.hasOwnProperty.call ( newVNode.attrs, name ) ) {
            nodePatcher.removeAttr ( newVNode, name );
        }
    } );
}

/**
    diffEvents ( newVNode: Object, oldVNode: Object, nodePatcher: Object )

    Return Type:
    void

    Description:
    对比新旧vnode的事件，将差异存入nodePatcher中
    ！！！场景需要，暂不实现卸载事件的功能

    URL doc:
    http://amaple.org/######
*/
export function diffEvents ( newVNode, oldVNode, nodePatcher ) {

    if ( !oldVNode.events ) {

        // 绑定新vnode上的所有事件
        foreach ( newVNode.events, ( handlers, type ) => {
            nodePatcher.addEvents ( newVNode, type, handlers );
        } );
    }
    else {
        let addHandlers;
        foreach ( newVNode.events, ( handlers, type ) => {

            addHandlers = [];
            if ( oldVNode.events.hasOwnProperty ( type ) ) {
                foreach ( handlers, handler => {
                    if ( oldVNode.events [ type ].indexOf ( handler ) === -1 ) {
                        addHandlers.push ( handler );
                    }
                } );
            }
            else {
                addHandlers = handlers;
            }

            // 存在没有绑定的时间方法时才绑定
            if ( addHandlers.length > 0 ) {
                nodePatcher.addEvents ( newVNode, type, addHandlers );
            }
        } );
    }
}

/**
    indexOf ( children: Array, searchNode: Object )

    Return Type:
    Number
    查找的node在children数组中的位置，如果没有找打则返回-1

    Description:
    获取查找的node在children数组中的位置，如果没有找打则返回-1

    URL doc:
    http://amaple.org/######
*/
function indexOf ( children, searchNode ) {
	let index = -1;
    foreach ( children, ( child, i ) => {
        if ( child.key === searchNode.key ) {
            index = i;
            return false;
        }
    } );
	
	return index;
}

/**
    diffChildren ( newChildren: Array, oldChildren: Array, nodePatcher: Object )

    Return Type:
    void

    Description:
    比较新旧节点的子节点，将差异存入nodePatcher中

    URL doc:
    http://amaple.org/######
*/
export function diffChildren ( newChildren, oldChildren, nodePatcher ) {

    if ( oldChildren && oldChildren.length > 0 && ( !newChildren || newChildren.length <= 0 ) ) {
        foreach ( oldChildren, oldChild => {
            nodePatcher.removeNode ( oldChild );
        } );
    }
    else if ( newChildren && newChildren.length > 0 && ( !oldChildren || oldChildren.length <= 0 ) ) {
        foreach ( newChildren, ( newChild, i ) => {
            nodePatcher.addNode ( newChild, getInsertIndex ( i, newChildren ) );
        } );
    }
    else if ( newChildren && newChildren.length > 0 && oldChildren && oldChildren.length > 0 ) {

        let keyType = newChildren [ 0 ] && newChildren [ 0 ].key === undefined ? 0 : 1,
            obj = { keyType, children : [] };

        const 
            newNodeClassification = [ obj ],
            oldNodeClassification = [];

        // 将新节点按有没有key进行分类
        foreach ( newChildren, newChild => {

            // key为undefined的分类
            if ( keyType === 0 ) {
                if ( newChild.key === undefined ) {
                    obj.children.push ( newChild );
                }
                else {
                    keyType = 1;
                    obj = { keyType, children : [ newChild ] };
                    newNodeClassification.push ( obj );
                }
            }
            else if ( keyType === 1 ) {

                // key为undefined的分类
                if ( newChild.key !== undefined ) {
                    obj.children.push ( newChild );
                }
                else {
                    keyType = 0;
                    obj = { keyType, children : [ newChild ] };
                    newNodeClassification.push ( obj );
                }
            }
        } );

        // 将旧节点按有没有key进行分类
        keyType = oldChildren [ 0 ] && oldChildren [ 0 ].key === undefined ? 0 : 1;
        obj = { keyType, children : [] };
        oldNodeClassification.push ( obj );
        foreach ( oldChildren, oldChild => {

            // key为undefined的分类
            if ( keyType === 0 ) {
                if ( oldChild.key === undefined ) {
                    obj.children.push ( oldChild );
                }
                else {
                    keyType = 1;
                    obj = { keyType, children : [ oldChild ] };
                    oldNodeClassification.push ( obj );
                }
            }
            else if ( keyType === 1 ) {

                // key为undefined的分类
                if ( oldChild.key !== undefined ) {
                    obj.children.push ( oldChild );
                }
                else {
                    keyType = 0;
                    obj = { keyType, children : [ oldChild ] };
                    oldNodeClassification.push ( obj );
                }
            }
        } );


        // 对每个分类的新旧节点进行对比
        let moveItems, oldIndex, oldChildrenCopy, oldItem,
            offset = 0;
        foreach ( newNodeClassification,  ( newItem, i ) => {
            oldItem = oldNodeClassification [ i ] || { children : [] };

            if ( newItem.keyType === 0 ) {

                // key为undefined时直接对比同位置的两个节点
                foreach ( newItem.children, ( newChild, j ) => {
                    nodePatcher.concat ( newChild.diff ( oldItem.children [ j ] ) );
                } );

                // 如果旧节点数量比新节点多，则移除旧节点中多出的节点
                if ( newItem.children.length < oldItem.children.length ) {
                    for ( let j = newItem.children.length; j < oldItem.children.length; j ++ ) {
                        nodePatcher.removeNode ( oldItem.children [ j ] );
                    }
                }
            }
            else if ( newItem.keyType === 1 ) {

                // key不为undefined时需对比节点增加、移除及移动
                oldChildrenCopy = oldItem.children;
                
                // 对比有无增加节点
                foreach ( newItem.children, ( newChild, j ) => {
                    if ( indexOf ( oldChildrenCopy, newChild ) === -1 ) {
                        nodePatcher.addNode ( newChild, getInsertIndex ( j, newItem.children ) + offset );

                        oldChildrenCopy.splice ( j, 0, newChild );
                    }
                } );
                
                // 对比有无移除节点
                let k = 0;
                while ( oldChildrenCopy [ k ] ) {
                    if ( indexOf ( newItem.children, oldChildrenCopy [ k ] ) === -1 ) {
                        nodePatcher.removeNode ( oldChildrenCopy [ k ] );
                        oldChildrenCopy.splice ( k, 1 );
                    }
                    else {
                        k ++;
                    }
                }

                moveItems = [];
                oldIndex = 0;
                foreach ( newItem.children, ( newChild, j ) => {
                    oldIndex = indexOf ( oldChildrenCopy, newChild );
                    if ( oldIndex > -1 ) {
                        nodePatcher.concat ( newChild.diff ( oldChildrenCopy [ oldIndex ] ) );
                        if ( oldIndex !== j ) {
                            moveItems.push ( {
                                item : newChild,
                                from : oldIndex,
                                to : getInsertIndex ( j, oldChildrenCopy ),
                                list : createChildrenList ( oldChildrenCopy, newItem.children )
                            } );

                            oldChildrenCopy.splice ( oldIndex, 1 );
                            oldChildrenCopy.splice ( j, 0, newChild );
                        }
                    }
                } );
                
                foreach ( optimizeSteps ( moveItems ), move => { 


                    nodePatcher.moveNode ( move.item, move.to + offset );
                } );
            }

            offset += getInsertIndex ( newItem.children.length, newItem.children );
        } );
    }
}