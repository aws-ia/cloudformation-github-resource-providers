import {exceptions} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import {ResourceModel, TypeConfigurationModel} from './models';
import {AbstractGitHubResource} from "../../GitHub-Common/src/abstract-github-resource";
import {Octokit} from "@octokit/rest";
import {Endpoints, RequestError} from "@octokit/types";

import {version} from '../package.json';

interface CallbackContext extends Record<string, any> {
}

type Permissions = {
    pull: boolean
    triage?: boolean
    push: boolean
    maintain?: boolean
    admin: boolean
}

type GetCollaboratorEndpoint = 'GET /repos/{owner}/{repo}/collaborators/{username}/permission';
type CreateOrUpdateCollaboratorEndpoint = 'PUT /repos/{owner}/{repo}/collaborators/{username}';
type ListCollaboratorEndpoint = 'GET /repos/{owner}/{repo}/collaborators';
type ListInvitationsEndpoint = 'GET /repos/{owner}/{repo}/invitations';
type GetInvitationEndpoint = 'GET /repos/{owner}/{repo}/invitations/{invitation_id}';
type UpdateInvitationsEndpoint = 'PATCH /repos/{owner}/{repo}/invitations/{invitation_id}';

type GetCollaboratorPayload = Endpoints[GetCollaboratorEndpoint]['response']['data'];
type PutCollaboratorPayload = Endpoints[CreateOrUpdateCollaboratorEndpoint]['response']['data'];
type ListCollaboratorResponseData = Endpoints[ListCollaboratorEndpoint]['response']['data'];
type ListInvitationsResponseData = Endpoints[ListInvitationsEndpoint]['response']['data'];
type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
type GetInvitationResponseData = ArrayElement<ListInvitationsResponseData>;
type UpdateInvitationsResponseData = Endpoints[UpdateInvitationsEndpoint]['response']['data'];

type CollaboratorData =
    GetCollaboratorPayload &
    PutCollaboratorPayload &
    ListCollaboratorResponseData &
    ListInvitationsResponseData &
    UpdateInvitationsResponseData;

class Resource extends AbstractGitHubResource<ResourceModel, ResourceModel, ResourceModel, ResourceModel, TypeConfigurationModel> {

    private userAgent = `AWS CloudFormation (+https://aws.amazon.com/cloudformation/) CloudFormation resource ${this.typeName}/${version}`;

    async get(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        let invite = await this.getPendingInvitation(model, typeConfiguration);
        if (invite) {
            return new ResourceModel({permission: this.permissionsToPermission(invite.permissions)});
        }

        const response = await octokit.request<GetCollaboratorEndpoint>('GET /repos/{owner}/{repo}/collaborators/{username}/permission', {
            owner: model.owner,
            repo: model.repository,
            username: model.username
        });

        if(response.data.permission == 'none') {
            throw {
                name: 'Not found',
                status: 404
            } as RequestError;
        }

        return new ResourceModel({permission: this.permissionsToPermission(response.data.permission)});
    }

    async list(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel[]> {
        const collaborators = await this.listCollaboratorsByRepo(model, typeConfiguration);

        const invitations = await this.listInvitationsByRepo(model, typeConfiguration);

        return collaborators.map(user => {
            return this.setModelFrom(model, new ResourceModel({username: user.login, permission : this.getPermissionName(user.permissions as Permissions)}));
        }).concat(invitations.map(invite => {
            return this.setModelFrom(model, new ResourceModel({username: invite.invitee.login, permission: this.permissionsToPermission(invite.permissions)}));
        }));
    }

    async create(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel> {
        const response = await this.putCollaborator(model, typeConfiguration);

        return new ResourceModel();
    }

    async update(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel> {
        if (await this.assertIsCollaborator(model, typeConfiguration)) {
            const response = await this.putCollaborator(model, typeConfiguration);
            return new ResourceModel({permission: this.permissionsToPermission(response.data.permissions)});
        }
        let invite = await this.getPendingInvitation(model, typeConfiguration);
        if (invite) {
            const response = await this.updateRepoInvitation(model, invite, typeConfiguration);
            return new ResourceModel({permission: this.permissionsToPermission(response.data.permissions)});
        }

        throw {
            name: 'Resource not found',
            status: 404
        } as RequestError;
    }

    async delete(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        let invite = await this.getPendingInvitation(model, typeConfiguration);
        if (invite) {

            await octokit.request('DELETE /repos/{owner}/{repo}/invitations/{invitation_id}}', {
                owner: model.owner,
                repo: model.repository,
                invitation_id: invite.id
            });
            return;
        }

        if (await this.assertIsCollaborator(model, typeConfiguration)) {
            // https://docs.github.com/en/rest/collaborators/collaborators#add-a-repository-collaborator
            await octokit.request('DELETE /repos/{owner}/{repo}/collaborators/{username}', {
                owner: model.owner,
                repo: model.repository,
                username: model.username,
            });
            return;
        }

        throw new exceptions.NotFound(this.typeName, null);
    }

    newModel(partial?: any): ResourceModel {
        return new ResourceModel(partial);
    }

    setModelFrom(model: ResourceModel, from?: ResourceModel): ResourceModel {
        return new ResourceModel({...model, ...from});
    }

    private async putCollaborator(model: ResourceModel, typeConfiguration?: TypeConfigurationModel) {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        return await octokit.request(
            'PUT /repos/{owner}/{repo}/collaborators/{username}',
            {
                owner: model.owner,
                repo: model.repository,
                username: model.username,
                permission: model.permission as "pull" | "push" | "admin" | "maintain" | "triage"
            });
    }

    private async updateRepoInvitation(model: ResourceModel, invite: GetInvitationResponseData, typeConfiguration: TypeConfigurationModel) {
        //https://docs.github.com/en/rest/collaborators/invitations#update-a-repository-invitation
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        return await octokit.request(
            "PATCH /repos/{owner}/{repo}/invitations/{invitation_id}",
            {
                owner: model.owner,
                repo: model.repository,
                invitation_id: invite.id,
                permissions: model.permission as "read" | "write" | "maintain" | "triage" | "admin"
            });
    }

    private async listCollaboratorsByRepo(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ListCollaboratorResponseData> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        return await octokit.paginate(
            octokit.repos.listCollaborators,
            {
                owner: model.owner,
                repo: model.repository
            }
        )
    }

    private async listInvitationsByRepo(model: ResourceModel, typeConfiguration?: TypeConfigurationModel):Promise<ListInvitationsResponseData> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        return await octokit.paginate(
            octokit.repos.listInvitations,
            {
                owner: model.owner,
                repo: model.repository
            }
        )
    }

    private async assertIsCollaborator(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<boolean> {
        try {
            const octokit = new Octokit({
                auth: typeConfiguration?.gitHubAccess.accessToken,
                userAgent: this.userAgent
            });
            const response = await octokit.request<GetCollaboratorEndpoint>('GET /repos/{owner}/{repo}/collaborators/{username}/permission', {
                owner: model.owner,
                repo: model.repository,
                username: model.username
            });

            const collaborator = response.data;

            return !!collaborator && collaborator.permission !== "none";
        } catch (e) {
            if (e.status === 404) {
                return false;
            }
            throw e;
        }
    }

    private async getPendingInvitation(model: ResourceModel, typeConfiguration?: TypeConfigurationModel) : Promise<GetInvitationResponseData>{
        const pendingInvitations = await this.listInvitationsByRepo(model, typeConfiguration);
        const relatedInvitations = pendingInvitations.filter(inv => {
            return inv.invitee?.login === model.username
        });

        if (relatedInvitations.length > 1) {
            this.loggerProxy.log(`User ${model.username} has ${relatedInvitations.length} pending invitations for this repo`);
        }
        return relatedInvitations.length == 0 ? null : relatedInvitations[0];
    }

    private getPermissionName(permissions: Permissions) {
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

    private permissionsToPermission(permissions: string) {
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
                throw new exceptions.InternalFailure(`Error reading the permission ${permissions}`);
        }

    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
