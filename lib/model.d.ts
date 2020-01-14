interface ops {
    [key: string]: any;
}
declare class Datastore {
    options: ops;
    constructor(options: ops);
    set(key: string, val: any): Promise<void>;
    get(key: any): Promise<any>;
}
declare const _default: Datastore;
export default _default;
