import React from 'react';
import { Code, Terminal, FileCode, Cpu } from 'lucide-react';
import { CodeLanguage } from '../../data/codeSnippets';

interface CodeLanguageSelectorProps {
  currentLanguage: CodeLanguage;
  onSelectLanguage: (lang: CodeLanguage) => void;
}

export const CodeLanguageSelector: React.FC<CodeLanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage
}) => {
  const options: { id: CodeLanguage; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    {
      id: 'javascript',
      label: 'JavaScript / TS',
      icon: FileCode,
      color: '#f7df1e'
    },
    {
      id: 'python',
      label: 'Python',
      icon: Terminal,
      color: '#38bdf8'
    },
    {
      id: 'html_css',
      label: 'HTML / CSS',
      icon: Code,
      color: '#fb7185'
    },
    {
      id: 'cpp_go',
      label: 'C++ / Go',
      icon: Cpu,
      color: '#34d399'
    }
  ];

  return (
    <div className="w-full max-w-xl mx-auto mb-3 px-2">
      <div className="flex items-center justify-center gap-1.5 p-1 bg-[var(--card-bg)]/90 border border-[var(--sub-alt)] rounded-xl font-mono text-xs shadow-xs overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-[var(--sub-color)] px-2 font-bold flex items-center gap-1">
          <Code className="w-3.5 h-3.5 text-[var(--main-color)]" />
          <span>Stack:</span>
        </span>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = currentLanguage === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectLanguage(opt.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs font-semibold cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--main-color)]/15 text-[var(--main-color)] border border-[var(--main-color)]/30 font-bold shadow-xs'
                  : 'text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)]/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
