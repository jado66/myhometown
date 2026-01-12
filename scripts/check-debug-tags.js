#!/usr/bin/env node

/**
 * Pre-commit hook to check for debug <pre> tags in staged files
 * This prevents accidentally committing debug code to the repository
 */

const { execSync } = require("child_process");
const fs = require("fs");

const DEBUG_PATTERNS = [
  /<pre>/gi,
  /<pre\s+/gi,
  // Add more patterns if needed, e.g.:
  // /console\.log\(/gi,
  // /debugger;/gi,
];

function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
    });
    return output
      .split("\n")
      .filter(Boolean)
      .filter((file) => {
        // Skip this script file itself
        if (file.includes("check-debug-tags.js")) {
          return false;
        }
        // Only check relevant file types
        return /\.(js|jsx|ts|tsx|html)$/.test(file);
      });
  } catch (error) {
    console.error("Error getting staged files:", error.message);
    return [];
  }
}

function checkFileForDebugTags(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const violations = [];

    lines.forEach((line, index) => {
      // Skip comment lines
      const trimmedLine = line.trim();
      if (
        trimmedLine.startsWith("//") ||
        trimmedLine.startsWith("/*") ||
        trimmedLine.startsWith("*") ||
        trimmedLine.startsWith("<!--")
      ) {
        return;
      }

      DEBUG_PATTERNS.forEach((pattern) => {
        if (pattern.test(line)) {
          violations.push({
            line: index + 1,
            content: line.trim(),
            pattern: pattern.toString(),
          });
        }
      });
    });

    return violations;
  } catch (error) {
    // File might have been deleted or renamed
    return [];
  }
}

function main() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    process.exit(0);
  }

  let hasErrors = false;
  const allViolations = {};

  stagedFiles.forEach((file) => {
    const violations = checkFileForDebugTags(file);
    if (violations.length > 0) {
      hasErrors = true;
      allViolations[file] = violations;
    }
  });

  if (hasErrors) {
    console.error("\n❌ COMMIT BLOCKED: Debug tags found in staged files:\n");

    Object.entries(allViolations).forEach(([file, violations]) => {
      console.error(`📄 ${file}:`);
      violations.forEach((v) => {
        console.error(`   Line ${v.line}: ${v.content}`);
      });
      console.error("");
    });

    console.error("Please remove debug <pre> tags before committing.\n");
    process.exit(1);
  }

  process.exit(0);
}

main();
