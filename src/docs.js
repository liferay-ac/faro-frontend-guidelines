// Reads every Markdown file in ./docs into a doc object the templates can use

import fs from "node:fs";
import path from "node:path";
import front_matter from "front-matter";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

const docs_dir = path.join(import.meta.dirname, "..", "docs");

// colours code blocks at build time, so the browser runs no JavaScript for it
const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight: (code, lang) =>
      hljs.highlight(code, { language: hljs.getLanguage(lang) ? lang : "plaintext" }).value,
  }),
);

// "React Hooks" -> "react-hooks"
const slugify = (text) =>
  text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// "React, Testing" or a YAML list -> [{ name, slug }]
const parse_tags = (raw) =>
  (Array.isArray(raw) ? raw : String(raw ?? "").split(","))
    .map((name) => String(name).trim())
    .filter(Boolean)
    .map((name) => ({ name, slug: slugify(name) }));

// -> { iso: "2026-10-11", display: "October 11, 2026" }
const parse_date = (raw) => {
  const date = new Date(raw);
  if (!raw || Number.isNaN(date.getTime())) return undefined;

  return {
    iso: date.toISOString().slice(0, 10),
    // YAML dates are midnight UTC, so format in UTC or it can show the day before
    display: date.toLocaleDateString("en-US", { timeZone: "UTC", dateStyle: "long" }),
  };
};

// front matter "revisions" -> [{ date, by, change, ai }], in the order written (oldest first)
const parse_revisions = (raw) =>
  (Array.isArray(raw) ? raw : []).map((revision) => {
    const by = String(revision.by ?? "");

    return { date: parse_date(revision.date), by, change: String(revision.change ?? ""), ai: /^AI\b/.test(by) };
  });

// every .md file in a folder -> { file, attributes, body }; files starting with "_" are skipped (templates)
const read_markdown = (dir) =>
  fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map((file) => ({ file, ...front_matter(fs.readFileSync(path.join(dir, file), "utf-8")) }));

export const get_docs = () =>
  read_markdown(docs_dir)
    .map(({ file, attributes, body }) => {
      const tags = parse_tags(attributes.tags);

      return {
        slug: file.replace(/\.md$/, ""),
        title: attributes.title ?? "No Title",
        description: attributes.description,
        author: attributes.author ?? "Ninguem",
        date: parse_date(attributes.date),
        tags,
        keywords: tags.map((tag) => tag.name).join(", "),
        ai_drafted: attributes.ai_drafted === true,
        revisions: parse_revisions(attributes.revisions),
        content: marked.parse(body),
      };
    })
    // newest first; undated docs last
    .sort((a, b) => (b.date?.iso ?? "").localeCompare(a.date?.iso ?? ""));

// every tag any doc uses, with its docs, sorted by name
export const get_tags = (docs) => {
  const tags = new Map();

  for (const doc of docs) {
    for (const tag of doc.tags) {
      if (!tags.has(tag.slug)) tags.set(tag.slug, { ...tag, docs: [] });
      tags.get(tag.slug).docs.push(doc);
    }
  }

  return [...tags.values()].sort((a, b) => a.name.localeCompare(b.name));
};

// ---- Rules: one Markdown file per rule in ./rules, in the shape of the Herb linter rule docs ----

const rules_dir = path.join(import.meta.dirname, "..", "rules");

const required_fields = ["title", "category", "description"];
const statuses = ["proposed", "accepted", "rejected"];
const required_headings = ["## Description", "## Rationale", "## Examples", "### ✅ Good", "### 🚫 Bad", "## References"];

// a rule page with a missing piece stops the build, naming the file, instead of shipping half a rule
const check_rule = (file, attributes, body) => {
  const problems = [
    ...required_fields.filter((field) => !attributes[field]).map((field) => `missing front matter "${field}"`),
    ...(statuses.includes(String(attributes.status ?? "proposed").toLowerCase())
      ? []
      : [`status must be one of: ${statuses.join(", ")}`]),
    // an accepted rule is a team agreement, so a person has to have written it
    ...(attributes.ai_drafted !== false && String(attributes.status).toLowerCase() === "accepted"
      ? ['an accepted rule must be rewritten by a person: set "ai_drafted: false" once it is']
      : []),
    ...required_headings
      .filter((heading) => !body.split("\n").some((line) => line.trim() === heading))
      .map((heading) => `missing heading "${heading}"`),
  ];

  if (problems.length) throw new Error(`rules/${file}:\n  - ${problems.join("\n  - ")}`);
};

export const get_rules = () =>
  read_markdown(rules_dir)
    .map(({ file, attributes, body }) => {
      check_rule(file, attributes, body);

      const id = file.replace(/\.md$/, "");

      return {
        id,
        slug: id,
        title: attributes.title,
        description: attributes.description,
        category: attributes.category,
        category_slug: slugify(attributes.category),
        // every rule starts as a proposal; only the team marks one accepted
        status: String(attributes.status ?? "proposed").toLowerCase(),
        accepted: String(attributes.status ?? "proposed").toLowerCase() === "accepted",
        enforced_by: attributes.enforced_by ?? "Code review",
        // drafted by AI unless the front matter says otherwise
        ai_drafted: attributes.ai_drafted !== false,
        revisions: parse_revisions(attributes.revisions),
        author: attributes.author ?? "Ninguem",
        date: parse_date(attributes.date),
        keywords: attributes.category,
        content: marked.parse(body),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

// -> [{ name, slug, rules }], categories and their rules sorted by name, like the Herb rules index
export const get_rule_categories = (rules) => {
  const categories = new Map();

  for (const rule of rules) {
    const slug = slugify(rule.category);
    if (!categories.has(slug)) categories.set(slug, { name: rule.category, slug, rules: [] });
    categories.get(slug).rules.push(rule);
  }

  return [...categories.values()].sort((a, b) => a.name.localeCompare(b.name));
};
