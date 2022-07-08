#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const minimist = require("minimist");
const prompts = require("prompts");

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
  const root = path.join(cwd, templateDir);

  const questions = [
    {
      type: "text",
      name: "name",
      message: "project name",
      initial: defaultProjectName,
      validate: (name) => isValidPackageName(name) || "Invalid project name",
    },
  ];

  const { name = defaultProjectName } = await prompts(questions);

  const write = (file, content) => {
    const targetPath = path.join(root, file);
    const destPath = path.join(cwd, name, file);

    if (content) {
      fs.writeFileSync(destPath, content);
    } else {
      copy(targetPath, destPath);
    }
  };

  const destRoot = path.join(cwd, name);
  if (!fs.existsSync(destRoot)) {
    fs.mkdirSync(destRoot);
  }

  const files = fs.readdirSync(root);
  for (const file of files.filter((file) => file !== "package.json")) {
    write(file);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf-8")
  );

  // package.json name
  pkg.name = name;

  write("package.json", JSON.stringify(pkg, null, 2));
};

run();
