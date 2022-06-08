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
import {Permissions, ResourceModel} from './models';
import {isOctokitRequestError} from "../../Common/util";
import {Octokit} from "@octokit/rest";
import {Endpoints, OctokitResponse, RequestError} from "@octokit/types";

interface CallbackContext extends Record<string, any> {
}

type GetCollaboratorEndpoint = 'GET /repos/{owner}/{repo}/collaborators/{username}/permission';
type CreateOrUpdateCollaboratorEndpoint = 'PUT /repos/{owner}/{repo}/collaborators/{username}';
type ListCollaboratorEndpoint = 'GET /repos/{owner}/{repo}/collaborators';
type ListInvitationsEndpoint = 'GET /repos/{owner}/{repo}/invitations';
type UpdateInvitationsEndpoint = 'PATCH /repos/{owner}/{repo}/invitations/{invitation_id}';

type GetCollaboratorResponseData = Endpoints[GetCollaboratorEndpoint]['response']['data'];
type CreateOrUpdateCollaboratorResponseData = Endpoints[CreateOrUpdateCollaboratorEndpoint]['response']['data'];
type ListCollaboratorResponseData = Endpoints[ListCollaboratorEndpoint]['response']['data'];
type ListInvitationsResponseData = Endpoints[ListInvitationsEndpoint]['response']['data'];
type UpdateInvitationsResponseData = Endpoints[UpdateInvitationsEndpoint]['response']['data'];


type CollaboratorData =
    GetCollaboratorResponseData &
    CreateOrUpdateCollaboratorResponseData &
    ListCollaboratorResponseData &
    ListInvitationsResponseData &
    UpdateInvitationsResponseData;

type InvitationModel = {
    invitationId: number,
    owner: string,
    repository: string,
    user: string,
    permissions: string,
    createdAt: string,
}

class Resource extends BaseResource<ResourceModel> {

    private static setModelFromCreateOrUpdateApiResponse(model: ResourceModel, data: CollaboratorData, logger?: LoggerProxy): ResourceModel {
        if (!!logger) {
            logger.log(`jdc initial model: ${JSON.stringify(model)}`);
            logger.log(`jdc initial data: ${JSON.stringify(data)}`);
        }
        model.owner = data.repository.owner.login;
        model.repository = data.repository.name;
        model.username = data.invitee.login;
        model.permission = Resource.permissionsToPermission(data.permissions);
        if (!!logger) {
            logger.log(`jdc final model ${JSON.stringify(model)}`);
        }
        return model;
    }

    private static setModelFromReadApiResponse(model: ResourceModel, data: CollaboratorData, logger?: LoggerProxy): ResourceModel {
        if (!!logger) {
            logger.log(`jdc initial model: ${JSON.stringify(model)}`);
            logger.log(`jdc initial data: ${JSON.stringify(data)}`);
        }
        model.username = data.user.login;
        model.permission = data.permission;
        if (!!logger) {
            logger.log(`jdc final read model ${JSON.stringify(model)}`);
        }
        return model;
    }

    private static setModelFromInvitationApiResponse(model: ResourceModel, data: InvitationModel, logger: LoggerProxy) {
        if (!!logger) {
            logger.log(`jdc initial invitation model: ${JSON.stringify(model)}`);
            logger.log(`jdc initial invitation data: ${JSON.stringify(data)}`);
        }
        model.owner = data.owner;
        model.repository = data.repository;
        model.username = data.user;
        model.permission = Resource.permissionsToPermission(data.permissions);
        if (!!logger) {
            logger.log(`jdc final invitation read model ${JSON.stringify(model)}`);
        }
        return model;
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
        if (await this.assertIsCollaborator(model, request)) {
            const response = await this.createOrUpdateCollaborator(model, request);
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromCreateOrUpdateApiResponse(model, response.data as CollaboratorData, logger));
        }
        if (await this.assertHasInvitationPending(model, request)) {
            const response = await this.updateRepoInvitation(model, request);
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromCreateOrUpdateApiResponse(model, response.data as CollaboratorData, logger));
        }
        throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
    }

    private static getErrorMessage(requestError: RequestError, errorResponse: Error) {
        return requestError.errors?.map(e => e.message).join('\n') || errorResponse.message;
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
        logger.log('jdc creating')
        if (await this.assertIsCollaborator(model, request) || await this.assertHasInvitationPending(model, request)) {
            throw new exceptions.AlreadyExists(this.typeName, request.logicalResourceIdentifier);
        }
        const response = await this.createOrUpdateCollaborator(model, request);
        logger.log(`jdc create response: ${response}`);

        // Add invitation ID in a readonly field
        model.invitationId = response.data.id;

        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromCreateOrUpdateApiResponse(model, response.data as CollaboratorData, logger));
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
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });

        //todojd refactor to minimize calls
        const isCollaborator = await this.assertIsCollaborator(model, request);
        const hasInvitations = this.assertHasInvitationPending(model, request);

        if (!isCollaborator && !hasInvitations) {
            logger.log(`jdc it exist: ${JSON.stringify(isCollaborator)}`);
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }
        try {
            if (isCollaborator) {
                // https://docs.github.com/en/rest/collaborators/collaborators#add-a-repository-collaborator
                await octokit.request('DELETE /repos/{owner}/{repo}/collaborators/{username}', {
                    owner: model.owner,
                    repo: model.repository,
                    username: model.username,
                });
            }
            if (hasInvitations) {
                // https://docs.github.com/en/rest/collaborators/invitations#delete-a-repository-invitation
                await octokit.request('DELETE /repos/{owner}/{repo}/invitations/{invitation_id}}', {
                    owner: model.owner,
                    repo: model.repository,
                    invitation_id: model.invitationId
                });
            }
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>();
        } catch (e) {
            this.handleError(e, request);
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

        if (await this.assertIsCollaborator(model, request)) {
            const actualCollaborator = await this.getCollaborator(model, request, logger);
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromReadApiResponse(model, actualCollaborator.data as CollaboratorData, logger));
        }
        if (await this.assertHasInvitationPending(model, request)) {
            const pendingInvitations = await this.listInvitationsByRepo(model, request);
            const relatedInvitations = pendingInvitations.filter(inv => {
                return inv.invitationId === model.invitationId
            });
            if (relatedInvitations.length > 1) {
                logger.log(`User ${model.username} has ${relatedInvitations.length} pending invitations for this repo`);
            }
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromInvitationApiResponse(model, relatedInvitations[0], logger));
        }
        throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
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
            const collaborators = await octokit.paginate(octokit.repos.listCollaborators,
                {
                    owner: model.owner,
                    repo: model.repository
                },
                response => response.data.map(membershipItem => {
                    const resourceModel = new ResourceModel();
                    resourceModel.username = membershipItem.login;
                    resourceModel.repository = model.repository;
                    resourceModel.owner = model.owner;
                    resourceModel.permission = Resource.getPermissionName(membershipItem.permissions as Permissions);
                    return resourceModel;
                }));
            const invitations = await this.listInvitationsByRepo(model, request);
            const currentAndPendingCollaborators = collaborators.concat(invitations.map(invitation => {
                const invitationAsRM = new ResourceModel();
                invitationAsRM.owner = invitation.owner;
                invitationAsRM.repository = invitation.repository;
                invitationAsRM.username = invitation.user;
                invitationAsRM.permission = Resource.permissionsToPermission(invitation.permissions);
                return invitationAsRM;
            }))
            return ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>()
                .status(OperationStatus.Success)
                .resourceModels(currentAndPendingCollaborators).build();
        } catch (e) {
            this.handleError(e, request);
        }
    }

    private async assertIsCollaborator(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        try {
            const collaborator = await this.getCollaborator(model, request);
            return !!collaborator && collaborator.data.permission !== "none";
        } catch (e) {
            if (e.status === 404) {
                return false;
            }
            throw e;
        }
    }

    private async assertHasInvitationPending(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        const invitations = await this.listInvitationsByRepo(model, request);
        return invitations.some(invitation => invitation.user === model.username);
    }

    private async getCollaborator(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>, logger?: LoggerProxy): Promise<OctokitResponse<GetCollaboratorResponseData>> {
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });
        try {
            const response = await octokit.request('GET /repos/{owner}/{repo}/collaborators/{username}/permission', {
                owner: model.owner,
                repo: model.repository,
                username: model.username,
                permission: model.permission
            });
            if (logger) {
                logger.log(`jdc read response: ${JSON.stringify(response)}`)
            }
            return response;
        } catch (e) {
            this.handleError(e, request);
        }
    }

    /**
     * https://docs.github.com/en/rest/collaborators/collaborators#add-a-repository-collaborator
     * @param model
     * @param request
     * @private
     */
    private async createOrUpdateCollaborator(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>): Promise<OctokitResponse<CreateOrUpdateCollaboratorResponseData>> {
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });
        try {
            return await octokit.request('PUT /repos/{owner}/{repo}/collaborators/{username}', {
                owner: model.owner,
                repo: model.repository,
                username: model.username,
                permission: model.permission as "pull" | "push" | "admin" | "maintain" | "triage"
            });
        } catch (e) {
            this.handleError(e, request);
        }
    }

    private async listInvitationsByRepo(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });
        try {
            const pendingInvites = await octokit.paginate(octokit.repos.listInvitations,
                {
                    owner: model.owner,
                    repo: model.repository
                },
                response => response.data.map(invitation => {
                    return {
                        user: invitation.invitee.login,
                        repository: invitation.repository.name,
                        owner: invitation.repository.owner.login,
                        invitationId: invitation.id,
                        permissions: invitation.permissions,
                        createdAt: invitation.created_at
                    };
                }));

            return pendingInvites as InvitationModel[];
        } catch (e) {
            this.handleError(e, request);
        }
    }

    private async updateRepoInvitation(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        //https://docs.github.com/en/rest/collaborators/invitations#update-a-repository-invitation
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });
        try {
            const response = await octokit.request("PATCH /repos/{owner}/{repo}/invitations/{invitation_id}",
                {
                    owner: model.owner,
                    repo: model.repository,
                    invitation_id: model.invitationId,
                    permissions: model.permission as "read" | "write" | "maintain" | "triage" | "admin"
                });
            return response;
        } catch (e) {
            this.handleError(e, request);
        }
    }


    private static getPermissionName(permissions: Permissions) {
        // example:
        // "permissions": {
        //     "pull": true,
        //     "triage": true,
        //     "push": true,
        //     "maintain": false,
        //     "admin": false
        // }
        if (permissions.admin)
            return 'admin';
        if (permissions.maintain)
            return 'maintain';
        if (permissions.push)
            return 'push';
        if (permissions.triage)
            return 'triage';
        if (permissions.pull)
            return 'pull';

        throw new exceptions.InternalFailure('Error mapping the permissions');
    }

    private handleError(errorResponse: Error, request: ResourceHandlerRequest<ResourceModel>) {
        // TODO: Should have utility to get the right exception
        if (!isOctokitRequestError(errorResponse))
            throw new exceptions.InternalFailure(errorResponse);

        const requestError = errorResponse as unknown as RequestError;
        switch (requestError.status) {
            case 401:
            case 403:
                throw new exceptions.AccessDenied();
            case 404:
                throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
            case 422:
                throw new exceptions.InvalidRequest(Resource.getErrorMessage(requestError, errorResponse));
            default:
                throw new exceptions.InternalFailure(Resource.getErrorMessage(requestError, errorResponse));
        }
    }

    private static permissionsToPermission(permissions: string) {
        switch (permissions) {
            case "read":
                return "pull";
            case "write":
                return "push";
            case "triage":
            case "maintain":
            case "admin":
                return permissions
            default:
                throw new exceptions.InternalFailure("Error reading the permission");
        }

    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
