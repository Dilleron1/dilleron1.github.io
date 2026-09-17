/**
 * render.js — собирает карточку профиля из window.PROFILE.
 * Текстовые значения вставляются через textContent (без ручного экранирования).
 */
window.Render = (function () {
  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var node = byId(id);
    if (node) node.textContent = value;
  }

  function applyHead(profile) {
    var title = profile.name + " — bio";
    document.title = title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", profile.bio ? profile.bio.replace(/<[^>]+>/g, " ") : title);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    var ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && profile.avatar) ogImage.setAttribute("content", profile.avatar);
  }

  function applyHero(profile) {
    var avatar = byId("avatar");
    if (avatar) {
      avatar.src = profile.avatar || avatar.src;
      avatar.alt = "Аватар " + profile.name;
    }

    var status = byId("avatar-status");
    if (status) {
      var state = profile.status || "online";
      status.setAttribute("data-status", state);
      status.title = state;
    }

    setText("display-name", profile.displayName || profile.name);
    setText("handle", profile.handle || "@" + profile.name);

    var badge = byId("badge");
    if (badge) badge.classList.toggle("is-hidden", profile.verified === false);
  }

  function applyBio(profile) {
    var bio = byId("bio");
    if (!bio) return;
    if (profile.bio) {
      bio.innerHTML = profile.bio;
      bio.hidden = false;
    } else {
      bio.hidden = true;
    }
  }

  function buildFacts(profile) {
    var list = byId("facts");
    if (!list) return;
    list.innerHTML = "";
    var facts = profile.facts || [];
    facts.forEach(function (fact) {
      var item = el("li", "facts__item");
      var label = el("span", "facts__label");
      label.textContent = fact.label;
      var value = el("span", "facts__value");
      value.textContent = fact.value;
      item.appendChild(label);
      item.appendChild(value);
      list.appendChild(item);
    });
    list.hidden = facts.length === 0;
  }

  function buildSocials(profile) {
    var list = byId("socials");
    if (!list) return;
    list.innerHTML = "";
    (profile.socials || []).forEach(function (social) {
      var item = el("li");
      var link = el("a", "social");
      link.href = social.url || "#";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", social.label || social.icon);
      link.title = social.label || social.icon;
      link.dataset.copy = social.copy || "";
      link.dataset.label = social.label || social.icon;
      link.innerHTML = window.Icons.get(social.icon);
      link.dataset.reveal = "";
      item.appendChild(link);
      list.appendChild(item);
    });
  }

  function buildLinks(profile) {
    var list = byId("links");
    if (!list) return;
    list.innerHTML = "";
    (profile.links || []).forEach(function (entry) {
      var item = el("li");

      var node = entry.url ? el("a", "link") : el("button", "link");
      node.classList.toggle("link--accent", entry.accent === true);
      node.dataset.copy = entry.copy || "";
      node.dataset.label = entry.label || "";

      if (entry.url) {
        node.href = entry.url;
        node.target = "_blank";
        node.rel = "noopener noreferrer";
      } else {
        node.type = "button";
      }

      var iconBox = el("span", "link__icon");
      iconBox.innerHTML = window.Icons.get(entry.icon);

      var text = el("span", "link__text");
      var label = el("span", "link__label");
      label.textContent = entry.label || "";
      var sub = el("span", "link__sub");
      sub.textContent = entry.sub || entry.url || "скопировать";
      text.appendChild(label);
      text.appendChild(sub);

      var action = el("span", "link__action");
      action.innerHTML = window.Icons.get(entry.url ? "arrow" : "copy");

      node.appendChild(iconBox);
      node.appendChild(text);
      node.appendChild(action);
      item.appendChild(node);
      list.appendChild(item);
    });
  }

  function buildStats(profile) {
    var list = byId("stats");
    if (!list) return { values: {}, nodes: {} };

    list.innerHTML = "";
    var refs = { values: {}, nodes: {} };

    (profile.stats || []).forEach(function (stat) {
      var item = el("li", "stat");
      item.dataset.statId = stat.id;

      if (stat.interactive) {
        item.classList.add("stat--button");
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
      }

      var iconBox = el("span", "stat__icon");
      iconBox.innerHTML = window.Icons.get(stat.icon);

      var value = el("span", "stat__value");
      value.textContent = stat.value === null || stat.value === undefined ? "—" : stat.value;

      var label = el("span", "stat__label");
      label.textContent = stat.label || "";

      item.appendChild(iconBox);
      item.appendChild(value);
      item.appendChild(label);
      list.appendChild(item);

      refs.values[stat.id] = value;
      refs.nodes[stat.id] = item;
    });

    return refs;
  }

  function fill(profile) {
    applyHead(profile);
    applyHero(profile);
    applyBio(profile);
    buildFacts(profile);
    buildSocials(profile);
    buildLinks(profile);
    return buildStats(profile);
  }

  function markReady() {
    window.requestAnimationFrame(function () {
      document.body.classList.add("is-ready");
    });
  }

  return { fill: fill, markReady: markReady };
})();
