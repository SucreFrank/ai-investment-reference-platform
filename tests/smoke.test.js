const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("static site contains required product sections and compliance copy", () => {
  const html = read("index.html");

  [
    "AI 投资参考平台",
    "热点行业观察",
    "ETF 指标解读",
    "行业 / 公司查询",
    "投资术语速查",
    "风险提示与免责声明",
    "不构成任何证券、基金、期货或其他金融产品的投资建议"
  ].forEach((text) => assert.match(html, new RegExp(text)));
});

test("demo data covers industries, companies, risks, and glossary terms", () => {
  const data = require("../data");

  assert.equal(data.industries.length, 5);
  assert.equal(data.terms.length, 12);
  assert.equal(data.assetDemo.name, "沪深300ETF");
  assert.ok(data.assetDemo.metrics.length >= 8);

  data.industries.forEach((industry) => {
    assert.ok(industry.name);
    assert.ok(industry.simple);
    assert.ok(industry.risks.length >= 3);
    assert.ok(industry.companies.length >= 3);
  });

  data.assetDemo.metrics.forEach((metric) => {
    assert.ok(metric.name);
    assert.ok(metric.brief);
    assert.ok(metric.explain);
    assert.ok(metric.beginner);
    assert.ok(metric.pitfalls.length >= 2);
  });
});

test("PRD and README document demo boundaries", () => {
  const prd = read("docs/PRD.md");
  const readme = read("README.md");

  assert.match(prd, /参考而非荐股/);
  assert.match(prd, /具体 ETF 指标解读/);
  assert.match(prd, /Demo 数据必须明确标注为演示样例/);
  assert.match(readme, /使用静态演示数据/);
  assert.match(readme, /不提供买入、卖出、目标价、收益承诺/);
});
