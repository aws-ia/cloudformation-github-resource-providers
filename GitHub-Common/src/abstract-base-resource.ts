import {
    Action,
    BaseModel,
    BaseResource,
    exceptions,
    handlerEvent,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy
} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib";
    import {NotFound} from "@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib/dist/exceptions";

export interface RetryableCallbackContext {
    retry?: number
}

export abstract class AbstractBaseResource<ResourceModelType extends BaseModel, GetResponseData, CreateResponseData, UpdateResponseData, ErrorType, TypeConfigurationType> extends BaseResource<ResourceModelType> {

    private maxRetries = 5;

    /**
     * This method is invoked to get a resource from a vendor API, corresponding to the given the CloudFormation model input.
     * Typically, this uses the primary identifier to perform an REST API request.
     *
     * @param model Current model coming from CloudFormation. This contains the input given by the user as well as any
     * @param typeConfiguration The type configuration for the resource. This can be null
     * output already set by previous handler which returned an IN_PROGRESS event.
     */
    abstract get(model: ResourceModelType, typeConfiguration?: TypeConfigurationType): Promise<GetResponseData>;

    /**
     * This method is invoked to list all possible resources from a vendor API, of the current resource type.
     *
     * @param model Current model coming from CloudFormation. This contains the input given by the user as well as any
     * @param typeConfiguration The type configuration for the resource. This can be null
     * output already set by previous handler which returned an IN_PROGRESS event.
     */
    abstract list(model: ResourceModelType, typeConfiguration?: TypeConfigurationType): Promise<ResourceModelType[]>;

    /**
     * This method is invoked to create a resource from a vendor API, that should correspond to the given the CloudFormation model input.
     *
     * @param model Current model coming from CloudFormation. This contains the input given by the user as well as any
     * @param typeConfiguration The type configuration for the resource. This can be null
     * output already set by previous handler which returned an IN_PROGRESS event.
     * @param typeConfiguration
     */
    abstract create(model: ResourceModelType, typeConfiguration?: TypeConfigurationType): Promise<CreateResponseData>;

    /**
     * This method is invoked to update a resource from a vendor API, that should correspond to the given the CloudFormation model input.
     *
     * @param model Current model coming from CloudFormation. This contains the input given by the user as well as any
     * @param typeConfiguration The type configuration for the resource. This can be null
     * output already set by previous handler which returned an IN_PROGRESS event.
     */
    abstract update(model: ResourceModelType, typeConfiguration?: TypeConfigurationType): Promise<UpdateResponseData>;

    /**
     * This method is invoked to delete a resource from a vendor API, that should correspond to the given the CloudFormation model input.
     *
     * @param model Current model coming from CloudFormation. This contains the input given by the user as well as any
     * @param typeConfiguration The type configuration for the resource. This can be null
     * output already set by previous handler which returned an IN_PROGRESS event.
     */
    abstract delete(model: ResourceModelType, typeConfiguration?: TypeConfigurationType): Promise<void>;

    /**
     * This method is invoked to instantiate a new resource model
     *
     * @param partial The data to initially set.
     */
    abstract newModel(partial?: any): ResourceModelType;

    /**
     * This method is invoked when the current CloudFormation model needs to be set, from the responses returned by the
     * get and create method.
     *
     * @param model Current model coming from CloudFormation. This contains the input given by the user as well as any
     * output already set by previous handler which returned an IN_PROGRESS event.
     * @param from The response returned coming from the get and create methods.
     */
    abstract setModelFrom(model: ResourceModelType, from?: GetResponseData | CreateResponseData): ResourceModelType;

    /**
     * This method is invoked when an exception is thrown while calling get, list, create, update or delete methods.
     * This should process the exception in turn thrown one of the CloudFormation framework exception, e.g
     * `new exceptions.NotFound()`
     *
     * @param e The exception to process
     * @param request The current CloudFormation request
     */
    abstract processRequestException(e: ErrorType, request: ResourceHandlerRequest<ResourceModelType>): void;

    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     * @param typeConfiguration The resource configuration data
     */
    @handlerEvent(Action.Create)
    public async createHandler(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModelType>,
        callbackContext: RetryableCallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationType
    ): Promise<ProgressEvent<ResourceModelType, RetryableCallbackContext>> {
        let model = this.newModel(request.desiredResourceState);

        if (!callbackContext.retry) {
            if (await this.assertExists(model, typeConfiguration)) {
                throw new exceptions.AlreadyExists(this.typeName, request.logicalResourceIdentifier);
            }

            try {
                let data = await this.create(model, typeConfiguration);
                model = this.setModelFrom(model, data);
                return ProgressEvent.progress<ProgressEvent<ResourceModelType, RetryableCallbackContext>>(model, {
                    retry: 1
                });
            } catch (e) {
                logger.log(`Error ${e}`);
                this.processRequestException(e, request);
            }
        }

        try {
            const data = await this.get(model, typeConfiguration);

            model = this.setModelFrom(model, data);
            return ProgressEvent.success<ProgressEvent<ResourceModelType, RetryableCallbackContext>>(model);
        } catch (e) {
            try {
                this.processRequestException(e, request);
            } catch (e) {
                if (e instanceof NotFound) {
                    if (callbackContext.retry <= this.maxRetries) {
                        return ProgressEvent.progress<ProgressEvent<ResourceModelType, RetryableCallbackContext>>(model, {
                            retry: callbackContext.retry + 1
                        });
                    } else {
                        throw new exceptions.NotStabilized(`Resource failed to stabilized after ${this.maxRetries} retries`);
                    }
                }
                throw e;
            }
        }
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
     * @param typeConfiguration The resource configuration data
     */
    @handlerEvent(Action.Update)
    public async updateHandler(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModelType>,
        callbackContext: RetryableCallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationType
    ): Promise<ProgressEvent<ResourceModelType, RetryableCallbackContext>> {
        let model = this.newModel(request.desiredResourceState);

        if (!(await this.assertExists(model, typeConfiguration))) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        try {
            await this.update(model, typeConfiguration);
            const data = await this.get(model, typeConfiguration);
            model = this.setModelFrom(model, data);
        } catch (e) {
            logger.log(`Error ${e}`);
            this.processRequestException(e, request);
        }

        return ProgressEvent.success<ProgressEvent<ResourceModelType, RetryableCallbackContext>>(model);
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
     * @param typeConfiguration The resource configuration data
     */
    @handlerEvent(Action.Delete)
    public async deleteHandler(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModelType>,
        callbackContext: RetryableCallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationType
    ): Promise<ProgressEvent<ResourceModelType, RetryableCallbackContext>> {
        let model = this.newModel(request.desiredResourceState);

        if (!callbackContext.retry) {
            if (!(await this.assertExists(model, typeConfiguration))) {
                throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
            }

            try {
                await this.delete(model, typeConfiguration)
                return ProgressEvent.progress<ProgressEvent<ResourceModelType, RetryableCallbackContext>>(model, {
                    retry: 1
                });
            } catch (e) {
                logger.log(`Error ${e}`);
                this.processRequestException(e, request);
            }
        }

        try {
            await this.get(model, typeConfiguration);
        } catch (e) {
            try {
                this.processRequestException(e, request);
            } catch (e) {
                if (e instanceof NotFound) {
                    return ProgressEvent.success<ProgressEvent<ResourceModelType, RetryableCallbackContext>>();
                }
                throw e;
            }
        }

        if (callbackContext.retry <= this.maxRetries) {
            return ProgressEvent.progress<ProgressEvent<ResourceModelType, RetryableCallbackContext>>(model, {
                retry: callbackContext.retry + 1
            });
        } else {
            throw new exceptions.NotStabilized(`Resource failed to stabilized after ${this.maxRetries} retries`);
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
     * @param typeConfiguration The resource configuration data
     */
    @handlerEvent(Action.Read)
    public async readHandler(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModelType>,
        callbackContext: RetryableCallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationType
    ): Promise<ProgressEvent<ResourceModelType, RetryableCallbackContext>> {
        let model = this.newModel(request.desiredResourceState);

        try {
            const location = await this.get(model, typeConfiguration);
            model = this.setModelFrom(model, location);
        } catch (e) {
            logger.log(`Error ${e}`);
            this.processRequestException(e, request);
        }

        return ProgressEvent.success<ProgressEvent<ResourceModelType, RetryableCallbackContext>>(model);
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
     * @param typeConfiguration The resource configuration data
     */
    @handlerEvent(Action.List)
    public async listHandler(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModelType>,
        callbackContext: RetryableCallbackContext,
        logger: LoggerProxy,
        typeConfiguration: TypeConfigurationType
    ): Promise<ProgressEvent<ResourceModelType, RetryableCallbackContext>> {
        const model = this.newModel(request.desiredResourceState);

        try {
            const data = await this.list(model, typeConfiguration);

            return ProgressEvent.builder<ProgressEvent<ResourceModelType, RetryableCallbackContext>>()
                .status(OperationStatus.Success)
                .resourceModels(data)
                .build();
        } catch (e) {
            logger.log(`Error ${e}`);
            this.processRequestException(e, request);
        }
    }

    private async assertExists(model: ResourceModelType, typeConfiguration: TypeConfigurationType) {
        try {
            await this.get(model, typeConfiguration);
        } catch (e) {
            return false;
        }
        return true;
    }
}