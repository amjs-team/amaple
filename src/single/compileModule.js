import { isEmpty, foreach, guid, type } from "../func/util";
import { transformCompName } from "../func/private";
import { TYPE_COMPONENT } from "../var/const";
import { moduleErr } from "../error";
import iceAttr from "./iceAttr";
import check from "../check";
import configuration from "../core/configuration/core";
import cheerio from "cheerio";
import VElement from "../core/vnode/VElement";
import VTextNode from "../core/vnode/VTextNode";
import VFragment from "../core/vnode/VFragment";


/**
	parseModuleAttr ( moduleStrng: String, parses: Object )

	Return Type:
	String
	解析后的模块字符串

	Description:
	解析出模板根节点的属性值

	URL doc:
	http://icejs.org/######
*/
function parseModuleAttr ( moduleString, parses ) {
	const
		rend = /^\s*>/,
		rmoduleAttr = /^\s*(<module\s+)?(?:([^\s"'<>/=]+))?(?:\s*(?:=)\s*(?:"([^"]*)"|'([^']*)'))?/i;

	let attrMatch;

	parses.attrs = {};

	// 匹配出module标签内的属性
	while ( !rend.test ( moduleString ) ) {
		attrMatch = rmoduleAttr.exec ( moduleString );
		if ( attrMatch ) {
			parses.attrs [ attrMatch [ 2 ] ] = attrMatch [ 3 ] || attrMatch [ 4 ] || "";
			moduleString = moduleString.substr ( attrMatch [ 0 ].length );
		}
		else {
			break;
		}
	}

	return moduleString;
}


/**
	parseTemplate ( moduleString: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板内容

	URL doc:
	http://icejs.org/######
*/
function parseTemplate ( moduleString, parses ) {
	const 
		rtemplate = /<template>([\s\S]+)<\/template>/i,
		rblank = />(\s+)</g,
		rtext = /"/g,
		rwrap = /\r?\n\s*/g,

		viewMatch = rtemplate.exec ( moduleString );

	let view;
	if ( viewMatch ) {
		moduleString = moduleString.replace ( viewMatch [ 0 ], "" );
		view = ( viewMatch [ 1 ] || "" ).trim ();

		// 去除所有标签间的空格，并将"转换为'符号
		view = view
		.replace ( rblank, ( match, rep ) => match
			.replace ( rep, "" ) )
		.replace ( rtext, match => "'" )
		.replace ( rwrap, match => "" );

		parses.nodeQuery= cheerio.load ( view );
		parses.view = view;
	}

	return moduleString;
}

/**
	parseStyle ( css: String )

	Return Type:
	String
	处理后的css字符串

	Description:
	移除css空白符

	URL doc:
	http://icejs.org/######
*/
function removeCssBlank ( css ) {
	const rstyleblank = /(>\s*|\s*[{:;}]\s*|\s*<)/g;
	return css.replace ( rstyleblank, match => match.replace ( /\s+/g, "" ) );
}


/**
	parseStyle ( moduleString: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板样式

	URL doc:
	http://icejs.org/######
*/
function parseStyle ( moduleString, parses ) {

	const
		rstyle = /<style(?:.*?)>([\s\S]*)<\/style>/i,
		risScoped = /^<style(?:.*?)scoped(?:.*?)/i,
		rselector = /[^/@{}]+?/,
		rkeyframes = /@(?:-\w+-)?keyframes\s+\w+/,
		rcssparser = new RegExp ( `\\s*(${ rselector.source }|${ rkeyframes.source })\\s*{([\\s\\S]+?)}`, "g" ),
		ranimateScoped = /^(from|to|\d+%)\s*$/i,

		styleMatch = rstyle.exec ( moduleString );

	if ( styleMatch ) {
		moduleString = moduleString.replace ( styleMatch [ 0 ], "" );

		let style;
    	if ( risScoped.test ( styleMatch [ 0 ] ) ) {
			style = ( styleMatch [ 1 ] || "" ).trim ();

			// 解析每个css项并保存到parsers.style中
			parses.style = [];
			let keyframesItem;
			style = style.replace ( rcssparser, ( match, selector, content ) => {
				content = content.trim ();

				// css选择器为普通选择器时
				if ( new RegExp ( `^${ rselector.source }` ).test ( selector ) ) {
					if ( ranimateScoped.test ( selector ) ) {
						keyframesItem.content += `${ selector }{${ removeCssBlank ( content ) }}`;
					}
					else {
						if ( keyframesItem ) {
							parses.style.push ( keyframesItem );
							keyframesItem = undefined;
						}
						parses.style.push ( {
							selector,
							content : removeCssBlank ( content )
						} );
					}
				}

				// css选择器为@keyframes时
				else if ( rkeyframes.test ( selector ) ) {
					if ( keyframesItem ) {
						parses.style.push ( keyframesItem );
					}
					keyframesItem = {
						selector, 
						content : removeCssBlank ( content + "}" )
					};
				}
			} );
        }
		else {

			// 去除所有标签间的空格
        	style = removeCssBlank ( styleMatch [ 0 ] );
        }
	}
	else {
		parses.style = "";
	}

	return moduleString;
}


/**
	parseScript ( moduleString: String, parses: Object )

	Return Type:
	String
	解析后的模板字符串

	Description:
	解析出模板脚本

	URL doc:
	http://icejs.org/######
*/
function parseScript ( moduleString, scriptPaths, scriptNames, parses ) {

	const 
		rscript = /<script(?:.*?)>([\s\S]+)<\/script>/i,
		rscriptComment = /\/\/(.*?)\n|\/\*([\s\S]*?)\*\//g,
		rimport = /\s*(?:(?:(?:var|let|const)\s+)?(.+?)\s*=\s*)?import\s*\(\s*["'](.*?)["']\s*\)(?:\s*[,;])?/g,
		rhtmlComment = /<!--(.*?)-->/g,
		rmoduleDef 	= /new\s*ice\s*\.\s*Module\s*\(/,
		raddComponents = new RegExp ( rmoduleDef.source + "\\s*\\{" ),

		scriptMatch = rscript.exec ( moduleString ),
		scripts = {};


	if ( scriptMatch ) {

		const matchScript = ( scriptMatch [ 1 ] || "" ).replace ( rscriptComment, match => "" );

		// 获取import的script
		parses.script = matchScript.replace ( rimport, ( match, scriptName, scriptPath ) => {
			if ( !scriptName ) {
				throw moduleErr ( "import", `import("${ scriptPath }")返回的组件衍生类需被一个变量接收，否则可能因获取不到此组件而导致解析出错` );
			}
			scripts [ scriptName ] = scriptPath;
			return "";
		} ).trim ();

		// 如果有引入组件则将组件传入new ice.Module中
    	if ( !isEmpty ( scripts ) ) {

    		// 去掉注释的html的代码
    		const matchView = parses.view.replace ( rhtmlComment, match => "" );

    		foreach ( scripts, ( path, name ) => {

    			// 只有在view中有使用的component才会被使用
    			if ( new RegExp ( "<\s*" + transformCompName ( name, true ) ).test ( matchView ) ) {
    				scriptPaths.push ( path );
    				scriptNames.push ( name );
    			}
    		} );

    		// 需要组件时才将组件添加到对应模块中
    		if ( !isEmpty ( scriptNames ) ) {
    			parses.script = parses.script.replace ( raddComponents, match => match + `depComponents:[${ scriptNames.join( "," ) }],` );
    		}
    	}

		parses.script = parses.script.replace ( rmoduleDef, match => `${ match }args.moduleNode,` );
	}

	return moduleString;
}

function ASTToVnode ( astNodes, parent ) {

	foreach ( astNodes, astNode => {
		let vnode;
		if ( /^tag|style$/.test ( astNode.type ) ) {
			vnode = VElement ( astNode.name, astNode.attribs, null, null );
			if ( astNode.children.length > 0 ) {
				ASTToVnode ( astNode.children, vnode );
			}
		}
		else if ( astNode.type === "text" ) {
			vnode = VTextNode ( astNode.data, null );
		}

		if ( vnode ) {
			parent.appendChild ( vnode );
		}
	} );
}



/**
	compileModule ( moduleString: String )

	Return Type:
	Function

	Description:
	编译模块为可执行的编译函数

	URL doc:
	http://icejs.org/######
*/
export default function compileModule ( moduleString ) {

	// 模块编译正则表达式
	const rmodule = /^<module[\s\S]+<\/module>/i;
	let title = "",
		moduleFragment;
	if ( rmodule.test ( moduleString ) ) {
		
		const
			parses = {},
			scriptNames = [],
			scriptPaths = [];

		// 解析出Module标签内的属性
		moduleString = parseModuleAttr ( moduleString, parses );

		// 解析模板
		moduleString = parseTemplate ( moduleString, parses );
		title = parses.attrs [ iceAttr.title ] || "";

		// 解析样式
		moduleString = parseStyle ( moduleString, parses );

		// 解析js脚本
		moduleString = parseScript ( moduleString, scriptPaths, scriptNames, parses );
		

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 检查参数
		check ( parses.view )
			.notBe ( "" )
			.ifNot ( "module:template", "<module>内的<template>为必须子元素，它的内部DOM tree代表模块的页面布局" )
			.do ();

		check ( parses.script )
			.notBe ( "" )
			.ifNot ( "module:script", "<module>内的<script>为必须子元素，它的内部js代码用于初始化模块的页面布局" )
			.do ();

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 编译局部样式
		if ( type ( parses.style ) === "array" ) {
			let moduleIdentifier,
				styleString = "";
			foreach ( parses.style, styleItem => {
				if ( styleItem.selector.substr ( 0, 1 ) !== "@" ) {
					moduleIdentifier = "data-no-" + guid ();
					parses.nodeQuery ( styleItem.selector ).attr ( moduleIdentifier, "" );
					styleItem.selector += `[${ moduleIdentifier }]`;
				}

				styleString += `${ styleItem.selector }{${ styleItem.content }}`;
			} );

			parses.style = styleString ? `<style scoped>${ styleString }</style>` : "";
		}

		const body = parses.nodeQuery ( "body" );
		moduleFragment = new VFragment ();
		body.append ( parses.style );
		ASTToVnode ( body [ 0 ].children, moduleFragment );

		////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////
		/// 构造编译函数
		const buildView = `args.signCurrentRender();
			var nt=new args.NodeTransaction().start ();
			nt.collect(args.moduleNode);
			args.moduleNode.html(args.moduleFragment);`;
		moduleString = "";
		if ( !isEmpty ( scriptPaths ) ) {
			let addToWindow = "",
				delFromWindow = "";
			foreach ( scriptNames, name => {
				addToWindow += `window.${ name }=${ name };`;
				delFromWindow += `delete window.${ name };`;
			} );

			const componentBaseURL = configuration.getConfigure ( "baseURL" ).component;
			foreach ( scriptPaths, ( path, i ) => {
				scriptPaths [ i ] = `"${ componentBaseURL + path }"`;
			} );

			moduleString += `args.require([${ scriptPaths.join ( "," ) }],function(${ scriptNames.join ( "," ) }){
				${ addToWindow }
				${ buildView }
				${ parses.script };
				${ delFromWindow }
				nt.commit();
				args.flushChildren();
			},${ TYPE_COMPONENT });`;
		}
		else {
			moduleString += `${ buildView }
			${ parses.script };
			nt.commit();
			args.flushChildren();`;
		}
	}

	const updateFn = new Function ( "ice", "args", moduleString );
	updateFn.moduleFragment = moduleFragment;
	return { updateFn, title };
}