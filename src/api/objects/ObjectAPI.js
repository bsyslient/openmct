define([
    'lodash',
    './object-utils',
    './MutableObject'
], function (
    _,
    utils,
    MutableObject
) {

    /**
        Object API.  Intercepts the existing object API while also exposing
        A new Object API.
    */

    /**
     * Utilities for loading, saving, and manipulating domain objects.
     * @interface ObjectAPI
     * @memberof module:openmct
     * @implements {module:openmct.ObjectProvider}
     */
    var Objects = {},
        ROOT_REGISTRY = [],
        PROVIDER_REGISTRY = {},
        FALLBACK_PROVIDER;

    Objects._supersecretSetFallbackProvider = function (p) {
        FALLBACK_PROVIDER = p;
    };

    // Root provider is hardcoded in; can't be skipped.
    var RootProvider = {
        'get': function () {
            return Promise.resolve({
                name: 'The root object',
                type: 'root',
                composition: ROOT_REGISTRY
            });
        }
    };

    // Retrieve the provider for a given key.
    function getProvider(key) {
        if (key.identifier === 'ROOT') {
            return RootProvider;
        }
        return PROVIDER_REGISTRY[key.namespace] || FALLBACK_PROVIDER;
    }

    /**
     * Register a new object provider for a particular namespace.
     *
     * @param {string} namespace the namespace for which to provide objects
     * @param {module:openmct.ObjectProvider} provider the provider which
     *        will handle loading domain objects from this namespace
     * @memberof {module:openmct.ObjectAPI#}
     * @name addProvider
     */
    Objects.addProvider = function (namespace, provider) {
        PROVIDER_REGISTRY[namespace] = provider;
    };

    /**
     * Provides the ability to read, write, and delete domain objects.
     *
     * When registering a new object provider, all methods on this interface
     * are optional.
     *
     * @interface ObjectProvider
     * @memberof module:openmct
     */

    /**
     * Save this domain object in its current state.
     *
     * @method save
     * @memberof module:openmct.ObjectProvider#
     * @param {module:openmct.DomainObject} domainObject the domain object to
     *        save
     * @returns {Promise} a promise which will resolve when the domain object
     *          has been saved, or be rejected if it cannot be saved
     */

    /**
     * Delete this domain object.
     *
     * @method delete
     * @memberof module:openmct.ObjectProvider#
     * @param {module:openmct.DomainObject} domainObject the domain object to
     *        delete
     * @returns {Promise} a promise which will resolve when the domain object
     *          has been deleted, or be rejected if it cannot be deleted
     */

    /**
     * Get a domain object.
     *
     * @method get
     * @memberof module:openmct.ObjectProvider#
     * @param {string} key the key for the domain object to load
     * @returns {Promise} a promise which will resolve when the domain object
     *          has been saved, or be rejected if it cannot be saved
     */

    [
        'save',
        'delete',
        'get'
    ].forEach(function (method) {
        Objects[method] = function () {
            var key = arguments[0],
                provider = getProvider(key);

            if (!provider) {
                throw new Error('No Provider Matched');
            }

            if (!provider[method]) {
                throw new Error('Provider does not support [' + method + '].');
            }

            return provider[method].apply(provider, arguments);
        };
    });

    /**
     * Add a root-level object.
     * @param {module:openmct.ObjectAPI~Identifier} id the identifier of the
     *        root-level object to add.
     * @method addRoot
     * @memberof module:openmct.ObjectAPI#
     */
    Objects.addRoot = function (key) {
        ROOT_REGISTRY.unshift(key);
    };

    /**
     * Remove a root-level object.
     * @param {module:openmct.ObjectAPI~Identifier} id the identifier of the
     *        root-level object to remove.
     * @method removeRoot
     * @memberof module:openmct.ObjectAPI#
     */
    Objects.removeRoot = function (key) {
        ROOT_REGISTRY = ROOT_REGISTRY.filter(function (k) {
            return (
                k.identifier !== key.identifier ||
                k.namespace !== key.namespace
            );
        });
    };

    /**
     * Modify a domain object.
     * @param {module:openmct.DomainObject} object the object to mutate
     * @param {string} path the property to modify
     * @param {*} value the new value for this property
     * @method mutate
     * @memberof module:openmct.ObjectAPI#
     */

    /**
     * Observe changes to a domain object.
     * @param {module:openmct.DomainObject} object the object to observe
     * @param {string} path the property to observe
     * @param {Function} callback a callback to invoke when new values for
     *        this property are observed
     * @method observe
     * @memberof module:openmct.ObjectAPI#
     */

    /**
     * Uniquely identifies a domain object.
     *
     * @typedef Identifier
     * @memberof module:openmct.ObjectAPI~
     * @property {string} namespace the namespace to/from which this domain
     *           object should be loaded/stored.
     * @property {string} key a unique identifier for the domain object
     *           within that namespace
     */

    /**
     * A domain object is an entity of relevance to a user's workflow, that
     * should appear as a distinct and meaningful object within the user
     * interface. Examples of domain objects are folders, telemetry sensors,
     * and so forth.
     *
     * A few common properties are defined for domain objects. Beyond these,
     * individual types of domain objects may add more as they see fit.
     *
     * @property {module:openmct.ObjectAPI~Identifier} identifier a key/namespace pair which
     *           uniquely identifies this domain object
     * @property {string} type the type of domain object
     * @property {string} name the human-readable name for this domain object
     * @property {string} [creator] the user name of the creator of this domain
     *           object
     * @property {number} [modified] the time, in milliseconds since the UNIX
     *           epoch, at which this domain object was last modified
     * @typedef DomainObject
     * @memberof module:openmct
     */

    return Objects;
});
