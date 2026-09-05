(function () {
  const menu = document.getElementById("menu");
  const searchInput = document.getElementById("search-input");
  const noResults = document.getElementById("no-results");
  const navLinks = Array.from(document.querySelectorAll("#menu-nav a"));

  const modal = document.getElementById("item-modal");
  const modalImage = document.getElementById("modal-image");
  const modalTitle = document.getElementById("modal-title");
  const modalPrice = document.getElementById("modal-price");
  let lastFocusedEl = null;

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

  fetch("menu.json")
    .then((res) => res.json())
    .then((data) => {
      data.categories.forEach((category) => {
        const section = document.createElement("section");
        section.className = "category";
        section.id = category.id;

        const head = document.createElement("div");
        head.className = "category-head";
        head.innerHTML = `<h2>${category.name}</h2><span class="category-count">${category.items.length} çeşit</span>`;

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
          img.src = item.image;
          img.alt = item.name;
          img.loading = "lazy";
          img.decoding = "async";
          img.addEventListener("error", () => {
            imgWrap.classList.add("no-photo");
            img.remove();
          });
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
