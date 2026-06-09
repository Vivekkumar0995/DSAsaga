"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// ─── Template pre-filled with the "array" data ───────────────────────────────
const ARRAY_TEMPLATE = {
  slug: "array",
  name: "Arrays",
  learning_tracks: [
    {
      title: "Array Fundamentals",
      description: "Master the basics of array manipulation and common patterns",
      difficulty: "Beginner",
      lessons: [
        { title: "Introduction to Arrays", duration: "10 min" },
        { title: "Array Traversal Techniques", duration: "15 min" },
        { title: "In-place Modifications", duration: "12 min" },
        { title: "Prefix Sum Pattern", duration: "18 min" },
        { title: "Kadane's Algorithm", duration: "20 min" },
      ],
    },
    {
      title: "Two Pointer Technique",
      description: "Learn to solve problems efficiently with two pointers",
      difficulty: "Intermediate",
      lessons: [
        { title: "Two Pointer Basics", duration: "12 min" },
        { title: "Opposite Direction Pointers", duration: "15 min" },
        { title: "Same Direction Pointers", duration: "15 min" },
        { title: "Three Sum Pattern", duration: "20 min" },
      ],
    },
    {
      title: "Sliding Window",
      description: "Optimize subarray and substring problems",
      difficulty: "Intermediate",
      lessons: [
        { title: "Fixed Size Windows", duration: "15 min" },
        { title: "Variable Size Windows", duration: "18 min" },
        { title: "Window with HashMap", duration: "20 min" },
        { title: "Maximum/Minimum Windows", duration: "22 min" },
      ],
    },
    {
      title: "Binary Search",
      description: "Beyond basic binary search - advanced applications",
      difficulty: "Intermediate",
      lessons: [
        { title: "Binary Search Fundamentals", duration: "12 min" },
        { title: "Search Space Reduction", duration: "18 min" },
        { title: "Binary Search on Answer", duration: "20 min" },
        { title: "Rotated Array Problems", duration: "22 min" },
      ],
    },
  ],
  battle_modes: [
    { icon: "Zap", title: "Unranked Match", description: "Jump into a 5-minute battle instantly", time: "5 min", color: "from-yellow-500 to-orange-500" },
    { icon: "Trophy", title: "Ranked Battle", description: "Do it competitively", time: "15 min", color: "from-teal-500 to-green-500" },
    { icon: "Users", title: "Friend Challenge", description: "Challenge a friend with a custom room code", time: "custom", color: "from-purple-500 to-pink-500" },
  ],
  problems: [
    { id: 1, title: "Two Sum", difficulty: "Easy", category: "Array Fundamentals", acceptance_rate: 49, time: "~10 min" },
    { id: 2, title: "Remove Duplicates from Sorted Array", difficulty: "Easy", category: "Two Pointers", acceptance_rate: 52, time: "~8 min" },
    { id: 3, title: "Maximum Subarray", difficulty: "Medium", category: "Kadane's Algorithm", acceptance_rate: 50, time: "~15 min" },
    { id: 4, title: "Container With Most Water", difficulty: "Medium", category: "Two Pointers", acceptance_rate: 54, time: "~15 min" },
    { id: 5, title: "3Sum", difficulty: "Medium", category: "Two Pointers", acceptance_rate: 32, time: "~20 min" },
    { id: 6, title: "Subarray Sum Equals K", difficulty: "Medium", category: "Prefix Sum", acceptance_rate: 44, time: "~20 min" },
    { id: 7, title: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", acceptance_rate: 38, time: "~20 min" },
    { id: 8, title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", acceptance_rate: 48, time: "~15 min" },
    { id: 9, title: "Maximum Average Subarray I", difficulty: "Easy", category: "Sliding Window", acceptance_rate: 43, time: "~10 min" },
    { id: 10, title: "Longest Repeating Character Replacement", difficulty: "Medium", category: "Sliding Window", acceptance_rate: 51, time: "~20 min" },
    { id: 11, title: "Trapping Rain Water", difficulty: "Hard", category: "Two Pointers", acceptance_rate: 58, time: "~25 min" },
    { id: 12, title: "Median of Two Sorted Arrays", difficulty: "Hard", category: "Binary Search", acceptance_rate: 35, time: "~30 min" },
  ],
  testimonials: [
    { name: "Sarah Chen", role: "Software Engineer @ Google", content: "Array section helped me ace my coding interviews!", avatar: "S" },
    { name: "Marcus Johnson", role: "CS Student", content: "Way more fun than grinding LeetCode alone.", avatar: "M" },
    { name: "Priya Patel", role: "Full Stack Developer", content: "The learning tracks are incredibly well-structured.", avatar: "P" },
  ],
  live_activity: [
    { user_name: "CodeNinja42", action: "won a ranked battle", time: "2m ago" },
    { user_name: "AlgoQueen", action: "completed Binary Search track", time: "5m ago" },
    { user_name: "ByteMaster", action: "reached Diamond rank", time: "8m ago" },
    { user_name: "DevWarrior", action: "solved 50 problems", time: "12m ago" },
  ],
};

type SectionKey = "learning_tracks" | "battle_modes" | "problems" | "testimonials" | "live_activity";

const SECTIONS: { key: SectionKey; label: string; description: string }[] = [
  { key: "learning_tracks", label: "Learning Tracks", description: "Array of track objects with title, description, difficulty, and lessons[]" },
  { key: "battle_modes", label: "Battle Modes", description: "Array of battle mode objects with icon, title, description, time, color" },
  { key: "problems", label: "Problems", description: "Array of problem objects with id, title, difficulty, category, acceptance_rate, time" },
  { key: "testimonials", label: "Testimonials", description: "Array of testimonial objects with name, role, content, avatar" },
  { key: "live_activity", label: "Live Activity", description: "Array of activity objects with user_name, action, time" },
];

export default function AdminDataStructurePage() {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [sections, setSections] = useState<Record<SectionKey, string>>({
    learning_tracks: "",
    battle_modes: "",
    problems: "",
    testimonials: "",
    live_activity: "",
  });
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<{ slug: string; name: string }[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);

  useEffect(() => { //
    axios.get("/api/data-structure")
      .then(res => setExisting(res.data.data || []))
      .catch(() => { })
      .finally(() => setLoadingExisting(false));
  }, []);

  const loadTemplate = () => {
    setSlug(ARRAY_TEMPLATE.slug);
    setName(ARRAY_TEMPLATE.name);
    setSections({
      learning_tracks: JSON.stringify(ARRAY_TEMPLATE.learning_tracks, null, 2),
      battle_modes: JSON.stringify(ARRAY_TEMPLATE.battle_modes, null, 2),
      problems: JSON.stringify(ARRAY_TEMPLATE.problems, null, 2),
      testimonials: JSON.stringify(ARRAY_TEMPLATE.testimonials, null, 2),
      live_activity: JSON.stringify(ARRAY_TEMPLATE.live_activity, null, 2),
    });
    setJsonErrors({});
    toast.success("Array template loaded!");
  };

  const loadFromDB = async (s: string) => {
    const loadingToast = toast.loading(`Loading ${s}...`);
    try {
      const res = await axios.get(`/api/data-structure/${s}`);
      const doc = res.data.data;
      setSlug(doc.slug);
      setName(doc.name);
      setSections({
        learning_tracks: JSON.stringify(doc.learning_tracks, null, 2),
        battle_modes: JSON.stringify(doc.battle_modes, null, 2),
        problems: JSON.stringify(doc.problems, null, 2),
        testimonials: JSON.stringify(doc.testimonials, null, 2),
        live_activity: JSON.stringify(doc.live_activity, null, 2),
      });
      setJsonErrors({});
      toast.success(`"${doc.name}" loaded from DB`, { id: loadingToast });
    } catch {
      toast.error("Failed to load from DB", { id: loadingToast });
    }
  };

  const handleSectionChange = (key: SectionKey, value: string) => {
    setSections(prev => ({ ...prev, [key]: value }));
    try {
      JSON.parse(value);
      setJsonErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
    } catch {
      setJsonErrors(prev => ({ ...prev, [key]: "Invalid JSON" }));
    }
  };

  const handleSave = async () => {
    if (!slug.trim() || !name.trim()) {
      toast.error("Slug and Name are required");
      return;
    }

    const payload: Record<string, unknown> = { slug, name };
    let hasError = false;
    for (const section of SECTIONS) {
      const val = sections[section.key].trim();
      if (!val) {
        payload[section.key] = [];
        continue;
      }
      try {
        payload[section.key] = JSON.parse(val);
      } catch {
        setJsonErrors(prev => ({ ...prev, [section.key]: "Invalid JSON — fix before saving" }));
        hasError = true;
      }
    }

    if (hasError) {
      toast.error("Fix JSON errors before saving");
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading("Saving to MongoDB...");
    try {
      await axios.post("/api/data-structure", payload);
      toast.success(`"${slug}" saved to DB! ✅`, { id: loadingToast });

      const res = await axios.get("/api/data-structure");
      setExisting(res.data.data || []);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to save";
      toast.error(message, { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto pt-32 pb-10 px-4 sm:px-6 lg:px-8">


        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🗄️ Data Structure Admin
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Add or update data structure content stored in MongoDB. Each data structure needs a unique <code className="bg-gray-100 px-1 rounded">slug</code> (e.g. <code className="bg-gray-100 px-1 rounded">array</code>, <code className="bg-gray-100 px-1 rounded">string</code>).
          </p>
        </div>


        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">📋 Existing in Database</h2>
          {loadingExisting ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : existing.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No data structures in DB yet. Use the template below to add the first one.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {existing.map(e => (
                <button
                  key={e.slug}
                  onClick={() => loadFromDB(e.slug)}
                  className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm hover:bg-teal-100 transition-colors font-medium"
                >
                  {e.name} <span className="text-teal-400 font-normal">/{e.slug}</span>
                </button>
              ))}
            </div>
          )}
        </div>


        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">Content Editor</h2>
            <button
              onClick={loadTemplate}
              className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              📦 Load Array Template
            </button>
          </div>

          <div className="p-6 space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Slug <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="e.g. array, string, linked-list"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                />
                <p className="text-xs text-gray-400 mt-1">Must match the URL — e.g. <code>/array</code> needs slug <code>array</code></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Arrays, Strings, Linked Lists"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                />
              </div>
            </div>

            {SECTIONS.map(section => (
              <div key={section.key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {section.label}
                </label>
                <p className="text-xs text-gray-400 mb-2">{section.description}</p>
                <textarea
                  value={sections[section.key]}
                  onChange={e => handleSectionChange(section.key, e.target.value)}
                  rows={8}
                  spellCheck={false}
                  placeholder={`[\n  { ... }\n]`}
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-mono focus:outline-none focus:ring-2 resize-y bg-gray-50 ${jsonErrors[section.key]
                    ? "border-red-300 focus:ring-red-300"
                    : "border-gray-200 focus:ring-teal-400"
                    }`}
                />
                {jsonErrors[section.key] && (
                  <p className="text-xs text-red-500 mt-1">⚠️ {jsonErrors[section.key]}</p>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving || Object.keys(jsonErrors).length > 0}
                className="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "💾 Save to MongoDB"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
