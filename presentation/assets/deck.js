/* Mini presentation engine: ←/→ or space, N = notes, T = timer, F = fullscreen */
(function () {
  const slides = [...document.querySelectorAll(".slide")];
  let i = 0, t0 = null, timerOn = true;
  const bar = document.getElementById("bar"), cnt = document.getElementById("cnt"),
        clock = document.getElementById("clock"), notes = document.getElementById("notes");
  const total = slides.reduce((s, x) => s + (+x.dataset.min || 0), 0);

  function typeEl(el) {
    const txt = el.dataset.text; el.textContent = ""; el.classList.add("caret"); let k = 0;
    clearInterval(el._t);
    el._t = setInterval(() => { el.textContent = txt.slice(0, ++k); if (k >= txt.length) clearInterval(el._t); }, 35);
  }
  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0); let v = 0;
    clearInterval(el._c);
    el._c = setInterval(() => { v += to / 40; if (v >= to) { v = to; clearInterval(el._c); } el.textContent = v.toFixed(dec) + (el.dataset.suffix || ""); }, 25);
  }
  function show(n, back) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, k) => { s.classList.toggle("active", k === i); s.classList.toggle("past", k < i); });
    const s = slides[i];
    s.querySelectorAll(".step").forEach(e => e.classList.remove("show"));
    if (back) s.querySelectorAll(".step").forEach(e => e.classList.add("show"));
    s.querySelectorAll("[data-text]").forEach(typeEl);
    s.querySelectorAll("[data-count]").forEach(countUp);
    bar.style.width = ((i + 1) / slides.length * 100) + "%";
    const planned = slides.slice(0, i + 1).reduce((a, x) => a + (+x.dataset.min || 0), 0);
    cnt.textContent = `${i + 1}/${slides.length} · cible ${planned.toFixed(1)}/${total} min`;
    notes.innerHTML = s.querySelector("template") ? s.querySelector("template").innerHTML : "<i>(pas de notes)</i>";
    history.replaceState(null, "", "#" + (i + 1));
  }
  function next() {
    const hid = slides[i].querySelector(".step:not(.show)");
    if (hid) { hid.classList.add("show"); return; }
    show(i + 1);
  }
  function prev() { show(i - 1, true); }
  addEventListener("keydown", e => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ""))) return;   // ne pas naviguer pendant la saisie
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); if (!t0) t0 = Date.now(); next(); }
    else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) prev();
    else if (e.key === "Home") show(0); else if (e.key === "End") show(slides.length - 1);
    else if (e.key.toLowerCase() === "n") notes.classList.toggle("on");
    else if (e.key.toLowerCase() === "t") { timerOn = !timerOn; clock.style.visibility = timerOn ? "visible" : "hidden"; }
    else if (e.key.toLowerCase() === "f") document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  });
  document.getElementById("nextBtn").onclick = next;
  document.getElementById("prevBtn").onclick = prev;
  setInterval(() => {
    if (!t0) return; const s = Math.floor((Date.now() - t0) / 1000);
    clock.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }, 500);
  /* bars from data */
  document.querySelectorAll(".bar[data-v]").forEach(b => {
    const v = b.dataset.v;
    if (v === "" || v === "null") { b.classList.add("na"); b.style.setProperty("--v", "100%"); b.querySelector(".val").textContent = "to measure"; }
    else { b.style.setProperty("--v", v + "%"); b.querySelector(".val").textContent = v + "%"; }
  });
  show(+location.hash.slice(1) - 1 || 0);
})();
