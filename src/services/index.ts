export enum HttpMethods {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
  PATCH = "patch",
}

export class Service {
  public static defaultPath: string;
  public static key: string;

  public static endpoint(defaultPath: string, path: string) {
    return `${defaultPath}${path}`;
  }

  public static toFormData(data: Record<string, any>) {
    const formData = new FormData();

    for (const key in data) {
      if (data[key] instanceof FileList) {
        for (let i = 0; i < data[key].length; i++) {
          formData.append(key, data[key][i]);
        }
        continue;
      }

      if (key === "utm") {
        formData.append(key, JSON.stringify(data[key]));
        continue;
      }

      formData.append(key, data[key]);
    }

    return formData;
  }
}

export function Key<T extends typeof Service>(ctor: T, method: keyof T) {
  const prefix = ctor.key || ctor.name;

  return `${prefix}:${method.toString()}`;
}

export function Resolve<A extends keyof T, T extends Service>(
  ctor: T,
  method: keyof T,
): {
  key: string;
  service: T[A];
} {
  const prefix: string = (ctor as any).key || (ctor as any).name;

  const x = ctor[method];

  return {
    key: `${prefix}:${method.toString()}`,
    service: x as T[A],
  };
}
