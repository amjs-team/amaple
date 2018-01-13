import event from "../../event/core";
import complete from "../complete";

// 动态执行script
export default function ( options ) {

	let script;

	return {

		/**
			send ( options: Object, amXHR: Object )
		
			Return Type:
			void
		
			Description:
			动态执行javascript
		
			URL doc:
			http://amaple.org/######
		*/
		send ( options, amXHR ) {
			let self 	= this;

			script 		= document.createElement ( "script" );
			script.src 	= options.url;


			event.on ( script, "load error", function ( e ) {

				if ( script.parentNode ) {
					script.parentNode.removeChild ( script );
				}

				if ( e.type === "load" ) {
					this.status 		= 200;
					this.statusText 	= "success";
				}
				else {
					this.status 		= 500;
					this.statusText 	= "error";
				}
				self.done ( amXHR );
			} );

			document.head.appendChild ( script );
		},

		/**
			done ( amXHR: Object )
		
			Return Type:
			void
		
			Description:
			完成或中断后的处理
		
			URL doc:
			http://amaple.org/######
		*/
		done ( amXHR ) {

			if ( options.dataType === "JSONP" ) {

				dataType = "json";

				if ( type ( window [ options.jsonpCallback ] ) !== "function" ) {
					this.status 	= 200;
					this.statusText = "success";
					this.response 	= window [ options.jsonpCallback ];
				}
				else {
					this.status 	= 500;
					this.statusText = "error";
				}
			}

			complete ( amXHR );
		},

		/**
			abort ()
		
			Return Type:
			void
		
			Description:
			请求中断处理
		
			URL doc:
			http://amaple.org/######
		*/
		abort () {
			if ( script.parentNode ) {
				script.parentNode.removeChild ( script );
			}

			this.status = 0;
			this.statusText = this.abortText;

			type ( options.abort ) === "function" && options.abort ( this.statusText );
		}
	};
}