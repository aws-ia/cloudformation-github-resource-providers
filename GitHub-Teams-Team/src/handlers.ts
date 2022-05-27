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
import {OctokitResponse} from "@octokit/types"

interface CallbackContext extends Record<string, any> {}

class Resource extends BaseResource<ResourceModel> {

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
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        const octokit = new Octokit({auth: model.gitHubAccess});

        let response: OctokitResponse<any>;
        try {
            const privacy = model.privacy as "closed" | "secret";
            response = await octokit.request('POST /orgs/{org}/teams', {
                org: model.organisation,
                name: model.name,
                description: model.description,
                privacy: privacy
            });
        }catch (e) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }


        model.slug = response.data.slug;
        progress.status = OperationStatus.Success;

        return progress;
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
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);

        const octokit = new Octokit({auth: model.gitHubAccess});

        let response: OctokitResponse<any>;
        try {
            const privacy = model.privacy as "closed" | "secret";
            response = await octokit.request('PATCH /orgs/{org}/teams/{team_slug}', {
                org: model.organisation,
                team_slug: request.previousResourceState.slug,
                name: model.name,
                description: model.description,
                privacy: privacy
            });
        }catch (e) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        progress.status = OperationStatus.Success;
        model.slug = response.data.slug;
        return progress;
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
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>();
        const octokit = new Octokit({auth: model.gitHubAccess});

        let response: OctokitResponse<any>;
        try {
            response = await octokit.request('DELETE /orgs/{org}/teams/{team_slug}', {
                org: model.organisation,
                team_slug: model.slug
            });
        } catch (e) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        progress.status = OperationStatus.Success;
        return progress;
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
        const octokit = new Octokit({auth: model.gitHubAccess});

        let response: OctokitResponse<any>;
        try {
            response = await octokit.request('GET /orgs/{org}/teams/{team_slug}', {
                org: model.organisation,
                team_slug: model.slug
            });
        }catch (e) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        model.description = response.data.description;
        model.name = response.data.name;
        model.privacy = response.data.privacy;

        const progress = ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(model);
        return progress;
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

        const octokit = new Octokit({auth: model.gitHubAccess});
        let response: any;

        try{
            response = await octokit.paginate('GET /orgs/{org}/teams', {
                    org: model.organisation,
                    per_page: 100
                },
                response1 => {
                    return response1.data
            });
        } catch (e) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        let models = [];
        for(const m of response) {
            let resourceModel = new ResourceModel();
            resourceModel.name = m.name;
            resourceModel.description = m.description;
            resourceModel.privacy =  m.privacy;
            resourceModel.slug = m.slug;
            resourceModel.organisation = model.organisation;
            models.push(resourceModel);
        }

        return ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>()
            .status(OperationStatus.Success)
            .resourceModels(models).build();
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
