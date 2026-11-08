
/* =========================================
   PANEL & PARCEL — SHOP & CART JAVASCRIPT
   ========================================= */

/* PRODUCT INVENTORY */

const products = [
  {
    name: "Fae Realm Character Graphic Tee",
    category: "Apparel",
    price: 24.99,
    image: "character-tee.jpg",
    description: "A comfortable graphic T-shirt featuring original artwork of a character from my webtoon.",
    symbol: "✶"
  },
  {
    name: "Fae Realm Character Hoodie",
    category: "Apparel",
    price: 44.99,
    image: "character-hoodie.jpg",
    description: "A soft pullover hoodie featuring original character artwork and magical Fae Realm symbols.",
    symbol: "☾"
  },
  {
    name: "Character Spotlight Art Print",
    category: "Art & Prints",
    price: 14.99,
    image: "character-print.jpg",
    description: "A colorful art print featuring an original illustration of one of the main characters.",
    symbol: "✧"
  },
  {
    name: "Fae Realm Cast Poster",
    category: "Art & Prints",
    price: 19.99,
    image: "cast-poster.jpg",
    description: "A full-color poster featuring several characters from the webtoon together.",
    symbol: "♜"
  },
  {
    name: "Fae Realm Character Sticker Pack",
    category: "Collectibles",
    price: 8.99,
    image: "sticker-pack.jpg",
    description: "A collection of vinyl stickers with character expressions, magical symbols, and designs.",
    symbol: "✿"
  },
  {
    name: "Character Acrylic Keychain",
    category: "Accessories",
    price: 11.99,
    image: "acrylic-keychain.jpg",
    description: "A collectible acrylic keychain featuring original webtoon character artwork.",
    symbol: "✦"
  },
  {
    name: "Fae Realm Canvas Tote Bag",
    category: "Accessories",
    price: 21.99,
    image: null,
    description: "A practical tote bag featuring artwork inspired by the Fae Realm.",
    symbol: "❀"
  },
  {
    name: "Enchanted Realm Notebook",
    category: "Collectibles",
    price: 16.99,
    image: null,
    description: "A notebook inspired by the magical world of the webtoon.",
    symbol: "☼"
  }
];

/* HELPER FUNCTIONS */

const $ = id => document.getElementById(id);

const usd = amount => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
};

/* SAVE AND LOAD CART */

const cartKey = "panelParcelCartV2";

const defaultCart = [
  { id: 0, qty: 1, variant: "Size M · Twilight purple" },
  { id: 5, qty: 1, variant: "Clear acrylic · 2.5 in" },
  { id: 2, qty: 1, variant: "8 × 10 in · Matte finish" }
];

function getCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(cartKey));

    if (Array.isArray(saved)) {
      return saved.filter(item =>
        Number.isInteger(item.id) &&
        products[item.id] &&
        Number.isInteger(item.qty) &&
        item.qty > 0
      );
    }
  } catch (error) {
    console.warn("Unable to load saved cart:", error);
  }

  return defaultCart.map(item => ({ ...item }));
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

/* PRODUCT PHOTOS */

function imageMarkup(product) {
  if (product.image) {
    return `
      <img
        class="shop-product-image"
        src="images/${product.image}"
        alt="${product.name}"
        loading="lazy"
      >
    `;
  }

  return `
    <div class="missing-product-photo"
         role="img"
         aria-label="Product photo coming soon">
      ${product.symbol}
    </div>
  `;
}

/* =========================================
   SHOP PAGE
   ========================================= */

if ($("productGrid")) {
  const params = new URLSearchParams(window.location.search);

  let category = params.get("category") || "All";
  let query = params.get("q") || "";

  $("searchInput").value = query;

  function renderProducts() {
    const needle = query.trim().toLowerCase();

    let matches = products.filter(product => {
      const categoryMatch =
        category === "All" ||
        product.category === category ||
        (
          category === "Stickers & Collectibles" &&
          (
            product.category === "Collectibles" ||
            product.name === "Character Acrylic Keychain"
          )
        );

      const textMatch =
        !needle ||
        (
          product.name + " " + product.category +
          " " + product.description
        ).toLowerCase().includes(needle);

      return categoryMatch && textMatch;
    });

    const sort = $("sortSelect").value;

    if (sort === "low") {
      matches.sort((a, b) => a.price - b.price);
    }

    if (sort === "high") {
      matches.sort((a, b) => b.price - a.price);
    }

    if (sort === "name") {
      matches.sort((a, b) => a.name.localeCompare(b.name));
    }

    $("resultCount").textContent = matches.length;

    $("searchDescription").textContent = needle
      ? `matching "${query.trim()}"`
      : "in the collection";

    $("productGrid").innerHTML = matches.map(product => {
      const id = products.indexOf(product);

      return `
        <article class="product-tile">
          <div class="tile-photo">
            ${imageMarkup(product)}
          </div>

          <div class="tile-body">
            <div class="tile-category">
              ${product.category}
            </div>

            <h3>${product.name}</h3>

            <p class="tile-description">
              ${product.description}
            </p>

            <div class="tile-bottom">
              <strong class="tile-price">
                ${usd(product.price)}
              </strong>

              <button
                type="button"
                class="tile-action"
                data-add="${id}">
                Add to bag +
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    $("emptyState").hidden = matches.length > 0;

    document.querySelectorAll(".chip").forEach(button => {
      const active = button.dataset.category === category;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  /* ADD TO CART */

  $("productGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (!button) return;

    const id = Number(button.dataset.add);
    const cart = getCart();

    const existing = cart.find(item => item.id === id);

    if (existing) {
      existing.qty++;
    } else {
      cart.push({
        id,
        qty: 1,
        variant: products[id].category
      });
    }

    saveCart(cart);

    button.textContent = "Added ✓";

    setTimeout(() => {
      if (button.isConnected) {
        button.textContent = "Add to bag +";
      }
    }, 1200);
  });

  /* CATEGORY FILTERS */

  $("categoryFilters").addEventListener("click", event => {
    const button = event.target.closest(".chip");
    if (!button) return;

    category = button.dataset.category;

    const url = new URL(window.location.href);

    if (category === "All") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }

    history.replaceState(null, "", url);
    renderProducts();
  });

  /* SEARCH BAR */

  $("header-search").addEventListener("submit", event => {
    event.preventDefault();
    query = $("searchInput").value;
    renderProducts();
  });

  $("searchInput").addEventListener("input", event => {
    query = event.target.value;
    renderProducts();
  });

  /* SORTING */

  $("sortSelect").addEventListener("change", renderProducts);

  /* RESET SEARCH */

  $("resetSearch").addEventListener("click", () => {
    category = "All";
    query = "";
    $("searchInput").value = "";

    const url = new URL(window.location.href);
    url.searchParams.delete("category");
    url.searchParams.delete("q");

    history.replaceState(null, "", url);
    renderProducts();
  });

  renderProducts();
}

/* =========================================
   CART AND CHECKOUT PAGE
   ========================================= */

if ($("cartItems")) {
  let cart = getCart();
  const taxRate = 0.08;

  function updateTotals() {
    const subtotal = cart.reduce((sum, item) => {
      return sum + products[item.id].price * item.qty;
    }, 0);

    const method = document.querySelector(
      'input[name="shipping"]:checked'
    ).value;

    let shipping = 0;

    if (subtotal > 0) {
      if (method === "express") {
        shipping = 12.95;
      } else if (subtotal >= 75) {
        shipping = 0;
      } else {
        shipping = 5.95;
      }
    }

    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + shipping + tax;

    $("subtotal").textContent = usd(subtotal);
    $("shipping").textContent =
      shipping === 0 ? "FREE" : usd(shipping);
    $("tax").textContent = usd(tax);
    $("total").textContent = usd(total);

    $("shippingOptionPrice").textContent =
      subtotal >= 75 ? "FREE" : "$5.95";

    return total;
  }

  function renderCart() {
    $("cartItems").innerHTML = cart.map(item => {
      const product = products[item.id];

      const photo = product.image
        ? `<img src="images/${product.image}"
                alt="${product.name}">`
        : `<span aria-hidden="true">${product.symbol}</span>`;

      return `
        <article class="cart-item">

          <div class="cart-art">
            ${photo}
          </div>

          <div class="cart-info">
            <h3>${product.name}</h3>

            <p>${item.variant || product.category}</p>

            <div class="quantity-controls">
              <button type="button"
                      data-action="minus"
                      data-id="${item.id}"
                      aria-label="Decrease quantity">
                −
              </button>

              <span>${item.qty}</span>

              <button type="button"
                      data-action="plus"
                      data-id="${item.id}"
                      aria-label="Increase quantity">
                +
              </button>
            </div>

            <button type="button"
                    class="remove-item"
                    data-action="remove"
                    data-id="${item.id}">
              Remove
            </button>
          </div>

          <strong class="item-price">
            ${usd(product.price * item.qty)}
          </strong>
        </article>
      `;
    }).join("");

    const count = cart.reduce((sum, item) => {
      return sum + item.qty;
    }, 0);

    $("cartCount").textContent = count;
    $("summaryCount").textContent = count;

    $("cartEmpty").hidden = cart.length !== 0;

    updateTotals();
  }

  /* QUANTITY CONTROLS AND REMOVE BUTTON */

  $("cartItems").addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    const item = cart.find(product => product.id === id);
    if (!item) return;

    if (action === "remove") {
      cart = cart.filter(product => product.id !== id);
    }

    if (action === "minus") {
      if (item.qty === 1) {
        cart = cart.filter(product => product.id !== id);
      } else {
        item.qty--;
      }
    }

    if (action === "plus") {
      item.qty++;
    }

    saveCart(cart);
    renderCart();
  });

  /* SHIPPING METHOD */

  document.querySelectorAll(
    'input[name="shipping"]'
  ).forEach(input => {
    input.addEventListener("change", updateTotals);
  });

  /* DEMO CHECKOUT */

  $("checkoutForm").addEventListener("submit", event => {
    event.preventDefault();

    if (cart.length === 0) {
      $("formMessage").textContent =
        "Your bag is empty. Add an item before checking out.";
      return;
    }

    $("formMessage").textContent =
      `Preview ready: ${usd(updateTotals())} estimated total. ` +
      "This demo does not accept payments.";
  });

  renderCart();
}
