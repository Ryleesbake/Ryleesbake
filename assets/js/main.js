/* Rylee's Bake — page behavior. Class data lives in classes.js. */
(function () {
  "use strict";

  var TZ = "America/New_York";
  var types = window.RB_CLASS_TYPES || {};
  var info = window.RB_INFO || {};
  // Merge each date with its class type so cards have name, price, etc.
  var classes = (window.RB_CLASSES || []).map(function (c) {
    var t = types[c.type] || {};
    return Object.assign({}, t, c, { price: c.price != null ? c.price : t.price });
  });

  /* ---------- Dates ---------- */

  // Offset (in minutes) of Eastern time on a given day, e.g. -300 in winter.
  function easternOffset(y, m, d) {
    try {
      var probe = new Date(Date.UTC(y, m - 1, d, 12));
      var part = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "shortOffset" })
        .formatToParts(probe).find(function (p) { return p.type === "timeZoneName"; });
      var match = /GMT([+-]\d+)(?::(\d+))?/.exec(part && part.value);
      if (match) return parseInt(match[1], 10) * 60 + (match[2] ? Math.sign(parseInt(match[1], 10)) * parseInt(match[2], 10) : 0);
    } catch (e) { /* older browsers fall through */ }
    return m >= 4 && m <= 10 ? -240 : -300;
  }

  // Build a real Date for "YYYY-MM-DD" + "HH:MM" Eastern.
  function at(id, time) {
    var p = id.split("-").map(Number);
    var t = time.split(":").map(Number);
    var offset = easternOffset(p[0], p[1], p[2]);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2], t[0], t[1]) - offset * 60000);
  }

  function fmt(date, opts) {
    return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: TZ }, opts)).format(date);
  }
  function timeRange(c) {
    var o = { hour: "numeric", minute: "2-digit" };
    return fmt(at(c.id, c.start), o) + " – " + fmt(at(c.id, c.end), o);
  }
  function duration(c) {
    var mins = (at(c.id, c.end) - at(c.id, c.start)) / 60000;
    var h = Math.floor(mins / 60), half = mins % 60 >= 30;
    return "about " + h + (half ? "½" : "") + " hour" + (h === 1 && !half ? "" : "s");
  }
  function longDate(c) { return fmt(at(c.id, c.start), { weekday: "long", month: "long", day: "numeric" }); }
  function shortDate(c) { return fmt(at(c.id, c.start), { weekday: "short", month: "short", day: "numeric" }); }

  var now = new Date();
  var upcoming = classes
    // Bookable dates only: not yet ended, and has a Square link.
    .filter(function (c) { return c.checkout && at(c.id, c.end) > now; })
    .sort(function (a, b) { return at(a.id, a.start) - at(b.id, b.start); });

  /* ---------- Small helpers ---------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  var icon = {
    clock: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    seat: '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  };

  // Only a "Sold out" badge; open classes don't show a seat count.
  function spotsBadge(c) {
    return c.soldOut ? '<span class="badge badge--calm">Sold out</span>' : "";
  }

  /* ---------- Home page: class columns ---------- */

  var list = document.getElementById("class-list");
  var chev = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

  function classCard(c) {
    var start = at(c.id, c.start);
    var cta = c.soldOut
      ? '<a class="btn btn--ghost btn--small" href="mailto:' + esc(info.email) + "?subject=" + encodeURIComponent("Waitlist for " + c.name + ", " + shortDate(c)) + '">Join the waitlist</a>'
      : '<a class="btn btn--small" href="' + esc(c.checkout) + '" data-reserve="' + esc(c.type) + '" data-class="' + esc(c.id) + '"><span class="hide-sm">Reserve my spot</span><span class="show-sm">Reserve</span></a>';
    var bring = c.bringList && c.bringList.length
      ? "<ul>" + c.bringList.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" + (c.provided ? "<p>" + esc(c.provided) + "</p>" : "")
      : "<p>" + esc(c.bring || "") + "</p>";
    return (
      '<article class="class-card">' +
        '<div class="class-card__row">' +
          '<div class="cal" aria-hidden="true"><span class="cal__month">' + fmt(start, { month: "short" }) + '</span><span class="cal__day">' + fmt(start, { day: "numeric" }) + "</span></div>" +
          '<div class="class-card__info"><h4><span class="hide-sm">' + longDate(c) + '</span><span class="show-sm">' + shortDate(c) + "</span></h4>" +
          '<p class="class-card__time">' + timeRange(c) + (c.price != null ? ' · <strong>$' + esc(c.price) + "</strong><span class=\"hide-sm\"> per person</span>" : "") + "</p></div>" +
          (c.soldOut ? spotsBadge(c) : "") + cta +
        "</div>" +
        '<details class="class-card__more">' +
          "<summary>Class details " + chev + "</summary>" +
          '<div class="class-card__more-body">' +
            '<ul class="class-card__meta">' +
              "<li>" + icon.clock + timeRange(c) + " · " + duration(c) + "</li>" +
              "<li>" + icon.pin + "Clermont, FL · exact address on your confirmation page</li>" +
              "<li>" + icon.seat + "Small group, " + esc(c.capacity) + " students max</li>" +
            "</ul>" +
            (c.forWho ? '<p class="more-label">Who it\'s for</p><p>' + esc(c.forWho) + ".</p>" : "") +
            '<p class="more-label">What to bring</p>' + bring +
          "</div>" +
        "</details>" +
      "</article>"
    );
  }

  function classColumn(typeKey) {
    var t = types[typeKey] || {};
    var dates = upcoming.filter(function (c) { return c.type === typeKey; });
    var rest = dates.length - 1;
    var body = dates.length
      ? '<p class="next-label">Next class</p>' + classCard(dates[0]) +
        (rest > 0
          ? '<div class="class-col__more">' + dates.slice(1).map(classCard).join("") + "</div>" +
            '<button type="button" class="see-more" aria-expanded="false" data-more="' + rest + '">' +
              "See " + rest + " more date" + (rest === 1 ? "" : "s") + " " + chev + "</button>"
          : "")
      : '<div class="empty-state"><h4>New dates coming soon</h4><p>Follow <a href="' + esc(info.facebook) + '">Rylee\'s Bake on Facebook</a> to hear first.</p></div>';
    var from = t.price != null ? "$" + esc(t.price) + " · " : "";
    return (
      '<details class="class-col" id="dates-' + esc(typeKey) + '" open>' +
        '<summary class="class-col__head">' +
          '<span class="class-col__text">' +
            '<span class="class-card__name">' + esc(t.name || "") + "</span>" +
            '<span class="class-col__title">' + esc(t.title || "") + "</span>" +
            '<span class="class-col__for">' + from + esc(t.forWho || "") + "</span>" +
          "</span>" +
          '<span class="class-col__toggle btn btn--small"><span class="when-closed">See ' + dates.length + " date" + (dates.length === 1 ? "" : "s") + '</span><span class="when-open">Hide dates</span></span>' +
        "</summary>" +
        '<div class="class-col__cards">' + body + "</div>" +
      "</details>"
    );
  }

  if (list) {
    if (!upcoming.length) {
      list.innerHTML =
        '<div class="empty-state"><h3>New dates are on the way</h3>' +
        '<p>Follow along on <a href="' + esc(info.facebook) + '">Facebook</a> to hear first, or email ' +
        '<a href="mailto:' + esc(info.email) + '">' + esc(info.email) + "</a> to get on the list.</p></div>";
    } else {
      list.innerHTML = classColumn("101") + classColumn("201");
    }

    // Phones: both classes start collapsed so 101 and 201 are visible together.
    // Desktop: both columns stay open and the headers don't toggle.
    var mobile = window.matchMedia("(max-width: 820px)");
    var cols = list.querySelectorAll(".class-col");
    function setCols() { cols.forEach(function (d) { d.open = !mobile.matches; }); }
    setCols();
    if (mobile.addEventListener) mobile.addEventListener("change", setCols);
    list.addEventListener("click", function (ev) {
      if (!mobile.matches && ev.target.closest(".class-col__head")) ev.preventDefault();
      var more = ev.target.closest(".see-more");
      if (more) {
        var col = more.closest(".class-col");
        var showing = col.classList.toggle("show-all");
        var n = more.getAttribute("data-more");
        more.setAttribute("aria-expanded", showing ? "true" : "false");
        more.firstChild.textContent = showing ? "Show fewer dates " : "See " + n + " more date" + (n === "1" ? "" : "s") + " ";
      }
    });

    // 201 check before checkout
    var dlg = document.getElementById("confirm-201");
    if (dlg && typeof dlg.showModal === "function") {
      var go = dlg.querySelector("[data-continue]");
      list.addEventListener("click", function (ev) {
        var btn = ev.target.closest('[data-reserve="201"]');
        if (!btn) return;
        ev.preventDefault();
        var c = classes.filter(function (x) { return x.id === btn.getAttribute("data-class"); })[0];
        dlg.querySelector("[data-confirm-date]").textContent = c ? longDate(c) : "";
        go.href = btn.href;
        dlg.showModal();
      });
      dlg.querySelector("[data-see-101]").addEventListener("click", function () {
        dlg.close();
        var col = document.getElementById("dates-101");
        if (col) { col.open = true; col.classList.add("show-all"); }
        if (col) col.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      dlg.querySelector("[data-close]").addEventListener("click", function () { dlg.close(); });
      dlg.addEventListener("click", function (ev) { if (ev.target === dlg) dlg.close(); });
    }
  }

  // "Next class" pill in the hero
  var next = document.getElementById("next-class");
  var firstOpen = upcoming.filter(function (c) { return !c.soldOut; })[0];
  if (next && firstOpen) {
    next.querySelector("[data-next-text]").textContent =
      "Next class: " + shortDate(firstOpen) + " · " + firstOpen.name;
    next.hidden = false;
  }

  // Search-engine event listings for each upcoming class
  if (list && upcoming.length) {
    var events = upcoming.map(function (c) {
      var e = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: c.name + (c.title ? ": " + c.title : "") + " — Rylee's Bake",
        startDate: at(c.id, c.start).toISOString(),
        endDate: at(c.id, c.end).toISOString(),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        description: c.type === "201"
          ? "A hands-on sourdough discard class in Clermont, FL. Make cinnamon rolls, mix pizza dough to take home, taste discard appetizers and leave with a recipe bundle."
          : "A hands-on beginner sourdough class in Clermont, FL. Learn to feed a starter, mix, shape and bake, and take home your own dough, starter and kit.",
        image: [new URL("og-image.jpg", location.href).href],
        location: {
          "@type": "Place",
          name: "Rylee's Bake",
          address: { "@type": "PostalAddress", addressLocality: "Clermont", addressRegion: "FL", postalCode: "34715", addressCountry: "US" }
        },
        organizer: { "@type": "Organization", name: "Rylee's Bake", url: location.origin + location.pathname }
      };
      if (c.price != null) {
        e.offers = {
          "@type": "Offer", url: c.checkout, price: String(c.price), priceCurrency: "USD",
          availability: !c.soldOut ? "https://schema.org/InStock" : "https://schema.org/SoldOut"
        };
      }
      return e;
    });
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(events);
    document.head.appendChild(s);
  }

  /* ---------- Booked page ---------- */

  var booked = document.getElementById("booked-details");
  if (booked) {
    var wanted = new URLSearchParams(location.search).get("class");
    // Only show class-specific details when the Square redirect names the date.
    // Without ?class=, keep the page generic rather than guessing a date.
    var c = classes.filter(function (x) { return x.id === wanted; })[0];
    var a = info.address || {};
    var oneLine = a.street + ", " + a.city + ", " + a.state + " " + a.zip;

    if (c) {
      document.querySelector("[data-when]").textContent = longDate(c) + " · " + timeRange(c);
      document.querySelector("[data-class-name]").textContent = c.name + (c.title ? ": " + c.title : "");
      var bringEl = document.querySelector("[data-bring]");
      if (c.bringList && c.bringList.length) {
        var bl = document.querySelector("[data-bring-list]");
        c.bringList.forEach(function (item) {
          var li = document.createElement("li"); li.textContent = item; bl.appendChild(li);
        });
        bl.hidden = false; bringEl.hidden = true;
      } else {
        bringEl.textContent = c.bring || "";
      }
      if (c.provided) {
        var pv = document.querySelector("[data-provided]");
        pv.textContent = c.provided; pv.hidden = false;
      }
      var prepList = document.querySelector("[data-prep]");
      if (prepList && c.prep && c.prep.length) {
        c.prep.forEach(function (item) {
          var li = document.createElement("li"); li.textContent = item; prepList.appendChild(li);
        });
        document.querySelector("[data-prep-block]").hidden = false;
      }
      if (c.afterClass) document.querySelector("[data-after]").textContent = c.afterClass;
      var nextCard = document.querySelector("[data-next-class]");
      if (nextCard && c.type === "201") nextCard.hidden = true;
    }
    document.querySelector("[data-address]").textContent = oneLine;
    document.querySelector("[data-directions]").href =
      "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(oneLine);

    var gcal = document.querySelector("[data-gcal]");
    var ics = document.querySelector("[data-ics]");
    if (c) {
      var stamp = function (d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
      var s0 = stamp(at(c.id, c.start)), s1 = stamp(at(c.id, c.end));
      var title = c.name + " with Rylee's Bake";
      var details = "Hands-on sourdough class. What to bring: " + (c.bring || "just yourself") + " Questions: " + info.email;
      gcal.href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent(title) + "&dates=" + s0 + "/" + s1 +
        "&location=" + encodeURIComponent(oneLine) + "&details=" + encodeURIComponent(details);
      ics.addEventListener("click", function (ev) {
        ev.preventDefault();
        var body = [
          "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rylee's Bake//Class//EN", "BEGIN:VEVENT",
          "UID:" + c.id + "@ryleesbake", "DTSTAMP:" + stamp(new Date()), "DTSTART:" + s0, "DTEND:" + s1,
          "SUMMARY:" + title, "LOCATION:" + oneLine.replace(/,/g, "\\,"), "DESCRIPTION:" + details.replace(/,/g, "\\,"),
          "END:VEVENT", "END:VCALENDAR"
        ].join("\r\n");
        var url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
        var link = document.createElement("a");
        link.href = url; link.download = "ryleesbake-" + c.id + ".ics";
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    } else {
      gcal.hidden = true; ics.hidden = true;
    }
  }

  /* ---------- Shared ---------- */

  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    var nav = toggle.closest(".nav");
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("ul a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
