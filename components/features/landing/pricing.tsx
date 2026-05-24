"use client"

import React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    description: "For small teams getting started with resource management",
    features: [
      "Up to 25 users",
      "500 inventory items",
      "Basic approval workflows",
      "Email support",
      "Standard analytics",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Business",
    price: "$79",
    period: "/mo",
    description: "For growing organizations with complex operations",
    features: [
      "Unlimited users",
      "Unlimited inventory",
      "Advanced multi-level approvals",
      "Priority support",
      "Custom analytics & exports",
      "API access",
      "SSO integration",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-[10px] text-blue-400 uppercase font-bold tracking-[0.2em] mb-3 block">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Choose the plan that fits your organization. Scale up as you grow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl border p-7 sm:p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "border-blue-500/30 bg-blue-500/[0.03] shadow-lg shadow-blue-500/5"
                  : "border-white/5 bg-[#0A0A0A]"
              } hover:border-blue-500/20`}
            >
              {/* Shine overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, transparent 40%, rgba(37,99,235,0.04) 50%, transparent 60%)",
                    animation: "mirrorShine 3s ease-in-out infinite",
                  }}
                />
              </div>

              {plan.highlighted && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                    Popular
                  </span>
                </div>
              )}

              <div className="relative space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-500 text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                      <Check className="size-4 text-blue-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="block">
                  <Button
                    className={`w-full h-11 rounded-xl font-bold text-sm ${
                      plan.highlighted
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    } transition-all hover:scale-[1.01] active:scale-[0.99]`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
