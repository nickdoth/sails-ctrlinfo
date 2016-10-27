declare interface RequestControl<T> {
  [method: string]: {
    act: (apply: ApplyMethods<T>) => Promise<T>,
    view?: (result: T) => [ string, any ],
    viewError?: (result: T) => [ string, any ],
    json?: (result: T) => any,
    jsonError?: (result: T) => any,
    session?: (result: T) => any,
    sessionReplace?: (result: T) => any
  };
}

export default function ctrlInfo<T>(ctrl: RequestControl<T>) : (req: any, res: any) => void;
