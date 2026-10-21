(function () {
      "use strict";
      var track   = document.getElementById("slider-track");
      var caption = document.getElementById("slider-caption");
      var count   = document.getElementById("slider-count");
      var prev    = document.getElementById("slider-prev");
      var next    = document.getElementById("slider-next");
      var stage   = document.getElementById("slider-stage");

      if (!track || !prev || !next) return;

      var slides  = track.querySelectorAll(".wrr-slide");
      var total   = slides.length;
      var current = 0;

      function goTo(n) {
        current = ((n % total) + total) % total;
        track.style.transform = "translateX(-" + (current * 100) + "%)";
        var s = slides[current];
        var label = s.getAttribute("data-label") || "";
        var loc   = s.getAttribute("data-loc")   || "";
        // Build caption with DOM methods to avoid innerHTML with data attributes
        var strong = document.createElement("strong");
        strong.textContent = label;
        caption.textContent = "";
        caption.appendChild(strong);
        caption.appendChild(document.createTextNode(loc));
        count.textContent = (current + 1) + "\u00a0/\u00a0" + total;
      }

      prev.addEventListener("click", function () { goTo(current - 1); });
      next.addEventListener("click", function () { goTo(current + 1); });

      // Keyboard navigation — skip when a form control has focus
      stage.addEventListener("keydown", function (e) {
        var tag = document.activeElement && document.activeElement.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (e.key === "ArrowLeft")  { goTo(current - 1); }
        if (e.key === "ArrowRight") { goTo(current + 1); }
      });

      // Touch / swipe
      var touchStartX = null;
      stage.addEventListener("touchstart", function (e) {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      stage.addEventListener("touchend", function (e) {
        if (touchStartX === null) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        touchStartX = null;
        if (Math.abs(dx) < 40) return;
        goTo(dx < 0 ? current + 1 : current - 1);
      }, { passive: true });

      // Init
      goTo(0);
    })();
    