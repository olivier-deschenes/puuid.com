import { AccountRegionDTOSchema } from "@/server/api-route/riot/account/AccountDTO";
import { LolQueues } from "@/server/api-route/riot/league/LeagueDTO";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerStatistic = createServerFn({ method: "GET" })
  .validator(
    v.object({
      puuid: AccountRegionDTOSchema.entries.puuid,
      queue: v.picklist(LolQueues),
    }),
  )
  .handler(async (ctx) => {
    const params = ctx.data;

    const { StatisticService } = await import("@/server/services/StatisticService");
    const data = await StatisticService.getSummonerStatistic(params.puuid, params.queue);

    return data ?? null;
  });

export type $GetSummonerStatisticType = NonNullable<
  Awaited<ReturnType<typeof $getSummonerStatistic>>
>;
