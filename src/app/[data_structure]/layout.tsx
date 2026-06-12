import AppSidebar from "@/components/ui/AppSidebar";
import HideSidebarLayout from "@/components/ui/HideSidebarLayout";
import { decrypt } from "@/lib/jose_auth";
import { cookies } from "next/headers";

export default async function DataStructureLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? await decrypt(token) : null;
  const initialUser =
    payload &&
    typeof payload === "object" &&
    "userId" in payload &&
    payload.userId
      ? { userId: String(payload.userId) }
      : null;

  return (
    <HideSidebarLayout sidebar={<AppSidebar initialUser={initialUser} />}>
      {children}
    </HideSidebarLayout>
  );
}
