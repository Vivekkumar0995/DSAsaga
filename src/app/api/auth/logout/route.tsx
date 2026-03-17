import {NextResponse } from "next/server"

export async function POST(){

  try{
    const response = NextResponse.json(
    {message:"Loggedout sucessfully"},{status:200}
  );

  response.cookies.set("token" ,"" ,{
    httpOnly :true,
    expires:new Date(0),
    path:'/'
  });

  return response;
  }catch(error:unknown){
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
