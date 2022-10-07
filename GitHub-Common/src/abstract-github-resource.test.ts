import {AbstractGitHubResource} from "./abstract-github-resource";
import {BaseModel, ResourceHandlerRequest} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib";
import {
    AccessDenied,
    AlreadyExists,
    InvalidCredentials,
    NotFound,
    ServiceInternalError
} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib/dist/exceptions";
import {RequestError} from "@octokit/types";

class TestAbstractResource extends AbstractGitHubResource<BaseModel, {}, {}, {}, {}> {
    create(model: BaseModel): Promise<{}> {
        return Promise.resolve({});
    }

    delete(model: BaseModel): Promise<void> {
        return Promise.resolve(undefined);
    }

    get(model: BaseModel): Promise<{}> {
        return Promise.resolve({});
    }

    list(model: BaseModel): Promise<BaseModel[]> {
        return Promise.resolve([]);
    }

    newModel(partial: any): BaseModel {
        return undefined;
    }

    setModelFrom(model: BaseModel, from: {} | undefined): BaseModel {
        return undefined;
    }

    update(model: BaseModel): Promise<{}> {
        return Promise.resolve({});
    }
}

describe('AbstractGitHubResource', () => {
    describe('processRequestException', () => {
        let testInstance: TestAbstractResource;

        beforeAll(() => {
            testInstance = new TestAbstractResource('foo', BaseModel, undefined, undefined, BaseModel);
        });

        it.each([
            [AlreadyExists, 400],
            [InvalidCredentials, 401],
            [AccessDenied, 403],
            [NotFound, 404],
            [AlreadyExists, 422],
            [ServiceInternalError, 500],
            [ServiceInternalError, null],
            [ServiceInternalError, undefined]
        ])('throws a %p if the request has a HTTP %s status code', (errorType, statusCode) => {
            const errorMessage = 'Forced error';
            let requestError = {
                name: 'GitHub Error',
                status: statusCode,
                errors: [{
                    message: errorMessage,
                    resource: 'foo',
                    field: 'bar',
                    code: 'code'
                }]
            } as unknown as RequestError;

            try {
                testInstance.processRequestException(requestError, {logicalResourceIdentifier: 'foo'} as ResourceHandlerRequest<BaseModel>);
                fail('This should have thrown');
            } catch (e) {
                expect(e).toBeInstanceOf(errorType);
                if (e instanceof NotFound) {
                    expect(e.message).not.toContain(errorMessage);
                } else if (e instanceof AlreadyExists) {
                    expect(e.message).toBe(`Resource of type 'foo' with identifier 'foo' already exists.`);
                } else if (e instanceof ServiceInternalError) {
                    expect(e.message).toContain(`Unexpected error occurred while talking to the GitHub API: ${errorMessage}`);
                } else {
                    expect(e.message).toContain(errorMessage);
                }
            }
        });
    });
});
