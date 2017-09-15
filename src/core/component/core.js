import { extend, foreach, noop } from "../../func/util";
import { matchFnArgs } from "../../func/private";
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
	
	// 3、初始化vm数据
	// 4、数初始化生命周期
	moduleConstructor.initLifeCycle ( this, lifeCycle, 
	// 5、渲染并挂载模板
	// 6、初始化action
	// 7、调用apply
}

extend ( Component.prototype, {
	
	__mount__ ( componentNode, moduleVm ) {
    	
    	this.caller.set { props : moduleConstructor.initProps ( componentNode, moduleVm ) };
    	
    	/////////////////////
    	// 获取init方法返回值并转vm对象
		const 
        	initArgs = matchFnArgs ( this.init ),
      		initDeps = initArgs.map ( plugin => cache.getPlugin ( plugin ) ),
    	
    		vm = this.init.apply ( this.caller, initDeps );
    	
    	/////////////////////
    	// 转换组件代表元素为实际的组件元素节点
    	
    	// 2、获取props，如果有需要则验证它们
    },
	
	__initLifeCycle__ () {
    	const
    		lifeCycleContainer = {};
    	
    	foreach ( lifeCycle, cycleItem => {
        	lifeCycleContainer [ cycleItem ] = this.vm [ cycleItem ] || noop;
        	this [ cycleItem ] = () => {
            	lifeCycleContainer [ cycleItem ].call ( caller );
            }
        	
        	delete this.vm [ cycleItem ];
        } );
    },
	
	__initAction__ () {
    	
    },
	
	
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