import TopicSidebar from "@/components/array-battle/TopicSidebar"



export default async function TopicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
        <TopicSidebar />
        {children}
    </>
  );
}
