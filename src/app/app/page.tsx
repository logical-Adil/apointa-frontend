import type { Metadata } from "next";
import { AppWorkspace } from "./app-workspace";

export const metadata: Metadata = {
  title: "Workspace · Appointa",
  description:
    "Chat with Appointa and manage your appointments — all in one calm workspace.",
};

export default function AppPage() {
  return <AppWorkspace />;
}
