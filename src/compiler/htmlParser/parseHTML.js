import { foreach } from "../../func/util";
import { htmlParserErr } from "../../error";
import VElement from "../../core/vnode/VElement";
import VTextNode from "../../core/vnode/VTextNode";
import VFragment from "../../core/vnode/VFragment";

const 
	attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,
	ncname = "[a-zA-Z_][\\w\\-\\.]*",
	qnameCapture = `((?:${ncname}\\:)?${ncname})`,
	startTagOpen = new RegExp ( `^<${qnameCapture}` ),
	startTagClose = /^\s*(\/?)>/,
	endTag = new RegExp ( `^<\\/${qnameCapture}[^>]*>` ),
	doctype = /^<!DOCTYPE [^>]+>/i,

	ieNSBug = /^xmlns:NS\d+/,
	ieNSPrefix = /^NS\d+:/,

	// #7298: escape - to avoid being pased as HTML comment when inlined in page
	comment = /^<!\--/,
	conditionalComment = /^<!\[/,

	// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
	// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
	isNonPhrasingTag = makeMap (
		"address,article,aside,base,blockquote,body,caption,col,colgroup,dd," +
		"details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form," +
		"h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta," +
		"optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead," +
		"title,tr,track"
	),
	isUnaryTag = makeMap (
	  	"area,base,br,col,embed,frame,hr,img,input,isindex,keygen," +
	  	"link,meta,param,source,track,wbr"
	),
	isSVG = makeMap (
		  "svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face," +
		  "foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern," +
		  "polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view",
		  true
	),

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	canBeLeftOpenTag = makeMap ( "colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source" ),

	// Special Elements (can contain anything)
	isPlainTextElement = makeMap ( "script,style,textarea", true ),
	reCache = {},

	decodingMap = {
	 	"&lt;" : "<",
		"&gt;" : ">",
	 	"&quot;" : "",
	 	"&amp;" : "&",
		"&#10;" : "\n",
		"&#9;" : "\t"
	},
	encodedAttr = /&(?:lt|gt|quot|amp);/g,
	encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10|#9);/g,

	// #5992
	isIgnoreNewlineTag = makeMap ( "pre,textarea", true ),
	shouldIgnoreFirstNewline =  ( tag, html )  => tag && isIgnoreNewlineTag ( tag )  && html [ 0 ] === "\n";


let IS_REGEX_CAPTURING_BROKEN = false,
	parent, template;
"x".replace ( /x(.)?/g, ( m, g ) => {
	IS_REGEX_CAPTURING_BROKEN = g === "";
} );

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap ( str, expectsLowerCase ) {
	const 
		map = Object.create ( null ),
		list = str.split ( "," );

	foreach ( list, item => {
		map [ item ] = true;
	} );

	return expectsLowerCase
	? val => map [ val.toLowerCase () ]
	: val => map [ val ];
}

function getTagNamespace (tag) {
	if ( isSVG ( tag ) ) {
		return "svg";
	}

	// basic support for MathML
	// note it doesn't support other MathML elements being component roots
	if ( tag === "math" ) {
		return "math";
	}
}


function guardIESVGBug ( attrs ) {
	foreach ( attrs, ( val, name, attrs ) => {
		if ( !ieNSBug.test ( name ) ) {
			delete attrs [ name ];
			attrs [ name.replace ( ieNSPrefix, "" ) ] = val;
		}
	} );
}


// for script (e.g. type="x/template") or style, do not decode content
function isTextTag ( el ) {
	return /^SCRIPT|STYLE$/.test ( el.nodeName );
}

function closeElement ( vnode ) {
	if ( vnode.nodeName === "PRE" ) {
		inPre = false;
	}
}

function startHandler ( tagName, attrs, unary, stack, rootVNodes ) {

	// handle IE svg bug
	if ( getTagNamespace ( tagName ) === "svg" ) {
		guardIESVGBug ( attrs );
	}

	const vnode = VElement ( tagName, attrs );
	if ( vnode.nodeName === "PRE" ) {
		inPre = true;
	}
	if ( parent ) {
		parent.appendChild ( vnode );
	}
	else {
		rootVNodes.push ( vnode );
	}
	if ( !unary ) {
		stack.push ( vnode );
		parent = vnode;
	}
	else {
		closeElement ( vnode );
	}
}

function endHandler ( stack ) {

	// remove trailing whitespace
	const 
		vnode = stack [ stack.length - 1 ],
		lastNode = vnode.children [ vnode.children.length - 1 ];
	if ( lastNode && lastNode.nodeType === 3 && lastNode.text === " " && !inPre) {
		vnode.children.pop ();
	}

	// pop stack
	stack.pop ();
	parent = stack [ stack.length - 1 ];
	closeElement ( vnode );
}

let inPre = false;
function charsHandler ( text, rootVNodes ) {

	// IE textarea placeholder bug
	// if ( isIE && parent.tag === "textarea" && parent.attrs.placeholder === text ) {
	// 	return;
	// }

	const children = parent && parent.children || [];
	text = inPre || text.trim () ? text

		// only preserve whitespace if its not right after a starting tag
		// 节点与节点之间的空格与回车会解析为" "的文本节点
		: children.length ? " " : "";
	if ( text ) {
		const textNode = VTextNode ( text );
		if ( parent ) {
			parent.appendChild ( textNode );
		}
		else {
			rootVNodes.push ( textNode );
		}
	}
}


function decodeAttr  ( value, shouldDecodeNewlines )  {
	const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
	return value.replace ( re, match => decodingMap [ match ] );
}

export default function parseHTML ( html ) {
	template = html;

	const stack = [];
	let index = 0,
		rootVNodes = [],
		last, lastTag;
	while ( html ) {
    	last = html;
    
    	// Make sure we"re not in a plaintext content element like script/style
		if ( !lastTag || !isPlainTextElement ( lastTag )  ) {
			let textEnd = html.indexOf ( "<" );
			if ( textEnd === 0 ) {

        		// Comment:
        		// 暂忽略注释的解析
				if  ( comment.test ( html ) ) {
					const commentEnd = html.indexOf ( "-->" );

					if ( commentEnd >= 0 ) {
						// commentHandler ( html.substring ( 4, commentEnd ) );
						advance ( commentEnd + 3 );
            			continue;
					}
				}

				// http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
				if ( conditionalComment.test ( html ) ) {
					const conditionalEnd = html.indexOf ( "]>" );

					if ( conditionalEnd >= 0 ) {
            			advance ( conditionalEnd + 2 );
            			continue;
					}
				}

				// Doctype:
				const doctypeMatch = html.match ( doctype );
				if ( doctypeMatch ) {
					advance ( doctypeMatch [ 0 ].length );
					continue;
				}

				// End tag:
				const endTagMatch = html.match ( endTag );
				if ( endTagMatch ) {
					const curIndex = index;
					advance ( endTagMatch [ 0 ].length );
					parseEndTag ( endTagMatch [ 1 ], curIndex, index );
					continue;
				}

				// Start tag:
				const startTagMatch = parseStartTag ();
				if ( startTagMatch ) {
					handleStartTag ( startTagMatch );
					if ( shouldIgnoreFirstNewline ( lastTag, html ) ) {
						advance ( 1 );
					}
					continue;
				}
			}

			let text, rest, next;
			if ( textEnd >= 0 ) {
				rest = html.slice ( textEnd );
				while ( !endTag.test ( rest )  && !startTagOpen.test ( rest )  && !comment.test ( rest )  && !conditionalComment.test ( rest ) ) {

					// < in plain text, be forgiving and treat it as text
					next = rest.indexOf ( "<", 1 );
					if ( next < 0 ) {
						break;
					}

					textEnd += next;
					rest = html.slice ( textEnd );
				}

				text = html.substring ( 0, textEnd );
				advance ( textEnd );
			}

			if ( textEnd < 0 ) {
				text = html;
				html = "";
			}

			if ( text ) {

				// charsHandler会将文本节点放入children数组中
				charsHandler ( text, rootVNodes );
			}
		}
		else {
			let endTagLength = 0;
			const 
				stackedTag = lastTag.toLowerCase (),
				reStackedTag = reCache [ stackedTag ] ||  ( reCache [ stackedTag ] = new RegExp ( "([\\s\\S]*?)(</" + stackedTag + "[^>]*>)", "i" ) ),
				rest = html.replace ( reStackedTag, ( all, text, endTag ) => {
					endTagLength = endTag.length;
					if ( !isPlainTextElement ( stackedTag ) && stackedTag !== "noscript" ) {
						text = text.replace ( /<!\--([\s\S]*?)-->/g, "$1" )
						.replace ( /<!\[CDATA\[([\s\S]*?)]]>/g, "$1" );
					}
					if ( shouldIgnoreFirstNewline ( stackedTag, text ) ) {
						text = text.slice ( 1 );
					}

					charsHandler ( text, rootVNodes );
					return "";
				} );

			index += html.length - rest.length;
			html = rest;
			parseEndTag ( stackedTag, index - endTagLength, index );
		}

		if ( html === last ) {
			charsHandler ( html, rootVNodes );
			break;
		}
	}

	// Clean up any remaining tags
	parseEndTag ();

	function advance ( n ) {
		index += n;
		html = html.substring ( n );
	}

	function parseStartTag () {
		const start = html.match ( startTagOpen );
		if ( start ) {
			const match = {
				tagName : start [ 1 ],
				attrs : [],
				start : index
			};
			advance ( start [ 0 ].length );

			let end, attr;
			while ( !( end = html.match ( startTagClose ) ) && ( attr = html.match ( attribute ) ) ) {
				advance ( attr [ 0 ].length );
				match.attrs.push ( attr );
			}
			if ( end ) {
				match.unarySlash = end [ 1 ];
				advance ( end [ 0 ].length );
				match.end = index;
				return match;
			}
		}
	}

	function handleStartTag ( match ) {
		const 
			tagName = match.tagName,
			unary = isUnaryTag ( tagName ) || !!match.unarySlash,
			attrs = {};

		if ( lastTag === "p" && isNonPhrasingTag ( tagName ) ) {
			parseEndTag ( lastTag );
		}
		if ( canBeLeftOpenTag ( tagName ) && lastTag === tagName ) {
			parseEndTag ( tagName );
		}

		foreach ( match.attrs, args => {

			// hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
			if ( IS_REGEX_CAPTURING_BROKEN && args [ 0 ].indexOf ( "\"\"" ) === -1 ) {
				if ( args [ 3 ] === "" ) {
					delete args [ 3 ];
				}
				if ( args [ 4 ] === "" ) {
					delete args [ 4 ];
				}
				if ( args [ 5 ] === "" ) {
					delete args [ 5 ];
				}
			}

			const
				value = args [ 3 ] || args [ 4 ] || args [ 5 ] || "",
				shouldDecodeNewlines = tagName === "a" && args [ 1 ] === "href"
					? true
					: false;

			attrs [ args [ 1 ] ] = decodeAttr ( value, shouldDecodeNewlines );
		} );

		if ( !unary ) {
			lastTag = tagName;
		}
		startHandler ( tagName, attrs, unary, stack, rootVNodes );
	}

	function parseEndTag ( tagName, start, end ) {
		let pos;
		const lowerCasedTagName = ( tagName || "" ).toLowerCase ();
		if ( start === null ) {
			start = index;
		}
		if ( end === null ) {
			end = index;
		}

		// Find the closest opened tag of the same type
		if ( tagName ) {
			for ( pos = stack.length - 1; pos >= 0; pos -- ) {
				if ( stack [ pos ].nodeName.toLowerCase () === lowerCasedTagName ) {
					break;
				}
			}
		}
		else {

			// If no tag name is provided, clean shop
			pos = 0;
		}

		if ( pos >= 0 ) {

			// Close all the open elements, up the stack
			for ( let i = stack.length - 1; i >= pos; i -- ) {
				if ( ( i > pos || !tagName ) ) {
					throw htmlParserErr ( "", `tag <${ stack [ i ].nodeName }> has no matching end tag.` );
				}
				
				endHandler ( stack );
			}

			// Remove the open elements from the stack
			stack.length = pos;
			lastTag = pos && stack [ pos - 1 ].tag;
		}
		else if ( lowerCasedTagName === "br" ) {
			startHandler ( tagName, [], true, stack, rootVNodes );
		}
		else if ( lowerCasedTagName === "p" ) {
			startHandler ( tagName, [], false, stack, rootVNodes );
			endHandler ( stack );
		}
	}

	return rootVNodes.length === 1 
	? rootVNodes [ 0 ] 
	: VFragment ( rootVNodes );
}