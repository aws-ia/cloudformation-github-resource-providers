import {RequestError} from "@octokit/types";
import {
    exceptions,
    ResourceHandlerRequest,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import {BaseModel} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';

export function isOctokitRequestError(ex: object) {
    return ex instanceof Object && ex.hasOwnProperty('status') && ex.hasOwnProperty('name');
}

export function handleError(errorResponse: Error, request: ResourceHandlerRequest<BaseModel>, typeName: string) {
    if (!isOctokitRequestError(errorResponse))
        throw new exceptions.InternalFailure(errorResponse);

    const requestError = errorResponse as unknown as RequestError;
    switch (requestError.status) {
        case 401:
        case 403:
            throw new exceptions.AccessDenied();
        case 400:
            throw new exceptions.AlreadyExists(typeName, request.logicalResourceIdentifier);
        case 404:
            throw new exceptions.NotFound(typeName, request.logicalResourceIdentifier);
        case 422:
            throw new exceptions.AlreadyExists(typeName, request.logicalResourceIdentifier);
        default:
            throw new exceptions.InternalFailure(getErrorMessage(requestError, errorResponse));
    }
}

function getErrorMessage(requestError: RequestError, errorResponse: Error) {
    return requestError.errors?.map(e => e.message).join('\n') || errorResponse.message;
}

export enum CaseTransformer {
    PASCAL_TO_CAMEL,
    PASCAL_TO_SNAKE,
    SNAKE_TO_CAMEL,
}

export class Transformer {
    private readonly _object: { [key: string]: any; };
    private caseTransformer: CaseTransformer;
    private useSafeKeys: boolean;
    private LANGUAGE_KEYWORDS = [
        "abstract",
        "any",
        "as",
        "async",
        "await",
        "bigint",
        "boolean",
        "break",
        "case",
        "catch",
        "class",
        "configurable",
        "const",
        "constructor",
        "continue",
        "debugger",
        "declare",
        "default",
        "delete",
        "do",
        "else",
        "enum",
        "enumerable",
        "export",
        "extends",
        "false",
        "finally",
        "for",
        "from",
        "function",
        "get",
        "if",
        "in",
        "implements",
        "import",
        "instanceof",
        "interface",
        "is",
        "let",
        "module",
        "namespace",
        "never",
        "new",
        "null",
        "number",
        "of",
        "package",
        "private",
        "protected",
        "public",
        "readonly",
        "require",
        "return",
        "set",
        "static",
        "string",
        "super",
        "switch",
        "symbol",
        "this",
        "throw",
        "true",
        "try",
        "type",
        "typeof",
        "undefined",
        "value",
        "var",
        "void",
        "while",
        "with",
        "writable",
        "yield",
    ];

    constructor(object: { [key: string]: any }) {
        this._object = object;
    }

    /**
     * Returns an instance of `Transformer` for the given object, that let you chain other options/methods.
     * This is intended to always call at then end {@link Transformer#transform} to return the transformed object.
     *
     * @param object The object for which you wish the transform its keys.
     */
    public static for(object: { [key: string]: any }) {
        return new Transformer(object);
    }

    /**
     * Used to specify how to transform the keys, like PascalCase to camelCase.
     * See enum {@link CaseTransformer} for all available options.
     *
     * @param caseTransformer The transformer to use on the object keys.
     */
    public transformKeys(caseTransformer: CaseTransformer) {
        this.caseTransformer = caseTransformer;
        return this;
    }

    /**
     * Used to generate transform keys with format that the model auto-generation for TypeScript expects.
     *
     * Detail: The model auto-generation will suffix keys with `_` if they are keywords from the language
     * (see https://github.com/cloudsoft/cloudformation-cli-typescript-plugin/blob/master/python/rpdk/typescript/utils.py#L83-L86)
     */
    public forModelIngestion() {
        this.useSafeKeys = true;
        return this;
    }

    /**
     * Transform the given object keys, according to the given {@link CaseTransformer}.
     *
     * This will return `undefined` if given `object` is not set.
     * This will throw an exception is the given {@link CaseTransformer} is invalid.
     */
    public transform() {
        switch (this.caseTransformer) {
            case CaseTransformer.PASCAL_TO_CAMEL:
                return this.transformObjectKeys(this._object, key => key.substring(0, 1).toLocaleLowerCase() + key.substring(1));
            case CaseTransformer.PASCAL_TO_SNAKE:
                return this.transformObjectKeys(this._object, key => key.substring(0, 1).toLocaleLowerCase() + key.substring(1).replace(/([A-Z])/g, (input) => `_${input.toLocaleLowerCase()}`));
            case CaseTransformer.SNAKE_TO_CAMEL:
                return this.transformObjectKeys(this._object, key => key.substring(0, 1).toLocaleLowerCase() + key.substring(1).replace(/_([a-z])/g, (input, p1) => `${p1.toLocaleUpperCase()}`));
            default:
                throw new Error(`Case transformer "${this.caseTransformer}" not supported`);
        }
    }

    private transformObjectKeys(object: { [key: string]: any }, transformer: (key: string) => string) {
        if (!object) {
            return object;
        }

        return Object.keys(object).reduce((map, key) => {
            let value = object[key];
            if (value && value instanceof Object && !(value instanceof Array) && !(value instanceof Set)) {
                value = this.transformObjectKeys(value, transformer);
            }
            if (value && value instanceof Set) {
                value = Array.of(...value);
            }
            if (value && Array.isArray(value)) {
                value = value.map(item => item && item instanceof Object && !(item instanceof Array) && !(item instanceof Set)
                    ? this.transformObjectKeys(item, transformer)
                    : item);
            }
            let newKey = transformer(key);
            if (this.useSafeKeys) {
                newKey = this.safeKey(newKey);
            }
            map[newKey] = value;
            return map;
        }, {} as { [key: string]: any })
    }

    private safeKey(key: string) {
        return this.LANGUAGE_KEYWORDS.includes(key)
            ? `${key}_`
            : key;
    }
}

// For backwards compatibility
export function transformObjectCase(model: { [key: string]: any }, caseTransformer: CaseTransformer){
    return Transformer.for(model)
        .transformKeys(caseTransformer)
        .transform();
}
