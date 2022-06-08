import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import {ResourceModel} from './models';
import {Octokit} from "@octokit/rest";
import {RequestError} from "@octokit/types";
import {isOctokitRequestError} from "../../GitHub-Common/src/util";

interface CallbackContext extends Record<string, any> {}

type GetTagEndpoint = 'GET /repos/{owner}/{repo}/git/ref/{ref}';
type ListTagsEndpoint = 'GET /repos/{owner}/{repo}/git/matching-refs/{ref}';
type DeleteTagEndpoint = 'DELETE /repos/{owner}/{repo}/git/ref/{ref}';
type UpdateTagEndpoint = 'PATCH /repos/{owner}/{repo}/git/refs/{ref}';
type CreateTagEndpoint = 'POST /repos/{owner}/{repo}/git/refs';

class Resource extends BaseResource<ResourceModel> {

    private async getTag(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            return await octokit.request<GetTagEndpoint>('GET /repos/{owner}/{repo}/git/ref/{ref}', {
                owner: model.owner,
                repo: model.repository,
                ref: `tags/${model.tag}`
            });
        } catch (e) {
            this.processRequestException(e, request);
        }
    }

    private async assertTagExists(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        try {
            await this.getTag(model, request);
        } catch (e) {
            return false;
        }
        return true;
    }

    private processRequestException(e: Error, request: ResourceHandlerRequest<ResourceModel>) {
        if (isOctokitRequestError(e) && (e as unknown as RequestError).status === 404) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }
        if (isOctokitRequestError(e) && (e as unknown as RequestError).status === 403) {
            throw new exceptions.AccessDenied((e as unknown as RequestError).errors?.map(e => e.message).join('\n') || e.message);
        }
        throw new exceptions.InternalFailure(e);
    }

    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);

        if (await this.assertTagExists(model, request)) {
            throw new exceptions.AlreadyExists(this.typeName, request.logicalResourceIdentifier);
        }

        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            await octokit.request<CreateTagEndpoint>('POST /repos/{owner}/{repo}/git/refs', {
                owner: model.owner,
                repo: model.repository,
                // Note the format is different for `ref`. This needs to be the full git ref target
                ref: `refs/tags/${model.tag}`,
                sha: model.sha
            });

            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(model);
        } catch (e) {
            this.processRequestException(e, request);
        }
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Update)
    public async update(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);

        if (!(await this.assertTagExists(model, request))) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            await octokit.request<UpdateTagEndpoint>('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
                owner: model.owner,
                repo: model.repository,
                ref: `tags/${model.tag}`,
                sha: model.sha,
                force: model.force
            });

            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(model);
        } catch (e) {
            this.processRequestException(e, request);
        }
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Delete)
    public async delete(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);

        if (!(await this.assertTagExists(model, request))) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            await octokit.request<DeleteTagEndpoint>('DELETE /repos/{owner}/{repo}/git/refs/{ref}', {
                owner: model.owner,
                repo: model.repository,
                ref: `tags/${model.tag}`
            });

            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>();
        } catch (e) {
            this.processRequestException(e, request);
        }
    }

    /**
     * CloudFormation invokes this handler as part of a stack update operation when
     * detailed information about the resource's current state is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Read)
    public async read(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);

        const response = await this.getTag(model, request);
        model.sha = response.data.object.sha;

        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(model);
    }

    /**
     * CloudFormation invokes this handler when summary information about multiple
     * resources of this resource provider is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.List)
    public async list(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);

        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            const response = await octokit.paginate<ListTagsEndpoint>('GET /repos/{owner}/{repo}/git/matching-refs/{ref}', {
                owner: model.owner,
                repo: model.repository,
                ref: `tags/${model.tag}`
            });

            return ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>()
                .status(OperationStatus.Success)
                .resourceModels(response.map(ref => {
                    const resourceModel = new ResourceModel(model);
                    resourceModel.sha = ref.object.sha;
                    return resourceModel;
                })).build();
        } catch (e) {
            this.processRequestException(e, request);
        }
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
