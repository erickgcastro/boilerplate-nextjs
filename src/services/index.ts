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

  public static toFormData(data: Record<string, unknown>) {
    const formData = new FormData();

    for (const key in data) {
      const value = data[key];

      if (value instanceof FileList) {
        for (let i = 0; i < value.length; i++) {
          formData.append(key, value[i]);
        }
        continue;
      }

      if (key === "utm") {
        formData.append(key, JSON.stringify(value));
        continue;
      }

      // String() matches what FormData already did with non-Blob values.
      formData.append(key, value instanceof Blob ? value : String(value));
    }

    return formData;
  }
}

export function Key<T extends typeof Service>(ctor: T, method: keyof T) {
  const prefix = ctor.key || ctor.name;

  return `${prefix}:${method.toString()}`;
}

export function Resolve<T extends typeof Service, A extends keyof T>(
  ctor: T,
  method: A,
): {
  key: string;
  service: T[A];
} {
  return {
    key: Key(ctor, method),
    service: ctor[method],
  };
}
