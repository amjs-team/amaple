import script from "./script";

// jsonp跨域请求
export default function ( options ) {

	let  
		scriptExtend 	= script ( options ),
		jsonpCallback 	= options.jsonpCallback = "jsonpCallback" + Date.now ();

	window [ jsonpCallback ] = result => {
		window [ jsonpCallback ] = result;
	};

	options.data += ( ( options.data ? "&" : "" ) + "callback=" + jsonpCallback );

	return {
		send ( options, amXHR ) {
			scriptExtend.send ( options, amXHR );
		},

		done ( amXHR ) {
			scriptExtend.done ( amXHR );
		},

		abort () {
			scriptExtend.abort ();
		}
	};
}