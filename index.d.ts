declare interface RequestControlMap {
  [method: string]: RequestControl<any>;
}

interface RequestControl<T> {
  act?: (req: any) => PromiseLike<T>,
  view?: (result: T) => [ string, any ] | string,
  viewError?: (err: any) => [ string, any ],
  json?: (result: T) => any,
  jsonError?: (err: any) => any,
  session?: (result: T) => any,
  sessionReplace?: (result: T) => any
}

export default function ctrlInfo(ctrl: RequestControlMap) : (req: any, res: any) => void;
