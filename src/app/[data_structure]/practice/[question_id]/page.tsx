import QuestionPanelsClient from "@/components/practice/QuestionPanelsClient";

type Props = {
  params: Promise<{
    data_structure: string;
    question_id: string;
  }>;
};

async function getQuestion(slug: string) {
  const res = await fetch(`http://localhost:3000/api/questions/${slug}`, {
    cache: "no-store",
  });

  return res.json();
}

export default async function QuestionPage({ params }: Props) {
  const { question_id, data_structure } = await params;

  const data = await getQuestion(question_id); 

  const question = data.question;
  const previousQuestion = data.previousQuestion;
  const nextQuestion = data.nextQuestion;
  

  return <QuestionPanelsClient question={question} previousQuestion={previousQuestion} nextQuestion={nextQuestion} dataStructure={data_structure} />;
}
