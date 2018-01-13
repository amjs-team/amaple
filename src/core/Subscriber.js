import { extend, foreach, type } from "../func/util";
import ViewWatcher from "./ViewWatcher";

/**
    Subscriber ()

    Return Type:
    void

    Description:
    订阅类
    ViewModel会为每个监听属性创建一个Subscriber对象用于保存该属性对应监听视图的更新

    URL doc:
    http://amaple.org/######
*/
export default function Subscriber () {
	this.watchers = [];
}

extend ( Subscriber.prototype, {

    /**
        subscribe ()
    
        Return Type:
        void
    
        Description:
        订阅监听视图
    
        URL doc:
        http://amaple.org/######
    */
	subscribe () {
    	if ( type ( Subscriber.watcher ) === "object" ) {

            if ( Subscriber.watcher instanceof ViewWatcher ) {
                const watcher = Subscriber.watcher;

                // 在被订阅的vnode中生成此watcher的卸载函数
                // 用于在不再使用此watcher时在订阅它的订阅者对象中移除，以提高性能
                watcher.node.watcherUnmounts = watcher.node.watcherUnmounts || [];
                watcher.node.watcherUnmounts.push ( () => {
                    watcher.unmount ( this );
                } );
            }

        	this.watchers.push ( Subscriber.watcher );
        	// Subscriber.watcher = false;
        }
    },

    /**
        notify ()
    
        Return Type:
        void
    
        Description:
        通知所有监听视图进行更新
    
        URL doc:
        http://amaple.org/######
    */
	notify () {
    	foreach ( this.watchers, watcher => {
        	watcher.update ();
        } );
    }
} );