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
import {handleError} from "../../GitHub-Common/src/util";
import {Octokit} from "@octokit/rest";
import {Endpoints, OctokitResponse} from "@octokit/types";
import {NotFound} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib/dist/exceptions";

import {version} from '../package.json';

interface CallbackContext extends Record<string, any> {}

type GetMemberEndpoint = 'GET /orgs/{org}/memberships/{username}';
type DeleteMemberEndpoint = 'DELETE /orgs/{org}/members/{username}';
type CreateMemberEndpoint = 'PUT /orgs/{org}/memberships/{username}';
type ListMemberEndpoint = 'GET /orgs/{org}/members';

type GetMemberResponseData = Endpoints[GetMemberEndpoint]['response']['data'];
type CreateMemberResponseData = Endpoints[CreateMemberEndpoint]['response']['data'];
type DeleteMemberResponseData = Endpoints[DeleteMemberEndpoint]['response']['data']
type ListMemberResponseData = Endpoints[ListMemberEndpoint]['response']['data']

type MemberData = GetMemberResponseData &
    CreateMemberResponseData

class Resource extends BaseResource<ResourceModel> {

    private userAgent = `AWS CloudFormation (+https://aws.amazon.com/cloudformation/) CloudFormation resource ${this.typeName}/${version}`;

    private static setModelFromResponse(model: ResourceModel, data: CreateMemberResponseData|MemberData): ResourceModel {
        model.role = data.role;
        return model;
    }
    private async getMember(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>): Promise<OctokitResponse<GetMemberResponseData>> {
        const octokit = new Octokit({
            auth: model.gitHubAccess,
            userAgent: this.userAgent
        });
        try {
            const response = await octokit.request('GET /orgs/{org}/memberships/{username}', {
                org: model.organization,
                username: model.username
            });
            return response;
        } catch (e) {
            handleError(e, request, this.typeName);
        }
    }

    private async assertIsMember(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>) {
        try {
            const member = await this.getMember(model, request);
            return !!member
        } catch (e) {
            if (e instanceof NotFound) {
                return false;
            }
            throw e;
        }
    }

    private async createOrUpdateMember(model: ResourceModel, request: ResourceHandlerRequest<ResourceModel>): Promise<OctokitResponse<CreateMemberResponseData>> {
        const octokit = new Octokit({
            auth: model.gitHubAccess,
            userAgent: this.userAgent
        });
        try {
            let newVar = await octokit.request('PUT /orgs/{org}/memberships/{username}', {
                org: model.organization,
                username: model.username,
                role: model.role as "admin"|"member"
            });
            return newVar;
        } catch (e) {
            handleError(e, request, this.typeName);
        }
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
        if (await this.assertIsMember(model, request)) {
            throw new exceptions.AlreadyExists(this.typeName, request.logicalResourceIdentifier);
        }

        const response = await this.createOrUpdateMember(model, request);

        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromResponse(model, response.data as MemberData));

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

        if (!await this.assertIsMember(model, request)) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        const response = await this.createOrUpdateMember(model, request);

        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromResponse(model, response.data as MemberData));
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
            auth: model.gitHubAccess,
            userAgent: this.userAgent
        });

        try {
            if (await this.assertIsMember(model, request)) {
                await octokit.request('DELETE /orgs/{org}/memberships/{username}', {
                    org: model.organization,
                    username: model.username
                });
                return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>();
            }
        } catch (e) {
            handleError(e, request, this.typeName);
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

        if (await this.assertIsMember(model, request)) {
            const member = await this.getMember(model, request);
            return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(Resource.setModelFromResponse(model, member.data as MemberData));
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
            auth: model.gitHubAccess,
            userAgent: this.userAgent
        });
        try {
            const members = await octokit.paginate(octokit.orgs.listMembers,
                {
                    org: model.organization
                },
                response => response.data.map(membershipItem => {
                    const resourceModel = new ResourceModel(model);
                    resourceModel.username = membershipItem.login
                    return resourceModel;
                }));

            const invitations = await octokit.paginate(octokit.orgs.listPendingInvitations,
                {
                    org: model.organization
                },
                response => response.data.map(membershipItem => {
                    const resourceModel = new ResourceModel(model);
                    resourceModel.username = membershipItem.login
                    return resourceModel;
                }));

            return ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>()
                .status(OperationStatus.Success)
                .resourceModels([...members, ...invitations]).build();
        } catch (e) {
            handleError(e, request, this.typeName);
        }
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
