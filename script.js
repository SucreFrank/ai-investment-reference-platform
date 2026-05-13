(function () {
  const data = window.DEMO_DATA;
  const disclaimer =
    "演示样例，不代表实时市场热点或投资建议。投资有风险，决策需谨慎。";

  const $ = (selector) => document.querySelector(selector);
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  let activeIndustryId = data.industries[0].id;

  function renderMetrics() {
    $("#industry-count").textContent = String(data.industries.length);
    $("#term-count").textContent = String(data.terms.length);
  }

  function renderHeatmap() {
    const heatmap = $("#heatmap");
    heatmap.innerHTML = "";

    data.industries.forEach((industry) => {
      const cell = create("button", `heat-cell ${industry.tone}`);
      cell.type = "button";
      cell.dataset.id = industry.id;
      cell.style.setProperty("--heat", `${Math.max(42, industry.score)}%`);
      cell.innerHTML = `
        <span>${industry.name}</span>
        <strong>${industry.score}</strong>
      `;
      cell.addEventListener("click", () => selectIndustry(industry.id));
      heatmap.appendChild(cell);
    });
  }

  function renderIndustryCards() {
    const grid = $("#sector-grid");
    grid.innerHTML = "";

    data.industries.forEach((industry) => {
      const card = create("article", "sector-card");
      card.dataset.id = industry.id;
      card.innerHTML = `
        <div class="card-topline">
          <span class="tone-dot ${industry.tone}"></span>
          <span>关注度 ${industry.score}</span>
        </div>
        <h3>${industry.name}</h3>
        <p>${industry.simple}</p>
        <div class="tag-row">
          ${industry.tags.map((tag) => `<span>${tag}</span>`).join("")}
        </div>
        <button class="text-button" type="button">查看解释</button>
      `;
      card.querySelector("button").addEventListener("click", () => selectIndustry(industry.id));
      grid.appendChild(card);
    });
  }

  function selectIndustry(id) {
    activeIndustryId = id;
    renderIndustryDetail();
    renderCompanies();
    document.querySelectorAll(".sector-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.id === id);
    });
    document.querySelectorAll(".heat-cell").forEach((cell) => {
      cell.classList.toggle("active", cell.dataset.id === id);
    });
  }

  function getActiveIndustry() {
    return data.industries.find((industry) => industry.id === activeIndustryId) || data.industries[0];
  }

  function renderIndustryDetail() {
    const industry = getActiveIndustry();
    const detail = $("#industry-detail");
    detail.innerHTML = `
      <div class="detail-title-row">
        <div>
          <h3>${industry.name}</h3>
          <p>${industry.simple}</p>
        </div>
        <span class="score-badge">${industry.score}</span>
      </div>
      <div class="info-block">
        <h4>为什么被关注</h4>
        <p>${industry.why}</p>
      </div>
      <div class="info-block">
        <h4>先看哪些指标</h4>
        <div class="tag-row strong">
          ${industry.metrics.map((metric) => `<span>${metric}</span>`).join("")}
        </div>
      </div>
      <div class="info-block">
        <h4>产业链结构</h4>
        <ul>${industry.chain.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
      <div class="two-column-info">
        <div class="info-block warning">
          <h4>小白容易误解</h4>
          <p>${industry.misconception}</p>
        </div>
        <div class="info-block">
          <h4>继续学习关键词</h4>
          <p>${industry.keywords.join("、")}</p>
        </div>
      </div>
      <div class="risk-card">
        <strong>主要风险</strong>
        <span>${industry.risks.join("；")}。</span>
      </div>
      <p class="demo-note">${disclaimer}</p>
    `;
  }

  function renderCompanies() {
    const industry = getActiveIndustry();
    const list = $("#company-list");
    list.innerHTML = "";

    industry.companies.forEach((company) => {
      const item = create("article", "company-card");
      item.innerHTML = `
        <h3>${company.name}</h3>
        <p class="company-role">${company.role}</p>
        <dl>
          <div>
            <dt>关联逻辑</dt>
            <dd>${company.relation}</dd>
          </div>
          <div>
            <dt>观察指标</dt>
            <dd>${company.metrics}</dd>
          </div>
          <div>
            <dt>风险</dt>
            <dd>${company.risk}</dd>
          </div>
        </dl>
      `;
      list.appendChild(item);
    });
  }

  function renderQuickTags() {
    const tags = $("#quick-tags");
    const keywords = [
      ...data.industries.map((industry) => industry.name),
      "机器人",
      "芯片",
      "医药",
      "数据中心"
    ];

    tags.innerHTML = "";
    keywords.forEach((keyword) => {
      const button = create("button", "quick-tag", keyword);
      button.type = "button";
      button.addEventListener("click", () => {
        $("#query-input").value = keyword;
        runQuery(keyword);
      });
      tags.appendChild(button);
    });
  }

  function normalizeQuery(value) {
    return value.trim().toLowerCase().replace(/\s+/g, "");
  }

  function findIndustry(query) {
    const normalized = normalizeQuery(query);
    if (!normalized) return null;

    return data.industries.find((industry) => {
      const text = [industry.name, industry.simple, ...industry.tags, ...industry.keywords]
        .join(" ")
        .toLowerCase();
      return text.includes(normalized) || normalized.includes(industry.name.toLowerCase().replace(/\s+/g, ""));
    });
  }

  function runQuery(rawQuery) {
    const result = $("#query-result");
    const query = rawQuery.trim();
    const industry = findIndustry(query);

    if (!query) {
      result.innerHTML = `
        <h3>请输入想了解的行业或公司</h3>
        <p>可以尝试：AI 算力、半导体、机器人、创新药、低空经济。</p>
      `;
      return;
    }

    if (!industry) {
      result.innerHTML = `
        <h3>当前 Demo 暂未收录“${escapeHTML(query)}”</h3>
        <p>可以先尝试 AI 算力、半导体、机器人、创新药、低空经济等演示关键词。正式版本会接入更完整的数据和 AI 解释能力。</p>
        <div class="risk-card">
          <strong>提示</strong>
          <span>${disclaimer}</span>
        </div>
      `;
      return;
    }

    result.innerHTML = `
      <div class="query-heading">
        <div>
          <p class="eyebrow">Query Result</p>
          <h3>${industry.name}</h3>
        </div>
        <span class="status-pill">匹配成功</span>
      </div>
      <p class="query-summary">${industry.simple}</p>
      <div class="query-grid">
        <div>
          <h4>当前关注逻辑</h4>
          <p>${industry.why}</p>
        </div>
        <div>
          <h4>研究重点</h4>
          <p>${industry.focus}</p>
        </div>
        <div>
          <h4>代表公司类型</h4>
          <p>${industry.companies.map((company) => company.role).join("；")}。</p>
        </div>
        <div>
          <h4>先理解这些概念</h4>
          <p>${industry.keywords.join("、")}。</p>
        </div>
      </div>
      <div class="risk-card">
        <strong>风险提示</strong>
        <span>${industry.risks.join("；")}。</span>
      </div>
      <p class="demo-note">${disclaimer}</p>
    `;
  }

  function escapeHTML(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderTerms() {
    const grid = $("#term-grid");
    grid.innerHTML = "";

    data.terms.forEach((term, index) => {
      const button = create("button", "term-card");
      button.type = "button";
      button.dataset.index = String(index);
      button.innerHTML = `<strong>${term.name}</strong><span>${term.summary}</span>`;
      button.addEventListener("click", () => selectTerm(index));
      grid.appendChild(button);
    });

    selectTerm(0);
  }

  function selectTerm(index) {
    const term = data.terms[index];
    $("#term-detail").innerHTML = `
      <p class="eyebrow">Glossary</p>
      <h3>${term.name}</h3>
      <div class="info-block">
        <h4>一句话解释</h4>
        <p>${term.summary}</p>
      </div>
      <div class="info-block">
        <h4>小白理解版</h4>
        <p>${term.plain}</p>
      </div>
      <div class="info-block warning">
        <h4>常见误区</h4>
        <p>${term.trap}</p>
      </div>
    `;

    document.querySelectorAll(".term-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.index === String(index));
    });
  }

  function bindSearch() {
    $("#search-form").addEventListener("submit", (event) => {
      event.preventDefault();
      runQuery($("#query-input").value);
    });
    runQuery("AI 算力");
  }

  function init() {
    renderMetrics();
    renderHeatmap();
    renderIndustryCards();
    renderQuickTags();
    renderTerms();
    bindSearch();
    selectIndustry(activeIndustryId);
  }

  init();
})();
