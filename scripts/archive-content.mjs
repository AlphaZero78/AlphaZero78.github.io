import fs from "node:fs/promises";

const requiredFields = [
  "id",
  "title",
  "en",
  "department",
  "category",
  "date",
  "lead",
  "clearance",
  "abstract",
  "source",
];
const isText = (value) => typeof value === "string" && value.trim().length > 0;

export function validateContent(content) {
  const errors = [];
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    throw new Error("档案数据必须是 JSON 对象。");
  }
  for (const key of ["categories", "columns"]) {
    const names = content[key];
    if (!Array.isArray(names) || names.length !== 5 || !names.every(isText)) {
      errors.push(`${key}：必须包含五个非空分类名称`);
    } else if (new Set(names).size !== 5 || names.includes("全部档案")) {
      errors.push(`${key}：分类名称不能重复，也不能使用“全部档案”`);
    }
  }
  const categories = Array.isArray(content.categories)
    ? content.categories
    : [];
  const columns = Array.isArray(content.columns) ? content.columns : [];
  if (
    categories.some((name) => !columns.includes(name)) ||
    columns.some((name) => !categories.includes(name))
  ) {
    errors.push("categories 与 columns 必须包含相同的五个分类（顺序可以不同）");
  }
  const records = Array.isArray(content.records) ? content.records : [];
  if (!records.length || records.length % 5 !== 0) errors.push("records：五列需要相同数量的档案");
  const ids = new Set();
  records.forEach((record, index) => {
    const label = `records[${index}]`;
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      errors.push(`${label}：必须是档案对象`);
      return;
    }
    for (const key of requiredFields) {
      if (!isText(record[key])) errors.push(`${label}.${key}：必须是非空文本`);
    }
    const expectedId = `X-${String(index + 1).padStart(3, "0")}`;
    if (record.id !== expectedId)
      errors.push(`${label}.id：应为 ${expectedId}，编号须按顺序保持稳定`);
    if (ids.has(record.id)) errors.push(`${label}.id：重复编号 ${record.id}`);
    ids.add(record.id);
    if (!categories.includes(record.category))
      errors.push(`${label}.category：未知分类 ${record.category}`);
    if (
      !Array.isArray(record.findings) ||
      record.findings.length === 0 ||
      !record.findings.every(isText)
    ) {
      errors.push(`${label}.findings：必须包含至少一条非空研究记录`);
    }
    try {
      const url = new URL(record.source);
      if (!["https:", "http:"].includes(url.protocol)) throw new Error();
    } catch {
      errors.push(`${label}.source：必须是有效的 HTTP 或 HTTPS 链接`);
    }
    if (record.links !== undefined) {
      if (!Array.isArray(record.links)) errors.push(`${label}.links：必须是链接数组`);
      else for (const link of record.links) {
        try {
          if (!link || !isText(link.label) || !["https:", "http:", "mailto:"].includes(new URL(link.url).protocol)) throw new Error();
        } catch { errors.push(`${label}.links：必须包含名称和安全的网页或邮件链接`); }
      }
    }
    if (record.resumeFields !== undefined && (!Array.isArray(record.resumeFields) || !record.resumeFields.length || !record.resumeFields.every(field => field && isText(field.label) && isText(field.value)))) {
      errors.push(`${label}.resumeFields：必须包含非空的简历字段名称与内容`);
    }
  });
  for (const name of columns) {
    if (records.filter((record) => record?.category === name).length !== records.length / 5) {
      errors.push(`分类“${name}”：五列需要相同数量的档案`);
    }
  }
  if (errors.length)
    throw new Error(`档案数据校验失败：\n- ${errors.join("\n- ")}`);
  return content;
}

export async function loadContent() {
  return validateContent(
    JSON.parse(
      await fs.readFile(
        new URL("../content/archives.json", import.meta.url),
        "utf8",
      ),
    ),
  );
}

export function archiveText(r) {
  return `\uFEFFZIHAN DONG · PERSONAL ARCHIVE\nFILE ${r.id} / ${r.title}\n${r.en}\n\n${(r.resumeFields ?? []).map(field => `${field.label}：${field.value}`).join("\n")}\n\n${r.abstract}\n\n内容详情\n${r.findings.map((f, i) => `${i + 1}. ${f}`).join("\n")}\n\n相关链接：${r.source}\n董梓涵的个人主页 · Based on RhineLabUI by LBEILC.\n`;
}
