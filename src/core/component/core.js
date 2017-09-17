import { extend, foreach, noop } from "../../func/util";
import { matchFnArgs } from "../../func/private";
import { query } from "../../func/node";
import { noUnitHook } from "../../var/const";
import check from "../../check";
import ModuleCaller from "../ModuleCaller";
import moduleConstructor from "../moduleConstructor";
import Tmpl from "../tmpl/Tmpl";
import cache from "../../cache/core";

export default function Component () {

	// check
	check ( this.init ).type ( "function" ).ifNot ( "component:" + this.constructor.name, "component derivative必须带有init方法" ).do ();
	
	// 1、创建Caller
	const
    	caller = this.caller = new ModuleCaller (),
        lifeCycle = [ "mount", "unmount" ];
	
	// 7、调用apply
}

extend ( Component.prototype, {
	
	__mount__ ( componentNode, moduleVm ) {
		let propsValidator, componentString, scopedStyle;
    	
    	if ( type ( this.validateProps ) ) {

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
    		componentVm = this.init.apply ( this.caller, initDeps );
    	
    	// 4、数初始化生命周期
		// moduleConstructor.initLifeCycle ( this, lifeCycle, componentVm );

    	/////////////////////
    	// 转换组件代表元素为实际的组件元素节点
    	if ( this.render ) {

    		// 构造模板和样式的获取器获取模板和样式
    		this.caller.set ( {
    			template ( str ) {
    				componentString = str || "";
    			},

    			style ( obj ) {
    				scopedStyle = obj || {};
    			}
    		} );

    		this.render.apply ( this.caller, cache.getDependentPlugin ( this.init ) );

    		this.caller.del ( "template", "style" );

    		// 处理模块并挂载数据
    		const 
    			template = componentNode.ownerDocument.createElement ( "template" ),
    			tmpl = new Tmpl ( componentVm );

    		template.innerHTML = componentString;
    		tmpl.mount ( template.content || template );

    		template.isComponent = true;
    		template.canRender = !attr ( componentNode, ":for" );	// 待考虑？？？？？？

    		// 将处理过的实际组件结构替换组件代表元素
    		componentNode.parent.replaceChild ( template, componentNode );

    		// 调用mount钩子函数
    		( this.mount || noop ).apply ( this.caller, cache.getDependentPlugin ( this.mount ) );


    		// 为对应元素添加内嵌样式
    		let num;
    		foreach ( scopedStyle, ( styles, selector ) => {
    			foreach ( query ( selector, template.content || template, true ), elem => {
    				foreach ( styles, ( styleName, val ) => {
    					num = parseInt ( v );
    					elem.style [ styleName ] = type ( num ) === "number" && ( num >= 0 || num <= 0 ) && noUnitHook.indexOf ( k ) === -1 ? "px" : "";
    				} );
    			} );
    		} );
    	}

    	// 初始化action
    	if ( this.action ) {
    		const actions = this.action.apply ( this.caller, cache.getDependentPlugin ( this.action ) );

    		moduleConstructor.initAction ( this, actions );
    	}

    	// 组件初始化完成，调用apply钩子函数
    	( this.apply || noop ).apply ( this.caller, cache.getDependentPlugin ( this.apply || noop ) );

    	return template;
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