import {ResourceModel, TypeConfigurationModel} from './models';
import {Endpoints} from "@octokit/types";
import {Octokit} from "@octokit/rest";
import {AbstractGitHubResource} from "../../GitHub-Common/src/abstract-github-resource";
import {version} from '../package.json';

type GetMembershipEndpoint = 'GET /orgs/{org}/teams/{team_slug}/memberships/{username}';
type PutMembershipEndpoint = 'PUT /orgs/{org}/teams/{team_slug}/memberships/{username}';

type GetMembershipPayload = Endpoints[GetMembershipEndpoint]['response']['data'];
type PutUpdateMembershipPayload = Endpoints[PutMembershipEndpoint]['response']['data'];

type MembershipData = GetMembershipPayload & PutUpdateMembershipPayload;

class Resource extends AbstractGitHubResource<ResourceModel, GetMembershipPayload, PutUpdateMembershipPayload, PutUpdateMembershipPayload, TypeConfigurationModel> {

    private userAgent = `AWS CloudFormation (+https://aws.amazon.com/cloudformation/) CloudFormation resource ${this.typeName}/${version}`;

    async get(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<GetMembershipPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<GetMembershipEndpoint>('GET /orgs/{org}/teams/{team_slug}/memberships/{username}', {
            org: model.org,
            team_slug: model.teamSlug,
            username: model.username,
        });

        return response.data;
    }

    async list(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel[]> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const orgAndTeam = {
            org: model.org,
            team_slug: model.teamSlug,
        };
        const currentMembers = await octokit.paginate(
            octokit.teams.listMembersInOrg,
            orgAndTeam,
            response => response.data.map(membershipItem => {
                const resourceModel = new ResourceModel();
                resourceModel.username = membershipItem.login;
                resourceModel.org = model.org;
                resourceModel.teamSlug = model.teamSlug;
                resourceModel.state = "active"
                return resourceModel;
            }));

        const pendingInvites = await octokit.paginate(
            octokit.teams.listPendingInvitationsInOrg,
            orgAndTeam,
            response => response.data.map(membershipItem => {
                const resourceModel = new ResourceModel();
                resourceModel.username = membershipItem.login;
                resourceModel.org = model.org;
                resourceModel.teamSlug = model.teamSlug;
                resourceModel.state = "pending";
                return resourceModel;
            }));

        return [
            ...currentMembers,
            ...pendingInvites
        ];
    }

    async create(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<PutUpdateMembershipPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<PutMembershipEndpoint>(
            'PUT /orgs/{org}/teams/{team_slug}/memberships/{username}',
            {
                org: model.org,
                team_slug: model.teamSlug,
                username: model.username,
                role: model.role as "member" | "maintainer"
            });

        return response.data;
    }

    async update(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<PutUpdateMembershipPayload> {
        return this.create(model, typeConfiguration);
    }

    async delete(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        await octokit.request('DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}', {
            org: model.org,
            team_slug: model.teamSlug,
            username: model.username
        });
    }

    newModel(partial?: any): ResourceModel {
        return new ResourceModel(partial);
    }

    setModelFrom(model: ResourceModel, from?: MembershipData): ResourceModel {
        return new ResourceModel({
            ...model,
            state: from.state,
            role: from.role
        });
    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
