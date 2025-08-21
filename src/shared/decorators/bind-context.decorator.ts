import { copyMetadata } from '@shared/utils/copy-metadata.util';

/**
 * A method decorator that auto-binds `this` while preserving reflect metadata.
 * @param shouldCopyMetadata - whether copy method decorator metadata which this decorator attached to
 */
export function BindContext(shouldCopyMetadata = false): MethodDecorator {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    // Keep the prototype method descriptor (so prototype-level metadata remains discoverable)
    // and install a lazy getter that binds once per instance.
    return {
      configurable: true,
      get(this: any): any {
        // If already bound on this instance, return it.
        const existing = Object.getOwnPropertyDescriptor(this, propertyKey)?.value;
        if (typeof existing === 'function') return existing;

        // Create a bound function
        const bound = originalMethod.bind(this);

        if (shouldCopyMetadata) {
          // --- Preserve metadata on the bound function (function target) ---
          // Copy metadata that might have been set directly on the original method function
          copyMetadata(originalMethod, bound);

          // --- Mirror (target, propertyKey) metadata onto (this, propertyKey) ---
          // Many frameworks look up metadata via (target, propertyKey).
          // We keep it on the prototype, but we also mirror it to the instance property
          // to protect against consumers that check on the instance.
          copyMetadata(target, this, propertyKey);
        }

        // Define the bound method on the instance for future direct access
        Object.defineProperty(this, propertyKey, {
          value: bound,
          configurable: descriptor.configurable,
          writable: descriptor.writable,
        });

        return bound;
      },
    };
  };
}
