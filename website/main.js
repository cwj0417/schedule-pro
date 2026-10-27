(() => {
  "use strict";

  const REPO = "cwj0417/schedule-pro";
  const RELEASES_URL = `https://github.com/${REPO}/releases`;
  const LATEST_URL = `${RELEASES_URL}/latest`;
  const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
  const CACHE_KEY = "schedulepro:latestRelease";
  const CACHE_TTL = 60 * 60 * 1000;

  /* ---------- 主题 ---------- */
  const THEME_KEY = "schedulepro:theme";
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  const readStoredTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      /* 隐私模式下忽略 */
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "切换到浅色主题" : "切换到深色主题");
    }
  };

  const storedTheme = readStoredTheme();
  if (storedTheme === "dark" || storedTheme === "light") {
    applyTheme(storedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
  }

  /* ---------- 顶部导航阴影 ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 入场动画 ---------- */
  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  // 同一容器内的卡片依次出现，避免整片同时淡入
  const groups = new Map();
  revealItems.forEach((item) => {
    const parent = item.parentElement;
    if (!parent) return;
    const index = groups.get(parent) || 0;
    groups.set(parent, index + 1);
    item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------- 更新日志 ---------- */
  const versionText = document.getElementById("latestVersionText");
  const mockVersion = document.querySelector(".mock-version");
  const releaseVersion = document.getElementById("releaseVersion");
  const releaseDate = document.getElementById("releaseDate");
  const releaseNotes = document.getElementById("releaseNotes");
  const releaseDownload = document.getElementById("releaseDownload");
  const downloadLinks = ["downloadTop", "downloadHero", "downloadCta"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const allLink = document.getElementById("releaseAllLink");

  if (allLink) allLink.href = RELEASES_URL;

  downloadLinks.forEach((link) => {
    link.href = LATEST_URL;
  });

  const setDownloadUrl = (url) => {
    downloadLinks.forEach((link) => {
      link.href = url;
    });
    if (releaseDownload) releaseDownload.href = url;
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  };

  const cleanLine = (line) =>
    line
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .replace(/^#{1,6}\s*/, "")
      .replace(/^\s*(?:[-*+]|\d+\.)\s*/, "")
      .trim();

  // 只按行解析成段落和列表，全部使用 textContent，避免把远端内容当 HTML 注入
  const renderNotes = (markdown) => {
    const fragment = document.createDocumentFragment();
    let list = null;

    String(markdown || "")
      .replace(/\r/g, "")
      .split("\n")
      .forEach((raw) => {
        const line = raw.trim();
        if (!line) {
          list = null;
          return;
        }

        if (/^([-*+]|\d+\.)\s+/.test(line)) {
          if (!list) {
            list = document.createElement("ul");
            fragment.appendChild(list);
          }
          const item = document.createElement("li");
          item.textContent = cleanLine(line);
          list.appendChild(item);
        } else {
          list = null;
          const paragraph = document.createElement("p");
          paragraph.textContent = cleanLine(line);
          fragment.appendChild(paragraph);
        }
      });

    return fragment;
  };

  const renderRelease = (release) => {
    const version = release.tag_name || release.name || "";
    const date = formatDate(release.published_at);

    if (version) {
      if (releaseVersion) releaseVersion.textContent = `v${String(version).replace(/^v/, "")}`;
      if (versionText) versionText.textContent = `最新版本 ${version}`;
      if (mockVersion) mockVersion.textContent = version;
    }

    if (releaseDate) releaseDate.textContent = date ? `发布于 ${date}` : "查看发布详情";

    if (releaseNotes) {
      releaseNotes.textContent = "";
      if (release.body && release.body.trim()) {
        releaseNotes.appendChild(renderNotes(release.body));
      } else {
        const empty = document.createElement("p");
        empty.className = "release-empty";
        empty.textContent = "该版本没有单独的更新说明，可以前往 Release 页面查看安装包与全部变更。";
        releaseNotes.appendChild(empty);
      }
    }

    if (release.html_url) setDownloadUrl(release.html_url);
  };

  const renderFallback = () => {
    if (releaseVersion) releaseVersion.textContent = "最新版本见 GitHub";
    if (versionText) versionText.textContent = "前往 GitHub 获取最新版本";
    if (releaseDate) releaseDate.textContent = "发布信息以 GitHub 为准";
    if (releaseNotes) {
      releaseNotes.textContent = "";
      const paragraph = document.createElement("p");
      paragraph.className = "release-empty";
      paragraph.textContent = "暂时没能从 GitHub 读取更新说明，可以直接前往 Releases 页面查看完整变更与下载地址。";
      releaseNotes.appendChild(paragraph);
    }
    setDownloadUrl(LATEST_URL);
  };

  const readCache = () => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (!cached || !cached.savedAt || Date.now() - cached.savedAt > CACHE_TTL) return null;
      return cached.release;
    } catch (error) {
      return null;
    }
  };

  const writeCache = (release) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), release }));
    } catch (error) {
      /* 存储不可用时忽略 */
    }
  };

  const loadLatestRelease = async () => {
    const cached = readCache();
    if (cached) {
      renderRelease(cached);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!response.ok) throw new Error(`GitHub API ${response.status}`);

      const data = await response.json();
      if (!data || data.draft) throw new Error("no published release");

      renderRelease(data);
      writeCache(data);
    } catch (error) {
      renderFallback();
    }
  };

  loadLatestRelease();

  /* ---------- 页脚年份 ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
