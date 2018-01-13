import slice from "../../var/slice";
import { foreach, noop, type, isPlainObject } from "../../func/util";
import cache from "../../cache/core";
import { defineReactiveProperty, transformCompName, stringToScopedVNode } from "../../func/private";
import { rexpr, rvar, noUnitHook } from "../../var/const";
import { componentErr } from "../../error";
import Subscriber from "../Subscriber";
import ValueWatcher from "../ValueWatcher";
import ViewModel from "../ViewModel";
import NodeTransaction from "../vnode/NodeTransaction";
import VFragment from "../vnode/VFragment";

const dataType = [ String, Number, Function, Boolean, Object ];

/**
    validateProp ( prop: any, validate: Object )

    Return Type:
    Boolean
    属性值是否通过验证

    Description:
    验证属性值，验证成功返回true，否则返回false

    URL doc:
    http://amaple.org/######
*/
function validateProp ( prop, validate ) {
    let isPass = false;
    const tvalidate = type ( validate );

    if ( dataType.indexOf ( validate ) >= 0 ) {

        // 类型验证
        if ( prop !== undefined && prop !== null ) {

            // 动态props的Object类型数据一般会被转换为ViewModel类型的对象
            isPass = prop.constructor === validate || prop.constructor === ViewModel;
        }
    }
    else if ( validate instanceof RegExp ) {

        // 正则表达式验证
        isPass = validate.test ( prop );
    }
    else if ( tvalidate === "array" ) {

        // 多个值的验证
        // 如果验证参数为数组，则满足数组中任意一项即通过
        foreach ( validate, v => {
            isPass = isPass || !!validateProp ( prop, v );
            if ( isPass ) {
                return false;
            }
        } );
    }
    else if ( tvalidate === "function" ) {

        // 方法验证
        isPass = validate ( prop );
    }

    return isPass;
}

export default {

    /**
        initProps ( componentNode: DOMObject, moduleVm: Object )
    
        Return Type:
        props
        转换后的属性对象
    
        Description:
        获取并初始化属性对象
    
        URL doc:
        http://amaple.org/######
    */
    initProps ( componentNode, moduleVm, propsValidator ) {
        let props = {}, match;

        foreach ( componentNode.attrs, ( attrVal, name ) => {
            
            // 属性名需符合变量的命名规则
            if ( rvar.test ( name ) ) {
                if ( match = attrVal.match ( rexpr ) ) {
                    const 
                        subs = new Subscriber (),
                        propName = match [ 1 ],
                        getter = () => {
                            return moduleVm [ propName ];
                        };

                    let propValue;

                    new ValueWatcher ( ( newVal ) => {
                        propValue = newVal;
                        subs.notify ();
                    }, getter );

                    //////////////////////////////
                    //////////////////////////////
                    //////////////////////////////
                    defineReactiveProperty ( name, () => {
                            subs.subscribe ();
                            return propValue;
                        },
                        ( newVal ) => {
                            if ( newVal !== propValue ) {
                                moduleVm [ propName ] = propValue = newVal;

                                subs.notify ();
                            }
                        }, props );
                }
                else {
                    props [ name ] = attrVal;
                }
            }
        } );

        return props;
    },

    /**
        validateProps ( props: Object, propsValidator: Object )
    
        Return Type:
        void
    
        Description:
        验证props
    
        URL doc:
        http://amaple.org/######
    */
    validateProps ( props, propsValidator ) {
        foreach ( props, ( val, name ) => {

            // 验证属性值
            const validateItem = propsValidator [ name ];
            if ( validateItem ) {
                const validate = isPlainObject ( validateItem ) ? validateItem.validate : validateItem;
                if ( validate && !validateProp ( val, validate ) ) {
                    throw componentErr ( `prop: ${ name }`, `组件传递属性'${ name }'的值未通过验证，请检查该值的正确性或修改验证规则` );
                }
            }
        } );

        // 再次检查是否为必须属性值与默认值赋值
        // 默认值不会参与验证，即使不符合验证规则也会赋值给对应属性
        foreach ( propsValidator, ( validatorItem, propName ) => {
            if ( !props [ propName ] ) {
                if ( validatorItem.require === true && validatorItem.default === undefined ) {
                    throw componentErr ( `prop:${ propName }`, `组件传递属性${ propName }为必须值` );
                }
                else if ( validatorItem.default !== undefined ) {
                    props [ propName ] = validatorItem.default;
                }
            }
        } );
    },

    /**
        initLifeCycle ( component: Object )
    
        Return Type:
        void
    
        Description:
        初始化组件对象的生命周期
    
        URL doc:
        http://amaple.org/######
    */
    initLifeCycle ( component, componentVNode, moduleObj ) {
        const lifeCycleHook = {
            update : noop,
            unmount () {

                // 在对应module.components中移除此组件
                moduleObj.components.splice ( moduleObj.components.indexOf ( component ), 1 );
                ( componentVNode.delRef || noop ) ();
            }
        };
        
        component.lifeCycle = {};
        foreach ( lifeCycleHook, ( hookFn, cycleName ) => {
            const cycleFunc = component [ cycleName ] || noop;
            component.lifeCycle [ cycleName ] = () => {
                cycleFunc.apply ( component, cache.getDependentPlugin ( cycleFunc ) );

                // 钩子函数调用
                hookFn ();
            };
        } );
    },

    /**
        initTemplate ( template: String, scopedStyle: Object )
    
        Return Type:
        void
    
        Description:
        初始化模板
        为模板添加实际的DOM结构
        为模板DOM结构添加样式
    
        URL doc:
        http://amaple.org/######
    */
    initTemplate ( template, scopedStyle ) {
        const 
            rblank = />(\s+)</g,
            rwrap = /\r?\n\s*/g;
        
        // 去除所有标签间的空格，并转义"和'符号
        template = template
        .replace ( rblank, ( match, rep ) => match
            .replace ( rep, "" ) )
        .replace ( rwrap, match => "" );

        // 为对应元素添加内嵌样式
        let num, styleString;
        const styleObject = [];
        foreach ( scopedStyle, ( styles, selector ) => {
            styleString = "";
            foreach ( styles, ( val, styleName ) => {
                num = parseInt ( val );
                styleString += `${ styleName }:${ val + ( type ( num ) === "number" && ( num >= 0 || num <= 0 ) && noUnitHook.indexOf ( styleName ) === -1 ? "px" : "" ) };`;
            } );

            styleObject.push ( { selector, content: styleString } );
        } );
        
        return stringToScopedVNode ( template, styleObject );
    },
    
    /**
        initSubElements ( componentVNode: Object, subElementNames: Object )
    
        Return Type:
        Object
        组件子元素对象
    
        Description:
        获取组件子元素并打包成局部vm的数据对象
    
        URL doc:
        http://amaple.org/######
    */
    initSubElements ( componentVNode, subElementNames ) {
        const _subElements = {
            default : ""
        };

        foreach ( subElementNames, ( multiple, subElemName ) => {
            if ( multiple === true ) {
                _subElements [ subElemName ] = [];
            }
        } );
        
        let componentName, subElemName, vf;
        foreach ( componentVNode.children.concat (), vnode => {
            componentName = transformCompName ( vnode.nodeName || "" );

            if ( subElementNames.hasOwnProperty ( componentName ) ) {
                vf = VFragment ();
                foreach ( vnode.children.concat (), subVNode => {
                    vf.appendChild ( subVNode );
                } );

                if ( subElementNames [ componentName ] === true ) {
                    _subElements [ componentName ].push ( vf );
                }
                else {
                    _subElements [ componentName ] = vf;
                }
            }
            else {
                _subElements.default = _subElements.default || VFragment ();
                _subElements.default.appendChild ( vnode );
            }
        } );
        
        return { subElements: _subElements };
    },
    
    /**
        initAction ( component: Object, actions: Object )
        
        Return Type:
        void
    
        Description:
        初始化组件行为
    
        URL doc:
        http://amaple.org/######
    */
    initAction ( component, actions ) {
        component.action = {};
        foreach ( actions, ( action, name ) => {
            if ( type ( action ) !== "function" ) {
                throw componentErr ( "actionType", `action'${ name }'不是方法，组件action返回的对象属性必须为方法，它表示此组件的行为` );
            }
            else if ( component [ name ] ) {
                throw componentErr ( "duplicate", `此组件对象上已存在名为'${ name }'的属性或方法` );
            }

            component.action [ name ] = ( ...args ) => {
                const nt = new NodeTransaction ().start ();
                action.apply ( {}, args );
                nt.commit ();
            };
        } );
    }
};