#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prompts from "prompts";
import { yellow, red } from "kolorist";

const cwd = process.cwd();

const copy = (src, dest) => {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
};

const copyDir = (srcDir, destDir) => {
  fs.mkdirSync(destDir);

  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
};

const isValidPackageName = (projectName) => {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
};

const run = async () => {
  const defaultProjectName = "vue-app";
  const templateDir = "template";
  const templatePath = path.join(
    fileURLToPath(import.meta.url),
    "..",
    templateDir
  );

  const questions = [
    {
      type: "text",
      name: "name",
      message: "project name",
      initial: defaultProjectName,
      validate: (name) => isValidPackageName(name) || "Invalid project name",
    },
  ];

  const { name } = await prompts(questions);

  const write = (file, content) => {
    const targetPath = path.join(templatePath, file);
    const destPath = path.join(cwd, name, file);

    if (content) {
      fs.writeFileSync(destPath, content);
    } else {
      copy(targetPath, destPath);
    }
  };

  const destRoot = path.join(cwd, name);

  if (fs.existsSync(destRoot)) {
    console.log(yellow(`${name} already exists.`));
    return;
  } else {
    fs.mkdirSync(destRoot);
  }

  const files = fs.readdirSync(templatePath);
  for (const file of files.filter((file) => file !== "package.json")) {
    write(file);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templatePath, "package.json"), "utf-8")
  );

  // package.json name
  pkg.name = name;

  write("package.json", JSON.stringify(pkg, null, 2));
};

run();
