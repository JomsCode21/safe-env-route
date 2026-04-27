import { existsSync, writeFileSync } from "node:fs";

import { getDefinedSchema } from "./define-env";

export interface GenerateEnvExampleOptions {
  includeComments?: boolean;
  newlineBetweenGroups?: boolean;
  overwrite?: boolean;
}

const defaultOptions: Required<GenerateEnvExampleOptions> = {
  includeComments: true,
  newlineBetweenGroups: true,
  overwrite: true,
};

function getOptions(options?: GenerateEnvExampleOptions): Required<GenerateEnvExampleOptions> {
  return {
    ...defaultOptions,
    ...(options ?? {}),
  };
}

export function generateEnvExample(options?: GenerateEnvExampleOptions): string {
  const schema = getDefinedSchema();
  const settings = getOptions(options);
  const groups = Object.entries(schema);
  const lines: string[] = [];

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const [groupName, groupSchema] = groups[groupIndex];

    if (settings.includeComments) {
      lines.push(`# [${groupName}]`);
    }

    for (const key of Object.keys(groupSchema)) {
      lines.push(`${key}=`);
    }

    const shouldAddSpacer = settings.newlineBetweenGroups && groupIndex < groups.length - 1;
    if (shouldAddSpacer) {
      lines.push("");
    }
  }

  const content = lines.join("\n");
  if (content === "") {
    return "\n";
  }

  return `${content}\n`;
}

export function writeEnvExample(
  filePath = ".env.example",
  options?: GenerateEnvExampleOptions,
): string {
  const settings = getOptions(options);
  if (!settings.overwrite && existsSync(filePath)) {
    throw new Error(`Refusing to overwrite existing file: ${filePath}`);
  }

  const content = generateEnvExample(settings);
  writeFileSync(filePath, content, "utf8");
  return content;
}
