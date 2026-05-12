import React from 'react';

interface Props {
  text: string;
}

const renderInline = (line: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = boldRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={`b-${key++}`} className="text-white font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return parts;
};

const MarkdownRenderer: React.FC<Props> = ({ text }) => {
  if (!text) return null;

  const elements: React.ReactNode[] = [];
  const lines = text.split('\n');
  let listBuffer: React.ReactNode[] | null = null;
  let listType: 'ul' | 'ol' | null = null;
  let tableBuffer: string[] | null = null;
  let key = 0;

  const flushList = () => {
    if (listBuffer && listType) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`list-${key++}`} className="space-y-1.5 my-2">
            {listBuffer}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`list-${key++}`} className="space-y-1.5 my-2 list-decimal pl-5 marker:text-gold-400 marker:font-semibold">
            {listBuffer}
          </ol>
        );
      }
    }
    listBuffer = null;
    listType = null;
  };

  const flushTable = () => {
    if (!tableBuffer || tableBuffer.length < 2) {
      tableBuffer = null;
      return;
    }
    const rows = tableBuffer.map((r) =>
      r
        .split('|')
        .map((c) => c.trim())
        .filter((_, i, arr) => i !== 0 && i !== arr.length - 1)
    );
    const headerRow = rows[0];
    const bodyRows = rows.slice(2);
    elements.push(
      <div key={`tbl-${key++}`} className="my-3 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-600">
              {headerRow.map((h, i) => (
                <th key={i} className="text-left py-1.5 px-2 text-gold-400 font-semibold">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-700/50">
                {row.map((c, ci) => (
                  <td key={ci} className="py-1.5 px-2 text-gray-300">
                    {renderInline(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = null;
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');

    // Table detection
    if (line.startsWith('|')) {
      flushList();
      if (!tableBuffer) tableBuffer = [];
      tableBuffer.push(line);
      continue;
    } else if (tableBuffer) {
      flushTable();
    }

    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${key++}`} className="text-base font-semibold text-gold-400 mt-4 mb-2 tracking-tight">
          {renderInline(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={`h2-${key++}`} className="text-lg font-bold text-white mt-4 mb-2">
          {renderInline(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={`h1-${key++}`} className="text-xl font-bold text-gold-500 mt-4 mb-2">
          {renderInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    const ulMatch = line.match(/^[-*]\s+(.*)/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listBuffer = [];
        listType = 'ul';
      }
      listBuffer!.push(
        <li key={`li-${key++}`} className="text-sm leading-relaxed text-gray-300 pl-4 relative">
          <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-gold-500"></span>
          {renderInline(ulMatch[1])}
        </li>
      );
      continue;
    }

    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listBuffer = [];
        listType = 'ol';
      }
      listBuffer!.push(
        <li key={`li-${key++}`} className="text-sm leading-relaxed text-gray-300 pl-1">
          {renderInline(olMatch[2])}
        </li>
      );
      continue;
    }

    if (line.trim() === '') {
      flushList();
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${key++}`} className="text-sm leading-relaxed text-gray-300 my-1.5">
        {renderInline(line)}
      </p>
    );
  }
  flushList();
  flushTable();

  return <div>{elements}</div>;
};

export default MarkdownRenderer;
