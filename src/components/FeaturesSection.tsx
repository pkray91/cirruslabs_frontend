'use client';

import { motion } from "framer-motion"
import { Shield, Brain, LayoutDashboard, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Policy Compliance Monitoring",
    description: "Real-time monitoring and alerts for policy violations. Ensure your organization stays compliant with automated oversight.",
  },
  {
    icon: Brain,
    title: "AI Knowledge Assistant",
    description: "Instant answers to policy questions using advanced AI. Get accurate guidance on compliance matters in seconds.",
  },
  {
    icon: LayoutDashboard,
    title: "Employee Dashboard",
    description: "Personalized dashboard for employees to track their compliance status and access relevant policies easily.",
  },
  {
    icon: BarChart3,
    title: "Admin Insights",
    description: "Comprehensive analytics and reporting for administrators. Make data-driven decisions with powerful insights.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-white border-t border-[#e2e8f0]">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-[#e2e8f0] bg-[#f8fafc] text-[#2563eb] text-[10px] font-black mb-6 tracking-[0.4em] uppercase">
            FEATURES
          </span>
          <h2 className="orbitron text-4xl font-black text-[#172554] mb-6 tracking-tight uppercase">
            Powerful AI-driven compliance
          </h2>
          <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Everything you need to maintain compliance and empower your workforce with intelligent policy assistance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group p-6 md:p-8 rounded-3xl border border-[#e2e8f0] bg-[#f8fafc] card-glow-hover cursor-pointer"
            >
              <div className="inline-flex p-3 md:p-4 rounded-2xl bg-[#2563eb] mb-6 md:mb-8 shadow-lg shadow-blue-500/20 text-white transition-transform duration-500 group-hover:scale-110">
                <feature.icon size={24} />
              </div>
              
              <h3 className="orbitron text-base md:text-lg font-black text-[#172554] mb-4 tracking-wide uppercase">
                {feature.title}
              </h3>
              
              <p className="text-[#475569] leading-relaxed text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
