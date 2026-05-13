import { SiteLoadingScreen } from "@/components/site-loading";

export default function AppWorkspaceLoading() {
  return (
    <SiteLoadingScreen
      message="Opening your workspace"
      submessage="Syncing chat, appointments, and concierge context."
    />
  );
}
