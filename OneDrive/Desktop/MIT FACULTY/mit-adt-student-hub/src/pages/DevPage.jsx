import { Github, Linkedin, Code, Shield, Smartphone, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DevPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-28 overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[40%] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-teal-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 px-6 pt-12">
        {/* Header Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-[14px] font-bold tracking-[0.2em] text-[var(--color-text-secondary)] uppercase mb-2">Designed & Built By</p>
          <h1 className="text-[44px] font-black tracking-tighter text-[var(--color-text)] leading-none">
            Anant<br/>Suthar
          </h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[32px] p-8 mb-8"
        >
          <p className="text-[17px] leading-relaxed text-[var(--color-text)] font-medium mb-6">
            I design and build mobile-first products with a strong focus on clean architecture, 
            polished UI systems, and practical features that solve real user problems.
          </p>
          
          <div className="space-y-4">
            <FeatureRow icon={Code} text="Full-Stack Engineering" />
            <FeatureRow icon={Shield} text="Cybersecurity Enthusiast" />
            <FeatureRow icon={Smartphone} text="Premium App Experiences" />
          </div>
        </motion.div>

        {/* Social Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4"
        >
          <SocialButton 
            href="https://github.com/anant720"
            icon={Github}
            label="Follow on GitHub"
            color="bg-[#24292F]"
            hoverColor="hover:bg-[#1b1f23]"
          />
          <SocialButton 
            href="https://www.linkedin.com/in/anantsuthar/"
            icon={Linkedin}
            label="Connect on LinkedIn"
            color="bg-[#0A66C2]"
            hoverColor="hover:bg-[#004182]"
          />
          <SocialButton 
            href="https://anant-portfolio-mauve.vercel.app/"
            icon={Globe}
            label="View Portfolio"
            color="bg-[#1C1C1E]"
            hoverColor="hover:bg-[#000000]"
          />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-4 bg-white/40 p-4 rounded-[20px] border border-white/60">
      <div className="w-10 h-10 rounded-full bg-[var(--color-bg)] flex items-center justify-center shadow-sm">
        <Icon size={18} className="text-[var(--color-primary)]" strokeWidth={2.5} />
      </div>
      <span className="text-[15px] font-bold text-[var(--color-text)]">{text}</span>
    </div>
  );
}

function SocialButton({ href, icon: Icon, label, color, hoverColor }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className={`group flex items-center justify-center gap-3 w-full h-16 rounded-[24px] ${color} ${hoverColor} text-white transition-all active:scale-[0.98] shadow-lg`}
    >
      <Icon size={24} strokeWidth={2.5} />
      <span className="text-[17px] font-bold tracking-wide">{label}</span>
    </a>
  );
}
