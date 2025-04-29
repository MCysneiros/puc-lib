import { api, HydrateClient } from "~/trpc/server";
import EstatisticaTable from "../_components/EstatisticaTable";

export default async function EstatisticaPage() {
  const data = await api.token.getTokens({
    username: "fernando",
    password: "admin***",
  });

  const estatistica = await api.estatistica.getEstatistica({
    authToken: data.access,
  });

  return (
    <HydrateClient>
      <main className="radius-lg flex min-h-screen flex-col items-center justify-center bg-[#e6e6e6] text-black">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          {/* Removido o h1 do título */}
          <EstatisticaTable estatistica={estatistica} />
        </div>
      </main>
    </HydrateClient>
  );
}
