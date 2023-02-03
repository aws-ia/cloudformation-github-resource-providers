import {ResourceModel, TypeConfigurationModel} from './models';
import {AbstractGitHubResource} from "../../GitHub-Common/src/abstract-github-resource";
import {Octokit} from "@octokit/rest";
import {Endpoints} from "@octokit/types";
import {version} from '../package.json';

type GetMemberEndpoint = 'GET /orgs/{org}/memberships/{username}';
type DeleteMemberEndpoint = 'DELETE /orgs/{org}/members/{username}';
type PutMemberEndpoint = 'PUT /orgs/{org}/memberships/{username}';

type GetMemberPayload = Endpoints[GetMemberEndpoint]['response']['data'];
type PutMemberPayload = Endpoints[PutMemberEndpoint]['response']['data'];

class Resource extends AbstractGitHubResource<ResourceModel, GetMemberPayload, PutMemberPayload, PutMemberPayload, TypeConfigurationModel> {

    private userAgent = `AWS CloudFormation (+https://aws.amazon.com/cloudformation/) CloudFormation resource ${this.typeName}/${version}`;

    async get(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<GetMemberPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<GetMemberEndpoint>('GET /orgs/{org}/memberships/{username}', {
            org: model.organization,
            username: model.username
        });

        console.log("get response.data:", response.data)

        return response.data;
    }

    async list(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel[]> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const members = await octokit.paginate(
            octokit.orgs.listMembers,
            {
                org: model.organization
            },
            response => response.data.map(membershipItem => {
                const resourceModel = new ResourceModel(model);
                resourceModel.username = membershipItem.login;
                return resourceModel;
            }));

        console.log("list members:", members)

        const invitations = await octokit.paginate(
            octokit.orgs.listPendingInvitations,
            {
                org: model.organization
            },
            response => response.data.map(membershipItem => {
                const resourceModel = new ResourceModel(model);
                resourceModel.username = membershipItem.login
                return resourceModel;
            }));

        console.log("list invitations:", invitations)

        return [
            ...members,
            ...invitations
        ];
    }

    async create(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<PutMemberPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<PutMemberEndpoint>('PUT /orgs/{org}/memberships/{username}', {
            org: model.organization,
            username: model.username,
            role: model.role as "admin" | "member"
        });

        return response.data;
    }

    async update(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<PutMemberPayload> {
        return this.create(model, typeConfiguration);
    }

    async delete(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        await octokit.request<DeleteMemberEndpoint>('DELETE /orgs/{org}/memberships/{username}', {
            org: model.organization,
            username: model.username
        });
    }

    newModel(partial?: any): ResourceModel {
        return new ResourceModel(partial);
    }

    setModelFrom(model: ResourceModel, from?: GetMemberPayload | PutMemberPayload): ResourceModel {
        return new ResourceModel({...model, role: from.role});
    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
