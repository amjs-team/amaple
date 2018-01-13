import { extend, foreach, type } from "../func/util";
import ModuleLoader from "./ModuleLoader";
import requestEventHandler from "./requestEventHandler";
import { amAttr } from "../var/const";
import amHistory from "./history/core";

/**
    unmountStructure ( structure: Object )

    Return Type:
    void

    Description:
    卸载结构
    当更新页面时，相应的结构也将会变化
    需将不显示的解雇卸载

    URL doc:
    http://amaple.org/######
*/
function unmountStructure ( structure ) {
    foreach ( structure, unmountItem => {
        if ( unmountItem.children && unmountItem.children.length > 0 ) {
            unmountStructure ( unmountItem.children );
        }

        if ( unmountItem.module ) {
            unmountItem.module.unmount ();
        }
    } );
}

/**
    diffStructure ( newEntity: Object, oldEntity: Object, readyToUnmount: Array )

    Return Type:
    void

    Description:
    对比新旧结构实体的差异
    如果结构未改变则将旧结构的module、moduleNode赋值给对应新结构上
    如果结构改变则记录到readyToUnmountz数组中即将卸载

    URL doc:
    http://amaple.org/######
*/  
function diffStructure ( newEntity, oldEntity, readyToUnmount ) {
    let oldItem;
    foreach ( newEntity, ( newItem, i ) => {
        oldItem = oldEntity [ i ];
        if ( oldItem && oldItem.name === newItem.name ) {

            newItem.moduleNode = oldItem.moduleNode;
            if ( oldItem.modulePath === newItem.modulePath && !newItem.hasOwnProperty ( "forcedRender" ) ) {
                
                newItem.notUpdate = null;
                newItem.module = oldItem.module;

                // 相同时才去对比更新子结构
                if ( type ( newItem.children ) === "array" && type ( oldItem.children ) === "array" ) {
                    diffStructure ( newItem.children, oldItem.children, readyToUnmount );
                }
            }
            else {
                readyToUnmount.push ( oldItem );
            }
        }
    } );
}


// [
  //  { module: obj1, name: "default", moduleNode: node1, parent: null, children: [
    //    { module: obj2, name: "header", moduleNode: node2, parent: parentObj },
    //    { module: obj3, name: "main", moduleNode: node3, parent: parentObj },
    //    { module: obj4, name: "footer", moduleNode:node4, parent: parentObj }
   // ] }
// ]

export default function Structure ( entity ) {
    this.entity = entity;
}

extend ( Structure.prototype, {
	update ( newStructure ) {
    	const 
            newEntity = newStructure.entity,
            oldEntity = this.entity,
            readyToUnmount = [];
    	
        // 对比新旧结构实体的差异，并在相同结构上继承旧结构的module和moduleNode
        diffStructure ( newEntity, oldEntity, readyToUnmount );
        this.entity = newEntity;
    	
        // 调用结构卸载函数
    	unmountStructure ( readyToUnmount );

        return this;
	},

    /**
        isEmpty ()
    
        Return Type:
        Boolean
        是否为空结构
    
        Description:
        判断此结构对象是否为空
    
        URL doc:
        http://amaple.org/######
    */
    isEmpty () {
        let empty = true;
        foreach ( this.entity, entity => {
            if ( entity.modulePath !== null ) {
                empty = false;

                return false;
            }
        } );

        return empty;
    },

    /**
        copy ()
    
        Return Type:
        Object
    
        Description:
        拷贝一个Structure对象
    
        URL doc:
        http://amaple.org/######
    */
    copy ( entity = this.entity, parent = null ) {
        const copyEntity = [];

        foreach ( entity, item => {
            const copyItem = {};

            foreach ( item, ( v, k ) => {
                if ( k === "children" ) {
                    copyItem.children = this.copy ( v, copyItem );
                }
                else if ( k === "parent" ) {
                    copyItem.parent = parent;
                }
                else {
                    copyItem [ k ] = v;
                }
            } );

            copyEntity.push ( copyItem );
        } );

        return parent ? copyEntity : new Structure ( copyEntity );
    },
	
	/**
        render ( location: Object )
    
        Return Type:
        void
    
        Description:
        根据location对象渲染出对应的模块
    
        URL doc:
        http://amaple.org/######
    */
	render ( location, nextStructureBackup ) {

        const locationGuide = {};
        if ( location.action !== "POP" ) {
            locationGuide.structure = nextStructureBackup;
            locationGuide.param = location.param;
            locationGuide.get = location.get;
            locationGuide.post = location.post;
        }

        // 使用模块加载器来加载更新模块
        new ModuleLoader ( 
            location.nextStructure, 
            location.param,
            location.get,
            location.post
        ).load ();

        switch ( location.action ) {
            case "PUSH":
                amHistory.push ( locationGuide, location.path );
                
                break;
            case "REPLACE":
                amHistory.replace ( locationGuide, location.path );
                
                break;
            case "NONE":
                amHistory.saveState ( locationGuide, location.path );

                break;
            case "POP":
                // do nothing
        }
    },
} );

extend ( Structure, {

    /**
        signCurrentRender ( structureItem: Object, param: Object, args: String, data: Object )
        
        Return Type:
        void
    
        Description:
        标记当前正在渲染的页面结构项并传递对应的参数到正在渲染的模块内
        这样可以使创建Module对象时获取父级的vm，和保存扫描到的moduleNode
    
        URL doc:
        http://amaple.org/######
    */
    signCurrentRender ( structureItem, param, args, data ) {
        structureItem.param = param;
        structureItem.get = args;
        structureItem.post = data;
        Structure.currentRender = structureItem;
    },
    
    /**
        getCurrentRender ()
    
        Return Type:
        Object
        当前结构项
    
        Description:
        获取当前正在渲染的页面结构项
    
        URL doc:
        http://amaple.org/######
    */
    getCurrentRender () {
        return Structure.currentRender;
    },

    /**
        saveSubModuleNode ( vnode: Object )
    
        Return Type:
        void
    
        Description:
        保存扫描到的模块节点对象以便下次使用时直接获取
    
        URL doc:
        http://amaple.org/######
    */
    saveSubModuleNode ( vnode ) {
        foreach ( Structure.currentRender.children, child => {
            if ( child.name === ( vnode.attr ( amAttr.module ) || "default" ) && !child.moduleNode ) {
                child.moduleNode = vnode;
                return false;
            }
        } );
    },
} );