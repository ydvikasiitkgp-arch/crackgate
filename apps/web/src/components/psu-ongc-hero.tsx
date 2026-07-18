"use client";

import Link from "next/link";
import { ONGC_RECRUITMENT_URL } from "@/data/ongc";
import { ONGC_PATTERN } from "@/data/ongc-mocks";
import Image from "next/image";

export function PsuOngcHero() {
  return (
    <section className="relative overflow-hidden bg-[#003580] text-white">
      {/* Background image — oil rig */}
      <div className="absolute inset-0">
        <Image
          src="/images/ongc/oil-rig-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#003580] via-[#003580]/90 to-[#003580]/60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:py-24">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Left — text */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <Image
                src="/images/ongc/ongc-logo.png"
                alt="ONGC logo"
                width={56}
                height={56}
                className="rounded-lg"
                priority
              />
              <span className="badge border border-blue-300/30 bg-blue-300/10 text-blue-300">
                PSU Recruitment · Oil and Natural Gas Corporation
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] lg:text-6xl">
              ONGC
              <span className="block text-blue-300">Computer Based Test</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              Discipline-specific mock series targeting the official ONGC CBT pattern.
              85 MCQs · 2 hours · no negative marking — the real exam experience.
            </p>

            {/* Stats strip */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Stat value={`${ONGC_PATTERN.questions}`} label="MCQs per paper" />
              <Stat value={`${ONGC_PATTERN.durationMin / 60} hrs`} label="Duration" />
              <Stat value={`${ONGC_PATTERN.sections[0].count}`} label="Domain Knowledge" />
              <Stat value={`${ONGC_PATTERN.sections[1].count}`} label="Aptitude" />
              <Stat value="5" label="Disciplines" />
              <Stat value="15" label="Mocks / discipline" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={ONGC_RECRUITMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cg-neon inline-flex items-center gap-2 rounded-lg border border-blue-300/70 bg-blue-300/10 px-6 py-3.5 text-base font-semibold text-blue-100 transition hover:bg-blue-300/20"
              >
                View Official Notification <span aria-hidden>↗</span>
              </a>
              <a href="#disciplines" className="btn bg-white/10 text-white border border-white/25 hover:bg-white/20 btn-lg">
                Choose your discipline
              </a>
            </div>
          </div>

          {/* Right — logo card (desktop) */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <Image
                src="/images/ongc/ongc-logo.png"
                alt="ONGC"
                width={160}
                height={160}
                className="rounded-xl"
                priority
              />
              <div className="mt-4 space-y-1 text-sm text-white/70">
                <p className="font-semibold text-white">Advt. No. 1/2025 (R&P)</p>
                <p>Petroleum · Mechanical · Chemical</p>
                <p>Instrumentation · Geology</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}
