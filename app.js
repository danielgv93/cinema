/* ════════════════════════════════════════════
   CONFIGURATION — loaded from movies-config.json
   ════════════════════════════════════════════ */
let CONFIG = {};

/* ════════════ UTILITY FUNCTIONS ════════════ */

function avg(scores) {
    const vals = Object.values(scores);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function scoreClass(val) {
    if (val >= 8) return "high";
    if (val >= 6) return "mid";
    return "low";
}

function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/* ════════════ RENDER STATS BAR ════════════ */

function renderStats(movies) {
    const bar = document.getElementById("statsBar");
    const totalMovies = movies.length;
    const allAvgs = movies.map((m) => avg(m.scores));
    const globalAvg = (
        allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length
    ).toFixed(1);
    const best = movies.reduce((a, b) =>
        avg(a.scores) > avg(b.scores) ? a : b,
    );

    bar.innerHTML = `
    <div class="stat">
      <div class="stat-value">${totalMovies}</div>
      <div class="stat-label">Películas</div>
    </div>
    <div class="stat">
      <div class="stat-value">${globalAvg}</div>
      <div class="stat-label">Media global</div>
    </div>
    <div class="stat">
      <div class="stat-value">${CONFIG.members.length}</div>
      <div class="stat-label">Miembros</div>
    </div>
  `;
}

/* ════════════ RENDER CONTROLS ════════════ */

let currentSort = "recent";

function renderControls() {
    const controls = document.getElementById("controls");
    const sorts = [
        { id: "recent", label: "Recientes" },
        { id: "best", label: "Mejor puntuadas" },
        { id: "worst", label: "Peor puntuadas" },
        { id: "alpha", label: "A → Z" },
    ];

    controls.innerHTML = sorts
        .map(
            (s) =>
                `<button class="control-btn ${s.id === currentSort ? "active" : ""}" data-sort="${s.id}">${s.label}</button>`,
        )
        .join("");

    controls.querySelectorAll(".control-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            currentSort = btn.dataset.sort;
            renderControls();
            renderMovies(sortMovies(CONFIG.movies));
        });
    });
}

function sortMovies(movies) {
    const sorted = [...movies];
    switch (currentSort) {
        case "recent":
            return sorted.sort(
                (a, b) =>
                    new Date(b.date_watched) -
                    new Date(a.date_watched),
            );
        case "best":
            return sorted.sort(
                (a, b) => avg(b.scores) - avg(a.scores),
            );
        case "worst":
            return sorted.sort(
                (a, b) => avg(a.scores) - avg(b.scores),
            );
        case "alpha":
            return sorted.sort((a, b) =>
                a.title.localeCompare(b.title, "es"),
            );
        default:
            return sorted;
    }
}

/* ════════════ RENDER MOVIES ════════════ */

function renderMovies(movies) {
    const grid = document.getElementById("movieGrid");
    const ranked = [...movies].sort(
        (a, b) => avg(b.scores) - avg(a.scores),
    );

    grid.innerHTML = movies
        .map((movie, i) => {
            const average = avg(movie.scores);
            const sc = scoreClass(average);
            const rank =
                ranked.findIndex((m) => m.title === movie.title) +
                1;
            const voterCount = Object.keys(movie.scores).length;

            const membersHTML = Object.entries(movie.scores)
                .sort((a, b) => b[1] - a[1])
                .map(
                    ([name, val]) => `
        <div class="member-score">
          <span class="member-name">${name}</span>
          <div class="member-bar-track">
            <div class="member-bar-fill" style="width: ${val * 10}%; background: var(--${scoreClass(val) === "high" ? "green" : scoreClass(val) === "mid" ? "accent" : "red"})"></div>
          </div>
          <span class="member-val score-${scoreClass(val)}">${val}</span>
        </div>
      `,
                )
                .join("");

            return `
      <article class="movie-card" data-idx="${i}" style="animation-delay: ${i * 0.06}s">
        <div class="movie-poster">
          <img src="${movie.poster}" alt="${movie.title}" loading="lazy" width="300" height="450"
               onerror="this.parentElement.classList.add('poster-skeleton'); this.style.display='none';">
          <div class="rank-badge">#${rank}</div>
        </div>
        <div class="movie-info">
          <div class="movie-title" title="${movie.title}">${movie.title}</div>
          <div class="movie-meta">
            <span>${movie.year}</span>
            <span class="dot"></span>
            <span>${movie.director}</span>
          </div>
          <div class="movie-genres">
            ${movie.genres.map((g) => `<span class="genre-tag">${g}</span>`).join("")}
          </div>
          <div class="movie-score-row">
            <span class="avg-score score-${sc}">${average.toFixed(1)}</span>
            <div class="score-bar-track">
              <div class="score-bar-fill bar-${sc}" style="width: ${average * 10}%"></div>
            </div>
            <span class="score-voters">${voterCount} votos</span>
          </div>
        </div>
      </article>
      <div class="movie-detail" data-detail="${i}">
        <div class="detail-inner">
          <div class="detail-section-label">Desglose de puntuaciones</div>
          <div class="score-breakdown">${membersHTML}</div>
          <div class="detail-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Vista el ${formatDate(movie.date_watched)}
          </div>
        </div>
      </div>
    `;
        })
        .join("");

    // Toggle expand
    function closeDetail(d) {
        if (d.classList.contains("open")) {
            d.classList.remove("open");
            d.classList.add("closing");
            d.addEventListener(
                "animationend",
                () => {
                    d.classList.remove("closing");
                },
                { once: true },
            );
        }
    }

    grid.querySelectorAll(".movie-card").forEach((card) => {
        card.addEventListener("click", () => {
            const wasExpanded = card.classList.contains("expanded");
            grid.querySelectorAll(".movie-card").forEach((c) =>
                c.classList.remove("expanded"),
            );
            grid.querySelectorAll(".movie-detail").forEach((d) =>
                closeDetail(d),
            );
            if (!wasExpanded) {
                card.classList.add("expanded");
                const detail = card.nextElementSibling;
                if (
                    detail &&
                    detail.classList.contains("movie-detail")
                ) {
                    detail.classList.add("open");
                }
            }
        });
    });
}

/* ════════════ RENDER MEMBER RANKING ════════════ */

function renderRanking() {
    const section = document.getElementById("rankingSection");
    const memberAvgs = CONFIG.members
        .map((name) => {
            const scores = CONFIG.movies
                .map((m) => m.scores[name])
                .filter(Boolean);
            const memberAvg =
                scores.reduce((a, b) => a + b, 0) / scores.length;
            return { name, avg: memberAvg, count: scores.length };
        })
        .sort((a, b) => {
            if (isNaN(a.avg) && isNaN(b.avg)) return 0;
            if (isNaN(a.avg)) return 1;
            if (isNaN(b.avg)) return -1;
            return b.avg - a.avg;
        });

    section.innerHTML = `
    <h2 class="section-title">Ranking de miembros</h2>
    <div class="member-ranking">
      ${memberAvgs
          .map((m, i) => {
              const movieScores = CONFIG.movies
                  .filter((mv) => mv.scores[m.name] != null)
                  .map((mv) => ({ title: mv.title, score: mv.scores[m.name] }))
                  .sort((a, b) => b.score - a.score);
              const moviesHTML = movieScores
                  .map(
                      (ms) => `
                      <div class="member-movie-row">
                        <span class="member-movie-title">${ms.title}</span>
                        <span class="member-movie-score score-${scoreClass(ms.score)}">${ms.score.toFixed(1)}</span>
                      </div>`,
                  )
                  .join("");
              return `
        <div class="member-rank-item">
          <div class="member-rank-row" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
            <span class="member-rank-pos">${i + 1}</span>
            <span class="member-rank-name">${m.name}</span>
            <span class="member-rank-count">${m.count} ${m.count === 1 ? "peli" : "pelis"}</span>
            <span class="member-rank-avg${m.count === 0 ? "" : ` score-${scoreClass(m.avg)}`}">${m.count === 0 ? "Sin votos" : m.avg.toFixed(1)}</span>
            <span class="member-rank-chevron">▼</span>
          </div>
          <div class="member-detail-panel">
            <div class="member-detail-inner">
              ${moviesHTML || '<span style="color:var(--text-muted);font-size:0.78rem">Sin votos aún</span>'}
            </div>
          </div>
        </div>`;
          })
          .join("")}
    </div>
  `;
}

/* ════════════ INIT ════════════ */

fetch("movies-config.json")
    .then((res) => {
        const lastMod = res.headers.get("Last-Modified");
        return res.json().then((data) => ({ data, lastMod }));
    })
    .then(({ data, lastMod }) => {
        CONFIG = data;
        renderStats(CONFIG.movies);
        renderControls();
        renderMovies(sortMovies(CONFIG.movies));
        renderRanking();

        if (lastMod) {
            const d = new Date(lastMod);
            const formatted = d.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }) + " · " + d.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
            });
            document.getElementById("lastUpdated").className = "last-updated";
            document.getElementById("lastUpdated").textContent =
                "Puntuaciones actualizadas: " + formatted;
        }
    })
    .catch((err) =>
        console.error("Error loading movies-config.json:", err),
    );
