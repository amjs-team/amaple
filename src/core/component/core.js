import { extend, foreach, noop, type } from "../../func/util";
import { matchFnArgs, transformCompName } from "../../func/private";
import { rcomponentName } from "../../var/const";
import check from "../../check";
import ModuleCaller from "../ModuleCaller";
import ViewModel from "../ViewModel";
import moduleConstructor from "../moduleConstructor";
import Tmpl from "../tmpl/Tmpl";
import cache from "../../cache/core";

export default function Component () {

	// check
	check ( this.init ).type ( "function" ).ifNot ( "component:" + this.constructor.name, "component derivative必须带有init方法" ).do ();
	
	// 1、创建Caller
	const
    	caller = this.caller = new ModuleCaller ();
}

extend ( Component.prototype, {
	
	__init__ ( componentNode, moduleVm ) {
		let propsValidator, componentString, scopedStyle;
    	
    	if ( type ( this.validateProps ) === "function" ) {

    		// 构造属性验证获取器获取属性验证参数
    		this.caller.set ( {
    			propsType ( validator ) {
    				propsValidator = validator || {};
    			}
    		} );

    		this.validateProps.apply ( this.caller, cache.getDependentPlugin ( this.validateProps ) );

    		this.caller.del ( "propsType" );
    	}

    	// 获取props，如果有需要则验证它们
    	this.caller.set ( { props : moduleConstructor.initProps ( componentNode, moduleVm, propsValidator ) } );
    	
    	//////////////////////////////////////////
    	// 获取init方法返回值并初始化vm数据
		const 
      		initDeps = cache.getDependentPlugin ( this.init ),
    		componentVm = new ViewModel ( this.init.apply ( this.caller, initDeps ) );

        this.caller.set ( { state : componentVm } );
    	
    	// 4、数初始化生命周期
		// moduleConstructor.initLifeCycle ( this, lifeCycle, componentVm );

    	/////////////////////
    	// 转换组件代表元素为实际的组件元素节点
    	if ( this.render ) {

    		// 构造模板和样式的获取器获取模板和样式
    		this.caller.set ( {
    			template ( str ) {
    				componentString = str || "";
                    return this;
    			},

    			style ( obj ) {
    				scopedStyle = obj || {};
                    return this;
    			},
            	
            	subElements ( ...elemNames ) {
                	this.subElements = [];
                	foreach ( elemNames, name => {
                    	if ( !rcomponentName.test ( name ) ) {
							throw componentErr ( "name", "组件名称定义需遵循首字母大写的驼峰式命名规则" );
                    	}
                    	
                    	this.subElements.push ( transformCompName ( name ) );
                    } );

                    return this;
                }
    		} );

    		this.render.apply ( this.caller, cache.getDependentPlugin ( this.init ) );

    		this.caller.del ( "template", "style", "subElements" );

    		// 处理模块并挂载数据 
    		const 
            	fragment = moduleConstructor.initTemplate ( componentString, scopedStyle ),
                subElements = moduleConstructor.initSubElements ( componentNode ),
                tmpl = new Tmpl ( componentVm, this.depComponents || [] );
        	
    		tmpl.mount ( fragment, false, Tmpl.defineScoped ( subElements ) );

    		// 将处理过的实际组件结构替换组件代表元素
    		componentNode.parentNode.replaceChild ( fragment, componentNode );

    		// 调用mount钩子函数
    		( this.mount || noop ).apply ( this.caller, cache.getDependentPlugin ( this.mount || noop ) );
    	}

    	// 初始化action
    	if ( this.action ) {
    		const actions = this.action.apply ( this.caller, cache.getDependentPlugin ( this.action ) );

    		moduleConstructor.initAction ( this.caller, actions );
    	}

    	// 组件初始化完成，调用apply钩子函数
    	( this.apply || noop ).apply ( this.caller, cache.getDependentPlugin ( this.apply || noop ) );
    },
	
	depComponents ( ...comps ) {
    	this.depComponents = [];
    	
    	foreach ( comps, comp => {
        	if ( comp.__proto__.name === "Component" ) {
            	this.depComponents.push ( comp );
            }
        } );
    }
} );

extend ( Component, {
	globalClass : {},

	defineGlobal ( componentDerivative ) {
		globalClass [ componentDerivative.name ] = componentDerivative;
	},

	getGlobal ( name ) {
		return this.globalClass [ name ];
	}
} );