import { api } from "~/trpc/server";

export async function getOrSetToken() {
  const data = await api.token.getTokens({
    username: "fernando",
    password: "admin***",
  });

  return data.access;
}
