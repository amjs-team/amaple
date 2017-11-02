import { extend, foreach, noop, type } from "../../func/util";
import { transformCompName } from "../../func/private";
import { rcomponentName } from "../../var/const";
import { componentErr } from "../../error";
import slice from "../../var/slice";
import check from "../../check";
import ViewModel from "../ViewModel";
import componentConstructor from "./componentConstructor";
import Tmpl from "../tmpl/Tmpl";
import cache from "../../cache/core";

export default function Component () {

	// check
	check ( this.init ).type ( "function" ).ifNot ( "component:" + this.constructor.name, "component derivative必须定义init方法" ).do ();
    check ( this.render ).type ( "function" ).ifNot ( "component:" + this.constructor.name, "component derivative必须定义render方法，因为组件必须存在组件模板HTML" ).do ();
}

extend ( Component.prototype, {
	
    /**
        __init__ ( componentVNode: Object, moduleObj: Object )
    
        Return Type:
        void
    
        Description:
        初始化一个对应的组件对象
    
        URL doc:
        http://icejs.org/######
    */
	__init__ ( componentVNode, moduleObj ) {
        let isCallPropsType = false;
    	
    	//////////////////////////////////////////
    	// 获取init方法返回值并初始化vm数据
        // 构造属性验证获取器获取属性验证参数
        this.propsType = ( validator ) => {
            isCallPropsType = true;

            // 获取props，如果有需要则验证它们
            this.props = componentConstructor.initProps ( componentVNode, moduleObj.state, validator || {} );
        };

        // 没有验证时手动调用初始化props
        if ( !isCallPropsType ) {
            this.propsType ();
        }

		const componentVm = new ViewModel ( this.init.apply ( this, cache.getDependentPlugin ( this.init ) ) );
        delete this.propsType;

        this.state = componentVm;

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

		// 处理模块并挂载数据
		const 
            vfragment = componentConstructor.initTemplate ( componentString, scopedStyle ),
            subElements = componentConstructor.initSubElements ( componentVNode, subElementNames ),
            tmpl = new Tmpl ( componentVm, this.components || [], this ),
            vfragmentBackup = vfragment.clone ();
    	
		tmpl.mount ( vfragment, false, Tmpl.defineScoped ( subElements, componentVNode, false ) );

		// 保存组件对象和结构
    	componentVNode.component = this;
    	componentVNode.templateNodes = vfragment.children.concat ();

		// 调用mounted钩子函数
		( this.mounted || noop ).apply ( this, cache.getDependentPlugin ( this.mounted || noop ) );

    	// 初始化action
    	if ( this.action ) {
    		const actions = this.action.apply ( this, cache.getDependentPlugin ( this.action ) );
    		componentConstructor.initAction ( this, actions );
    	}
    	
    	// 如果有saveRef方法则表示此组件需被引用
        ( componentVNode.saveRef || noop ) ( this.action ) || noop;

        // 初始化生命周期
        componentConstructor.initLifeCycle ( this, moduleObj );

    	// 组件初始化完成，调用apply钩子函数
    	( this.apply || noop ).apply ( this, cache.getDependentPlugin ( this.apply || noop ) );

        vfragment.diff ( vfragmentBackup ).patch ();
    },
	
    /**
        depComponents ( comps: Array )
    
        Return Type:
        void
    
        Description:
        指定此组件模板内的依赖组件类
    
        URL doc:
        http://icejs.org/######
    */
	depComponents ( ...comps ) {
    	this.components = [];
    	
    	foreach ( comps, comp => {
        	if ( comp && comp.__proto__.name === "Component" ) {
            	this.components.push ( comp );
            }
        	else if ( type ( comp ) === "string" ) {
            	const compObj = cache.getComponent ( comp );
            	if ( compObj && compObj.__proto__.name === "Component" ) {
           			this.components.push ( compObj );
                }
            }
        } );
    }
} );

extend ( Component, {

    // 全局组件类
    // 所有的模板内都可以在不指定组件的情况下使用
	globalClass : {},

    /**
        defineGlobal ( componentDerivative: Function|Class )
    
        Return Type:
        void
    
        Description:
        定义一个全局组件
        组件对象必须为一个方法(或一个类)
    
        URL doc:
        http://icejs.org/######
    */
	defineGlobal ( componentDerivative ) {
		globalClass [ componentDerivative.name ] = componentDerivative;
	},

    /**
        getGlobal ( name: String )
    
        Return Type:
        Function|Class
        对应的组件类
    
        Description:
        通过组件类名获取对应的组件类
    
        URL doc:
        http://icejs.org/######
    */
	getGlobal ( name ) {
		return this.globalClass [ name ];
	}
} );