// portfolio main — neural canvas, typed text, nav, scroll fx, counters, contact

(function () {

  // ---- cursor glow ----
  var glow = document.getElementById("cursorGlow");
  if (glow && window.matchMedia("(hover: hover)").matches) {
    window.addEventListener("mousemove", function (e) {
      glow.style.left = e.clientX + "px";
      glow.style.top  = e.clientY + "px";
    }, { passive: true });
  }

  // ---- neural canvas ----

  var canvas = document.getElementById("neuralCanvas");
  var ctx = canvas.getContext("2d");
  var nodes = [];

  var NUM_NODES = 65;
  var LINK_DIST = 130;
  var SPEED = 0.38;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeNode() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 1.4 + 0.8,
      // mix of blue and teal nodes
      isTeal: Math.random() > 0.55
    };
  }

  function initNodes() {
    nodes = [];
    for (var i = 0; i < NUM_NODES; i++) nodes.push(makeNode());
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[i].x - nodes[j].x;
        var dy = nodes[i].y - nodes[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);

        if (d < LINK_DIST) {
          var alpha = (1 - d / LINK_DIST) * 0.16;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = "rgba(59,114,255," + alpha + ")";
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.isTeal ? "rgba(45,212,191,0.75)" : "rgba(59,114,255,0.75)";
      ctx.fill();

      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    }

    requestAnimationFrame(draw);
  }

  resize();
  initNodes();
  draw();

  window.addEventListener("resize", function () {
    resize();
    initNodes();
  });


  // ---- typed text ----

  var roles = [
    "AI Agents",
    "LLM Applications",
    "RAG Pipelines",
    "Agentic Systems",
    "ML Models",
    "AI Products"
  ];

  var typedEl = document.getElementById("typedText");
  var ri = 0, ci = 0, deleting = false;

  function type() {
    var word = roles[ri];

    if (!deleting) {
      typedEl.textContent = word.slice(0, ci + 1);
      ci++;
      if (ci === word.length) {
        deleting = true;
        setTimeout(type, 1700);
        return;
      }
    } else {
      typedEl.textContent = word.slice(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        setTimeout(type, 280);
        return;
      }
    }

    setTimeout(type, deleting ? 52 : 88);
  }

  type();


  // ---- navbar ----

  var navbar = document.getElementById("navbar");
  var navToggle = document.getElementById("navToggle");
  var navLinksEl = document.getElementById("navLinks");
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", function () {
    navbar.classList.toggle("scrolled", window.scrollY > 55);

    var current = "";
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 130) {
        current = sec.id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }, { passive: true });

  navToggle.addEventListener("click", function () {
    var open = navLinksEl.classList.toggle("open");
    navToggle.classList.toggle("active", open);
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      navLinksEl.classList.remove("open");
      navToggle.classList.remove("active");
    });
  });

  document.addEventListener("click", function (e) {
    if (!navbar.contains(e.target)) {
      navLinksEl.classList.remove("open");
      navToggle.classList.remove("active");
    }
  });


  // ---- scroll reveal ----

  var revealEls = document.querySelectorAll(".reveal");

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  revealEls.forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 75 + "ms";
    observer.observe(el);
  });


  // ---- counter animation ----

  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    var start = performance.now();
    var dur = 1300;

    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  var statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".stat-num").forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  var statsEl = document.querySelector(".about-stats");
  if (statsEl) statsObserver.observe(statsEl);


  // ---- proficiency bars ----
  var profObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".prof-fill").forEach(function (bar) {
          bar.style.width = bar.dataset.pct + "%";
        });
        profObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  var profWrap = document.querySelector(".prof-wrap");
  if (profWrap) profObserver.observe(profWrap);


  // ---- contact form ----

  var form = document.getElementById("contactForm");
  var statusEl = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var btn = form.querySelector("button[type=submit]");
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var subject = form.subject.value.trim() || "Portfolio Inquiry";
      var message = form.message.value.trim();

      btn.textContent = "Sending...";
      btn.disabled = true;

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.error) throw new Error(data.error);
          statusEl.textContent = "Message sent! Bishnu will get back to you soon. 🙌";
          statusEl.className = "form-status success";
          form.reset();
        })
        .catch(function (err) {
          statusEl.textContent = err.message || "Something went wrong. Try emailing directly.";
          statusEl.className = "form-status error";
        })
        .finally(function () {
          btn.textContent = "Send Message";
          btn.disabled = false;
          setTimeout(function () {
            statusEl.textContent = "";
            statusEl.className = "form-status";
          }, 6000);
        });
    });
  }

})();
