(function () {
  const menu = document.getElementById("menu");
  const searchInput = document.getElementById("search-input");
  const noResults = document.getElementById("no-results");
  const navLinks = Array.from(document.querySelectorAll("#menu-nav a"));
  const scrollTopBtn = document.getElementById("scroll-top");

  const modal = document.getElementById("item-modal");
  const modalImage = document.getElementById("modal-image");
  const modalTitle = document.getElementById("modal-title");
  const modalPrice = document.getElementById("modal-price");
  let lastFocusedEl = null;

  // Simple, meaningful line-icons per category — not decoration, they help scanning.
  const CATEGORY_ICONS = {
    durum: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12c0-4 3-8 9-8 5 0 7 3 7 6s-2 5-6 5H8c-2 0-4 1-4 3"/><path d="M4 12h13"/></svg>',
    double: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 9c0-3 2.5-6 7-6 4 0 5.5 2.5 5.5 5s-1.5 4-4.5 4H5c-1.5 0-3 .8-3 2.3"/><path d="M9 15c0-3 2.5-6 7-6 4 0 5.5 2.5 5.5 5s-1.5 4-4.5 4h-5.5c-1.5 0-3 .8-3 2.3"/></svg>',
    karisik: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="4" y1="20" x2="20" y2="4"/><circle cx="8" cy="16" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.4" fill="currentColor" stroke="none"/><line x1="20" y1="20" x2="4" y2="4"/><circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none"/></svg>',
    kampanyalar: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/></svg>',
  };

  function openModal(item) {
    lastFocusedEl = document.activeElement;
    modalImage.innerHTML = "";
    if (item.image) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      img.loading = "eager";
      modalImage.appendChild(img);
    }
    modalTitle.textContent = item.name;
    modalPrice.textContent = "₺" + item.price;
    modal.hidden = false;
    modal.querySelector(".item-modal-close").focus();
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  modal.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  // ---- scroll-to-top button ----
  window.addEventListener("scroll", () => {
    scrollTopBtn.hidden = window.scrollY < 600;
  });
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  fetch("menu.json")
    .then((res) => res.json())
    .then((data) => {
      data.categories.forEach((category) => {
        const section = document.createElement("section");
        section.className = "category";
        section.id = category.id;

        const head = document.createElement("div");
        head.className = "category-head";
        const iconSvg = CATEGORY_ICONS[category.id] || "";
        head.innerHTML = `<span class="category-icon">${iconSvg}</span><h2>${category.name}</h2><span class="category-count">${category.items.length} çeşit</span>`;

        const itemsWrapper = document.createElement("div");
        itemsWrapper.className = "items";

        category.items.forEach((item) => {
          const card = document.createElement("div");
          card.className = "item";
          card.tabIndex = 0;
          card.setAttribute("role", "button");
          card.setAttribute("aria-label", `${item.name}, ${item.price} lira, detay için aç`);
          card.dataset.name = item.name.toLocaleLowerCase("tr");

          const imgWrap = document.createElement("div");
          imgWrap.className = "item-image-wrap";

          const img = document.createElement("img");
          img.alt = item.name;
          img.loading = "lazy";
          img.decoding = "async";

          let retried = false;
          img.addEventListener("load", () => {
            img.classList.add("loaded");
            imgWrap.classList.add("loaded");
          });
          img.addEventListener("error", () => {
            if (!retried) {
              // Mobile networks can drop a request mid-flight; one silent retry
              // avoids showing a broken-image icon for what is often a transient blip.
              retried = true;
              setTimeout(() => {
                img.src = item.image + "?retry=1";
              }, 700);
            } else {
              imgWrap.classList.add("no-photo");
              img.remove();
            }
          });
          img.src = item.image;
          imgWrap.appendChild(img);

          const name = document.createElement("div");
          name.className = "item-name";
          name.textContent = item.name;

          const price = document.createElement("div");
          price.className = "price";
          price.textContent = "₺" + item.price;

          card.appendChild(imgWrap);
          card.appendChild(name);
          card.appendChild(price);

          const openThis = () => openModal(item);
          card.addEventListener("click", openThis);
          card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openThis();
            }
          });

          itemsWrapper.appendChild(card);
        });

        section.appendChild(head);
        section.appendChild(itemsWrapper);
        menu.appendChild(section);
      });

      // ---- reveal animation ----
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("show");
          });
        },
        { threshold: 0.15 }
      );
      document.querySelectorAll(".category").forEach((sec) => revealObserver.observe(sec));

      // ---- scroll-spy active nav ----
      const sections = Array.from(document.querySelectorAll(".category"));
      const spyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              navLinks.forEach((link) => {
                link.classList.toggle("active", link.dataset.target === entry.target.id);
              });
            }
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach((sec) => spyObserver.observe(sec));

      // ---- search ----
      let debounceTimer;
      searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => filterMenu(searchInput.value), 120);
      });

      function filterMenu(rawQuery) {
        const query = rawQuery.trim().toLocaleLowerCase("tr");
        let anyVisible = false;

        document.querySelectorAll(".category").forEach((section) => {
          let categoryHasMatch = false;
          section.querySelectorAll(".item").forEach((card) => {
            const matches = !query || card.dataset.name.includes(query);
            card.classList.toggle("hidden-by-search", !matches);
            if (matches) categoryHasMatch = true;
          });
          section.hidden = !categoryHasMatch;
          if (categoryHasMatch) anyVisible = true;
        });

        noResults.hidden = anyVisible;
      }
    })
    .catch((err) => {
      menu.innerHTML = `<p style="text-align:center;color:#a89a89;padding:40px 20px;">Menü yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</p>`;
      console.error(err);
    });
})();
