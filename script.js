fetch("menu.json")
  .then(response => response.json())
  .then(data => {
    const menuDiv = document.getElementById("menu");

    data.categories.forEach(category => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "category";

      categoryDiv.innerHTML = `<h2>${category.name}</h2>`;

      category.items.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "item";

        itemDiv.innerHTML = `
          <img src="${item.image}" alt="${item.name}">
          <div class="item-info">
            <div>${item.name}</div>
            <div class="price">₺${item.price}</div>
          </div>
        `;

        categoryDiv.appendChild(itemDiv);
      });

      menuDiv.appendChild(categoryDiv);
    });
  });
