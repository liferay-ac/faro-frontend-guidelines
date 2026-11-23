// Builds the site into ./dist: a home page, a page per doc, per tag and per rule, plus ./public

import fs from "node:fs";
import path from "node:path";
import Handlebars from "handlebars";
import { get_docs, get_tags, get_rules, get_rule_categories } from "./docs.js";

const root = path.join(import.meta.dirname, "..");
const dist_dir = path.join(root, "dist");

const template = (file) =>
  Handlebars.compile(fs.readFileSync(path.join(import.meta.dirname, "views", file), "utf-8"));

Handlebars.registerPartial("doc-list", template("partials/doc-list.handlebars"));
Handlebars.registerPartial("revisions", template("partials/revisions.handlebars"));

const layout = template("layouts/main.handlebars");
const home_page = template("home.handlebars");
const doc_page = template("doc.handlebars");
const tag_page = template("tag.handlebars");
const tags_page = template("tags.handlebars");
const rules_page = template("rules.handlebars");
const rule_page = template("rule.handlebars");
const search_page = template("search.handlebars");

// where the site lives: "" at the root (localhost), or e.g. "/faro-frontend-guidelines" on GitHub Pages
const base_path = (process.env.BASE_PATH ?? "").replace(/\/$/, "");

// "/docs/foo" -> dist/docs/foo/index.html, with the page wrapped in the layout
const write_page = (url_path, page, data) => {
  const file = path.join(dist_dir, url_path, "index.html");
  const html = layout({ ...data, body: page(data) });

  fs.mkdirSync(path.dirname(file), { recursive: true });
  // every link in templates and Markdown starts with "/", so the base path goes in front of them all
  fs.writeFileSync(file, html.replace(/(href|src|action)="\//g, `$1="${base_path}/`));
};

fs.rmSync(dist_dir, { recursive: true, force: true }); // so deleted docs don't linger

const docs = get_docs();
const tags = get_tags(docs);

write_page("/", home_page, { docs });

for (const doc of docs) {
  write_page(`/docs/${doc.slug}`, doc_page, doc);
}

write_page("/tags", tags_page, { tags, title: "Tags" });

for (const tag of tags) {
  write_page(`/tags/${tag.slug}`, tag_page, { ...tag, title: `Tagged: ${tag.name}`, keywords: tag.name });
}

const rules = get_rules();
const rule_categories = get_rule_categories(rules);

write_page("/rules", rules_page, { categories: rule_categories, title: "Rules" });

for (const rule of rules) {
  write_page(`/rules/${rule.id}`, rule_page, rule);
}

write_page("/search", search_page, { docs, rules, tags, title: "Search" });

fs.cpSync(path.join(root, "public"), dist_dir, { recursive: true });

console.log(`built dist/: ${docs.length} docs, ${tags.length} tags, ${rules.length} rules`);
