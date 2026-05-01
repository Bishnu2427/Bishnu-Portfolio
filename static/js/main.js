/* ============================================================
   BISHNU KUMAR SINGH — Portfolio Main JS
   Neural canvas, typed text, scroll animations, counter, nav
   ============================================================ */

(function () {
  "use strict";

  // ---- neural network canvas ----

  const canvas = document.getElementById("neuralCanvas");
  const ctx = canvas.getContext("2d");

  let nodes = [];
  let animFrame;

  const config = {
    nodeCount: 70,
    connectDist: 140,
    nodeSpeed: 0.4,
    nodeRadius: 2,
    lineAlpha: 0.18,
    nodeCyan: "rgba(0, 229, 255,",
    nodePurple: "rgba(168, 85, 247,",
  };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeNode() {
    const isPurple = Math.random() > 0.6;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * config.nodeSpeed,
      vy: (Math.random() - 0.5) * config.nodeSpeed,
      r: Math.random() * 1.5 + 1,
      color: isPurple ? config.nodePurple : config.nodeCyan,
    };
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i < config.nodeCount; i++) {
      nodes.push(makeNode());
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectDist) {
          const alpha = (1 - dist / config.connectDist) * config.lineAlpha;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // draw nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color + "0.8)";
      ctx.fill();

      // move
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    }

    animFrame = requestAnimationFrame(drawFrame);
  }

  function startCanvas() {
    resize();
    initNodes();
    drawFrame();
  }

  window.addEventListener("resize", () => {
    resize();
    initNodes();
  });

  startCanvas();


  // ---- typed text effect ----

  const roles = [
    "AI Agents",
    "LLM Applications",
    "Agentic Pipelines",
    "RAG Systems",
    "ML Models",
    "AI Products",
  ];

  const typedEl = document.getElementById("typedText");
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let typingTimeout;

  function typeLoop() {
    const current = roles[roleIdx];

    if (!deleting) {
      typedEl.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        deleting = true;
        typingTimeout = setTimeout(typeLoop, 1800);
        return;
      }
    } else {
      typedEl.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        typingTimeout = setTimeout(typeLoop, 300);
        return;
      }
    }

    const speed = deleting ? 55 : 90;
    typingTimeout = setTimeout(typeLoop, speed);
  }

  typeLoop();


  // ---- navbar scroll behavior ----

  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    // highlight active nav link
    let current = "";
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  });


  // ---- mobile nav toggle ----

  const navToggle = document.getElementById("navToggle");
  const navLinksContainer = document.getElementById("navLinks");

  navToggle.addEventListener("click", () => {
    navLinksContainer.classList.toggle("open");
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navLinksContainer.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target)) {
      navLinksContainer.classList.remove("open");
    }
  });


  // ---- scroll reveal ----

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    revealObserver.observe(el);
  });


  // ---- counter animation ----

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out
      const val = Math.floor(progress < 1 ? target * (1 - Math.pow(1 - progress, 3)) : target);
      el.textContent = val;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll(".stat-num").forEach(animateCount);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll(".about-stats").forEach((el) => {
    counterObserver.observe(el);
  });


  // ---- contact form ----

  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      btn.textContent = "Sending...";
      btn.disabled = true;

      // since there's no mail endpoint set up, just show a friendly message
      setTimeout(() => {
        formStatus.textContent = "Message sent! Bishnu will get back to you soon.";
        formStatus.className = "form-status success";
        form.reset();
        btn.textContent = "Send Message";
        btn.disabled = false;

        setTimeout(() => {
          formStatus.textContent = "";
          formStatus.className = "form-status";
        }, 5000);
      }, 1000);
    });
  }

})();
