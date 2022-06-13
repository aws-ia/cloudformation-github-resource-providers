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
import {Octokit} from "@octokit/core";
import {isOctokitRequestError} from "../../GitHub-Common/src/util";
import {Endpoints, OctokitResponse, RequestError} from "@octokit/types";

interface CallbackContext extends Record<string, any> {}

type GetTeamRepoAccessEndpoint = 'GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}';
type PutTeamRepoAccessEndpoint = 'PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}';
type DeleteTeamRepoAccessEndpoint = 'DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}';

type GetTeamRepoAccessResponseData = Endpoints[GetTeamRepoAccessEndpoint]['response']['data'];
type PutTeamRepoAccessResponseData = Endpoints[PutTeamRepoAccessEndpoint]['response']['data'];
type DeleteTeamRepoAccessResponseData = Endpoints[DeleteTeamRepoAccessEndpoint]['response']['data'];

class Resource extends BaseResource<ResourceModel> {

    private async getTeamRepoAccess(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>): Promise<OctokitResponse<GetTeamRepoAccessResponseData>> {
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            return await octokit.request<GetTeamRepoAccessEndpoint>('GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}', {
                org: model.org,
                team_slug: model.team,
                owner: model.owner,
                repo: model.repository
            });
        } catch (e) {
            this.processRequestException(e, request);
        }
    }

    private async putTeamRepoAccess(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>): Promise<OctokitResponse<PutTeamRepoAccessResponseData>> {
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            return await octokit.request<PutTeamRepoAccessEndpoint>('PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}', {
                org: model.org,
                team_slug: model.team,
                owner: model.owner,
                repo: model.repository,
                permission: model.permission as "pull" | "push" | "admin" | "maintain" | "triage" | undefined
            });
        } catch (e) {
            this.processRequestException(e, request);
        }
    }

    private async deleteTeamRepoAccess(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>): Promise<OctokitResponse<DeleteTeamRepoAccessResponseData>> {
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        try {
            return await octokit.request<DeleteTeamRepoAccessEndpoint>('DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}', {
                org: model.org,
                team_slug: model.team,
                owner: model.owner,
                repo: model.repository
            });
        } catch (e) {
            this.processRequestException(e, request);
        }
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

    private async assertTeamRepoAccess(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        try {
            await this.getTeamRepoAccess(model, request);
        } catch (e) {
            return false;
        }
        return true;
    }

    private parsePermission(data: GetTeamRepoAccessResponseData) {
        if (data.permissions.admin === true) {
            return 'admin';
        }
        if (data.permissions.maintain === true) {
            return 'maintain';
        }
        if (data.permissions.triage === true) {
            return 'triage';
        }
        if (data.permissions.pull) {
            return 'pull';
        }
        return 'push';
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

        if (await this.assertTeamRepoAccess(model, request)) {
            throw new exceptions.AlreadyExists(this.typeName, request.logicalResourceIdentifier);
        }

        await this.putTeamRepoAccess(model, request);

        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(model);
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

        if (!(await this.assertTeamRepoAccess(model, request))) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        await this.putTeamRepoAccess(model, request);

        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(model);
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

        if (!(await this.assertTeamRepoAccess(model, request))) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        await this.deleteTeamRepoAccess(model, request);

        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>();
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

        const response = await this.getTeamRepoAccess(model, request);

        model.permission = this.parsePermission(response.data);

        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(model);
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
