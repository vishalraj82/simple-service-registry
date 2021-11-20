/**
  * A simple service registry manager for nodejs apps
  */

type Service = String | Array<any> | Object | Function;
type ServiceCreator = (sr: ServiceRegistry) => void;

export class ServiceRegistry {
    /** @type {RegExp} */
    static serviceNameRegex: RegExp = /^[a-z][a-z0-9_]*$/i;

    /** @type {Map<string, any>} */
    private registry: Map<string, any>;

    /** @type {Map<string, any>} */
    private services: Map<string, any>;

    /** @type {Array<string>} */
    private loadQueue: Array<string>;

    /**
     * Instantiate the class members
     */
    constructor() {
        this.registry = new Map();
        this.services = new Map();
        this.loadQueue = [];
    }

    /**
      * Register a service
      *
      * @param {String} serviceName - Name of the service to be registered
      * @param {any} service - The service to be regsitered
      */
    register(serviceName: string, serviceOrCreator: Service): ServiceRegistry {
        if (ServiceRegistry.serviceNameRegex.test(serviceName) === false) {
            const regexSrc = ServiceRegistry.serviceNameRegex.source;
            throw new Error(`Service name must adhere to - ${regexSrc}`);
        } else if (this.registry.has(serviceName) === true) {
            throw new Error(`A service is already registered with name - ${serviceName}`);
        }

        this.registry.set(serviceName, serviceOrCreator);

        return this;
    }

    /**
      * @param {string} serviceName - The name of the service to be unregistered
      * @return {boolean} - If the service was unregsitered successfully
      */
    unregister(serviceName: string): boolean {
        if (this.registry.has(serviceName) === false) {
            throw new Error(`No service registered with name - ${serviceName}`);
        }

        const registryDeleted = this.registry.delete(serviceName),
            serviceDeleted = this.services.has(serviceName) ? this.services.delete(serviceName) : true;

        return (registryDeleted && serviceDeleted);
    }

    /**
     * Register a service with creator function
     *
     * @param {ServiceCreator} serviceCreator - The function to register a service
     * @returns {ServiceRegistry}
     */
    create(serviceCreator: ServiceCreator): ServiceRegistry {
        serviceCreator(this);
        return this;
    }

    /**
     * Check if a service is registered
     *
     * @param {String} serviceName - Name of the service to be checked if registered
     * @return {boolean}
     */
    isRegistered(serviceName: string): boolean {
        return this.registry.has(serviceName);
    }

    /**
     * Get a service
     *
     * @param {String} serviceName - The name of the service to be fetched
     * @return {any} - The value of the corresponding service
     */
    get(serviceName: string): Service {
        if (this.loadQueue.includes(serviceName) === true) {
            const circular = this.loadQueue.reduce((chain, name) => `${chain} => ${name}`);
            throw new Error(`Detected circular dependency in services - ${circular} => ${serviceName}`);
        }

        this.loadQueue.push(serviceName);

        if (this.isRegistered(serviceName) === false) {
            throw new Error(`No service registered with name - ${serviceName}`);
        }

        if (this.services.has(serviceName) === false) {
            const registry = this.registry.get(serviceName),
                service = typeof registry === 'function' ? registry(this) : registry;
            this.services.set(serviceName, service);
        }

        this.loadQueue.pop();

        return this.services.get(serviceName);
    }
}
