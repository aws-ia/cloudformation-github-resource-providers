import {ResourceModel, TypeConfigurationModel} from './models';
import {Octokit} from "@octokit/rest";
import {Endpoints} from "@octokit/types";
import {AbstractGitHubResource} from "../../GitHub-Common/src/abstract-github-resource";
import {version} from '../package.json';

type GetTagEndpoint = 'GET /repos/{owner}/{repo}/git/ref/{ref}';
type ListTagsEndpoint = 'GET /repos/{owner}/{repo}/git/matching-refs/{ref}';
type DeleteTagEndpoint = 'DELETE /repos/{owner}/{repo}/git/ref/{ref}';
type UpdateTagEndpoint = 'PATCH /repos/{owner}/{repo}/git/refs/{ref}';
type CreateTagEndpoint = 'POST /repos/{owner}/{repo}/git/refs';

type GetTagPayload = Endpoints[GetTagEndpoint]['response']['data'];
type CreateTagPayload = Endpoints[CreateTagEndpoint]['response']['data'];
type UpdateTagPayload = Endpoints[UpdateTagEndpoint]['response']['data'];

class Resource extends AbstractGitHubResource<ResourceModel, GetTagPayload, CreateTagPayload, UpdateTagPayload, TypeConfigurationModel> {

    private userAgent = `AWS CloudFormation (+https://aws.amazon.com/cloudformation/) CloudFormation resource ${this.typeName}/${version}`;

    async get(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<GetTagPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<GetTagEndpoint>('GET /repos/{owner}/{repo}/git/ref/{ref}', {
            owner: model.owner,
            repo: model.repository,
            ref: `tags/${model.tag}`
        });

        return response.data;
    }

    async list(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<ResourceModel[]> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.paginate<ListTagsEndpoint>('GET /repos/{owner}/{repo}/git/matching-refs/{ref}', {
            owner: model.owner,
            repo: model.repository,
            ref: `tags/${model.tag}`
        });

        return response.map(tagPayload => this.setModelFrom(model, tagPayload));
    }

    async create(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<CreateTagPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<CreateTagEndpoint>('POST /repos/{owner}/{repo}/git/refs', {
            owner: model.owner,
            repo: model.repository,
            // Note the format is different for `ref`. This needs to be the full git ref target
            ref: `refs/tags/${model.tag}`,
            sha: model.sha
        });

        return response.data;
    }

    async update(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<UpdateTagPayload> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        const response = await octokit.request<UpdateTagEndpoint>('PATCH /repos/{owner}/{repo}/git/refs/{ref}', {
            owner: model.owner,
            repo: model.repository,
            ref: `tags/${model.tag}`,
            sha: model.sha,
            force: model.force
        });

        return response.data;
    }

    async delete(model: ResourceModel, typeConfiguration?: TypeConfigurationModel): Promise<void> {
        const octokit = new Octokit({
            auth: typeConfiguration?.gitHubAccess.accessToken,
            userAgent: this.userAgent
        });

        await octokit.request<DeleteTagEndpoint>('DELETE /repos/{owner}/{repo}/git/refs/{ref}', {
            owner: model.owner,
            repo: model.repository,
            ref: `tags/${model.tag}`
        });
    }

    newModel(partial?: any): ResourceModel {
        return new ResourceModel(partial);
    }

    setModelFrom(model: ResourceModel, from?: CreateTagPayload | UpdateTagPayload): ResourceModel {
        const resourceModel = new ResourceModel(model);

        if (from) {
            resourceModel.sha = from.object.sha;
        }

        delete resourceModel.force;

        return resourceModel;
    }

}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel, null, null, TypeConfigurationModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
