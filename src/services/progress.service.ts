import Question from "@/models/question_model";
import SolvedQuestion from "@/models/SolvedQuestion";
import UserProgress from "@/models/UserProgress";


export async function awardQuestionCompletion(userId: string,questionSlug: string){

  const question = await Question.findOne({slug: questionSlug});

  if (!question) {
    throw new Error("Question not found");
  }

  const alreadySolved = await SolvedQuestion.findOne({userId,questionId: question._id,status: "solved"});

  if (alreadySolved) {
    return {success: true,message: "Already solved"};
  }

  await SolvedQuestion.create({userId,questionId: question._id,questionSlug: question.slug,dataStructureSlug: question.category,status: "solved",xpEarned: question.xp});

  let progress = await UserProgress.findOne({userId});

  if (!progress) {
    progress = await UserProgress.create({userId});
  }

  progress.xp += question.xp;
  progress.solvedCount += 1;

    if (question.difficulty === "easy") progress.easySolved += 1;
    if (question.difficulty === "medium") progress.mediumSolved += 1;
    if (question.difficulty === "hard") progress.hardSolved += 1;

    progress.level = Math.floor(progress.xp / 100) + 1;

    if (progress.level >= 1000) progress.currentRank = "Legend";
    else if (progress.level >= 500) progress.currentRank = "Master"; 
    else if (progress.level >= 150) progress.currentRank = "Warrior";
    else progress.currentRank = "Beginner";

  await progress.save();

  return {
    success: true,
    xpGained: question.xp,
    newLevel: progress.level,
    rank: progress.currentRank,
  };
}
