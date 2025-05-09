import 'server-only';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { createTRPCContext } from '~/server/api/trpc';
import { appRouter } from '~/server/api/root';
import type { AppRouter } from '~/server/api/root';

export const { dehydrate, hydrate } = createTRPCOptionsProxy<AppRouter>({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: cache(() => null),
});
