import assert from 'assert/strict';
import { ServiceRegistry } from '../src/ServiceRegistry';

describe('Simple Service Registry', () => {
    type ErrorObj = {
        name: 'Error',
        message: string
    };

    const getExpectedError = (message: string): ErrorObj => ({ name: 'Error', message });

    let registry: ServiceRegistry;

    beforeEach(() => {
        registry = new ServiceRegistry();
    });

    describe('Error conditions', () => {
        it('Throws error for invalid service name', () => {
            const regexSrc = ServiceRegistry.serviceNameRegex.source;
            assert.throws(
                () => registry.register('__hello', 'will throw error'),
                getExpectedError(`Service name must adhere to - ${regexSrc}`)
            );
        });

        it('Throws error when service name gets duplicated', () => {
            const serviceName = 'hello',
                service = 'Duplicate service';

            assert.throws(
                () => {
                    registry.register(serviceName, service);
                    registry.register(serviceName, service);
                },
                getExpectedError(`A service is already registered with name - ${serviceName}`)
            );
        });

        it('Throws error when a non-existent service is unregistered', () => {
            const serviceName = 'Unregistered';

            assert.throws(
                () => registry.unregister(serviceName),
                getExpectedError(`No service registered with name - ${serviceName}`)
            );
        });

        it('Throws error when unregistered service is fetched', () => {
            const serviceName = 'Unregistered';

            assert.throws(
                () => registry.get(serviceName),
                getExpectedError(`No service registered with name - ${serviceName}`)
            );
        });

        it('Throws error when circular dependency is detected between two services', () => {
            const serviceA = 'serviceA',
                serviceB = 'serviceB',
                chain = [serviceA, serviceB, serviceA].join(' => ');

            assert.throws(
                () => {
                    registry
                        .register(serviceA, (sr: ServiceRegistry) => sr.get(serviceB))
                        .register(serviceB, (sr: ServiceRegistry) => sr.get(serviceA))
                        .get(serviceA);
                },
                getExpectedError(`Detected circular dependency in services - ${chain}`)
            );
        });

        it('Throws error when circular dependency is detected between chain of services', () => {
            const serviceA = 'serviceA',
                serviceB = 'serviceB',
                serviceC = 'serviceC',
                serviceD = 'serviceD',
                chain = [serviceA, serviceB, serviceC, serviceD, serviceA].join(' => ');

            assert.throws(
                () => {
                    registry
                        .register(serviceA, (sr: ServiceRegistry) => sr.get(serviceB))
                        .register(serviceB, (sr: ServiceRegistry) => sr.get(serviceC))
                        .register(serviceC, (sr: ServiceRegistry) => sr.get(serviceD))
                        .register(serviceD, (sr: ServiceRegistry) => sr.get(serviceA))
                        .get(serviceA);
                },
                getExpectedError(`Detected circular dependency in services - ${chain}`)
            );
        });
    });

    it('Unregisters a registered service successfully', () => {
        const serviceName = 'SomeService';
        registry.register(serviceName, 'SomeValue');
        assert.equal(registry.unregister(serviceName), true);
    });

    it('Registeres a service via creator function', () => {
        const serviceName = 'some_service',
            serviceValue = 'some_value';

        registry.create((sr: ServiceRegistry) => sr.register(serviceName, serviceValue));

        assert.strictEqual(registry.get(serviceName), serviceValue);
    });

    it('Returns status of a service registry', () => {
        const serviceName1 = 'serviceName1',
            serviceValue1 = 'serviceValue1',
            serviceName2 = 'serviceName2';

        registry.register(serviceName1, serviceValue1);

        assert.strictEqual(registry.isRegistered(serviceName1), true);
        assert.strictEqual(registry.isRegistered(serviceName2), false);
    });
});
