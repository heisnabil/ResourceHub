"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "How does ResourceHub handle inventory tracking?",
    a: "ResourceHub provides real-time tracking across all your locations. Items are automatically categorized, and you receive instant alerts when stock drops below configured thresholds. Every change is logged for complete auditability.",
  },
  {
    q: "Can I customize approval workflows?",
    a: "Absolutely. You can create multi-level approval chains based on request value, category, or department. Managers receive instant notifications and can approve requests from any device.",
  },
  {
    q: "Is my data secure?",
    a: "Security is our top priority. ResourceHub uses end-to-end encryption, role-based access control, and maintains SOC 2 Type II compliance. All data is hosted on enterprise-grade infrastructure with 99.9% uptime.",
  },
  {
    q: "How does pricing work for larger teams?",
    a: "Our Business plan supports unlimited users and inventory items at $79/month. For enterprise deployments with custom SLAs, dedicated support, and on-premise options, contact our sales team for a tailored quote.",
  },
  {
    q: "Can I integrate ResourceHub with our existing tools?",
    a: "Yes. ResourceHub offers REST APIs and native integrations with popular tools including Slack, Microsoft Teams, Jira, and major ERP systems. Our webhook support enables custom integrations.",
  },
  {
    q: "What kind of support do you offer?",
    a: "Starter plans include email support with 24-hour response times. Business plans get priority support with 4-hour response times. Enterprise customers receive dedicated account managers and 24/7 phone support.",
  },
]

export function FAQs() {
  return (
    <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-[10px] text-blue-400 uppercase font-bold tracking-[0.2em] mb-3 block">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Frequently asked questions
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Everything you need to know about ResourceHub.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border border-white/5 bg-[#0A0A0A] rounded-xl px-5 data-[state=open]:border-blue-500/20"
              >
                <AccordionTrigger className="text-sm font-medium text-white hover:text-blue-400 py-4 [&>svg]:text-zinc-500">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-zinc-400 leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
