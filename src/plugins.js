import cache from "./cache/core";
import * as util from "./func/util";
import * as node from "./func/node";
import event from "./event/core";
import http from "./http/core";
import promise from "./promise/Promise";

// 创建插件
cache.pushPlugin ( "util", util );
cache.pushPlugin ( "node", node );
cache.pushPlugin ( "event", event );
cache.pushPlugin ( "http", http );
cache.pushPlugin ( "promise", promise );