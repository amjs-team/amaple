import { foreach, guid } from "../../func/util";
import { attr } from "../../func/node";
import event from "../../event/core";
import complete from "../complete";

// 文件异步上传传送器，在不支持FormData的旧版本浏览器中使用iframe刷新的方法模拟异步上传
export default function () {

	let uploadFrame = document.createElement ( "iframe" ),
		id = "upload-iframe-unique-" + guid ();

		attr ( uploadFrame, {
			id, 
			name : id
		} );
		uploadFrame.style.position 	= "absolute";
		uploadFrame.style.top 		= "9999px";
		uploadFrame.style.left 		= "9999px";
		( document.body || document.documentElement ).appendChild ( uploadFrame );

	return {

		/**
			send ( options: Object, amXHR: Object )
		
			Return Type:
			void
		
			Description:
			文件上传请求，在不支持FormData进行文件上传的时候会使用此方法来实现异步上传
		 	此方法使用iframe来模拟异步上传
		
			URL doc:
			http://amaple.org/######
		*/
		send ( options, amXHR ) {
			let self = this,

				// 备份上传form元素的原有属性，当form提交后再使用备份还原属性
				backup = {
					action  : options.data.action  || "",
					method  : options.data.method  || "",
					enctypt : options.data.enctypt || "",
					target  : options.data.target  || "",
				};

			// 绑定回调
			event.on ( uploadFrame, "load", function () {
				self.done ( amXHR );
			}, false, true );

			// 设置form的上传属性
			attr ( options.data, {
				action : options.url,
				method : "POST",
				target : id
			} );

			// 当表单没有设置enctype时自行加上，此时需设置encoding为multipart/form-data才有效
			if ( attr ( options.data, "enctypt" ) !== "multipart/form-data" ) {
				options.data.encoding = "multipart/form-data";
			}

			options.data.submit ();

			// 还原form备份参数
			foreach ( backup, ( val, attribute ) => {
				if ( val ) {
					attr ( options.data, attribute, val );
				}
				else {
					// 移除attribute属性
					attr ( options.data, attribute, null );
				}
			} );

		},

		/**
			done ( amXHR: Object )
		
			Return Type:
			void
		
			Description:
			上传完成的处理，主要工作是获取返回数据，移除iframe
		
			URL doc:
			http://amaple.org/######
		*/
		done ( amXHR ) {

			// 获取返回数据
			let child, entity,
				doc 	= uploadFrame.contentWindow.document;
			if ( doc.body ) {

				this.status 	= 200;
				this.statusText = "success";

				// 当mimeType为 text/javascript或application/javascript时，浏览器会将内容放在pre标签中
				if ( ( child = doc.body.firstChild ) && child.nodeName.toUpperCase () === "PRE" && child.firstChild ) {
					this.response = child.innerHTML;
				}
				else {
					this.response = doc.body.innerHTML;
				}

				// 如果response中包含转义符，则将它们转换为普通字符
				if ( /&\S+;/.test (this.response) ) {
					entity 	= {
						lt 		: "<",
						gt 		: ">",
						nbsp 	: " ",
						amp 	: "&",
						quot 	: "\""
					};
					this.response = this.response.replace ( /&(lt|gt|nbsp|amp|quot);/ig, ( all, t ) => {
						return entity [ t ];
					} );
				}
			}

			complete ( amXHR );

			// 移除iframe
			uploadFrame.parentNode.removeChild (uploadFrame);
		},

		/**
			abort ()
		
			Return Type:
			void
		
			Description:
			请求中断处理，此时无法中断
		
			URL doc:
			http://amaple.org/######
		*/
		abort () {}
	};
}