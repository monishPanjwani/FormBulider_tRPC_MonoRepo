import type { ServerRouter } from "@repo/trpc/client";
import { createTRPCProxyClient } from "@repo/trpc/client";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";

import { upstreamProcedure } from "~/lib/trpc-upstream";

const url = upstreamProcedure().toString();

export const api = createTRPCProxyClient<ServerRouter>({
  links: [createTRPCHttpBatchClientClient({ url })],
});

export const apiStreaming = createTRPCProxyClient<ServerRouter>({
  links: [createTRPCHttpBatchClientClient({ url, enableStreaming: true })],
});
