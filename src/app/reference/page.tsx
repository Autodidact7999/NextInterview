"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { ReferenceView } from "@/components/reference/reference-view";
import { parseReferenceSection } from "@/lib/routes/search-params";

export default function Page() {
  return (
    <Suspense fallback={<ReferenceView selectedSection="mindmap" />}>
      <ReferencePageContent />
    </Suspense>
  );
}

function ReferencePageContent() {
  const searchParams = useSearchParams();
  const selectedSection = parseReferenceSection(searchParams.get("section"));

  return <ReferenceView selectedSection={selectedSection} />;
}
