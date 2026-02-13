fetch("menu.json")
  .then(res => res.json())
  .then(data => {
    const menu = document.getElementById("menu");

    data.categories.forEach(category => {
      const section = document.createElement("div");
      section.className = "category";

      const title = document.createElement("h2");
      title.textContent = category.name;

      const itemsWrapper = document.createElement("div");
      itemsWrapper.className = "items";

      category.items.forEach(item => {
        const card = document.createElement("div");
        card.className = "item";

        card.innerHTML = `
  <img src="${item.image}" alt="${item.name}">
  <div class="item-name">${item.name}</div>
  <div class="price">₺${item.price}</div>
`;


        itemsWrapper.appendChild(card);
      });

      section.appendChild(title);
      section.appendChild(itemsWrapper);
      menu.appendChild(section);
    });

    // reveal animation
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll(".category").forEach(sec => observer.observe(sec));
  });
