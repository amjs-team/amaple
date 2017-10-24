import { foreach } from "../../func/util";

/**
    diffAttrs ( newVNode: Object, oldVNode: Object, nodePatcher: Object )

    Return Type:
    void

    Description:
    对比新旧vnode的属性，将差异存入nodePatcher中

    URL doc:
    http://icejs.org/######
*/
export function diffAttrs ( newVNode, oldVNode, nodePatcher ) {
	foreach ( newVNode.attrs, ( attr, name ) => {
        if ( oldVNode.attrs [ name ] !== attr ) {
            nodePatcher.reorderAttr ( newVNode, name, attr );
        }
    } );

    //找出移除的属性
    foreach ( oldVNode.attrs, ( attr, name ) => {
        if ( !newVNode.attrs.hasOwnProperty ( name ) ) {
            nodePatcher.removeAttr ( newVNode, name );
        }
    } );
}

/**
    diffChildren ( newChildren: Array, oldChildren: Array, nodePatcher: Object )

    Return Type:
    void

    Description:
    比较新旧节点的子节点，将差异存入nodePatcher中

    URL doc:
    http://icejs.org/######
*/
export function diffChildren ( newChildren, oldChildren, nodePatcher ) {

    const oldChildrenCopy = oldChildren.concat ();
    let oldIndex = 0,
        moveItems = [],
        i = 0;

	foreach ( newChildren, ( newChild, i ) => {
		if ( oldChildrenCopy.indexOf ( newChild ) === -1 ) {
			nodePatcher.addNode ( newChild, i );

            oldChildrenCopy.splice ( i, 0, newChild );
        }
    } );

    while ( oldChildrenCopy [ i ] ) {
        if ( newChildren.indexOf ( oldChildrenCopy [ i ] ) === -1 ) {
        	
			nodePatcher.removeNode ( oldChildrenCopy [ i ], i );
            oldChildrenCopy.splice ( i, 1 );
        }
        else {
            i ++;
        }
    }

    foreach ( newChildren, ( newChild, i ) => {
        oldIndex = oldChildrenCopy.indexOf ( newChild );
        if ( oldIndex > -1 && oldIndex !== i ) {
            moveItems.push ( {
                item : newChild,
                from : oldIndex,
                to : i,
                list : oldChildrenCopy.concat ()
			} );

            oldChildrenCopy.splice ( oldIndex, 1 );
            oldChildrenCopy.splice ( i, 0, newChild );
        }
    } );
	
	foreach ( optimizeSteps ( moveItems ), move => {
    	nodePatcher.moveNode ( move.item, move.from, move.to );
    } );
}

/**
    optimizeSteps ( patches: Array )

    Return Type:
    void

    Description:
    优化步骤
    主要优化为子节点的移动步骤优化

    URL doc:
    http://icejs.org/######
*/
function optimizeSteps ( patches ) {
    let i = 0;
    while ( patches [ i ] ) {
        const 
        	step = patches [ i ],
            optimizeItems = [],
            span = step.from - step.to,
            nextStep = patches [ i + 1],

            // 合并的步骤
            mergeItems = { alternates: [], eliminates: [], previous: [] };

        if ( step.to < step.from && ( nextStep && nextStep.to === step.to + 1 && nextStep.from - nextStep.to >= span || !nextStep ) ) {
            for ( let j = step.from - 1; j >= step.to; j -- ) {

                const optimizeItem = { 
                	type : step.type, 
                	item : step.list [ j ], 
                	from : j, 
                	to : j + 1 
                };

                //向前遍历查看是否有可合并的项
                for ( let j = i - 1; j >= 0; j-- ) {
                	let mergeStep = patches [ j ];

                    // 只有一个跨度的项可以分解出来
                    if ( mergeStep.from - mergeStep.to === 1 ) {
                        mergeStep = { 
                        	type : mergeStep.type, 
                        	item : mergeStep.list [ mergeStep.to ], 
                        	from : mergeStep.to, 
                        	to : mergeStep.from 
                        };
                    }

                    if ( mergeStep.item === optimizeItem.item && mergeStep.to === optimizeItem.from ) {
                    	mergeItems.previous.push ( { 
							step : mergeStep, optimizeItem, 
                        	exchangeItems : patches.slice ( j + 1, i ).concat ( optimizeItems ) 
                        } );

                        break;
                    }
                }

                optimizeItems.push ( optimizeItem );
            }
        }
        else {
            i++;
            continue;
        }

        let toOffset = 1,
            j = i + 1,
            lastStep = step,
            mergeStep, mergeSpan;
    	
        while ( patches [ j ] ) {
            mergeStep = patches [ j ],
            mergeSpan = mergeStep.from - mergeStep.to;

            let merge = false;
            if ( step.to + toOffset === mergeStep.to ) {

                if ( mergeSpan === span ) {
                    mergeItems.eliminates.push ( mergeStep );

                    merge = true;
                    lastStep = mergeStep;
                }
                else if ( mergeSpan > span ) {
                    mergeItems.alternates.push ( mergeStep );

                    merge = true;
                    lastStep = mergeStep;
                }

                toOffset ++;
            }

            j ++;

            if ( !merge ) {
                break;
                }
            }

            // 判断是否分解进行合并，依据为合并后至少不会更多步骤
            // 合并项分为相同跨度的项、向前遍历可合并的项
            // +1是因为需算上当前合并项，但在eliminates中并没有算当前合并项
            if ( optimizeItems.length <= mergeItems.eliminates.length + mergeItems.previous.length + 1 ) {
                Array.prototype.splice.apply ( patches, [ patches.indexOf ( lastStep ) + 1, 0 ].concat ( optimizeItems ) );
                patches.splice ( i, 1 );
				
            	let mergeStep;
                foreach ( mergeItems.previous, prevItem => {
                    mergeStep = prevItem.step;

                    // 如果两个合并项之间还有其他项，则需与合并项调换位置
                    // 调换位置时，合并项的from在调换项的from与to之间（包括from与to）则合并项的from-1；调换项的to在合并项的from与to之间（包括from与to）则调换项的to+1
                	let mergeFrom, mergeTo, exchangeFrom, exchangeTo;
                    foreach ( prevItem.exchangeItems, exchangeItem => {
                    	mergeFrom = mergeStep.from;
                        mergeTo = mergeStep.to;
                        exchangeFrom = exchangeItem.from;
                        exchangeTo = exchangeItem.to;

                        if ( mergeFrom >= exchangeFrom && mergeFrom <= exchangeTo ) {
                            mergeStep.from --;
                        }
                        if ( mergeTo >= exchangeFrom && mergeTo <= exchangeTo ) {
                            mergeStep.to --;
                        }

                        if ( exchangeFrom >= mergeFrom && exchangeFrom <= mergeTo ) {
                            exchangeItem.from ++;
                        }
                        if ( exchangeTo >= mergeFrom && exchangeTo <= mergeTo ) {
                            exchangeItem.to ++;
                        }
                    } );

                    prevItem.optimizeItem.from = mergeStep.from;
                    patches.splice ( patches.indexOf ( mergeStep ), 1 );

                    // 向前合并了一个项，则i需-1，不然可能会漏掉可合并项
                    i --;
                } );

                foreach ( mergeItems.eliminates, eliminateItem => {
                    foreach ( optimizeItems, optimizeItem => {
                        optimizeItem.to ++;
                    } );

                    patches.splice ( patches.indexOf ( eliminateItem ), 1 );
                } );

                foreach ( mergeItems.alternates, alternateItem => {
                    foreach ( optimizeItems, optimizeItem => {
                        optimizeItem.to ++;
                    } );

                    alternateItem.to += optimizeItems.length;
                } );
            }
            else {
                i ++;
            }
        }

        return patches;
}