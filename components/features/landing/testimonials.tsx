"use client"

import React from "react"
import Marquee from "react-fast-marquee"
import { motion } from "framer-motion"

const testimonials = [
  {
    quote: "ResourceHub cut our equipment procurement time by 60%. The automated approval workflow is a game-changer.",
    author: "Rachel Kim",
    role: "VP Operations",
    company: "NovaTech",
  },
  {
    quote: "Finally, a platform that makes inventory management feel effortless. Our IT team loves the real-time tracking.",
    author: "Daniel Okafor",
    role: "CTO",
    company: "Meridian Labs",
  },
  {
    quote: "We went from Excel spreadsheets to a fully automated system in one week. The ROI was immediate.",
    author: "Priya Sharma",
    role: "Head of Procurement",
    company: "Atlas Industries",
  },
  {
    quote: "The role-based access control gives us peace of mind. Every request is tracked and auditable.",
    author: "Michael Torres",
    role: "Compliance Director",
    company: "Vantage Corp",
  },
  {
    quote: "Our workspace resource requests used to take 3 days. Now they take 3 minutes.",
    author: "Sofia Andersen",
    role: "Office Manager",
    company: "Bright Horizon",
  },
  {
    quote: "The analytics dashboard gives leadership exactly the visibility they need into resource allocation.",
    author: "James Liu",
    role: "CFO",
    company: "Cascade Systems",
  },
  {
    quote: "We manage 12 offices globally with ResourceHub. The multi-location inventory tracking is flawless.",
    author: "Emma Bakker",
    role: "Global Ops Lead",
    company: "Orbit Group",
  },
  {
    quote: "Integration was seamless. The API and SSO support meant we were up and running in hours.",
    author: "Ahmed Hassan",
    role: "Engineering Manager",
    company: "Pulse AI",
  },
]

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="mx-3 w-[320px] sm:w-[380px] shrink-0 rounded-2xl border border-white/5 bg-[#0A0A0A] p-6 transition-all hover:border-blue-500/20">
      <p className="text-sm text-zinc-300 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold">
          {t.author.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{t.author}</p>
          <p className="text-xs text-zinc-500">{t.role}, {t.company}</p>
        </div>
      </div>
    </div>
  )
}

export function Testimonials() {
  const firstHalf = testimonials.slice(0, 4)
  const secondHalf = testimonials.slice(4)

  return (
    <section className="py-20 sm:py-28 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14 px-4"
      >
        <span className="text-[10px] text-blue-400 uppercase font-bold tracking-[0.2em] mb-3 block">
          Testimonials
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Trusted by operations teams everywhere
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto">
          See what industry leaders are saying about ResourceHub.
        </p>
      </motion.div>

      <div className="space-y-4">
        <Marquee speed={30} gradient={false} pauseOnHover>
          {firstHalf.map((t) => (
            <TestimonialCard key={t.author} t={t} />
          ))}
        </Marquee>
        <Marquee speed={25} gradient={false} pauseOnHover direction="right">
          {secondHalf.map((t) => (
            <TestimonialCard key={t.author} t={t} />
          ))}
        </Marquee>
      </div>
    </section>
  )
}
