"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AxiosError } from "axios";
import { useState } from "react";

// Full page load: /api has no locale prefix, and the logout route handler sets cookies and redirects.
const logoutOnUnauthorized = (error: Error) => {
  if (error instanceof AxiosError && error.response?.status === 401) {
    window.location.assign("/api/logout?message=unauthorized");
  }
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
        mutationCache: new MutationCache({ onError: logoutOnUnauthorized }),
        queryCache: new QueryCache({ onError: logoutOnUnauthorized }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
