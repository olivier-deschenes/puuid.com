import { friendlyQueueTypeToRiot, type FriendlyQueueType } from "@/client/lib/typeHelper";
import type { ChampionsResponseType } from "@/shared/services/DDragon/types";
import { $getSummonerMatches } from "@/server/functions/$getSummonerMatches";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import type { SummonerType } from "@/server/db/schema/summoner";

type QueryParams = {
  summoner: Pick<SummonerType, "puuid" | "region">;
  queue: FriendlyQueueType;
};

export const getSummonerMatchesKey = (params: QueryParams) =>
  [
    "getSummonerMatchesOptions",
    params.summoner.puuid,
    params.queue,
    params.summoner.region,
  ] as const;

export const getSummonerMatchesOptions = (
  { summoner, queue }: QueryParams,
  c: string,
  champions: ChampionsResponseType["data"],
  w: boolean | undefined,
) =>
  queryOptions({
    queryKey: getSummonerMatchesKey({ summoner, queue }),
    queryFn: () =>
      $getSummonerMatches({
        data: {
          puuid: summoner.puuid,
          region: summoner.region,
          queue: friendlyQueueTypeToRiot(queue),
        },
      }),
    select: (data) => {
      if (c || w !== undefined) {
        return data.matches.filter((m) => {
          const championName = champions[m.match_summoner.championId]!.name.toUpperCase();
          const cCheck = championName.startsWith(c);

          const wCheck = w === undefined ? true : m.match_summoner.win === w;

          return cCheck && wCheck;
        });
      }

      return data.matches;
    },
  });

export const useGetSummonerMatches = (params: QueryParams, c: string, w: boolean | undefined) => {
  const { champions } = useLoaderData({ from: "/lol" });

  return useQuery(getSummonerMatchesOptions(params, c, champions, w));
};

export type GetSummonerMatchesType = Awaited<ReturnType<typeof $getSummonerMatches>>;
