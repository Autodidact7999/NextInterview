"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { RoadmapView } from "@/components/roadmap/roadmap-view";
import { parseRoadmapSection } from "@/lib/routes/search-params";

export default function Page() {
  return (
    <Suspense fallback={<RoadmapView selectedSection="overview" />}>
      <RoadmapPageContent />
    </Suspense>
  );
}

function RoadmapPageContent() {
  const searchParams = useSearchParams();
  const selectedSection = parseRoadmapSection(searchParams.get("section"));

  return <RoadmapView selectedSection={selectedSection} />;
}
