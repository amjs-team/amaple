import { extend, noop } from "../func/util";

const rheader = /^(.*?):[ \t]*([^\r\n]*)$/mg;


export default function AmXMLHttpRequest () {

	// 请求传送器，根据不同的请求类型来选择不同的传送器进行请求
	this.transport = null;
}

extend ( AmXMLHttpRequest.prototype, {

	/**
		setRequestHeader ( header: String, value: String )
	
		Return Type:
		void
	
		Description:
		设置请求头
	
		URL doc:
		http://amaple.org/######
	*/
	setRequestHeader ( header, value ) {
		if ( !this.transport.completed ) {
			this.transport.headers = this.transport.headers || {};
			this.transport.headers [ header.toLowerCase () ] = value;
		}
	},

	/**
		getRequestHeader ( header: String )
	
		Return Type:
		String
		对应返回头信息
	
		Description:
		获取返回头信息
	
		URL doc:
		http://amaple.org/######
	*/
	getResponseHeader ( header ) {

		let match;

		if ( this.transport.completed ) {
			if ( !this.transport.respohseHeader ) {
				this.transport.respohseHeader = {};
				while ( match = rheader.exec ( this.transport.responseHeadersString || "" ) ) {
					this.transport.respohseHeader [ match [ 1 ].toLowerCase () ] = match [ 2 ];
				}
			}

			match = this.transport.responseHeader [ header ];
		}

		return match || null;
	},

	/**
		getAllResponseHeaders ()
	
		Return Type:
		String
		所有返回头信息
	
		Description:
		获取所有返回头信息
	
		URL doc:
		http://amaple.org/######
	*/
	getAllResponseHeaders () {
		return this.transport.completed ? this.transport.responseHeadersString : null;
	},

	/**
		overrideMimeType ( mimetype: String )
	
		Return Type:
		void
	
		Description:
		设置mimeType
	
		URL doc:
		http://amaple.org/######
	*/
	overrideMimeType ( mimetype ) {
		if ( !this.transport.completed ) {
			options.mimetype = mimetype;
		}
	},

	/**
		abort ( statusText: String )
	
		Return Type:
		void
	
		Description:
		触发请求中断
	
		URL doc:
		http://amaple.org/######
	*/
	abort ( statusText ) {
        if ( this.transport ) {
        	this.transport.abortText = statusText || "abort";
            this.transport.abort ();
        }
	},

	/**
		addEventListener ( type: String, callback: Function )
	
		Return Type:
		void
	
		Description:
		绑定xhr回调事件
	
		URL doc:
		http://amaple.org/######
	*/
	addEventListener ( type, callback ) {
		if ( !this.transport.completed ) {
			this.transport.callbacks = this.transport.callbacks || {};
			this.transport.callbacks [ type ] = callback || noop;
		}
	}
} );