import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Lock,
  Eye,
  RefreshCw,
  CheckCircle2,
  X,
} from "lucide-react";

interface TermsOverlayProps {
  onClose: () => void;
}

const SECTIONS = [
  {
    id: "usage",
    icon: FileText,
    title: "Acceptable Use",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    content:
      "You agree to use this platform only for lawful purposes. Misuse, unauthorized access, reverse engineering, or harmful activity is strictly prohibited.",
  },
  {
    id: "privacy",
    icon: Lock,
    title: "Privacy & Data",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    content:
      "Your data is securely encrypted and protected. We never sell personal information to third parties.",
  },
  {
    id: "visibility",
    icon: Eye,
    title: "Transparency",
    bg: "bg-fuchsia-50",
    iconColor: "text-fuchsia-600",
    content:
      "We believe in transparent communication regarding how our systems and services operate.",
  },
  {
    id: "updates",
    icon: RefreshCw,
    title: "Policy Updates",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    content:
      "Terms may be updated periodically. Continued usage after updates indicates agreement to revised terms.",
  },
];

const TermsOverlay: React.FC<TermsOverlayProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{
        background: "rgba(88, 28, 135, 0.18)",
        backdropFilter: "blur(10px)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-3xl lg:rounded-[32px] shadow-2xl flex flex-col lg:flex-row"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-50 p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-purple-600 transition"
        >
          <X size={18} />
        </button>

        {/* LEFT SECTION */}
        <div className="w-full lg:w-[55%] px-5 sm:px-10 py-6 sm:py-8 overflow-y-auto custom-scrollbar">
          {/* Back */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-purple-600 font-semibold text-sm mb-5 sm:mb-8"
          >
            <div className="p-2 rounded-lg bg-purple-100">
              <ArrowLeft size={14} />
            </div>
            Back
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-xs font-bold tracking-wide border border-purple-200 mb-4 sm:mb-6">
            <ShieldCheck size={14} />
            SECURE & TRUSTED
          </div>

          {/* Heading */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-5xl font-black leading-tight text-gray-900">
              Terms &
              <span className="block text-purple-600">Conditions</span>
            </h1>
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-6 sm:mb-8">
            Please review our terms carefully before continuing to use the
            platform.
          </p>

          {/* Sections */}
          <div className="space-y-3 sm:space-y-4">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isOpen = activeSection === section.id;

              return (
                <motion.div
                  key={section.id}
                  layout
                  className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() =>
                      setActiveSection(isOpen ? null : section.id)
                    }
                    className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left"
                  >
                    <div
                      className={`p-2.5 sm:p-3 rounded-xl ${section.bg} ${section.iconColor}`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {section.title}
                      </h3>

                      {!isOpen && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {section.content}
                        </p>
                      )}
                    </div>

                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      className="text-gray-400"
                    >
                      ▼
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100">
                          {section.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="hidden lg:flex relative w-[45%] items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(145deg, #7c3aed 0%, #9333ea 45%, #a855f7 100%)",
            }}
          />

          {/* Soft Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-white/10 blur-3xl" />

          {/* Main Card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-60 h-60 rounded-[32px] flex flex-col items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <ShieldCheck size={34} className="text-white" />
            </div>

            <h2 className="text-white font-bold text-xl">
              Protected Access
            </h2>

            <p className="text-white/70 text-sm mt-2 text-center px-6">
              Your account and information are protected with secure encryption.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-xs font-semibold">
                Security Active
              </span>
            </div>
          </motion.div>

          {/* Floating Card */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 right-10 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-green-300" />
              <span className="text-white text-xs font-semibold">
                Compliance Ready
              </span>
            </div>

            <div className="flex gap-2">
              {["GDPR", "SOC2", "ISO"].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-white/20 text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TermsOverlay;

