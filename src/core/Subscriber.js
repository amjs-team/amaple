import { extend, foreach, type } from "../func/util";

/**
    Subscriber ()

    Return Type:
    void

    Description:
    订阅类
    ViewModel会为每个监听属性创建一个Subscriber对象用于保存该属性对应监听视图的更新

    URL doc:
    http://icejs.org/######
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
        http://icejs.org/######
    */
	subscribe () {
    	if ( type ( Subscriber.watcher ) === "object" ) {

            // 在被订阅的watcher中反引用此订阅者对象
            // 用于在不再使用此watcher时在订阅它的订阅者对象中移除，以提高性能
            // Subscriber.watcher.subs = Subscriber.watcher.subs || [];
            // Subscriber.watcher.subs.push ( this );

        	this.watchers.push ( Subscriber.watcher );
        	Subscriber.watcher = undefined;
        }
    },

    /**
        notify ()
    
        Return Type:
        void
    
        Description:
        通知所有监听视图进行更新
    
        URL doc:
        http://icejs.org/######
    */
	notify () {
    	foreach ( this.watchers, watcher => {
        	watcher.update ();
        } );
    }
} );