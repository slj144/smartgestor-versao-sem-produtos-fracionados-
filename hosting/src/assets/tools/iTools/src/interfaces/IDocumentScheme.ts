
type IDocumentSchemeType = "array" | "string" | "boolean" | "number" | "null";
type IDocumentSchemeBjsonType = "object" | "array" | "bool" | "int" | "long" | "double" | "decimal" | "objectId" | "regex" | "date";

export interface ISCheme{
	$jsonSchema?: IDocumentScheme;
	$or?: any[];
}

export interface IDocumentScheme {
	type?:  IDocumentSchemeType | IDocumentSchemeType[];
	bsonType?: IDocumentSchemeBjsonType | IDocumentSchemeBjsonType[];

	// A short title or name to the data that scheme is modeling.

	title?: string,

	// Description if fail in validation

	description?: string;

	// Required Properties

	required?: string[],

	// Default Properties

	properties?:{
		[key: string]: IDocumentScheme;
	};
	
	// Arrays

	items?: IDocumentScheme | IDocumentScheme[];
	additionalItems?: boolean | IDocumentScheme,
	minItems?: number;
	maxItems?: number;
	uniqueItems?: boolean;

	// Number Properties

	maximum?: number;
	minimum?: number;
	exclusiveMaximum?: number;
	exclusiveMinimum?: number;

	// String properties

	pattern?: string;
	minLength?: number;
	maxLength?: number;

	// Controls properties quantity

	minProperties?: number;
	maxProperties?: number;

	// Propeties with Regexp in keys

	patternProperties?: {
	 	[key: string]: IDocumentScheme;
	};

	// Default is true. If true, a a document can hold additional fields that are not defined in schema

	additionalProperties?: boolean | IDocumentScheme,

	// Specify the schema dependencies

	dependencies?: {
		[key: string]: IDocumentScheme | string[];
	};
}
