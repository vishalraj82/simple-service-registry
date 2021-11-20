"use strict";
/**
  * A simple service registry manager for nodejs apps
  */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistry = void 0;
class ServiceRegistry {
    constructor() {
        this._registry = new Map();
        this._services = new Map();
        this._loadQueue = [];
    }
    /**
      * @param {String} serviceName - Name of the service to be registered
      * @param {any} service - The service to be regsitered
      */
    register(serviceName, service) {
        if (false === ServiceRegistry.serviceNameRegex.test(serviceName)) {
            throw new Error(`Service name must adhere to - ${ServiceRegistry.serviceNameRegex.source}`);
        }
        else if (true === this._registry.has(serviceName)) {
            throw new Error(`A service is already registered with name - ${serviceName}`);
        }
        this._registry.set(serviceName, service);
    }
    /**
      * @param {string} serviceName - The name of the service to be unregistered
      *
      * @return {boolean} - If the service was unregsitered successfully
      */
    unregister(serviceName) {
        if (false === this._registry.has(serviceName)) {
            throw new Error(`No service registered with name - ${serviceName}`);
        }
        return (this._registry.delete(serviceName) &&
            this._services.delete(serviceName));
    }
    create(serviceCreator) {
        serviceCreator(this);
        return this;
    }
    isRegistered(serviceName) {
        return this._registry.has(serviceName);
    }
    get(serviceName) {
        if (false === this._registry.has(serviceName)) {
            throw new Error(`No service registered with name - ${serviceName}`);
        }
        else if (true === this._loadQueue.includes(serviceName)) {
            const circular = this._loadQueue.reduce((chain, serviceName) => `${chain} => ${serviceName}`, '');
            throw new Error(`Detected circular dependency in services - ${serviceName} ${circular}`);
        }
        this._loadQueue.push(serviceName);
        if (false === this._services.has(serviceName)) {
            const registry = this._registry.get(serviceName), service = 'function' === typeof registry ? registry(this) : registry;
            this._services.set(serviceName, service);
        }
        this._loadQueue.pop();
        return this._services.get(serviceName);
    }
}
exports.ServiceRegistry = ServiceRegistry;
/** @type {RegExp} */
ServiceRegistry.serviceNameRegex = /^[a-z]\w*$/i;
