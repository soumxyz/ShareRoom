import React from "react";
import { FlipWords } from "./flip-words";

export function FlipWordsDemo() {
  const words = ["Images", "Files", "Code", "Docs"];

  return (
    <span className="inline-flex items-baseline justify-center whitespace-nowrap">
      <span>Share&nbsp;</span>
      <FlipWords words={words} duration={2400} className="text-[#0c1524] font-medium" />
      <span>&nbsp;instantly</span>
    </span>
  );
}