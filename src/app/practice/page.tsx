"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { PracticeView } from "@/components/practice/practice-view";
import { parsePracticeWeek } from "@/lib/routes/search-params";

export default function Page() {
  return (
    <Suspense fallback={<PracticeView selectedWeek="all" />}>
      <PracticePageContent />
    </Suspense>
  );
}

function PracticePageContent() {
  const searchParams = useSearchParams();
  const selectedWeek = parsePracticeWeek(searchParams.get("week"));

  return <PracticeView selectedWeek={selectedWeek} />;
}
