"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AshokaChakra } from "@/components/ashoka-chakra";
import { motion } from "framer-motion";
import {
  INDEPENDENCE_DAY_ACTIVE,
  INDEPENDENCE_DAY_DISCOUNT,
  INDEPENDENCE_DAY_PROMO_CODE,
} from "@/lib/celebration";

export function IndependenceDaySection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!INDEPENDENCE_DAY_ACTIVE || !mounted) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 pt-10" aria-labelledby="indy-heading">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(255,153,51,0.08) 0%, rgba(255,255,255,0.03) 40%, rgba(19,136,8,0.08) 100%)',
          border: '2px solid #ffffff',
          boxShadow: '0 20px 40px -20px rgba(255,153,51,0.2), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 0 1px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.15)'
        }}
      >
        {/* Decorative corner accents — stronger, wider */}
        <div
          aria-hidden
          className="absolute top-0 left-0 h-40 w-40 rounded-t-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,153,51,0.35) 0%, transparent 70%)',
            clipPath: 'polygon(0 0, 100% 0, 0 100%)'
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-0 h-40 w-40 rounded-b-2xl"
          style={{
            background: 'linear-gradient(-45deg, rgba(19,136,8,0.35) 0%, transparent 70%)',
            clipPath: 'polygon(100% 100%, 100% 0, 0 100%)'
          }}
        />

        <div className="relative flex flex-col items-center gap-8 p-8 sm:flex-row sm:items-start sm:text-left sm:p-12">
          {/* Chakra in premium frame */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex shrink-0"
          >
            <div
              className="relative flex h-28 w-28 items-center justify-center rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255,153,51,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(19,136,8,0.15) 100%)',
                border: '2px solid rgba(255,153,51,0.5)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 30px -10px rgba(255,153,51,0.2)'
              }}
            >
              {/* Rotating ring — strong */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{
                  border: '2px solid rgba(255,153,51,0.35)',
                  borderTopColor: 'rgba(255,153,51,0.7)',
                  borderRightColor: 'rgba(255,255,255,0.55)',
                  borderBottomColor: 'rgba(19,136,8,0.7)',
                  borderLeftColor: 'rgba(19,136,8,0.55)'
                }}
              />
              <AshokaChakra size={80} />
            </div>
            {/* Pulsing glow dots */}
            <div className="absolute -inset-2 flex items-center justify-between px-2 pointer-events-none">
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="h-2 w-2 rounded-full"
                style={{ background: 'linear-gradient(135deg, #FF9933, #138808)' }}
              />
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="h-2 w-2 rounded-full"
                style={{ background: 'linear-gradient(135deg, #138808, #FF9933)' }}
              />
            </div>
          </motion.div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, rgba(255,153,51,0.15), rgba(19,136,8,0.15))',
                color: '#FFB84D',
                border: '1px solid rgba(255,153,51,0.25)'
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#FF9933' }} aria-hidden />
              Independence Day Offer
            </motion.span>

            <motion.h2
              id="indy-heading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ color: 'rgb(var(--ink-rgb))' }}
            >
              {INDEPENDENCE_DAY_DISCOUNT.replace("up to", "Up to")} on Pro & Premium All-Access
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-3 text-base sm:text-lg max-w-xl"
              style={{ color: 'rgb(var(--muted-rgb))' }}
            >
              Use code{" "}
              <code className="rounded px-2 py-0.5 font-mono text-sm font-bold mx-1" style={{
                background: 'linear-gradient(135deg, rgba(255,153,51,0.2), rgba(19,136,8,0.2))',
                color: '#FFD66B',
                border: '1px solid rgba(255,153,51,0.3)'
              }}>
                {INDEPENDENCE_DAY_PROMO_CODE}
              </code>{" "}
              at checkout. Offer valid through August 28.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="shrink-0 w-full sm:w-auto"
          >
            <Link
              href="/pricing"
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #FF9933 0%, #FF9933 40%, #138808 100%)',
                boxShadow: '0 4px 20px -5px rgba(255,153,51,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <span className="relative z-10">Claim Offer</span>
              <motion.span
                initial={{ x: -4, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="relative z-10"
              >
                →
              </motion.span>
              {/* Shimmer overlay */}
              <div
                className="absolute inset-0 rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                  transform: 'translateX(-100%)'
                }}
              />
            </Link>
            <style jsx>{`
              a:hover div { animation: shimmer 0.6s ease-out forwards; }
              @keyframes shimmer { to { transform: translateX(100%); } }
            `}</style>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}