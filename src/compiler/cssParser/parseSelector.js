import { cssParserErr } from "../../error";

const 
	rName = /^(?:\\.|[\w\-\u00c0-\uFFFF])+/,
    rEscape = /\\([\da-f]{1,6}\s?|(\s)|.)/ig,

    //modified version of https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L87
    rAttr = /^\s*((?:\\.|[\w\u00c0-\uFFFF\-])+)\s*(?:(\S?)=\s*(?:(['"])(.*?)\3|(#?(?:\\.|[\w\u00c0-\uFFFF\-])*)|)|)\s*(i)?\]/,

	actionTypes = {
		"undefined" : "exists",
		"" :  "equals",
		"~" : "element",
		"^" : "start",
		"$" : "end",
		"*" : "any",
		"!" : "not",
		"|" : "hyphen"
	},

	simpleSelectors = {
		">" : "child",
		"<" : "parent",
		"~" : "sibling",
		"+" : "adjacent"
	},

	attribSelectors = {
		"#" : ["id", "equals"],
		"." : ["class", "element"]
	},

	//pseudos, whose data-property is parsed as well
	unpackPseudos = {
		"has" : true,
		"not" : true,
		"matches" : true
	},

	stripQuotesFromPseudos = {
		"contains" : true,
		"icontains" : true
	},

	quotes = {
		"\"" : true,
		"'" : true
	};

//unescape function taken from https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L139
// function funescape ( _, escaped, escapedWhitespace ) {
// 	const high = "0x" + escaped - 0x10000;

// 	// NaN means non-codepoint
// 	// Support: Firefox
// 	// Workaround erroneous numeric interpretation of +"0x"
// 	return high !== high || escapedWhitespace ?
// 		escaped :

// 		// BMP codepoint
// 		high < 0 ?
// 			String.fromCharCode ( high + 0x10000 ) :

// 			// Supplemental Plane codepoint (surrogate pair)
// 			String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
// }

function unescapeCSS ( str ) {
	return str.replace ( rEscape, ( _, escaped, escapedWhitespace ) => {
		const high = "0x" + escaped - 0x10000;

		// NaN means non-codepoint
		// Support: Firefox
		// Workaround erroneous numeric interpretation of +"0x"
		return escapedWhitespace ?
			escaped :

			// BMP codepoint
			high < 0 ?
				String.fromCharCode ( high + 0x10000 ) :

				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode ( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );		// eslint-disable-line
	} );
}

function isWhitespace ( c ) {
	return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
}

function actionToParseSelector ( subselects, selector ) {
	let tokens = [],
		sawWS = false,
		data, firstChar, name, quot;

	function getName(){
		const sub = selector.match ( rName ) [ 0 ];
		selector = selector.substr ( sub.length );
		return unescapeCSS ( sub );
	}

	function stripWhitespace ( start ) {
		while ( isWhitespace ( selector.charAt ( start ) ) ) {
			start++;
		}

		selector = selector.substr ( start );
	}

	stripWhitespace ( 0 );

	while ( selector !== "" ) {
		firstChar = selector.charAt ( 0 );

		if ( isWhitespace ( firstChar ) ) {
			sawWS = true;
			stripWhitespace ( 1 );
		}
		else if ( firstChar in simpleSelectors ) {
			tokens.push ( {
				type: simpleSelectors [ firstChar ]
			} );
			sawWS = false;

			stripWhitespace ( 1 );
		}
		else if ( firstChar === "," ) {
			if ( tokens.length === 0 ) {
				throw cssParserErr ( "syntax", "empty sub-selector" );
			}

			subselects.push ( tokens );
			tokens = [];
			sawWS = false;
			stripWhitespace ( 1 );
		}
		else {
			if ( sawWS ) {
				if ( tokens.length > 0 ) {
					tokens.push ( {
						type : "descendant"
					} );
				}
				sawWS = false;
			}

			if ( firstChar === "*" ) {
				selector = selector.substr ( 1 );
				tokens.push ( {
					type : "universal"
				} );
			}
			else if ( firstChar in attribSelectors ) {
				selector = selector.substr ( 1 );
				tokens.push ( {
					type : "attribute",
					name : attribSelectors [ firstChar ] [ 0 ],
					action : attribSelectors [ firstChar ] [ 1 ],
					value : getName (),
					ignoreCase : false
				} );
			}
			else if ( firstChar === "[" ) {
				selector = selector.substr ( 1 );
				data = selector.match ( rAttr );
				if ( !data ) {
					throw cssParserErr ( "syntax", `Malformed attribute selector:${ selector }` );
				}
				selector = selector.substr ( data [ 0 ].length );
				name = unescapeCSS ( data [ 1 ] );

				tokens.push ( {
					type : "attribute",
					name : name,
					action : actionTypes [ data [ 2 ] ],
					value : unescapeCSS ( data [ 4 ] || data [ 5 ] || ""),
					ignoreCase : !!data [ 6 ]
				} );

			}
			else if ( firstChar === ":" ) {
				if ( selector.charAt ( 1 ) === ":" ) {
					selector = selector.substr ( 2 );
					tokens.push ( {
						type : "pseudo-element", 
						name : getName ().toLowerCase ()
					} );

					continue;
				}

				selector = selector.substr ( 1 );

				name = getName ().toLowerCase ();
				data = null;

				if ( selector.charAt ( 0 ) === "(" ) {
					if ( name in unpackPseudos ) {
						quot = selector.charAt ( 1 );
						const quoted = quot in quotes;

						selector = selector.substr ( quoted + 1 );

						data = [];
						selector = actionToParseSelector ( data, selector );

						if ( quoted ) {
							if ( selector.charAt ( 0 ) !== quot ) {
								throw cssParserErr ( "syntax", "unmatched quotes in :" + name );
							}
							else {
								selector = selector.substr ( 1 );
							}
						}

						if ( selector.charAt ( 0 ) !== ")" ) {
							throw cssParserErr ( "syntax", "missing closing parenthesis in :" + name + " " + selector );
						}

						selector = selector.substr ( 1 );
					}
					else {
						let pos = 1,
							counter = 1;

						for ( ; counter > 0 && pos < selector.length; pos++ ) {
							if ( selector.charAt ( pos ) === "(" ) {
								counter++;
							}
							else if ( selector.charAt ( pos ) === ")" ) {
								counter--;
							}
						}

						if ( counter ) {
							throw cssParserErr ( "syntax", "parenthesis not matched" );
						}

						data = selector.substr ( 1, pos - 2 );
						selector = selector.substr ( pos );

						if ( name in stripQuotesFromPseudos ) {
							quot = data.charAt ( 0 );

							if ( quot === data.slice ( -1 ) && quot in quotes ) {
								data = data.slice ( 1, -1 );
							}

							data = unescapeCSS ( data );
						}
					}
				}

				tokens.push ( {
					type : "pseudo", 
					name : name, 
					data : data
				} );
			}
			else if ( rName.test ( selector ) ) {
				name = getName ();
				tokens.push ( {
					type : "tag", 
					name : name
				} );
			}
			else {
				if ( tokens.length && tokens [ tokens.length - 1 ].type === "descendant" ) {
					tokens.pop ();
				}

				addToken ( subselects, tokens );
				return selector;
			}
		}
	}

	addToken ( subselects, tokens );

	return selector;
}

function addToken ( subselects, tokens ) {
	if ( subselects.length > 0 && tokens.length === 0 ) {
		throw cssParserErr ( "syntax", "empty sub-selector" );
	}

	subselects.push ( tokens );
}


export default function parseSelector ( selector ) {
	const subselects = [];
	selector = actionToParseSelector ( subselects, selector + "" );

	if ( selector !== "" ) {
		throw cssParserErr ( "syntax", "Unmatched selector: " + selector );
	}

	return subselects;
}