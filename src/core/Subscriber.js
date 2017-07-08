import { extend, foreach } from "../func/util";
import Watcher from "./Watcher";

export default function Subscribe () {
	this.watchers = [];
}

extend ( Subscriber.prototype, {
	subscribe () {
    	if ( Subscriber.watcher instanceof Watcher ) {
        	this.watchers.push ( Subscriber.watcher );
        	Subscribe.watcher = undefined;
        }
    },
  
	notify () {
    	foreach ( this.watchers, watcher => {
        	watcher.update ();
        } );
    }
} );