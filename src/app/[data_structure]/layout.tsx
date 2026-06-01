import AppSidebar from "@/components/ui/AppSidebar";
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
    payload && typeof payload === "object" && "userId" in payload && payload.userId
      ? { userId: String(payload.userId) }
      : null;

  return (
    <div className="flex min-h-screen transition-all duration-300">
      <AppSidebar initialUser={initialUser} />
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
