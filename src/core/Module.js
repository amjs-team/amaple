import Class from "../Class.js";
import ModuleCaller from "./ModuleCaller";
import check from "../check";


export default Class ( "Module" ) ( {
	constructor ( moduleName, vmData ) {
    	
    	// 检查参数
		check ( moduleName ).type ( "string" ).notBe ( "" ).ifNot ( "ice.module", "moduleName参数类型必须为string" ).do ();
		check ( vmData ).type ( "object" ).check ( vmData.init ).type ( "function" ).ifNot ( "ice.module", "vmData参数必须为带有init方法的的object" ).do ();
      	
      	/////////////////////////////////
      	/////////////////////////////////
      	///
		let moduleElem 	= query ( "*[" + single.aModule + "=" + moduleName + "]" ),

			// 获取init方法参数
			initArgs 	= matchFnArgs ( vmData.init ),
          	initDeps 	= initArgs.map ( plugin => cache.getPlugin ( plugin ) ),

			// 获取apply方法参数
			applyArgs 	= matchFnArgs ( vmData.apply || noop ),
            applyDeps 	= applyArgs.map ( plugin => cache.getPlugin ( plugin ) ),

			parent = findParentVm ( moduleElem ) || {},
            
            mc = new ModuleCaller ( { parent } ),

			// 获取后初始化vm的init方法
			// 对数据模型进行转换
			vm = new ViewModel ( vmData.init.apply ( mc, initDeps ) ),

			// 使用vm解析模板
			tmpl = new Tmpl ( moduleElem );
    	
    	
    	mc.set ( { state : vm } );
		
		// 将当前vm保存在对应的模块根节点下，以便子模块寻找父模块的vm对象
		moduleElem.__vm__ = vm;

		// 解析模板，挂载数据
		tmpl.mount ( vm, true );

		vm.view = slice.call ( moduleElem.childNodes ) || [];
    	
		// 调用apply方法
		( vmData.apply || noop ).apply ( mc, applyDeps );
    }
} );