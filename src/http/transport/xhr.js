import { foreach, type } from "../../func/util";
import { requestErr } from "../../error";
import event from "../../event/core";
import complete from "../complete";

export default function () {

	return {

		/**
			send ( options: Object, amXHR: Object )
		
			Return Type:
			void
		
			Description:
			ajax请求前设置参数，并发送请求
		
			URL doc:
			http://amaple.org/######
		*/
		send ( options, amXHR ) {

			let i, 
				self = this,

				// 获取xhr对象
				xhr = this.xhr = ( () => {
					try {
						return new XMLHttpRequest ();
					}
					catch ( e ) {}
				} ) ();

			if ( options.crossDomain && !"withCredentials" in xhr ) {
				throw requestErr ( "crossDomain", "该浏览器不支持跨域请求" );
			}

			xhr.open ( options.method, options.url, options.async, options.username, options.password );

			// 覆盖原有的mimeType
			if ( options.mimeType && xhr.overrideMimeType ) {
				xhr.overrideMimeType ( options.mimeType );
			}

			xhr.setRequestHeader ( "X-Requested-With", "XMLHTTPRequest" );
            foreach ( this.headers, ( header, key ) => {
                xhr.setRequestHeader ( key, header );
            } );

            // 绑定请求中断回调
            if ( type ( options.abort ) === "function" && event.support ( "abort", xhr ) ) {
            	xhr.onabort = function () {
            		options.abort ( this.statusText );
            	};
            }

            if ( event.support ( "error", xhr ) ) {
            	xhr.onload = xhr.onerror = function ( e ) {

					amXHR.transport.status = xhr.status === 1223 ? 204 : xhr.status;

            		self.done ( amXHR );
            	};
            }
            else {
            	xhr.onreadystatechange = function () {
            		if ( xhr.readyState === XMLHttpRequest.DONE ) {

            			// 兼容IE有时将204状态变为1223的问题
            			amXHR.transport.status = xhr.status === 1223 ? 204 : xhr.status;

            			self.done ( amXHR );

            		}
            	};
            }

            // 发送请求
            try {
            	xhr.send ( options.hasContent && options.data || null );
            }
            catch ( e ) {
            	throw requestErr ( "send", e );
            }
		},

		/**
			done ( amXHR: Object )
		
			Return Type:
			void
		
			Description:
			ajax请求完成后的处理
		
			URL doc:
			http://amaple.org/######
		*/
		done ( amXHR ) {

			const xhr = this.xhr;

			xhr.onload = xhr.onerror = xhr.onreadystatechange = null;

			// 获取所有返回头信息
			this.responseHeadersString = xhr.getAllResponseHeaders ();

			this.status 		= xhr.status;
			this.statusText 	= xhr.statusText;
			this.response 		= xhr.responseText;

			complete ( amXHR );
		},

		/**
			abort ()
		
			Return Type:
			void
		
			Description:
			ajax请求中断
		
			URL doc:
			http://amaple.org/######
		*/
		abort () {
			this.status 	= 0;
			this.statusText = this.abortText;

			xhr.abort && xhr.abort ();
		}
	};
}