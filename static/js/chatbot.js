/* ============================================================
   BISHNU'S BUDDY — Chatbot JS
   ============================================================ */

(function () {
  "use strict";

  const toggleBtn = document.getElementById("chatToggle");
  const chatWindow = document.getElementById("chatWindow");
  const closeBtn = document.getElementById("chatClose");
  const messagesContainer = document.getElementById("chatMessages");
  const inputEl = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSend");

  let sessionId = null;
  let isBotTyping = false;

  // grab or create session id for this visit
  sessionId = sessionStorage.getItem("buddy_session") || crypto.randomUUID();
  sessionStorage.setItem("buddy_session", sessionId);


  // ---- toggle open/close ----

  toggleBtn.addEventListener("click", () => {
    const isOpen = chatWindow.classList.contains("open");
    chatWindow.classList.toggle("open", !isOpen);
    toggleBtn.classList.toggle("open", !isOpen);
    if (!isOpen) {
      setTimeout(() => inputEl.focus(), 300);
    }
  });

  closeBtn.addEventListener("click", () => {
    chatWindow.classList.remove("open");
    toggleBtn.classList.remove("open");
  });


  // ---- suggestion chips ----

  messagesContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("suggestion-chip")) {
      const msg = e.target.dataset.msg;
      if (msg) {
        // remove all chips after click so it doesn't clutter
        const chipsEl = messagesContainer.querySelector(".chat-suggestions");
        if (chipsEl) chipsEl.remove();
        sendMessage(msg);
      }
    }
  });


  // ---- send on enter ----

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isBotTyping) {
      e.preventDefault();
      handleSend();
    }
  });

  sendBtn.addEventListener("click", () => {
    if (!isBotTyping) handleSend();
  });


  function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = "";
    sendMessage(text);
  }


  function sendMessage(text) {
    appendMessage("user", text);
    showTyping();
    isBotTyping = true;
    sendBtn.disabled = true;

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, session_id: sessionId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        removeTyping();
        appendMessage("bot", data.response);
        if (data.session_id) {
          sessionId = data.session_id;
          sessionStorage.setItem("buddy_session", sessionId);
        }
      })
      .catch(() => {
        removeTyping();
        appendMessage("bot", "Oops — something broke on my end. Give it another shot!");
      })
      .finally(() => {
        isBotTyping = false;
        sendBtn.disabled = false;
        inputEl.focus();
      });
  }


  function appendMessage(role, text) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("chat-msg", role === "bot" ? "bot-msg" : "user-msg");

    if (role === "bot") {
      const avatar = document.createElement("div");
      avatar.className = "msg-avatar";
      avatar.textContent = "🤖";
      wrapper.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.innerHTML = formatText(text);

    wrapper.appendChild(bubble);
    messagesContainer.appendChild(wrapper);
    scrollToBottom();
  }


  function showTyping() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("chat-msg", "bot-msg", "typing-indicator");
    wrapper.id = "typingIndicator";

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = "🤖";

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      dot.className = "typing-dot";
      bubble.appendChild(dot);
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    messagesContainer.appendChild(wrapper);
    scrollToBottom();
  }


  function removeTyping() {
    const indicator = document.getElementById("typingIndicator");
    if (indicator) indicator.remove();
  }


  function scrollToBottom() {
    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: "smooth" });
  }


  // format basic markdown-ish: **bold**, bullet lines starting with -
  function formatText(text) {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>");

    // convert lines starting with - or * into bullet list
    const lines = html.split("\n");
    let inList = false;
    const result = [];

    for (const line of lines) {
      const isBullet = /^[-•]\s/.test(line.trim());
      if (isBullet) {
        if (!inList) {
          result.push("<ul>");
          inList = true;
        }
        result.push(`<li>${line.replace(/^[-•]\s/, "").trim()}</li>`);
      } else {
        if (inList) {
          result.push("</ul>");
          inList = false;
        }
        if (line.trim()) {
          result.push(`<p>${line}</p>`);
        }
      }
    }

    if (inList) result.push("</ul>");
    return result.join("");
  }

})();
