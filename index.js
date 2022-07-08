#!/usr/bin/env node

// @ts-nocheck
const fs = require("node:fs");
const path = require("node:path");
const minimist = require("minimist");
const prompts = require("prompts");

const cwd = process.cwd();
const questions = [];

const templateDir = "template";
const destDir = "dest";
const root = path.join(cwd, templateDir);

const write = (file) => {
  const targetPath = path.join(root, file);
  const destPath = path.join(cwd, destDir, file);
  copy(targetPath, destPath);
};

const copy = (src, dest) => {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
};

const copyDir = (scrDir, destDir) => {
  fs.mkdirSync(destDir);

  for (const file of fs.readdirSync(scrDir)) {
    const srcFile = path.resolve(scrDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
};

const run = async () => {
  // const res = await prompts(questions);

  const destRoot = path.join(cwd, destDir);
  if (!fs.existsSync(destRoot)) {
    fs.mkdirSync(destRoot);
  }

  const files = fs.readdirSync(root);
  for (const file of files) {
    write(file);
  }
};

run();
