import { type } from "../../func/util";

export default function ( text ) {
	return type ( text ) === "object" ? text : JSON.parse ( text );
}