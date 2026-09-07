import React, { useState } from 'react';
import { X, Info, Shield, HelpCircle, FileText, Keyboard } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'privacy' | 'terms'>('faq');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--sub-alt)] rounded-3xl p-6 sm:p-8 shadow-2xl text-[var(--text-color)] max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--sub-color)] hover:text-[var(--text-color)] hover:bg-[var(--sub-alt)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--main-color)] text-white flex items-center justify-center font-bold text-lg">
            Y
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Yolnoma Typing Platform</h2>
            <p className="text-xs text-[var(--sub-color)]">Multi-Language Touch Typing Ecosystem</p>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex gap-2 border-b border-[var(--sub-alt)] mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-2.5 px-1 flex items-center gap-1.5 transition-colors ${
              activeTab === 'faq'
                ? 'border-b-2 border-[var(--main-color)] text-[var(--main-color)] font-bold'
                : 'text-[var(--sub-color)]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQ & Guides</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-1 flex items-center gap-1.5 transition-colors ${
              activeTab === 'privacy'
                ? 'border-b-2 border-[var(--main-color)] text-[var(--main-color)] font-bold'
                : 'text-[var(--sub-color)]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-1 flex items-center gap-1.5 transition-colors ${
              activeTab === 'terms'
                ? 'border-b-2 border-[var(--main-color)] text-[var(--main-color)] font-bold'
                : 'text-[var(--sub-color)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'faq' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[var(--sub-alt)] space-y-1">
              <h4 className="font-bold text-sm text-[var(--text-color)]">How is WPM calculated?</h4>
              <p className="text-[var(--sub-color)] leading-relaxed">
                Words Per Minute (WPM) is calculated by dividing total correct characters typed by 5, then dividing by elapsed test time in minutes: <code className="font-mono bg-black/20 px-1 py-0.5 rounded text-[var(--main-color)]">((Correct Chars / 5) / TimeInMinutes)</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--sub-alt)] space-y-1">
              <h4 className="font-bold text-sm text-[var(--text-color)]">Does Yolnoma Typing support RTL languages?</h4>
              <p className="text-[var(--sub-color)] leading-relaxed">
                Yes! Arabic, Persian, Hebrew, and Urdu scripts are rendered with full RTL (Right-To-Left) direction, aligned cursors, and accurate character metrics.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--sub-alt)] space-y-1">
              <h4 className="font-bold text-sm text-[var(--text-color)]">What keyboard shortcuts can I use?</h4>
              <p className="text-[var(--sub-color)] leading-relaxed">
                Press <span className="font-bold text-[var(--text-color)]">Tab + Enter</span> to quickly restart any test. Press <span className="font-bold text-[var(--text-color)]">Esc</span> to defocus the typing area.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-3 text-xs text-[var(--sub-color)] leading-relaxed">
            <p>
              Your privacy is paramount. Yolnoma Typing stores user accounts and test results securely in Firebase Firestore under strict access rules.
            </p>
            <p>
              We do not collect or sell personal identification information. All passwords are encrypted by Firebase Authentication using industry-standard protocols.
            </p>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-3 text-xs text-[var(--sub-color)] leading-relaxed">
            <p>
              By using Yolnoma Typing, you agree to engage in fair typing tests without automating or injecting client-side cheat scripts.
            </p>
            <p>
              Leaderboard records created through dishonest means or automated macros are subject to automated removal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
