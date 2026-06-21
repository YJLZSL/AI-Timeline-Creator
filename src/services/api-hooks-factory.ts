import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { api } from './api.js';

/* ───────────────────────────────────────────
   顶层资源工厂（不依赖 workspaceId）
   ─────────────────────────────────────────── */

export interface TopLevelHooksOptions {
  /** 自定义列表 URL，默认 `/api/{apiPath}` */
  listUrl?: string | (() => string);
  /** 自定义详情 URL，默认 `/api/{apiPath}/{id}` */
  detailUrl?: (id: string) => string;
  /** 自定义创建 URL，默认 `/api/{apiPath}` */
  createUrl?: string | (() => string);
  /** 自定义更新 URL，默认 `/api/{apiPath}/{id}` */
  updateUrl?: (id: string) => string;
  /** 自定义删除 URL，默认 `/api/{apiPath}/{id}` */
  deleteUrl?: (id: string) => string;
  /** 更新成功后是否同时使详情查询失效，默认 true */
  invalidatesDetail?: boolean;
}

export function createTopLevelHooks<T, CreateT, UpdateT>(
  entityName: string,
  apiPath: string,
  options: TopLevelHooksOptions = {},
) {
  const {
    listUrl,
    detailUrl,
    createUrl,
    updateUrl,
    deleteUrl,
    invalidatesDetail = true,
  } = options;

  function useList(): UseQueryResult<T[], Error> {
    return useQuery({
      queryKey: [entityName],
      queryFn: () => {
        const url =
          typeof listUrl === 'string'
            ? listUrl
            : listUrl
              ? listUrl()
              : `/api/${apiPath}`;
        return api.get<T[]>(url);
      },
    });
  }

  function useOne(id: string | null): UseQueryResult<T, Error> {
    return useQuery({
      queryKey: [entityName, id],
      queryFn: () =>
        api.get<T>(detailUrl ? detailUrl(id!) : `/api/${apiPath}/${id}`),
      enabled: !!id,
    });
  }

  function useCreate(): UseMutationResult<T, Error, CreateT, unknown> {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (data: CreateT) => {
        const url =
          typeof createUrl === 'string'
            ? createUrl
            : createUrl
              ? createUrl()
              : `/api/${apiPath}`;
        return api.post<T>(url, data);
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: [entityName] }),
    });
  }

  function useUpdate(): UseMutationResult<
    T,
    Error,
    { id: string; data: UpdateT },
    unknown
  > {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateT }) =>
        api.patch<T>(updateUrl ? updateUrl(id) : `/api/${apiPath}/${id}`, data),
      onSuccess: (_, vars) => {
        qc.invalidateQueries({ queryKey: [entityName] });
        if (invalidatesDetail) {
          qc.invalidateQueries({ queryKey: [entityName, vars.id] });
        }
      },
    });
  }

  function useDelete(): UseMutationResult<{ id: string }, Error, string, unknown> {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: string) =>
        api.delete<{ id: string }>(deleteUrl ? deleteUrl(id) : `/api/${apiPath}/${id}`),
      onSuccess: () => qc.invalidateQueries({ queryKey: [entityName] }),
    });
  }

  return { useList, useOne, useCreate, useUpdate, useDelete };
}

/* ───────────────────────────────────────────
   嵌套资源工厂（依赖 workspaceId）
   ─────────────────────────────────────────── */

export interface NestedHooksOptions<ListT = unknown> {
  /** 自定义列表 URL，默认 `/api/workspaces/{workspaceId}/{apiPath}` */
  listUrl?: (workspaceId: string) => string;
  /** 自定义详情 URL，默认 `/api/workspaces/{workspaceId}/{apiPath}/{id}` */
  detailUrl?: (workspaceId: string, id: string) => string;
  /** 自定义创建 URL */
  createUrl?: (workspaceId: string) => string;
  /** 自定义更新 URL */
  updateUrl?: (workspaceId: string, id: string) => string;
  /** 自定义删除 URL */
  deleteUrl?: (workspaceId: string, id: string) => string;
  /** 转换列表查询响应（如 Connection 的 { items: Connection[] } 包装） */
  listResponseTransformer?: (response: unknown) => ListT;
  /** 乐观更新配置 */
  optimisticUpdate?: {
    /** 列表数据在响应中的路径，如 'items'。未设置则响应本身就是数组 */
    listDataPath?: string;
    /** 需要乐观更新的字段名 */
    fields: string[];
  };
  /** 更新成功后是否同时使详情查询失效，默认 false */
  invalidatesDetail?: boolean;
  /** 资源 ID 字段名（在 mutation 变量中），默认 'id' */
  idFieldName?: string;
}

export function createNestedHooks<
  T,
  CreateT,
  UpdateT,
  IdField extends string = 'id',
  ListT = T[],
>(
  entityName: string,
  apiPath: string,
  options: NestedHooksOptions<ListT> = {},
) {
  const {
    listUrl,
    detailUrl,
    createUrl,
    updateUrl,
    deleteUrl,
    listResponseTransformer,
    optimisticUpdate,
    invalidatesDetail = false,
    idFieldName = 'id',
  } = options;

  type CreateVars = { workspaceId: string; data: CreateT };
  type UpdateVars = { workspaceId: string; data: UpdateT } & Record<IdField, string>;
  type DeleteVars = { workspaceId: string } & Record<IdField, string>;

  function useList(workspaceId: string | null): UseQueryResult<ListT, Error> {
    return useQuery({
      queryKey: [entityName, workspaceId],
      queryFn: async () => {
        const url = listUrl
          ? listUrl(workspaceId!)
          : `/api/workspaces/${workspaceId}/${apiPath}`;
        if (listResponseTransformer) {
          const response = await api.get<unknown>(url);
          return listResponseTransformer(response);
        }
        return api.get<ListT>(url);
      },
      enabled: !!workspaceId,
    });
  }

  function useOne(
    workspaceId: string | null,
    id: string | null,
  ): UseQueryResult<T, Error> {
    return useQuery({
      queryKey: [entityName, workspaceId, id],
      queryFn: () => {
        const url = detailUrl
          ? detailUrl(workspaceId!, id!)
          : `/api/workspaces/${workspaceId}/${apiPath}/${id}`;
        return api.get<T>(url);
      },
      enabled: !!workspaceId && !!id,
    });
  }

  function useCreate(): UseMutationResult<T, Error, CreateVars, unknown> {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (vars: CreateVars) => {
        const url = createUrl
          ? createUrl(vars.workspaceId)
          : `/api/workspaces/${vars.workspaceId}/${apiPath}`;
        return api.post<T>(url, vars.data);
      },
      onSuccess: (_, vars) =>
        qc.invalidateQueries({ queryKey: [entityName, vars.workspaceId] }),
    });
  }

  function useUpdate(): UseMutationResult<T, Error, UpdateVars, unknown> {
    const qc = useQueryClient();
    type OptimisticContext = { previousList: ListT | undefined; previousDetail: T | undefined };
    return useMutation<T, Error, UpdateVars, OptimisticContext>({
      mutationFn: (vars: UpdateVars) => {
        const id = vars[idFieldName as IdField];
        const url = updateUrl
          ? updateUrl(vars.workspaceId, id)
          : `/api/workspaces/${vars.workspaceId}/${apiPath}/${id}`;
        return api.patch<T>(url, vars.data);
      },
      ...(optimisticUpdate
        ? {
            onMutate: async (vars: UpdateVars) => {
              const id = vars[idFieldName as IdField];
              const listKey = [entityName, vars.workspaceId];
              const detailKey = [entityName, vars.workspaceId, id];

              await qc.cancelQueries({ queryKey: listKey });
              await qc.cancelQueries({ queryKey: detailKey });

              const previousList = qc.getQueryData<ListT | undefined>(listKey);
              const previousDetail = qc.getQueryData<T>(detailKey);

              const patch: Record<string, unknown> = { updatedAt: new Date() };
              for (const field of optimisticUpdate.fields) {
                if (vars.data[field as keyof UpdateT] !== undefined) {
                  patch[field] = vars.data[field as keyof UpdateT];
                }
              }

              if (previousList) {
                if (optimisticUpdate.listDataPath) {
                  const prevObj = previousList as Record<string, unknown>;
                  qc.setQueryData(listKey, {
                    ...prevObj,
                    [optimisticUpdate.listDataPath]:
                      (prevObj[optimisticUpdate.listDataPath] as unknown[]).map(
                        (item: unknown) =>
                          (item as Record<string, unknown>).id === id
                            ? ({ ...(item as Record<string, unknown>), ...patch } as T)
                            : item,
                      ),
                  });
                } else {
                  qc.setQueryData(
                    listKey,
                    (previousList as unknown[]).map((item: unknown) =>
                      (item as Record<string, unknown>).id === id
                        ? ({ ...(item as Record<string, unknown>), ...patch } as T)
                        : item,
                    ),
                  );
                }
              }

              if (previousDetail) {
                qc.setQueryData(detailKey, {
                  ...previousDetail,
                  ...patch,
                } as T);
              }

              return { previousList, previousDetail };
            },
            onError: (_err, vars, context) => {
              const id = vars[idFieldName as IdField];
              const listKey = [entityName, vars.workspaceId];
              const detailKey = [entityName, vars.workspaceId, id];
              if (context?.previousList) {
                qc.setQueryData(listKey, context.previousList);
              }
              if (context?.previousDetail) {
                qc.setQueryData(detailKey, context.previousDetail);
              }
            },
            onSettled: (_data, _err, vars) => {
              const id = vars[idFieldName as IdField];
              const listKey = [entityName, vars.workspaceId];
              const detailKey = [entityName, vars.workspaceId, id];
              qc.invalidateQueries({ queryKey: listKey });
              qc.invalidateQueries({ queryKey: detailKey });
            },
          }
        : {
            onSuccess: (_data, vars) => {
              qc.invalidateQueries({ queryKey: [entityName, vars.workspaceId] });
              if (invalidatesDetail) {
                const id = vars[idFieldName as IdField];
                qc.invalidateQueries({ queryKey: [entityName, vars.workspaceId, id] });
              }
            },
          }),
    });
  }

  function useDelete(): UseMutationResult<
    { id: string },
    Error,
    DeleteVars,
    unknown
  > {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (vars: DeleteVars) => {
        const id = vars[idFieldName as IdField];
        const url = deleteUrl
          ? deleteUrl(vars.workspaceId, id)
          : `/api/workspaces/${vars.workspaceId}/${apiPath}/${id}`;
        return api.delete<{ id: string }>(url);
      },
      onSuccess: (_, vars) =>
        qc.invalidateQueries({ queryKey: [entityName, vars.workspaceId] }),
    });
  }

  return { useList, useOne, useCreate, useUpdate, useDelete };
}
