
"use client";

import Image from "next/image";

import {Link} from "@/i18n/navigation";

type RwandaFitnessLogoProps = {
  onClick?: () => void;
};

export default function RwandaFitnessLogo({
  onClick,
}: RwandaFitnessLogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="RwandaFitness"
      className="group flex min-w-0 shrink-0 flex-col items-center"
    >
      {/* LOGO */}
      <Image
        src="/rwandafitness-logo.png"
        alt="RwandaFitness"
        width={320}
        height={100}
        priority
        className="h-auto w-[180px] object-contain transition-transform duration-300 group-hover:scale-[1.03] sm:w-[220px] lg:w-[260px]"
      />

      {/* SLOGAN */}
      <span className="mt-[-8px] text-center text-[7px] font-bold uppercase tracking-[0.22em] text-white/75 sm:text-[8px] lg:text-[9px]">
        STRONGER • BETTER • LIFE
      </span>
    </Link>
  );
}
