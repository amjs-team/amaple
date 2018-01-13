import { extend, foreach, noop, type, isEmpty } from "../../func/util";
import { clear } from "../../func/node";
import { transformCompName, getFunctionName, getReference } from "../../func/private";
import { rcomponentName } from "../../var/const";
import { componentErr } from "../../error";
import slice from "../../var/slice";
import check from "../../check";
import ViewModel from "../ViewModel";
import componentConstructor from "./componentConstructor";
import Tmpl from "../../compiler/tmpl/core";
import cache from "../../cache/core";
import NodeTransaction from "../vnode/NodeTransaction";

// 全局组件类
// 所有的模板内都可以在不指定组件的情况下使用
const globalClass = {};

/**
    getGlobal ( name: String )

    Return Type:
    Function|Class
    对应的组件类

    Description:
    通过组件类名获取对应的组件类

    URL doc:
    http://amaple.org/######
*/
export function getGlobal ( name ) {
    return globalClass [ name ];
}

export default function Component () {
    if ( !this || getFunctionName ( this.constructor ) === "Component" ) {
        throw componentErr ( "create", "Component类只能由另一个类继承，而不允许直接调用或创建对象" );
    }

	// check
	check ( this.init ).type ( "function" ).ifNot ( "component:" + getFunctionName ( this.constructor ), "component derivative必须定义init方法" ).do ();
    check ( this.render ).type ( "function" ).ifNot ( "component:" + getFunctionName ( this.constructor ), "component derivative必须定义render方法，因为组件必须存在组件模板HTML" ).do ();
}

extend ( Component.prototype, {
	
    /**
        __init__ ( componentVNode: Object, moduleObj: Object )
    
        Return Type:
        void
    
        Description:
        初始化一个对应的组件对象
    
        URL doc:
        http://amaple.org/######
    */
	__init__ ( componentVNode, moduleObj ) {
    	
        // 初始化props
        this.props = componentConstructor.initProps ( componentVNode, moduleObj.state );

    	//////////////////////////////////////////
    	// 获取init方法返回值并初始化vm数据
        // 构造属性验证获取器获取属性验证参数
        this.propsType = validator => {
            componentConstructor.validateProps ( this.props, validator || {} );
        };

		const componentVm = new ViewModel ( this.init.apply ( this, cache.getDependentPlugin ( this.init ) ) );
        this.state = componentVm;

        delete this.propsType;

    	/////////////////////
    	// 转换组件代表元素为实际的组件元素节点
        let componentString, scopedStyle,
            subElementNames = {};

		// 构造模板和样式的获取器获取模板和样式
		this.template = str => {
			componentString = str || "";
        	return this;
		};

		this.style = obj => {
			scopedStyle = obj || {};
            return this;
		};
        	
        this.subElements = ( ...elemNames ) => {
            foreach ( elemNames, nameObj => {
                if ( type ( nameObj ) === "string" ) {
                    nameObj = { elem : nameObj, multiple: false };
                }
                if ( !rcomponentName.test ( nameObj.elem ) ) {
                    throw componentErr ( "subElements", "组件子元素名\"" + nameObj.elem + "\"定义错误，组件子元素名的定义规则与组件名相同，需遵循首字母大写的驼峰式" );
                }
                subElementNames [ nameObj.elem ] = nameObj.multiple;
            } );

            return this;
        };

		this.render.apply ( this, cache.getDependentPlugin ( this.render ) );

		delete this.template;
    	delete this.style;
    	delete this.subElements;

        // 验证组件类
        this.depComponents = this.depComponents || [];
        foreach ( this.depComponents, comp => {
            if ( comp && getFunctionName ( comp.__proto__ ) !== "Component" ) {
                throw componentErr ( "depComponents", `组件"${ getFunctionName ( this.constructor ) }"内错误的依赖组件对象，请确保依赖组件为一个组件衍生类` );
            }
        } );

		// 处理模块并挂载数据
		const 
            vfragment = componentConstructor.initTemplate ( componentString, scopedStyle ),
            subElements = componentConstructor.initSubElements ( componentVNode, subElementNames ),
            tmpl = new Tmpl ( componentVm, this.depComponents, this );

        // 先清空后再添加上去进行对比
        // 避免造成if、else-if、for指令在对比时出错
        // vfragmentBackup.clear ();
        // clear ( vfragmentBackup.node );

        // 解析组件并挂载数据
        this.references = {};
        tmpl.mount ( vfragment, false, Tmpl.defineScoped ( subElements, componentVNode, false ) );

        // 保存组件对象和结构
        componentVNode.component = this;
        componentVNode.templateNodes = vfragment.children.concat ();
    	tmpl.moduleNode = componentVNode;

        // 初始化action
        if ( this.action ) {
            const actions = this.action.apply ( this, cache.getDependentPlugin ( this.action ) );
            componentConstructor.initAction ( this, actions );
        }
        else {
            this.action = {};
        }

		// 调用mounted钩子函数
		( this.mounted || noop ).apply ( this, cache.getDependentPlugin ( this.mounted || noop ) );

        // 初始化生命周期
        componentConstructor.initLifeCycle ( this, componentVNode, moduleObj );
        // vfragment.diff ( vfragmentBackup ).patch ();
    },

    /**
        __update__ ()
    
        Return Type:
        void
    
        Description:
        组件生命周期hook
        当该模块位置更新时时调用
    
        URL doc:
        http://amaple.org/######
    */
    __update__ () {
        const nt = new NodeTransaction ().start ();
        this.lifeCycle.update ();
        nt.commit ();
    },

    /**
        __unmount__ ()
    
        Return Type:
        void
    
        Description:
        组件生命周期hook
        当该模块卸载时时调用
    
        URL doc:
        http://amaple.org/######
    */
    __unmount__ () {
        if ( !isEmpty ( this.components ) ) {
            foreach ( this.components, comp => {
                comp.__unmount__ ();
            } );
        }

        this.lifeCycle.unmount ();
    },

    /**
        refs ( ref: String )
    
        Return Type:
        DOMObject|Object
        被引用的组件行为对象或元素
        
        Description:
        获取被引用的组件行为对象或元素
        当组件不可见时返回undefined
    
        URL doc:
        http://amaple.org/######
    */
    refs ( ref ) {
        return getReference ( this.references, ref );
    }
} );

extend ( Component, {

    /**
        defineGlobal ( componentDerivative: Function|Class )
    
        Return Type:
        void
    
        Description:
        定义一个全局组件
        组件对象必须为一个方法(或一个类)
    
        URL doc:
        http://amaple.org/######
    */
	defineGlobal ( componentDerivative ) {
        check ( getFunctionName ( componentDerivative.constructor ) ).be ( "Component" ).ifNot ( "Component.defineGlobal", "参数componentDerivative必须为继承ice.Component的组件衍生类" );
		this.globalClass [ getFunctionName ( componentDerivative ) ] = componentDerivative;
	}
} );