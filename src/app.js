const state = {
  lang: localStorage.getItem("gyk-language") || "tr",
  projectFilter: "Tümü",
  opportunityFilter: "Tümü",
};

const copy = {
  tr: {
    heroTitle: "Yaşamı, toprağı, becerileri ve aidiyeti birlikte onaran yaşayan köy.",
    heroText:
      "Güney Yaşam Köyü, Burdur'da katkıda bulunmak, öğrenmek, çalışmak, restore etmek, üretmek ve daha insani bir gelecek kurmak isteyenler için pratik bir köy yenilenme ağıdır.",
    primary: "Köyü Keşfet",
    apply: "Katkı Başvurusu",
    support: "Ortak Alanı Destekle",
    projects: "Güncel Projeler",
  },
  en: {
    heroTitle: "A living village for people rebuilding life, land, skills and belonging.",
    heroText:
      "Guney Yasam Koyu is a village renewal network in Burdur, Turkey. Come to contribute, learn, work, restore, grow, and build a more human future together.",
    primary: "Explore the Village",
    apply: "Apply to Contribute",
    support: "Support the Commons",
    projects: "See Current Projects",
  },
};

const roles = [
  ["Visitor", "Public pages, charter, events, applications, donations and products."],
  ["Registered Supporter", "Profile, saved opportunities, updates, donations and programme applications."],
  ["Applicant", "Detailed application, skills, availability, onboarding and charter acceptance."],
  ["Contributor", "Projects, contribution logs, credits, circles, ideas and permitted votes."],
  ["Resident Contributor", "Housing requests, shared meals, resident notices and long-term pathway."],
  ["Local Villager", "Local offers, needs, producer features, village votes and priority notices."],
  ["Village Producer", "Products, stock, orders, payout view, story and logistics support."],
  ["Steward", "Project leadership, deeper finance view, approvals, mentoring and budget requests."],
  ["Circle Lead", "Circle tasks, roles, reports, budget limits, escalation and analytics."],
  ["Council Member", "Major decisions, governance dashboard, budgets, conflict escalation and reports."],
  ["Finance Administrator", "Payments, expenses, reconciliation, reports, payouts and exports."],
  ["Property Administrator", "House bank, leases, repairs, assignments, inspections and documents."],
  ["Super Administrator", "System settings, roles, exports, integrations, content and automations."],
];

const projects = [
  {
    title: "Eski Fırın Ortak Mutfak",
    category: "Housing restoration",
    status: "In Progress",
    lead: "Restorasyon Çemberi",
    area: "Köy merkezi",
    skills: ["Taş işçiliği", "Gıda hijyeni", "Elektrik"],
    hours: 180,
    funding: 6800,
    progress: 62,
    image:
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Çocuklar İçin Dijital Atölye",
    category: "Youth and education",
    status: "Ready",
    lead: "Öğrenme Çemberi",
    area: "Okul yanı",
    skills: ["Öğretim", "Kodlama", "Mentorluk"],
    hours: 72,
    funding: 2200,
    progress: 28,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Ceviz Bahçesi Su ve Toprak Bakımı",
    category: "Food and farming",
    status: "Planned",
    lead: "Toprak Çemberi",
    area: "Güney ovası",
    skills: ["Permakültür", "Sulama", "Ölçüm"],
    hours: 120,
    funding: 3600,
    progress: 15,
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Usta-Çırak Tamir Günleri",
    category: "Makers and repair",
    status: "Open",
    lead: "Yerel ustalar",
    area: "Atölye sokağı",
    skills: ["Ahşap", "Metal", "Gençlik eğitimi"],
    hours: 96,
    funding: 1400,
    progress: 43,
    image:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
  },
];

const opportunities = [
  ["Köy evleri durum belgeleme", "On-site", "Volunteer contribution", "Beginner-friendly", "Turkish speaking"],
  ["Diaspora bülteni çevirisi", "Remote", "Digital skills", "English speaking", "German speaking"],
  ["Hasat haftası mutfak desteği", "Short-term", "Food production", "Family-friendly", "Contribution exchange"],
  ["Yaşlı ziyaret ve alışveriş ağı", "Long-term", "Elder support", "Local residents", "Paid local work"],
  ["Üretici fotoğraf ve ürün sayfaları", "Remote", "Creative projects", "Paid", "Students"],
  ["Çocuklar için hafta sonu kodlama", "On-site", "Teaching", "English speaking", "Apprenticeship"],
];

const products = [
  ["Güney Pantry Box", "Kurutulmuş otlar, reçel, tarhana ve köy kahvaltısı ürünleri.", "£38", "Commons payı %18"],
  ["Burdur Gift Box", "El işi tekstil, bal ve mevsimlik atıştırmalıklar.", "£54", "Üretici payı %72"],
  ["Diaspora Home Box", "Yurtdışındaki aileler için izlenebilir, sezonluk köy kutusu.", "£68", "Gençlik eğitimi %10"],
  ["Seasonal Harvest Box", "Mevsimlik üreticilerden taze ve kurutulmuş ürün seçimi.", "£42", "Lojistik desteği dahil"],
];

const events = [
  ["Repair Week", "12-18 Aug", "Roof repaired, tools catalogued, local builders paid."],
  ["Harvest Day", "7 Sep", "Trees pruned, youth trained, shared meal funded."],
  ["Diaspora Assembly", "19 Oct", "Project sponsors matched with transparent village needs."],
];

const stories = [
  ["Bir evin tekrar nefes alması", "Restoration diaries", "Yıkılmak üzere olan bir avlunun ortak mutfağa dönüşme günlüğü."],
  ["Almanya'dan dönen bir ustanın notları", "Diaspora stories", "Geri dönüş sadece nostalji değil; iş, sorumluluk ve sabır istiyor."],
  ["Kışlık hazırlık masası", "Food stories", "Reçel, tarhana ve kuru otların arkasındaki kadın emeği."],
];

const moneyRows = [
  ["Donations received", "£18,420"],
  ["Cooperative income", "£9,870"],
  ["Allocated to commons", "31%"],
  ["Local people paid", "24"],
  ["Homes in restoration", "5"],
  ["Contributor hours", "1,284"],
  ["Youth trained", "38"],
  ["Products sold", "612"],
  ["Active projects", "11"],
];

const pages = {
  home,
  about,
  charter,
  how,
  projects: projectsPage,
  opportunities: opportunitiesPage,
  stay,
  "house-bank": houseBank,
  market,
  events: eventsPage,
  transparency,
  stories: storiesPage,
  support,
  portal,
  governance,
  apply,
};

function t(key) {
  return copy[state.lang][key];
}

function shell(title, kicker, body) {
  return `
    <section class="page-hero compact">
      <div>
        <p class="kicker">${kicker}</p>
        <h1>${title}</h1>
      </div>
    </section>
    ${body}
  `;
}

function icon(name) {
  const paths = {
    map: '<path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z"/><path d="M9 3v15"/><path d="M15 6v15"/>',
    heart: '<path d="M19.5 12.5 12 20l-7.5-7.5a5 5 0 0 1 7.1-7.05l.4.4.4-.4a5 5 0 0 1 7.1 7.05z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
  };
  return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ""}</svg>`;
}

function home() {
  return `
    <section class="hero">
      <div class="hero-copy">
        <p class="kicker">Güney Yaşam Köyü</p>
        <h1>${t("heroTitle")}</h1>
        <p>${t("heroText")}</p>
        <div class="button-row">
          <a class="button primary" href="#about">${icon("map")}${t("primary")}</a>
          <a class="button" href="#apply">${icon("heart")}${t("apply")}</a>
          <a class="button ghost" href="#support">${t("support")}</a>
        </div>
      </div>
      <div class="hero-image" role="img" aria-label="Stone village houses and rural life">
        <div class="notice-card">
          <strong>People do not buy belonging.</strong>
          <span>They earn deeper belonging through contribution.</span>
        </div>
      </div>
    </section>
    <section class="three-steps">
      ${["Arrive respectfully", "Contribute meaningfully", "Build deeper belonging over time"]
        .map((step, index) => `<article><span>0${index + 1}</span><h2>${step}</h2><p>Clear expectations, human review and practical village work keep the system grounded.</p></article>`)
        .join("")}
    </section>
    <section class="section-grid">
      <div>
        <p class="kicker">Singular decentralised system</p>
        <h2>One charter, many circles, transparent responsibility.</h2>
        <p>Public pages, member portal, village operations, governance, cooperative economy and property management share one identity and permission model.</p>
      </div>
      <div class="system-map">
        ${["Public website", "Contributor portal", "Operations dashboard", "Governance", "Cooperative finance", "Property and land"].map(item => `<a href="#portal">${item}</a>`).join("")}
      </div>
    </section>
    ${projectStrip()}
    ${opportunityStrip()}
    ${marketStrip()}
    ${transparencyStrip()}
    ${ctaBand()}
  `;
}

function about() {
  return shell(
    "Güney: mevcut köylülerin öncelikli olduğu bir yenilenme ağı.",
    "About Güney",
    `
    <section class="split">
      <div>
        <h2>Nerede ve neden önemli?</h2>
        <p>Güney, Yeşilova/Burdur çevresinde tarım, zanaat, aile bağları ve yüksek ova yaşamının hâlâ hissedildiği bir köydür. Platformun amacı, köyü bir ürüne çevirmek değil; mevcut yaşamı güçlendirmek, boşalan evleri dikkatle onarmak ve yerel ekonomiyi büyütmektir.</p>
        <p>Katkıcılar; uzaktan çalışma, restorasyon, gıda üretimi, eğitim, yaşlı desteği, dijital beceriler ve küçük işletmeler üzerinden köy hayatına dahil olabilir.</p>
      </div>
      <div class="map-card">
        <h3>Public village map</h3>
        ${["Village centre", "Shared kitchen", "Workshop street", "Walking route", "Land care zone", "Restoration cluster"].map((pin, i) => `<button style="--x:${18 + i * 13}%;--y:${26 + (i % 3) * 18}%">${pin}</button>`).join("")}
        <p>Private homes, sensitive owner details and legal documents are never exposed publicly.</p>
      </div>
    </section>
    <section class="values-grid">
      ${["Existing villagers come first", "Not a retreat resort", "Diaspora is invited into responsibility", "Contributors earn trust gradually"].map(v => `<article><h3>${v}</h3><p>Every process is designed around respect, clear permission and practical usefulness.</p></article>`).join("")}
    </section>`
  );
}

function charter() {
  const sections = [
    "Purpose", "Values", "Existing village respect", "Contribution before entitlement", "Stewardship",
    "Shared assets", "Transparency", "Governance", "Conflict resolution", "Safety and safeguarding",
    "Environmental care", "Financial ethics", "Leaving well", "What the project will never become"
  ];
  return shell(
    "Güney Village Charter",
    "Shared framework",
    `<section class="charter-list">${sections.map((s, i) => `<article><span>${i + 1}</span><h2>${s}</h2><p>The charter keeps belonging connected to contribution, safety, transparency and respect for existing village life.</p></article>`).join("")}</section>
    <section class="acceptance-panel">
      <div><h2>Read and accept before applying</h2><p>Applicants must confirm the charter, safety rules, contribution expectations and privacy boundaries before onboarding begins.</p></div>
      <a class="button primary" href="#apply">${icon("check")}Accept Charter</a>
    </section>`
  );
}

function how() {
  return shell(
    "The pathway is gradual, reversible and contribution-based.",
    "How it works",
    `<section class="role-timeline">${["Visitor", "Supporter", "Applicant", "Contributor", "Resident Contributor", "Steward"].map((role, i) => `<article><span>${i + 1}</span><h2>${role}</h2><p>Access expands through reliability, consent, useful work and human-reviewed trust.</p></article>`).join("")}</section>
    <section class="split">
      <div class="statement good"><h2>Anti-exploitation</h2><p>Volunteer work must have clear expectations, safe conditions, visible benefit and a way to pause or leave.</p></div>
      <div class="statement firm"><h2>Anti-free-rider</h2><p>Discounts, housing, tools and governance access require demonstrated contribution and accountability.</p></div>
    </section>`
  );
}

function projectsPage() {
  const cats = ["Tümü", ...new Set(projects.map(p => p.category))];
  const shown = state.projectFilter === "Tümü" ? projects : projects.filter(p => p.category === state.projectFilter);
  return shell(
    "Projects with clear needs, funding and public impact.",
    "Project directory",
    `<div class="filters">${cats.map(c => `<button class="${state.projectFilter === c ? "active" : ""}" data-project-filter="${c}">${c}</button>`).join("")}</div>
    <section class="card-grid">${shown.map(projectCard).join("")}</section>`
  );
}

function opportunitiesPage() {
  const filters = ["Tümü", "Short-term", "Long-term", "Remote", "On-site", "Paid", "Beginner-friendly", "English speaking", "German speaking"];
  const shown = state.opportunityFilter === "Tümü" ? opportunities : opportunities.filter(o => o.includes(state.opportunityFilter));
  return shell(
    "Searchable contribution, paid work and learning opportunities.",
    "Opportunity board",
    `<div class="filters">${filters.map(f => `<button class="${state.opportunityFilter === f ? "active" : ""}" data-opportunity-filter="${f}">${f}</button>`).join("")}</div>
    <section class="table-list">${shown.map(o => `<article><div><h2>${o[0]}</h2><p>${o.slice(1).join(" / ")}</p></div><a class="button small" href="#apply">Apply</a></article>`).join("")}</section>`
  );
}

function stay() {
  return shell(
    "Accommodation is part of a living village system, not a property investment product.",
    "Stay and live",
    `<section class="values-grid">${["Short village stays", "Contributor stays", "Seasonal stays", "Family stays", "Artist and maker residencies", "Return-to-village pathways", "Housing restoration", "Long-term resident application"].map(item => `<article><h3>${item}</h3><p>Eligibility, contribution expectation and house rules are explicit before booking.</p></article>`).join("")}</section>
    <section class="notice-wide"><strong>Accommodation access increases with contribution and trust.</strong><span>Credits cannot override safety, housing rules or existing village priorities.</span></section>`
  );
}

function houseBank() {
  return shell(
    "Selected restoration and use opportunities without exposing private ownership.",
    "Village house bank",
    `<section class="card-grid">
      ${["Restore for village use", "Long-term contributor housing", "Workshop potential", "Community kitchen potential", "Lease opportunity", "Agricultural use"].map((item, i) => `<article class="property-card"><div class="property-image image-${i}"></div><h2>${item}</h2><p>General area: village cluster ${i + 1}. Condition: repair scale ${i % 2 ? "medium" : "major"}. Legal and owner details restricted.</p><a class="button small" href="#apply">Express Interest</a></article>`).join("")}
    </section>`
  );
}

function market() {
  return shell(
    "Local producers, traceable goods and transparent payouts.",
    "Producer marketplace",
    `<section class="card-grid">${products.map(p => `<article class="product-card"><span class="tag">${p[3]}</span><h2>${p[0]}</h2><p>${p[1]}</p><strong>${p[2]}</strong><div class="button-row"><button class="button small primary">Add</button><button class="button small">Producer story</button></div></article>`).join("")}</section>`
  );
}

function eventsPage() {
  return shell(
    "Every event includes what participants leave behind.",
    "Events",
    `<section class="table-list">${events.map(e => `<article><div><span class="tag">${e[1]}</span><h2>${e[0]}</h2><p>After Impact: ${e[2]}</p></div><a class="button small" href="#apply">Register</a></article>`).join("")}</section>`
  );
}

function transparency() {
  return shell(
    "Public summaries without exposing sensitive personal or legal information.",
    "Transparency",
    `<section class="metrics">${moneyRows.map(([k, v]) => `<article><span>${k}</span><strong>${v}</strong></article>`).join("")}</section>
    <section class="split">
      <div><h2>Shared fund allocation</h2><div class="bar-list">${["Restoration 34%", "Youth and learning 18%", "Producer support 21%", "Tools and logistics 14%", "Emergency reserve 13%"].map(row => `<p><span>${row}</span><b></b></p>`).join("")}</div></div>
      <div><h2>Reports</h2><p>Monthly and annual reports are downloadable once accounting review is complete.</p><button class="button">Download monthly report</button><button class="button ghost">Download annual report</button></div>
    </section>`
  );
}

function storiesPage() {
  return shell(
    "Documentary village journal, not marketing noise.",
    "Stories",
    `<section class="card-grid">${stories.map(s => `<article class="story-card"><span class="tag">${s[1]}</span><h2>${s[0]}</h2><p>${s[2]}</p><a href="#stories">Read story</a></article>`).join("")}</section>`
  );
}

function support() {
  return shell(
    "Support the commons with money, skills, materials or partnerships.",
    "Support",
    `<section class="support-grid">
      ${[
        ["£20", "Materials for a shared repair project"],
        ["£50", "One youth skill session"],
        ["£250", "A communal-space restoration step"],
        ["Skills", "Teach, translate, repair, mentor or document"],
        ["Materials", "Tools, timber, seeds, packaging or equipment"],
        ["Partners", "Introduce ethical suppliers and institutions"]
      ].map(i => `<article><strong>${i[0]}</strong><p>${i[1]}</p><button class="button small primary">Support</button></article>`).join("")}
    </section>`
  );
}

function portal() {
  return shell(
    "A secure operating system for contribution, roles and village work.",
    "Member portal demo",
    `<section class="dashboard">
      <aside>
        <h2>Ayşe Kaya</h2>
        <p>Role: Contributor</p>
        <p>Trust level: Reliable helper</p>
        <div class="score-ring">78</div>
        <small>Human-reviewed, appealable and never a measure of human worth.</small>
      </aside>
      <div class="dashboard-main">
        <div class="metrics compact-metrics">
          <article><span>Hours</span><strong>126</strong></article>
          <article><span>Credits</span><strong>42</strong></article>
          <article><span>Projects</span><strong>3</strong></article>
          <article><span>Tasks due</span><strong>5</strong></article>
        </div>
        <section class="kanban">${["Ideas", "Planned", "Ready", "In Progress", "Waiting", "Completed"].map((col, i) => `<div><h3>${col}</h3><p>${["Fırın tile list", "Mentor match", "Tool shelf", "Garden irrigation", "Budget review", "Story draft"][i]}</p></div>`).join("")}</section>
      </div>
    </section>
    <section class="section-grid">
      <div><h2>Contribution ledger</h2><p>Submitted -> Reviewed -> Approved -> Added to ledger. Entries include project, hours, category, evidence, payment type and benefit area.</p></div>
      <div><h2>Credits rules</h2><p>Credits are recognition and exchange, not money, crypto, investment or governance power.</p></div>
    </section>
    <section class="roles-table">${roles.map(r => `<article><strong>${r[0]}</strong><span>${r[1]}</span></article>`).join("")}</section>`
  );
}

function governance() {
  return shell(
    "No guru model: circles, council, transparent authority and appealable decisions.",
    "Governance",
    `<section class="values-grid">${["Food and farming", "Housing restoration", "Youth and education", "Finance", "Property", "Culture and events", "Safeguarding", "Diaspora"].map(c => `<article><h3>${c} Circle</h3><p>Lead, budget limit, public report, escalation route and decision log.</p></article>`).join("")}</section>`
  );
}

function apply() {
  return shell(
    "Start with clarity: skills, availability, needs and charter acceptance.",
    "Apply",
    `<form class="application" data-application>
      <label>Name<input required name="name" placeholder="Ad Soyad" /></label>
      <label>Email<input required type="email" name="email" placeholder="sen@example.com" /></label>
      <label>Connection<select name="connection"><option>Local villager</option><option>Diaspora</option><option>Contributor</option><option>Supporter</option><option>Visitor</option></select></label>
      <label>Skills<textarea name="skills" placeholder="Practical, digital, teaching or care skills"></textarea></label>
      <label>Availability<input name="availability" placeholder="A weekend, a season, remote weekly..." /></label>
      <label class="checkbox"><input type="checkbox" required /> I have read and accept the charter.</label>
      <button class="button primary" type="submit">Submit application</button>
      <p class="form-note" data-application-note></p>
    </form>`
  );
}

function projectStrip() {
  return `<section class="content-block"><div class="section-heading"><div><p class="kicker">Current projects</p><h2>Work that leaves the village stronger.</h2></div><a href="#projects">All projects</a></div><div class="card-grid">${projects.slice(0, 3).map(projectCard).join("")}</div></section>`;
}

function opportunityStrip() {
  return `<section class="content-block muted"><div class="section-heading"><div><p class="kicker">Opportunities</p><h2>Useful ways to arrive.</h2></div><a href="#opportunities">Open board</a></div><div class="table-list">${opportunities.slice(0, 4).map(o => `<article><div><h3>${o[0]}</h3><p>${o.slice(1).join(" / ")}</p></div><a class="button small" href="#apply">Apply</a></article>`).join("")}</div></section>`;
}

function marketStrip() {
  return `<section class="content-block"><div class="section-heading"><div><p class="kicker">Local producers</p><h2>Buy from the village economy.</h2></div><a href="#market">Marketplace</a></div><div class="product-row">${products.slice(0, 3).map(p => `<article><strong>${p[0]}</strong><span>${p[2]}</span><p>${p[1]}</p></article>`).join("")}</div></section>`;
}

function transparencyStrip() {
  return `<section class="content-block"><div class="section-heading"><div><p class="kicker">Public transparency</p><h2>Shared money and impact should be legible.</h2></div><a href="#transparency">Dashboard</a></div><div class="metrics">${moneyRows.slice(0, 6).map(([k, v]) => `<article><span>${k}</span><strong>${v}</strong></article>`).join("")}</div></section>`;
}

function ctaBand() {
  return `<section class="cta-band"><div><h2>Villagers, diaspora, contributors and supporters all enter through clear roles.</h2><p>The system protects local priority while making it easier for useful people to help.</p></div><div class="button-row"><a class="button primary" href="#apply">Start application</a><a class="button" href="#support">Support commons</a></div></section>`;
}

function projectCard(p) {
  return `<article class="project-card">
    <img src="${p.image}" alt="${p.title}" loading="lazy" />
    <div>
      <span class="tag">${p.status}</span>
      <h2>${p.title}</h2>
      <p>${p.lead} / ${p.area}</p>
      <p>${p.skills.join(", ")}</p>
      <div class="progress"><span style="width:${p.progress}%"></span></div>
      <small>${p.hours} hours needed / £${p.funding.toLocaleString()} funding</small>
      <div class="button-row"><a class="button small primary" href="#apply">Join</a><button class="button small">Donate</button><button class="button small ghost">Follow</button></div>
    </div>
  </article>`;
}

function render() {
  const route = window.location.hash.replace("#", "") || "home";
  const app = document.querySelector("#app");
  app.innerHTML = (pages[route] || home)();
  app.focus({ preventScroll: true });
  bindDynamic();
}

function bindDynamic() {
  document.querySelectorAll("[data-project-filter]").forEach(button => {
    button.addEventListener("click", () => {
      state.projectFilter = button.dataset.projectFilter;
      render();
    });
  });
  document.querySelectorAll("[data-opportunity-filter]").forEach(button => {
    button.addEventListener("click", () => {
      state.opportunityFilter = button.dataset.opportunityFilter;
      render();
    });
  });
  const application = document.querySelector("[data-application]");
  if (application) {
    application.addEventListener("submit", event => {
      event.preventDefault();
      localStorage.setItem("gyk-application", JSON.stringify(Object.fromEntries(new FormData(application))));
      document.querySelector("[data-application-note]").textContent =
        "Application saved locally for this prototype. A live build would send this to the secure portal.";
      application.reset();
    });
  }
}

document.querySelector("[data-menu-toggle]").addEventListener("click", () => {
  document.querySelector("[data-nav]").classList.toggle("open");
});

document.querySelector("[data-language]").addEventListener("click", () => {
  state.lang = state.lang === "tr" ? "en" : "tr";
  localStorage.setItem("gyk-language", state.lang);
  render();
});

document.querySelector("[data-newsletter]").addEventListener("submit", event => {
  event.preventDefault();
  const email = new FormData(event.currentTarget).get("email");
  localStorage.setItem("gyk-newsletter", email);
  document.querySelector("[data-newsletter-note]").textContent = "Saved locally for this prototype.";
  event.currentTarget.reset();
});

window.addEventListener("hashchange", render);
render();
