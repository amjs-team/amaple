import { foreach } from "../../func/util";
import { transformCompName } from "../../func/private";
import { rexpr } from "../../var/const";
import { runtimeErr } from "../../error";
import Tmpl from "./Tmpl";
import Component from "../component/core";

/**
    preTreat ( vnode: Object )

    Return Type:
    Object
    处理后的元素对象

    Description:
    元素预处理
    主要对“:if”、“:for”两个指令的特殊处理

    URL doc:
    http://icejs.org/######
*/
function preTreat ( vnode ) {

    const
        _if = Tmpl.directivePrefix + "if",
        _elseif = Tmpl.directivePrefix + "else-if",
        _else = Tmpl.directivePrefix + "else";

    let nextSib, parent, 
        condition = vnode.attr ( _if );

    if ( condition && !vnode.conditionElems ) {
        const conditionElems = [ vnode ];

        vnode.conditions = [ condition ];
        vnode.conditionElems = conditionElems;
        parent = vnode.parent;
        while ( nextSib = vnode.nextSibling () ) {
            if ( condition = nextSib.attr ( _elseif ) ) {
                nextSib.conditionElems = conditionElems;
                vnode.conditions.push ( condition );
                vnode.conditionElems.push ( nextSib );
                nextSib.attr ( _elseif, null );
                parent.removeChild ( nextSib );
            }
            else if ( nextSib.attrs.hasOwnProperty ( _else ) ) {
                nextSib.conditionElems = conditionElems;
                vnode.conditions.push ( "true" );
                vnode.conditionElems.push ( nextSib );
                nextSib.attr ( _else, null );
                parent.removeChild ( nextSib );
                break;
            }
            else {
                break;
            }
        }
    }
    
    return vnode;
}

/**
    concatHandler ( target: Object, source: Object )

    Return Type:
    Object
    合并后的compileHandlers

    Description:
    合并compileHandlers

    URL doc:
    http://icejs.org/######
*/
function concatHandler ( target, source ) {
	const concats = {};
	
	concats.watchers = target.watchers.concat ( source.watchers );
	concats.components = target.components.concat ( source.components );
    concats.templates = target.templates.concat ( source.templates );

	return concats;
}

/**
    mountVNode ( vnode: Object, tmpl: Object, mountModule: Boolean, isRoot: Boolean )

    Return Type:
    Object
	需监听元素，需渲染组件及需转换的template的集合

    Description:
    遍历vnode
    通过遍历获取需监听元素，需渲染组件及需转换的template

    URL doc:
    http://icejs.org/######
*/
export default function mountVNode ( vnode, tmpl, mountModule, isRoot = true ) {
	const rattr = /^:([\$\w]+)$/;

	let directive, handler, targetNode, expr, forAttrValue, firstChild,
		compileHandlers = {
			watchers : [],
			components : [],
			templates : []
		};

	do {
	   if ( vnode.nodeType === 1 && mountModule ) {
	       
			// 处理:for
			// 处理:if :else-if :else
			// 处理{{ expression }}
			// 处理:on
			// 处理:model
			vnode = preTreat ( vnode );
				if ( forAttrValue = vnode.attr ( Tmpl.directivePrefix + "for" ) ) {
				compileHandlers.watchers.push ( { handler : Tmpl.directives.for, targetNode : vnode, expr : forAttrValue } );
			}
			else {
				if ( vnode.nodeName === "TEMPLATE" ) {
					compileHandlers.templates.push ( vnode );
				}
				else {

					// 收集组件元素待渲染
					// 局部没有找到组件则查找全局组件
					const 
				   		componentName = transformCompName ( vnode.nodeName ),
				   		ComponentDerivative = tmpl.getComponent ( componentName ) || Component.getGlobal ( componentName );
					if ( ComponentDerivative && ComponentDerivative.__proto__.name === "Component" ) {
						compileHandlers.components.push ( { vnode, Class : ComponentDerivative } );
				   		vnode.isComponent = true;
					}
				}
			   
				foreach ( vnode.attrs, ( attr, name ) => {
					directive = rattr.exec ( name );
					if ( directive ) {
						directive = directive [ 1 ];
						if ( /^on/.test ( directive ) ) {

							// 事件绑定
							handler = Tmpl.directives.on;
							targetNode = vnode,
							expr = `${ directive.slice ( 2 ) }:${ attr }`;
						}
						else if ( Tmpl.directives [ directive ] ) {

							// 模板属性绑定
							handler = Tmpl.directives [ directive ];
							targetNode = vnode;
							expr = attr;
						}
						else {

							// 没有找到该指令
							throw runtimeErr ( "directive", "没有找到\"" + directive + "\"指令或表达式" );
						}

						compileHandlers.watchers.push ( { handler, targetNode, expr } );
					}
					else if ( rexpr.test ( attr ) && !vnode.isComponent ) {

						// 属性值表达式绑定
						compileHandlers.watchers.push ( { handler: Tmpl.directives.attrExpr, targetNode : vnode, expr : `${ name }:${ attr }` } );
					}
				} );
			}
		}
		else if ( vnode.nodeType === 3 ) {

			// 文本节点表达式绑定
			if ( rexpr.test ( vnode.nodeValue ) ) {
				compileHandlers.watchers.push ( { handler : Tmpl.directives.textExpr, targetNode : vnode, expr : vnode.nodeValue } );
			}
		}

		firstChild = vnode.children && vnode.children [ 0 ];
		if ( firstChild && !forAttrValue ) {
			compileHandlers = concatHandler ( compileHandlers, mountVNode ( firstChild, tmpl, true, false ) );
		}
	} while ( !isRoot && ( vnode = vnode.nextSibling () ) )

	return compileHandlers;
}