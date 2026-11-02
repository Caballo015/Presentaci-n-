/* =========================================================
   Jorge Luis Alfonso Valdés — Portfolio prototype script
   ========================================================= */

(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Pause SMIL animations (antennas) when reduced motion ---------- */
  if (prefersReduced) {
    document.querySelectorAll("svg").forEach((svg) => {
      if (typeof svg.pauseAnimations === "function") svg.pauseAnimations();
    });
  }

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll(".nav-links a[href^='#']");
  if (sections.length && links.length && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.id;
            links.forEach((l) =>
              l.classList.toggle("active", l.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window && !prefersReduced) {
    const ro = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            ro.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => ro.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Particle network (hero) ---------- */
  const canvas = document.getElementById("net");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1;
    const particles = [];
    const COUNT = 72;
    const LINK = 130;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.8,
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      // update
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 90 && dist > 0) {
          const f = (90 - dist) / 90 * 0.6;
          p.x += (dx / dist) * f;
          p.y += (dy / dist) * f;
        }
      }
      // links
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * 0.35;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(45,212,191,${alpha})`);
            grad.addColorStop(1, `rgba(56,189,248,${alpha * 0.7})`);
            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(45,212,191,0.85)";
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }

    let raf = 0;
    let running = true;
    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    init();
    raf = requestAnimationFrame(step);

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        init();
      }, 150);
    });

    const hero = canvas.parentElement;
    const heroObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? start() : stop()));
      },
      { threshold: 0 }
    );
    heroObs.observe(hero);

    window.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    window.addEventListener("mouseleave", () => {
      mouse.x = -9999; mouse.y = -9999;
    });
  }

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    const success = document.getElementById("form-success");
    const toast = document.getElementById("toast");
    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("show");
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.remove("show"), 3200);
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));
      const name = form.querySelector("#f-name");
      const email = form.querySelector("#f-email");
      const msg = form.querySelector("#f-msg");
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name.value.trim() || name.value.trim().length < 2) {
        name.closest(".field").classList.add("invalid"); valid = false;
      }
      if (!emailRe.test(email.value.trim())) {
        email.closest(".field").classList.add("invalid"); valid = false;
      }
      if (!msg.value.trim() || msg.value.trim().length < 10) {
        msg.closest(".field").classList.add("invalid"); valid = false;
      }
      if (!valid) {
        showToast("Revisa los campos marcados.");
        return;
      }
      // Prototype: build mailto and open client
      const subject = encodeURIComponent("Contacto desde portfolio — " + name.value.trim());
      const body = encodeURIComponent(msg.value.trim() + "\n\n— " + name.value.trim() + " (" + email.value.trim() + ")");
      const mailto = "mailto:lalfonso6587@gmail.com?subject=" + subject + "&body=" + body;
      if (success) {
        success.textContent = "Mensaje listo. Se abrirá tu cliente de correo para enviarlo.";
        success.classList.add("show");
      }
      showToast("Abriendo tu cliente de correo…");
      window.location.href = mailto;
      form.reset();
    });
  }

  /* ---------- Year ---------- */
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
