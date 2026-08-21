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
      output: "[0,1]",
      is_hidden: false
    },
    {
      input: "[3,2,4], 6",
      output: "[1,2]",
      is_hidden: false
    },
    {
      input: "[3,3], 6",
      output: "[0,1]",
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

  // Reference solution quick-editor
  const [refSlug, setRefSlug] = useState("two-sum");
  const [refSolution, setRefSolution] = useState("");
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
    toast.success("Loaded two-sum JSON sample!");
  };

  const handleUpload = async () => {
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
      toast.error("Invalid JSON: " + e.message);
      return;
    }

    if (!parsedPayload.title || !parsedPayload.slug || !parsedPayload.difficulty) {
      toast.error("JSON must include title, slug, and difficulty");
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading("Saving question to Database...");

    try {
      const res = await axios.post("/api/admin/questions", {
        dataStructureSlug,
        question: parsedPayload
      });
      toast.success("Question created/updated successfully! ✅", { id: loadingToast });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to upload question";
      toast.error(msg, { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSolution = async () => {
    if (!refSlug.trim()) { toast.error("Enter a question slug"); return; }
    if (!refSolution.trim()) { toast.error("Reference solution is empty"); return; }
    setSavingRef(true);
    const t = toast.loading("Saving reference solution...");
    try {
      const res = await axios.patch("/api/admin/questions", {
        slug: refSlug.trim(),
        reference_solution: refSolution.trim(),
      });
      toast.success("Reference solution saved! ✅", { id: t });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save", { id: t });
    } finally {
      setSavingRef(false);
    }
  };

  // Test cases quick-editor (JSON Payload)
  const [tcSlug, setTcSlug] = useState("two-sum");
  const [tcJson, setTcJson] = useState(
    JSON.stringify(
      [
        { input: "[2,7,11,15], 9", output: "[0,1]", is_hidden: false },
        { input: "[3,2,4], 6", output: "[1,2]", is_hidden: false },
        { input: "[3,3], 6", output: "[0,1]", is_hidden: true },
      ],
      null,
      2
    )
  );
  const [savingTc, setSavingTc] = useState(false);

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
      toast.error("Invalid JSON: " + e.message);
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
      toast.success("Test cases saved! ✅", { id: t });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save test cases", { id: t });
    } finally {
      setSavingTc(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto pt-32 pb-10 px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">✏️ Admin Question Uploader</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Quickly upload new dynamic coding questions, parameter schemas, and test cases directly to MongoDB.
          </p>
        </div>

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

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Question JSON Payload</h2>
            <button
              onClick={loadSample}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-all"
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
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Saving..." : "🚀 Upload Question"}
            </button>
          </div>
        </div>

        {/* ── Test Cases Quick-Editor (JSON Payload) ────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">🧪 Set / Update Test Cases (JSON Payload)</h2>
            <p className="text-xs text-gray-400 mt-1">
              Paste the JSON array of test cases for a question. Use <code>"is_hidden": true</code> for hidden test cases.
            </p>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Question Slug</label>
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
              className="w-full h-52 font-mono text-xs p-4 bg-gray-900 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveTestCases}
              disabled={savingTc}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingTc ? "Saving..." : "💾 Save Test Cases"}
            </button>
          </div>
        </div>

        {/* ── Reference Solution Quick-Editor ─────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700">🧠 Set Reference Solution (JavaScript)</h2>
            <p className="text-xs text-gray-400 mt-1">
              Paste the JavaScript reference solution for a question. This is used to auto-generate expected output for custom test cases and shown in the Editorial tab.
            </p>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Question Slug</label>
            <input
              value={refSlug}
              onChange={(e) => setRefSlug(e.target.value)}
              placeholder="e.g. two-sum"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference Solution (JS)</label>
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
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingRef ? "Saving..." : "💾 Save Reference Solution"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
