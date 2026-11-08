import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Eye,
  FileText,
  Search,
  Tag,
  User,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.tsx';
import { Card } from '../components/ui/Card.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { KnowledgeArticle } from '../types/index.ts';

interface KnowledgeBasePageProps {
  articles: KnowledgeArticle[];
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ articles }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);

  const categories = ['All', 'Security', 'Network', 'Backup & DR', 'M365', 'Standard Operating Procedures'];

  const filtered = articles.filter((a) => {
    if (selectedCategory !== 'All' && a.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !a.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.summary.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Operations Knowledge Base & SOPs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard operating procedures, runbooks, and remediation guides leveraged by AI agents during investigations.
          </p>
        </div>
      </div>

      {/* Search and Category Strip */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search runbooks by title, symptoms, or tags (e.g. Kerberos, SFP, Veeam, Snapshot)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((article) => (
          <div
            key={article.id}
            onClick={() => setActiveArticle(article)}
            className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <Badge variant="info">{article.category}</Badge>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {article.viewCount} views
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{article.title}</h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {article.summary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-1">
                {article.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {article.author}</span>
                <span className="text-blue-600 font-semibold">Read Runbook →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <Modal
          isOpen={Boolean(activeArticle)}
          onClose={() => setActiveArticle(null)}
          title={activeArticle.title}
          subtitle={`Category: ${activeArticle.category} • Author: ${activeArticle.author}`}
          maxWidth="2xl"
          footer={
            <button
              onClick={() => setActiveArticle(null)}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium"
            >
              Close Runbook
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Summary</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {activeArticle.summary}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Technical Resolution Steps</h4>
              <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                {activeArticle.resolutionSteps}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {activeArticle.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
