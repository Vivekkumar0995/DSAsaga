"use client"; // Still a client component, but now it renders static math HTML on the client

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm'; // Import GFM for tables
import 'katex/dist/katex.min.css'; // Required for styling

function decodeMarkdown(content: string) {
    try {
        const parsed = JSON.parse(content);
        return typeof parsed === 'string' ? parsed : content;
    } catch {
        return content;
    }
}

export default function MarkdownKatex({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
    >
      {decodeMarkdown(content)}
    </ReactMarkdown>
  );
}