import { usePathname } from "next/navigation";

export function useCurrentPathTill(till: number): string[] {
   const pathname = usePathname()
   const pathParts = pathname.split('/').filter(Boolean)

   if (till == 0) return pathParts;
   return pathParts.splice(0, till)
}
