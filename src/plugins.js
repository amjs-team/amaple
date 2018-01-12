import cache from "./cache/core";
import { type, foreach, isEmpty, isPlainObject, guid } from "./func/util";
import event from "./event/core";
import http from "./http/core";
import Promise from "./promise/core";

// 创建插件
cache.pushPlugin ( "util", { type, foreach, isEmpty, isPlainObject, guid } );
cache.pushPlugin ( "event", {
	on ( types, listener, once ) {
		event.on ( undefined, types, listener, false, once );
	},
	remove ( types, listener ) {
		event.remove ( undefined, types, listener, false );
	},
	emit ( types ) {
		event.emit ( undefined, types );
	}
} );
cache.pushPlugin ( "http", http );
cache.pushPlugin ( "Promise", Promise );