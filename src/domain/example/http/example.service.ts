import { httpClient } from "@/config/axios-client";
import type { CreateExampleDto } from "../dto/create-example.dto";
import type { UpdateExampleDto } from "../dto/update-user.dto";
import type { Example } from "../entities/example";
import { HttpMethods, Service } from "@/services";

export class ExampleService extends Service {
  public static key = "@user";
  public static defaultPath = "/example";

  public static async createExample(dto: CreateExampleDto): Promise<Example> {
    const method = HttpMethods.POST;
    const path = Service.endpoint(ExampleService.defaultPath, "");
    const { data } = await httpClient[method](path, dto);
    return data;
  }

  public static async getAllExamples(): Promise<Example[]> {
    const method = HttpMethods.GET;
    const path = Service.endpoint(ExampleService.defaultPath, "");
    const { data } = await httpClient[method](path);
    return data.reverse();
  }

  public static async getExampleById(id: string | number): Promise<Example> {
    const method = HttpMethods.GET;
    const path = Service.endpoint(ExampleService.defaultPath, `/${id}`);
    const { data } = await httpClient[method](path);
    return data;
  }

  public static async updateExample(dto: UpdateExampleDto): Promise<void> {
    const method = HttpMethods.PUT;
    const path = Service.endpoint(ExampleService.defaultPath, `/${dto.id}`);
    await httpClient[method](path, dto);
  }

  public static async deleteExample(id: string | number): Promise<void> {
    const method = HttpMethods.DELETE;
    const path = Service.endpoint(ExampleService.defaultPath, `/${id}`);
    await httpClient[method](path);
  }
}
