"use client";
import Link from "next/link";
import React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

type Props = {
  question: any;
  previousQuestion?: any;
  nextQuestion?: any;
  dataStructure: string;
};

export default function QuestionPanelsClient({
  question,
  previousQuestion,
  nextQuestion,
  dataStructure,
}: Props) {
  const previousHref = previousQuestion ? `/${dataStructure}/practice/${previousQuestion.slug}` : undefined;
  const nextHref = nextQuestion ? `/${dataStructure}/practice/${nextQuestion.slug}` : undefined;

  return (
    <div className="pt-20 h-screen bg-slate-50">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full overflow-y-auto bg-white border-r px-8 py-8">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">{question.title}</h1>

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                {question.difficulty}
              </span>

              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
                {question.xp} XP
              </span>
            </div>

            <div className="mt-8">
              <h2 className="font-semibold text-xl mb-3">Description</h2>

              <p className="text-neutral-700 leading-7">
                {question.description}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="font-semibold text-xl mb-3">Example Testcase</h2>

              <div className="bg-slate-100 rounded-2xl p-4">
                <p>
                  <strong>Input:</strong> {question.test_cases?.[0]?.input}
                </p>

                <p className="mt-2">
                  <strong>Output:</strong> {question.test_cases?.[0]?.output}
                </p>
              </div>
            </div>
            <div className="mt-10 flex justify-between items-center">
              <div>
                {previousHref ? (
                  <Link href={previousHref}>
                    <button className="px-5 py-3 rounded-xl border hover:bg-slate-100 transition">
                      ← Previous
                    </button>
                  </Link>
                ) : (
                  <button
                    className="px-5 py-3 rounded-xl border bg-slate-100 text-slate-400 cursor-not-allowed"
                    disabled
                  >
                    ← Previous
                  </button>
                )}
              </div>
              <div>
                {nextHref ? (
                  <Link href={nextHref}>
                    <button className="px-5 py-3 rounded-xl bg-black text-white hover:opacity-90 transition">
                      Next →
                    </button>
                  </Link>
                ) : (
                  <button
                    className="px-5 py-3 rounded-xl bg-slate-300 text-slate-500 cursor-not-allowed"
                    disabled
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-slate-200 hover:bg-slate-300 transition" />

        <Panel defaultSize={50} minSize={30}>
          <div className="h-full bg-[#0D1117] text-white flex flex-col">
            <div className="border-b border-neutral-700 px-6 py-4 flex justify-between items-center">
              <select className="bg-[#161B22] border border-neutral-700 rounded-lg px-4 py-2">
                <option>C++</option>
                <option>Java</option>
                <option>Python</option>
              </select>

              <div className="flex gap-3">
                <button className="px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600">
                  Run
                </button>

                <button className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500">
                  Submit
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {question.starter_code?.cpp}
              </pre>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
