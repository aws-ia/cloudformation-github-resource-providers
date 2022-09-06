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