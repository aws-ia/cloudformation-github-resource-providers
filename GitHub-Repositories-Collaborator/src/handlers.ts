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
import {handleError} from "../../GitHub-Common/src/util";
import {Octokit} from "@octokit/rest";
import {Endpoints, OctokitResponse} from "@octokit/types";

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

class Resource extends BaseResource<ResourceModel> {

    private static setModelFromCreateOrUpdateApiResponse(model: ResourceModel, data: CollaboratorData): ResourceModel {
        model.owner = data.repository.owner.login;
        model.repository = data.repository.name;
        model.username = data.invitee.login;
        model.permission = Resource.permissionsToPermission(data.permissions);
        return model;
    }

    private static setModelFromReadApiResponse(model: ResourceModel, data: CollaboratorData): ResourceModel {
        model.username = data.user.login;
        model.permission = data.permission;
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
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromCreateOrUpdateApiResponse(model, response.data as CollaboratorData));
        }
        if (await this.assertHasInvitationPending(model, request)) {
            const response = await this.updateRepoInvitation(model, request);
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromCreateOrUpdateApiResponse(model, response.data as CollaboratorData));
        }
        throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
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
        if (await this.assertIsCollaborator(model, request) || await this.assertHasInvitationPending(model, request)) {
            throw new exceptions.AlreadyExists(this.typeName, request.logicalResourceIdentifier);
        }
        const response = await this.createOrUpdateCollaborator(model, request);

        // Adding invitation ID in a readonly field
        model.invitationId = response.data.id;

        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromCreateOrUpdateApiResponse(model, response.data as CollaboratorData));
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

        try {
            if (await this.assertIsCollaborator(model, request)) {
                // https://docs.github.com/en/rest/collaborators/collaborators#add-a-repository-collaborator
                await octokit.request('DELETE /repos/{owner}/{repo}/collaborators/{username}', {
                    owner: model.owner,
                    repo: model.repository,
                    username: model.username,
                });
                return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>();
            }
            if (await this.assertHasInvitationPending(model, request)) {
                // https://docs.github.com/en/rest/collaborators/invitations#delete-a-repository-invitation
                await octokit.request('DELETE /repos/{owner}/{repo}/invitations/{invitation_id}}', {
                    owner: model.owner,
                    repo: model.repository,
                    invitation_id: model.invitationId
                });
                return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>();
            }
        } catch (e) {
            handleError(e, request);
        }
        throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
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
            const actualCollaborator = await this.getCollaborator(model, request);
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromReadApiResponse(model, actualCollaborator.data as CollaboratorData));
        }
        if (await this.assertHasInvitationPending(model, request)) {
            const pendingInvitations = await this.listInvitationsByRepo(model, request);
            const relatedInvitations = pendingInvitations.filter(inv => {
                return inv.id === model.invitationId
            });
            if (relatedInvitations.length > 1) {
                logger.log(`User ${model.username} has ${relatedInvitations.length} pending invitations for this repo`);
            }
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromCreateOrUpdateApiResponse(model, relatedInvitations[0] as CollaboratorData));
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
                const invitationAsResourceModel = new ResourceModel();
                invitationAsResourceModel.owner = invitation.repository.owner.login;
                invitationAsResourceModel.repository = invitation.repository.name;
                invitationAsResourceModel.username = invitation.invitee.login;
                invitationAsResourceModel.permission = Resource.permissionsToPermission(invitation.permissions);
                return invitationAsResourceModel;
            }))
            return ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>()
                .status(OperationStatus.Success)
                .resourceModels(currentAndPendingCollaborators).build();
        } catch (e) {
            handleError(e, request);
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
        return invitations.some(invitation => invitation.invitee.login === model.username);
    }

    private async getCollaborator(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>): Promise<OctokitResponse<GetCollaboratorResponseData>> {
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
            return response;
        } catch (e) {
            handleError(e, request);
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
            handleError(e, request);
        }
    }

    private async listInvitationsByRepo(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });
        try {
            return await octokit.paginate(octokit.repos.listInvitations,
                {
                    owner: model.owner,
                    repo: model.repository
                });
        } catch (e) {
            handleError(e, request);
        }
    }

    private async updateRepoInvitation(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        //https://docs.github.com/en/rest/collaborators/invitations#update-a-repository-invitation
        const octokit = new Octokit({
            auth: model.gitHubAccess
        });
        try {
            return await octokit.request("PATCH /repos/{owner}/{repo}/invitations/{invitation_id}",
                {
                    owner: model.owner,
                    repo: model.repository,
                    invitation_id: model.invitationId,
                    permissions: model.permission as "read" | "write" | "maintain" | "triage" | "admin"
                });
        } catch (e) {
            handleError(e, request);
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
