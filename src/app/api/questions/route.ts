import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import DataStructureModel from '@/models/data_structure_model';
import Question from '@/models/question_model';

export async function GET(request: NextRequest) {

    try{
        await connectDB();
        const searchParams = request.nextUrl.searchParams;
        const dsSlug = searchParams.get('dsSlug');

        if(!dsSlug){
            return NextResponse.json({success: false, message: "Data structure slug is required"}, {status: 400});
        }

        const dataStructure = await DataStructureModel.findOne({slug: dsSlug});

        if(!dataStructure){
            return NextResponse.json({success: false, message: "Data structure not found"}, {status: 404});
        }

        const questions = await Question.find({data_structure_id: dataStructure._id}).select("_id title slug difficulty xp order").sort({order: 1});
        return NextResponse.json({success: true, questions}, {status: 200});
        
    }
    catch(error){
        console.error("Error fetching questions:", error);
        return NextResponse.json({success: false, message: "Internal server error"}, {status: 500});
    }

}