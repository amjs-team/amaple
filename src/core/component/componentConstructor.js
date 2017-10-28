import slice from "../../var/slice";
import { foreach, noop, type, isPlainObject } from "../../func/util";
import { query } from "../../func/node";
import { defineReactiveProperty, transformCompName } from "../../func/private";
import { rexpr, rvar } from "../../var/const";
import { componentErr } from "../../error";
import { noUnitHook } from "../../var/const";
import Subscriber from "../Subscriber";
import ValueWatcher from "../ValueWatcher";
import VNode from "../vnode/VNode";
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
    http://icejs.org/######
*/
function validateProp ( prop, validate ) {
    let isPass = false;
    const tvalidate = type ( validate );

    // 类型验证
    if ( dataType.indexOf ( validate ) >= 0 ) {
        isPass = prop.constructor === validate;
    }

    // 正则表达式验证
    else if ( validate instanceof RegExp ) {
        isPass = validate.test ( prop );
    }

    // 多个值的验证
    else if ( tvalidate === "array" ) {

        // 如果验证参数为数组，则满足数组中任意一项即通过
        foreach ( validate, v => {
            isPass = isPass || !!validateProp ( prop, v );
            if ( isPass ) {
                return false;
            }
        } );
    }

    // 方法验证
    else if ( tvalidate === "function" ) {
        isPass = validate ( prop );
    }

    return isPass;
}

export default {

    /**
        initProps ( componentNode: DOMObject, moduleVm: Object, propsValidator: Object )
    
        Return Type:
        props
        转换后的属性对象
    
        Description:
        获取并初始化属性对象
    
        URL doc:
        http://icejs.org/######
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

                // 验证属性值
                const validateItem = propsValidator && propsValidator [ name ];
                if ( validateItem ) {
                    const validate = isPlainObject ( validateItem ) ? validateItem.validate : validateItem;
                    if ( validate && !validateProp ( props [ name ], validate ) ) {
                        throw componentErr ( `prop: ${ name }`, `组件传递属性'${ name }'的值未通过验证，请检查该值的正确性或修改验证规则` );
                    }
                }
            }
        } );

        // 再次检查是否为必须属性值与默认值赋值
        // 默认值不会参与验证，即使不符合验证规则也会赋值给对应属性
        foreach ( propsValidator, ( validatorItem, propName ) => {
            if ( !props [ propName ] ) {
                if ( validatorItem.require === true && validatorItem.default === undefined ) {
                    throw componentErr ( "prop:" + propName, "组件传递属性" + propName + "为必须值" );
                }
                else if ( validatorItem.default !== undefined ) {
                    props [ propName ] = validatorItem.default;
                }
            }
        } );

        return props;
    },

    /**
        initLifeCycle ( component: Object )
    
        Return Type:
        void
    
        Description:
        初始化组件对象的生命周期
    
        URL doc:
        http://icejs.org/######
    */
    initLifeCycle ( component, moduleObj ) {
        const lifeCycleHook = {
            update : noop,
            unmount () {

                // 在对应module.components中移除此组件
                moduleObj.components.splice ( moduleObj.components.indexOf ( component ), 1 );

                // 如果在module.refs中存在也一并移除
                component.refUnmountFn ();
            }
        };
            
        foreach ( lifeCycleHook, ( hookFn, cycleName ) => {
            component [ cycleName ] = () => {
                ( component [ cycleName ] || noop ).apply ( component, cache.getDependentPlugib ( component [ cycleName ] || noop ) );

                // 钩子函数调用
                hookFn ();
            }
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
        http://icejs.org/######
    */
    initTemplate ( template, scopedStyle ) {
        const 
            d = document.createElement ( "div" ),
            f = document.createDocumentFragment ();
        
        d.innerHTML = template;

        // 为对应元素添加内嵌样式
        let num;
        foreach ( scopedStyle, ( styles, selector ) => {
            foreach ( query ( selector, d, true ), elem => {
                foreach ( styles, ( val, styleName ) => {
                    num = parseInt ( val );
                    elem.style [ styleName ] += val + ( type ( num ) === "number" && ( num >= 0 || num <= 0 ) && noUnitHook.indexOf ( styleName ) === -1 ? "px" : "" );
                } );
            } );
        } );
        
        foreach ( slice.call ( d.childNodes ), child => {
            f.appendChild ( child );
        } );
    
        return VNode.domToVNode ( f );
    },
    
    /**
        initSubElements ( componentVNode: Object, subElementNames: Object )
    
        Return Type:
        Object
        组件子元素对象
    
        Description:
        获取组件子元素并打包成局部vm的数据对象
    
        URL doc:
        http://icejs.org/######
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
        foreach ( componentVNode.children, vnode => {
            componentName = transformCompName ( vnode.nodeName || "" );

            if ( subElementNames.hasOwnProperty ( componentName ) ) {
                vf = VFragment ();
                foreach ( vnode.children, subVNode => {
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
                _subElements.default.appendChild ( node );
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
        http://icejs.org/######
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
                action.apply ( component, args );
            };
        } );

        // caller.action = actions;
    }
};