"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Clock,
  CheckCircle2,
  Circle,
  BookOpen,
  ArrowRight,
  Filter,
} from "lucide-react";

interface Problem {
  id: number;
  _id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  acceptance_rate: string;
  time: string;
  xp: number;
  order: number;
}

interface PracticeClientProps {
  ds_param: string;
  ds_name: string;
  problems: Problem[];
  solvedSlugs: string[];
}

export default function PracticeClient({
  ds_param,
  ds_name,
  problems = [],
  solvedSlugs = [],
}: PracticeClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Load bookmarks from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`bookmarks_${ds_param}`);
      if (saved) {
        try {
          setBookmarks(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse bookmarks", e);
        }
      }
    }
  }, [ds_param]);

  const toggleBookmark = (slug: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      if (typeof window !== "undefined") {
        localStorage.setItem(`bookmarks_${ds_param}`, JSON.stringify(next));
      }
      return next;
    });
  };

  // Get dynamic category pills from questions
  const categories = ["All", ...Array.from(new Set(problems.map((p) => p.category)))];

  // Filtering logic
  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || problem.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Calculate dynamic stats
  const total = problems.length;
  const solved = problems.filter((p) => solvedSlugs.includes(p.slug)).length;
  const progressPct = total > 0 ? (solved / total) * 100 : 0;

  const easyList = problems.filter((p) => p.difficulty === "Easy");
  const easySolvedCount = easyList.filter((p) => solvedSlugs.includes(p.slug)).length;
  const easyPct = easyList.length > 0 ? (easySolvedCount / easyList.length) * 100 : 0;

  const mediumList = problems.filter((p) => p.difficulty === "Medium");
  const mediumSolvedCount = mediumList.filter((p) => solvedSlugs.includes(p.slug)).length;
  const mediumPct = mediumList.length > 0 ? (mediumSolvedCount / mediumList.length) * 100 : 0;

  const hardList = problems.filter((p) => p.difficulty === "Hard");
  const hardSolvedCount = hardList.filter((p) => solvedSlugs.includes(p.slug)).length;
  const hardPct = hardList.length > 0 ? (hardSolvedCount / hardList.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        
        {/* Simple Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8"
        >
          <div>
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Practice Arena</p>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {ds_name} Practice
            </h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm self-start sm:self-auto">
            <span className="text-sm text-slate-500 dark:text-slate-400">Solved</span>
            <span className="text-base font-black text-slate-800 dark:text-white">{solved}</span>
            <span className="text-slate-400">/</span>
            <span className="text-base font-semibold text-slate-500">{total}</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          {/* Main Progress Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Overall Progress</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black">{Math.round(progressPct)}%</span>
              <span className="text-sm text-slate-500">{solved} solved</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full"
              />
            </div>
          </div>

          {/* Easy Progress */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Easy Problems</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black">{easySolvedCount} <span className="text-sm font-normal text-slate-400">/ {easyList.length}</span></span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">{Math.round(easyPct)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${easyPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-green-500 h-full rounded-full"
              />
            </div>
          </div>

          {/* Medium Progress */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Medium Problems</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black">{mediumSolvedCount} <span className="text-sm font-normal text-slate-400">/ {mediumList.length}</span></span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">{Math.round(mediumPct)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mediumPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-amber-500 h-full rounded-full"
              />
            </div>
          </div>

          {/* Hard Progress */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">Hard Problems</p>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black">{hardSolvedCount} <span className="text-sm font-normal text-slate-400">/ {hardList.length}</span></span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">{Math.round(hardPct)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${hardPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-rose-500 h-full rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Filters and Search controls */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-sm backdrop-blur-sm"
        >
          {/* Top row: search input and difficulty dropdown */}
          <div className="flex flex-col md:flex-row gap-4 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search question by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                aria-label="Select Difficulty"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="min-w-[140px] px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition cursor-pointer font-medium"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Bottom row: category select pills */}
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
              Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? "bg-slate-900 dark:bg-teal-500 text-white dark:text-slate-950 shadow-md shadow-slate-900/10 dark:shadow-teal-500/10"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-transparent"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Problems List Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/10"
        >
          {/* Header row (Desktop only) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <div className="col-span-1">Status</div>
            <div className="col-span-5">Problem Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2 text-center">Difficulty</div>
            <div className="col-span-1 text-center">Acceptance</div>
            <div className="col-span-1 text-right">Bookmark</div>
          </div>

          {/* List items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <AnimatePresence mode="popLayout">
              {filteredProblems.map((problem) => {
                const isSolved = solvedSlugs.includes(problem.slug);
                const isBookmarked = bookmarks.includes(problem.slug);

                return (
                  <motion.div
                    key={problem.slug}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    {/* Status indicator */}
                    <div className="col-span-1 flex items-center justify-between md:justify-start">
                      <span className="md:hidden text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Status
                      </span>
                      {isSolved ? (
                        <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5.5 h-5.5 text-slate-300 dark:text-slate-700" />
                      )}
                    </div>

                    {/* Title */}
                    <div className="col-span-1 md:col-span-5 flex flex-col">
                      <Link
                        href={`/${ds_param}/practice/${problem.slug}`}
                        className="font-bold text-slate-800 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group flex items-center gap-1.5"
                      >
                        {problem.title}
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-teal-600 dark:text-teal-400" />
                      </Link>
                      <div className="flex items-center gap-3.5 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {problem.time}
                        </span>
                        <span>•</span>
                        <span>{problem.xp} XP</span>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-start">
                      <span className="md:hidden text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Category
                      </span>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        {problem.category}
                      </span>
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="md:hidden text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Difficulty
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          problem.difficulty === "Easy"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : problem.difficulty === "Medium"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>

                    {/* Acceptance */}
                    <div className="col-span-1 md:col-span-1 flex items-center justify-between md:justify-center">
                      <span className="md:hidden text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Acceptance
                      </span>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {problem.acceptance_rate}
                      </span>
                    </div>

                    {/* Bookmark action */}
                    <div className="col-span-1 md:col-span-1 flex items-center justify-between md:justify-end">
                      <span className="md:hidden text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Bookmark
                      </span>
                      <button
                        onClick={() => toggleBookmark(problem.slug)}
                        aria-label={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                        className={`p-2 rounded-xl transition ${
                          isBookmarked
                            ? "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25"
                            : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-5 h-5 fill-current" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty search results */}
          {filteredProblems.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center p-12 text-slate-400 bg-white dark:bg-slate-900">
              <BookOpen className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-lg font-bold">No practice questions found</p>
              <p className="text-sm mt-1 text-slate-400 max-w-xs leading-relaxed">
                We couldn&apos;t find questions matching &quot;{searchQuery}&quot; or chosen difficulty in this category.
              </p>
            </div>
          )}
        </motion.div>

      </main>
    </div>
  );
}
