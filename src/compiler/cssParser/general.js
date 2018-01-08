import { foreach } from "../../func/util";
import { cssParserErr } from "../../error";
import attributes from "./attributes";
import pseudos from "./pseudos";

var DomUtils    = require("domutils"),
    getChildren = DomUtils.getChildren,
    getSiblings = DomUtils.getSiblings;

/*
	all available rules
*/
export default {
	attribute : attributes,
	pseudo : pseudos,

	//tags
	tag ( next, data ) {
		const name = data.name;
		return elem => {
			return elem.nodeName.toLowerCase () === name && next ( elem );
		};
	},

	//traversal
	descendant ( next, rule, context, acceptSelf ) {
		return elem => {

			if (acceptSelf && next ( elem ) ) {
				return true;
			}

			let found = false;
			while ( !found && ( elem = elem.parent ) ) {
				found = next ( elem );
			}

			return found;
		};
	},
	parent ( next, data ) {
		// if ( options && options.strict ) {
		// 	throw cssParserErr ( "syntax", "Parent selector isn't part of CSS3" );
		// }

		return elem => {
			return getChildren ( elem ).some ( elem => {
				return elem.nodeType === 1 && next ( elem );
			} );
		};
	},
	child ( next ) {
		return elem => {
			const parent = elem.parent;
			return !!parent && next ( parent );
		};
	},
	sibling ( next ) {
		return elem => {
			const siblings = getSiblings ( elem );
			foreach ( siblings, sibling => {
				if ( sibling.nodeType === 1 ) {
					if ( sibling === elem ) {
						return false;
					}
					if ( next ( sibling ) ) {
						return true;
					}
				}
			} );

			return false;
		};
	},
	adjacent ( next ) {
		return elem => {

			const siblings = getSiblings ( elem );
			let lastElement;
			foreach ( siblings, sibling => {
				if ( sibling.nodeType === 1 ) {
					if ( sibling === elem ) {
						return false;
					}

					lastElement = sibling;
				}
			} );

			return !!lastElement && next ( lastElement );
		};
	},
	universal ( next ) {
		return next;
	}
};