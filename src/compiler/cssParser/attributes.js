import  { falseFunc } from "./util";

//https://github.com/slevithan/XRegExp/blob/master/src/xregexp.js#L469
const rChars = /[-[\]{}()*+?.,\\^$|#\s]/g;

/*
	attribute selectors
*/

export const rules = {
	equals ( next, data ) {
		const name = data.name;
		let value = data.value;

		if ( data.ignoreCase ) {
			value = value.toLowerCase ();

			return elem => {
				const attr = elem.attr ( name );
				return attr !== undefined && attr.toLowerCase () === value && next ( elem );
			};
		}

		return elem => {
			return elem.attr ( name ) === value && next ( elem );
		};
	},
	hyphen ( next, data ) {
		let value = data.value;
		const 
			name  = data.name,
		    len = value.length;

		if ( data.ignoreCase ) {
			value = value.toLowerCase ();

			return elem => {
				const attr = elem.attr ( name );
				return attr !== undefined &&
						( attr.length === len || attr.charAt ( len ) === "-" ) &&
						attr.substr ( 0, len ).toLowerCase () === value &&
						next ( elem );
			};
		}

		return elem => {
			const attr = elem.attr ( name );
			return attr !== undefined &&
					attr.substr ( 0, len ) === value &&
					( attr.length === len || attr.charAt ( len ) === "-" ) &&
					next ( elem );
		};
	},
	element ( next, data ) {
		const name = data.name;
		let value = data.value;

		if ( /\s/.test ( value ) ){
			return falseFunc;
		}

		value = value.replace ( rChars, "\\$&" );

		const 
			pattern = `(?:^|\\s)${ value }(?:$|\\s)`,
		    flags = data.ignoreCase ? "i" : "",
		    regex = new RegExp ( pattern, flags );

		return elem => {
			const attr = elem.attr ( name );
			return attr !== undefined && regex.test ( attr ) && next ( elem );
		};
	},
	exists ( next, data ) {
		const name = data.name;
		return elem => {
			return elem.attrs.hasOwnProperty ( name ) && next ( elem );
		};
	},
	start ( next, data ) {
		let value = data.value;
		const
			name  = data.name,
		    len = value.length;

		if ( len === 0 ) {
			return falseFunc;
		}
		
		if ( data.ignoreCase ) {
			value = value.toLowerCase ();

			return elem => {
				const attr = elem.attr ( name );
				return attr !== undefined && attr.substr ( 0, len ).toLowerCase () === value && next ( elem );
			};
		}

		return elem => {
			const attr = elem.attr ( name );
			return attr !== undefined && attr.substr ( 0, len ) === value && next ( elem );
		};
	},
	end ( next, data ) {
		let value = data.value;
		const 
			name  = data.name,
		    len   = -value.length;

		if ( len === 0 ) {
			return falseFunc;
		}

		if ( data.ignoreCase ) {
			value = value.toLowerCase ();

			return elem => {
				const attr = elem.attr ( name );
				return attr !== undefined && attr.substr ( len ).toLowerCase () === value && next ( elem );
			};
		}

		return elem => {
			const attr = elem.attr ( name );
			return attr !== undefined && attr.substr ( len ) === value && next ( elem );
		};
	},
	any ( next, data ) {
		const name  = data.name;
		let value = data.value;

		if ( value === "" ) {
			return falseFunc;
		}

		if ( data.ignoreCase ) {
			const regex = new RegExp ( value.replace ( rChars, "\\$&" ), "i" );

			return elem => {
				const attr = elem.attr ( name );
				return attr !== undefined && regex.test ( attr ) && next ( elem );
			};
		}

		return elem => {
			const attr = elem.attr ( name );
			return attr !== undefined && attr.indexOf ( value ) >= 0 && next ( elem );
		};
	},
	not ( next, data ) {
		const name  = data.name;
		let value = data.value;

		if ( value === "" ) {
			return elem => {
				return !!elem.attr ( name ) && next ( elem );
			};
		}
		else if ( data.ignoreCase ) {
			value = value.toLowerCase ();

			return elem => {
				const attr = elem.attr ( name );
				return attr !== undefined && attr.toLowerCase () !== value && next ( elem );
			};
		}

		return elem => {
			return elem.attr ( name ) !== value && next ( elem );
		};
	}
};

export default function ( next, data, options ) {
	return rules [ data.action ] ( next, data );
}