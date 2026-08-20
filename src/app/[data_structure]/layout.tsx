import AppSidebar from "@/components/ui/AppSidebar";
import HideSidebarLayout from "@/components/ui/HideSidebarLayout";

export default async function DataStructureLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <HideSidebarLayout sidebar={<AppSidebar />}>
      {children}
    </HideSidebarLayout>
  );
}
