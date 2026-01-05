import {castDraft, produce} from "immer";
import {IsPrimitive} from "../validation/IsPrimitive.tsx";

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

export interface Cont<V = unknown> {
    readonly parent: Cont<V> | null;
    readonly path: string;
    readonly value: V;
    readonly children: Cont<V>[];
    readonly root: Cont<V>;
    readonly containerIndex: ContainerIndex<V>;
}

export interface PrimitiveCallbackArgs<V = Cont> {
    i: string;
    value: Primitive;
    path: string;
    fullpath: string;
    key: string;
    containerValue: V;
}

/**
 * Shared index for O(1) lookups by path.
 */
interface ContainerIndex<V = Cont> {
    readonly Values: Map<string, V>;
    readonly Containers: Map<string, Cont<V>>;
}

const VALUES_STRING = 'Values' as const;
const CONTAINERS_STRING = 'Containers' as const;

export function RangePrimitiveValues<V>(
    container: Cont<V>,
    callback: (args: PrimitiveCallbackArgs<V>) => void,
    rootOffset = 2
): void {
    // We iterate over the index of values
    for (const [key, value] of container.containerIndex.Values.entries()) {
        if (!value || typeof value !== 'object') continue;

        // In this loop, 'value' is of type V
        Object.entries(value).forEach(([subKey, val]) => {
            const parts = key.split(".");
            parts.push(subKey);

            const path = parts.slice(2).join(".");

            // IsPrimitive check ensures 'val' matches our Primitive type
            if (parts.length > rootOffset && IsPrimitive(val as never)) {
                callback({
                    i: subKey,
                    value: val as Primitive, // Safe cast because of IsPrimitive check
                    path,
                    fullpath: parts.join("."),
                    key,
                    containerValue: value as V // Correctly typed as the Container's value type
                });
            }
        });
    }
}


/**
 * Creates an immutable container. Using standard function syntax avoids
 * JSX ambiguity in .tsx files and improves IDE support.
 */
export function createContainer<V>(
    parent: Cont<V> | null,
    path: string,
    value: V,
    containerIndex?: ContainerIndex<V>
): Cont<V> {
    // 1. Initialize or retrieve the shared index
    const newIndex: ContainerIndex<V> = containerIndex || {
        [VALUES_STRING]: new Map<string, V>(),
        [CONTAINERS_STRING]: new Map<string, Cont<V>>()
    };

    const currentPath = parent ? path : 'root';


    const newContainer: Cont<V> = Object.freeze({
        parent,
        path: currentPath,
        value,
        children: [] as Cont<V>[],
        // If there is no parent, this node is the root
        root: parent ? parent.root : (null as unknown as Cont<V>),
        containerIndex: newIndex
    });

    // Fix the circular reference for the root node specifically
    if (!parent) {
        // use a Partial Type Cast. This tells TypeScript: "I know this object is a Container, but for this one line, I need to treat the root property as writable"
        (newContainer as { -readonly [K in keyof Cont]: Cont[K] }).root = newContainer;
    }

    newIndex[VALUES_STRING].set(currentPath, value);
    newIndex[CONTAINERS_STRING].set(currentPath, newContainer);

    return newContainer;
}

/**
 * Re-implementation of BuildContainerTree using Immer for initialization
 */
export function BuildContainerTree<V>(initialData: V): Cont<V> {
    // Start with a base root
    const root = createContainer(null, 'root', initialData);

    return produce(root, (draft) => {
        const process = (container: Cont<V>, stackPath: string[]) => {
            const val = container.value;
            if (val && typeof val === 'object') {
                Object.entries(val).forEach(([key, subVal]) => {
                    if (subVal && typeof subVal === 'object') {
                        const newPath = [...stackPath, key];
                        const jp = newPath.join('.');

                        // In Immer, we create the child and push to the proxy array
                        const child = createContainer(
                            container,
                            jp,
                            subVal as V,
                            draft.containerIndex as never
                        );

                        // This 'push' is tracked by Immer
                        (container.children as Cont<V>[]).push(child);
                        process(child, newPath);
                    }
                });
            }
        };

        process(draft as never, ['root']);
    });
}

/**
 * Immutably updates a container tree using Immer.
 * This replaces the complex 'while' parent-bubbling loop.
 */
export function UpdateContainerByPath<V>(
    rootContainer: Cont<V>,
    path: string,
    key: string,
    newValue: never
): Cont<V> {
    // 1. We use Immer's 'produce' on the root container
    return produce(rootContainer, (draft) => {
        const target = draft.containerIndex.Containers.get(path);

        if (target) {
            // 2. Perform the update as if it were a mutation
            // Immer will handle the immutability of the parent chain automatically
            const updatedValue = { ...(target.value as object), [key]: newValue } as V;

            /**
             * ""this error is the "final boss" of Immer + TypeScript generics""
             * 3. THE FIX: Double-cast to bypass the Draft<V> recursion error.
             * This tells TS: "I am treating this draft target as an object
             * with a 'value' property of type V."
             */
            (target as { value: V }).value = updatedValue;

            // We use castDraft here because Maps have special Proxy handling in Immer
            draft.containerIndex.Values.set(path, castDraft(updatedValue));

        }
    });
}