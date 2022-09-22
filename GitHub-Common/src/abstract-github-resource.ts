import {
    BaseModel,
    exceptions,
    ResourceHandlerRequest
} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib";
import {AbstractBaseResource} from "./abstract-base-resource";
import {RequestError} from "@octokit/types";

export abstract class AbstractGitHubResource<ResourceModelType extends BaseModel, GetResponseData, CreateResponseData, UpdateResponseData, TypeConfigurationM> extends AbstractBaseResource<ResourceModelType, GetResponseData, CreateResponseData, UpdateResponseData, Error | RequestError, TypeConfigurationM> {

    processRequestException(e: Error | RequestError, request: ResourceHandlerRequest<ResourceModelType>) {
        if (!this.isOctokitRequestError(e)) {
            throw new exceptions.ServiceInternalError((e as Error).message);
        }

        const errorMessage = `[${(e as RequestError).name}] ${(e as Error).message}`;

        switch ((e as unknown as RequestError).status) {
            case 401:
                throw new exceptions.InvalidCredentials(errorMessage)
            case 403:
                throw new exceptions.AccessDenied(`Access denied, please check your API token: ${errorMessage}`);
            case 404:
                throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
            case 400:
            case 422:
                throw new exceptions.AlreadyExists(this.typeName, request.logicalResourceIdentifier);
            default:
                throw new exceptions.ServiceInternalError(`Unexpected error occurred while talking to the GitHub API: ${errorMessage}`);
        }
    }

    private isOctokitRequestError(ex: object) {
        return ex instanceof Object && ex.hasOwnProperty('status') && ex.hasOwnProperty('name') && ex.hasOwnProperty('message');
    }

}