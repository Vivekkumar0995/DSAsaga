import dbconnect from "@/lib/mongodb";

export async function GET(){
  await dbconnect();
  return Response.json({message:"mongodb connected"})
}
