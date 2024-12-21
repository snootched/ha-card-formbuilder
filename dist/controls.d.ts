import EditorForm from "./index";
import { AnyControl } from "./interfaces";
export declare const getNestedProperty: (obj: any, path: string) => any;
export declare function deepMergeNew<T>(target: T, source: T): T;
export declare function deepMerge<T>(target: T, source: T): T;
export declare function isObject(obj: any): boolean;
export declare function generateControl(control: AnyControl, card: EditorForm): import("lit-html").TemplateResult<1>;
