"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const SAMPLE_QUESTION_JSON = {
  title: "Two Sum",
  slug: "two-sum",
  difficulty: "easy",
  category: "Arrays",
  xp: 100,
  order: 1,
  time_limit_ms: 2000,
  memory_limit_mb: 256,
  unordered_output: true,
  description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
  return_type: "vector",
  return_type_cpp: "vector<int>",
  return_type_java: "int[]",
  return_type_c: "int*",
  params: [
    {
      name: "nums",
      type: "vector<int>",
      type_java: "int[]",
      type_c: "int*"
    },
    {
      name: "target",
      type: "int",
      type_java: "int",
      type_c: "int"
    }
  ],
  starter_code: {
    cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
    java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
    python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass",
    javascript: "function twoSum(nums, target) {\n    \n}",
    c: "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n}"
  },
  test_cases: [
    {
      input: "[2,7,11,15], 9",
      output: "[0,1]||[1,0]",
      is_hidden: false
    },
    {
      input: "[3,2,4], 6",
      output: "[1,2]||[2,1]",
      is_hidden: false
    },
    {
      input: "[3,3], 6",
      output: "[0,1]||[1,0]",
      is_hidden: true
    }
  ],
  reference_solution: "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}"
};

export default function AdminQuestionsPage() {
  const [dataStructureSlug, setDataStructureSlug] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [loadingDS, setLoadingDS] = useState(true);
  const [dataStructures, setDataStructures] = useState<{ slug: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Target question slug for quick testcase updates
  const [tcSlug, setTcSlug] = useState("two-sum");

  // Test cases quick-editor & bulk upload
  const [tcJson, setTcJson] = useState(
    JSON.stringify(SAMPLE_QUESTION_JSON.test_cases, null, 2)
  );
  const [savingTc, setSavingTc] = useState(false);

  // Automated generator state
  const [genLanguage, setGenLanguage] = useState("javascript");
  const [genRefCode, setGenRefCode] = useState(
    `function twoSum(nums, target) {\n  const solutions = [];\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      solutions.push([map.get(diff), i]);\n    }\n    map.set(nums[i], i);\n  }\n  return solutions.length === 1 ? solutions[0] : (solutions.length > 1 ? solutions : []);\n}`
  );
  const [genInputs, setGenInputs] = useState(
    `[2,7,11,15], 9\n[3,2,4], 6\n[3,3], 6\n[1,5,9,11], 14\n[0,4,3,0], 0`
  );
  const [genSampleCount, setGenSampleCount] = useState(2);
  const [generating, setGenerating] = useState(false);

  // Reference solution editor state
  const [refSolution, setRefSolution] = useState(SAMPLE_QUESTION_JSON.reference_solution);
  const [savingRef, setSavingRef] = useState(false);

  useEffect(() => {
    axios.get("/api/data-structure")
      .then(res => {
        setDataStructures(res.data.data || []);
        if (res.data.data?.length > 0) {
          setDataStructureSlug(res.data.data[0].slug);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDS(false));
  }, []);

  const loadSample = () => {
    setRawJson(JSON.stringify(SAMPLE_QUESTION_JSON, null, 2));
    toast.success("Loaded sample question JSON!");
  };

  const handleUploadQuestion = async () => {
    if (!dataStructureSlug) {
      toast.error("Please select a Data Structure target");
      return;
    }
    if (!rawJson.trim()) {
      toast.error("JSON payload is empty");
      return;
    }

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(rawJson);
    } catch (e: any) {
      toast.error("Invalid JSON syntax: " + e.message);
      return;
    }

    if (!parsedPayload.title || !parsedPayload.slug || !parsedPayload.difficulty) {
      toast.error("JSON must include title, slug, and difficulty");
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading("Saving question to database...");

    try {
      await axios.post("/api/admin/questions", {
        dataStructureSlug,
        question: parsedPayload
      });
      if (parsedPayload.slug) setTcSlug(parsedPayload.slug);
      toast.success("Question uploaded/updated successfully! ✅", { id: loadingToast });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload question", { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSolution = async () => {
    if (!tcSlug.trim()) { toast.error("Enter a question slug"); return; }
    if (!refSolution.trim()) { toast.error("Reference solution is empty"); return; }
    setSavingRef(true);
    const t = toast.loading("Saving reference solution...");
    try {
      await axios.patch("/api/admin/questions", {
        slug: tcSlug.trim(),
        reference_solution: refSolution.trim(),
      });
      toast.success("Reference solution saved! ✅", { id: t });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save", { id: t });
    } finally {
      setSavingRef(false);
    }
  };

  const handleSaveTestCases = async () => {
    if (!tcSlug.trim()) {
      toast.error("Enter a question slug");
      return;
    }
    if (!tcJson.trim()) {
      toast.error("Test cases JSON is empty");
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(tcJson);
    } catch (e: any) {
      toast.error("Invalid JSON syntax: " + e.message);
      return;
    }

    if (!Array.isArray(parsed)) {
      toast.error("Test cases must be a JSON array: [{ input, output, is_hidden }]");
      return;
    }

    setSavingTc(true);
    const t = toast.loading("Saving test cases...");
    try {
      await axios.patch("/api/admin/questions", {
        slug: tcSlug.trim(),
        test_cases: parsed,
      });
      toast.success(`Saved ${parsed.length} test cases! ✅`, { id: t });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save test cases", { id: t });
    } finally {
      setSavingTc(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (file.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            setTcJson(JSON.stringify(parsed, null, 2));
            toast.success(`Loaded ${parsed.length} test cases from ${file.name}`);
          } else if (parsed.test_cases && Array.isArray(parsed.test_cases)) {
            setTcJson(JSON.stringify(parsed.test_cases, null, 2));
            toast.success(`Loaded ${parsed.test_cases.length} test cases from ${file.name}`);
          } else {
            toast.error("JSON file must contain an array of test cases");
          }
        } catch (err: any) {
          toast.error("Invalid JSON file: " + err.message);
        }
      } else {
        setGenInputs(content);
        toast.success(`Loaded input list from ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerateOutputs = async () => {
    if (!genRefCode.trim()) {
      toast.error("Please enter a reference solution");
      return;
    }
    if (!genInputs.trim()) {
      toast.error("Please enter candidate input test cases");
      return;
    }

    setGenerating(true);
    const t = toast.loading("Executing reference solution in Docker sandbox...");

    try {
      const res = await axios.post("/api/admin/testcases/generate", {
        language: genLanguage,
        referenceCode: genRefCode,
        rawInputText: genInputs,
        sampleCount: Number(genSampleCount),
      });

      if (res.data.success && Array.isArray(res.data.test_cases)) {
        setTcJson(JSON.stringify(res.data.test_cases, null, 2));
        toast.success(`⚡ Generated outputs for ${res.data.count} test cases!`, { id: t });
      } else {
        toast.error(res.data.message || "Failed to generate outputs", { id: t });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Generation error";
      toast.error(msg, { id: t });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto pt-32 pb-10 px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">✏️ Admin Question Uploader & Tools</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Upload coding questions, bulk upload 50+ test cases, and auto-generate outputs via Docker reference execution.
          </p>
        </div>

        {/* Target Data Structure */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Target Data Structure
          </label>
          {loadingDS ? (
            <div className="text-sm text-gray-400">Loading Data Structures...</div>
          ) : (
            <select
              value={dataStructureSlug}
              onChange={(e) => setDataStructureSlug(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {dataStructures.map((ds) => (
                <option key={ds.slug} value={ds.slug}>
                  {ds.name} (/{ds.slug})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Question JSON Payload */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Question JSON Payload</h2>
            <button
              onClick={loadSample}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-all cursor-pointer"
            >
              📋 Load Dynamic Sample JSON
            </button>
          </div>

          <textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            placeholder="Paste your question JSON payload here..."
            spellCheck={false}
            className="w-full h-96 font-mono text-xs p-4 bg-gray-900 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleUploadQuestion}
              disabled={uploading}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {uploading ? "Saving..." : "🚀 Upload Question"}
            </button>
          </div>
        </div>

        {/* ⚡ Automated Testcase Generator Tool */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">⚡ Automated Testcase Generator Tool</h2>
            <p className="text-xs text-gray-500 mt-1">
              Supply candidate inputs (or upload a file) + a Reference Solution in JS, Python, C++, Java, or C. The backend will execute your reference solution in Docker and generate all expected outputs!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reference Language</label>
              <select
                value={genLanguage}
                onChange={(e) => setGenLanguage(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (g++)</option>
                <option value="java">Java (jdk-17)</option>
                <option value="c">C (gcc)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sample (Public) Testcase Count</label>
              <input
                type="number"
                value={genSampleCount}
                onChange={(e) => setGenSampleCount(Number(e.target.value))}
                min={0}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference Solution Code</label>
            <textarea
              value={genRefCode}
              onChange={(e) => setGenRefCode(e.target.value)}
              placeholder="Paste reference solution code..."
              spellCheck={false}
              className="w-full h-40 font-mono text-xs p-3 bg-gray-900 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-600">Candidate Inputs (One per line or JSON array)</label>
              <label className="cursor-pointer text-xs font-semibold text-teal-600 hover:underline">
                📁 Upload Input File (.txt / .json)
                <input type="file" accept=".txt,.json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <textarea
              value={genInputs}
              onChange={(e) => setGenInputs(e.target.value)}
              placeholder="[2,7,11,15], 9&#10;[3,2,4], 6&#10;[3,3], 6"
              spellCheck={false}
              className="w-full h-32 font-mono text-xs p-3 bg-gray-900 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateOutputs}
              disabled={generating}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {generating ? "Executing Reference Solution..." : "⚡ Generate Testcase Outputs"}
            </button>
          </div>
        </div>

        {/* 🧪 Set / Bulk Upload Test Cases (JSON Payload) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">🧪 Set / Bulk Upload Test Cases (50+ Test Cases)</h2>
              <p className="text-xs text-gray-500 mt-1">
                Upload `.json` file containing 50+ test cases or edit the JSON array directly. For multiple valid outputs, use <code>||</code> (e.g. <code>"[0,1]||[1,0]"</code>).
              </p>
            </div>
            <label className="cursor-pointer text-xs font-semibold text-teal-600 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-all">
              📂 Bulk Upload (.json)
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Question Slug Target</label>
            <input
              value={tcSlug}
              onChange={(e) => setTcSlug(e.target.value)}
              placeholder="e.g. two-sum"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Test Cases (JSON Array)</label>
            <textarea
              value={tcJson}
              onChange={(e) => setTcJson(e.target.value)}
              placeholder={`[\n  {\n    "input": "[2,7,11,15], 9",\n    "output": "[0,1]",\n    "is_hidden": false\n  }\n]`}
              spellCheck={false}
              className="w-full h-64 font-mono text-xs p-4 bg-gray-900 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveTestCases}
              disabled={savingTc}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {savingTc ? "Saving..." : "💾 Save Test Cases"}
            </button>
          </div>
        </div>

        {/* 🧠 Reference Solution Quick-Editor */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">🧠 Set Reference Editorial Solution</h2>
            <p className="text-xs text-gray-400 mt-1">
              Paste the reference solution for a question. Shown in Editorial tab and used for verification.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference Solution</label>
            <textarea
              value={refSolution}
              onChange={(e) => setRefSolution(e.target.value)}
              placeholder={`function twoSum(nums, target) {\n  // your solution here\n}`}
              spellCheck={false}
              className="w-full h-52 font-mono text-xs p-4 bg-gray-900 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSolution}
              disabled={savingRef}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {savingRef ? "Saving..." : "💾 Save Reference Solution"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
