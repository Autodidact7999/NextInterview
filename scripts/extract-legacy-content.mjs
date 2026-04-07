import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function extractInitializer(source, name) {
  const token = `const ${name} =`;
  const start = source.indexOf(token);

  if (start === -1) {
    throw new Error(`Could not find initializer for ${name}`);
  }

  let index = source.indexOf("=", start) + 1;

  while (/\s/.test(source[index] ?? "")) {
    index += 1;
  }

  const stack = [];
  let quote = null;
  let escaped = false;

  for (let cursor = index; cursor < source.length; cursor += 1) {
    const char = source[cursor];

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "[" || char === "{" || char === "(") {
      stack.push(char);
      continue;
    }

    if (char === "]" || char === "}" || char === ")") {
      stack.pop();

      if (stack.length === 0) {
        return source.slice(index, cursor + 1);
      }
    }
  }

  throw new Error(`Could not parse initializer for ${name}`);
}

function writeModule(filePath, imports, exportsMap) {
  const lines = [];

  if (imports.length > 0) {
    lines.push(`import type { ${imports.join(", ")} } from "@/lib/types";`, "");
  }

  for (const item of exportsMap) {
    lines.push(
      `export const ${item.name} = ${item.value} satisfies ${item.type};`,
      "",
    );
  }

  fs.writeFileSync(path.join(root, filePath), `${lines.join("\n").trim()}\n`);
}

const roadmapSource = read("3month_dsa_system_design_plan.html");
const referenceSource = read("java_dsa_reference.html");

writeModule(
  "src/content/roadmap.generated.ts",
  ["PatternCard", "SystemDesignTopic", "WeekPlan"],
  [
    {
      name: "roadmapWeeks",
      type: "WeekPlan[]",
      value: extractInitializer(roadmapSource, "weeks"),
    },
    {
      name: "roadmapPatterns",
      type: "PatternCard[]",
      value: extractInitializer(roadmapSource, "patterns"),
    },
    {
      name: "systemDesignTopics",
      type: "SystemDesignTopic[]",
      value: extractInitializer(roadmapSource, "sdTopics"),
    },
  ],
);

writeModule(
  "src/content/reference.generated.ts",
  ["MindMapNodeDetailMap", "ReferenceAccordionItem"],
  [
    {
      name: "typesReferenceEntries",
      type: "ReferenceAccordionItem[]",
      value: extractInitializer(referenceSource, "typesData"),
    },
    {
      name: "collectionsReferenceEntries",
      type: "ReferenceAccordionItem[]",
      value: extractInitializer(referenceSource, "collectionsData"),
    },
    {
      name: "patternReferenceEntries",
      type: "ReferenceAccordionItem[]",
      value: extractInitializer(referenceSource, "patternsData"),
    },
    {
      name: "mindMapNodeDetails",
      type: "MindMapNodeDetailMap",
      value: extractInitializer(referenceSource, "nodeDetails"),
    },
  ],
);

writeModule(
  "src/content/practice.generated.ts",
  ["DayPlanEntry", "SolutionMap", "WeekMetaMap"],
  [
    {
      name: "practiceDayPlan",
      type: "DayPlanEntry[]",
      value: extractInitializer(referenceSource, "dayPlan"),
    },
    {
      name: "practiceWeekMeta",
      type: "WeekMetaMap",
      value: extractInitializer(referenceSource, "weekMeta"),
    },
    {
      name: "practiceSolutions",
      type: "SolutionMap",
      value: extractInitializer(referenceSource, "solutions"),
    },
  ],
);
