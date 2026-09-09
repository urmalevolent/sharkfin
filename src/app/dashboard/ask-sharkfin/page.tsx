import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AskSharkFinClient from "./ask-sharkfin-client";

export default async function AskSharkFinPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AskSharkFinClient
      userName={session.user.name ?? "User"}
    />
  );
}