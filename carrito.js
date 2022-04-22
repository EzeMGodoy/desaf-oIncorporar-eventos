const db = {
  // Tener en cuenta q la db es independiente del carrito de compras
  metodos: {
    find: (id) => {
      return db.items.find((item) => item.id === id);
    },
  },

  items: [
    {
      id: 0,
      titulo: "EFT",
      foto: "img/capacitacion1.webp", //!No me deja agregar las fotos
      precio: 5000,
      cantidad: 5,
    },
    {
      id: 1,
      titulo: "El Real Potencial de Todos",
      foto: "img/capacitacion1.webp",
      precio: 4000,
      cantidad: 10,
    },
    {
      id: 2,
      titulo: "Lo que se hereda no se roba",
      foto: "img/capacitacion1.webp",
      precio: 4200,
      cantidad: 15,
    },
    {
      id: 3,
      titulo: "¿Por qué las emociones quedan atrapadas?",
      foto: "img/capacitacion1.webp",
      precio: 4500,
      cantidad: 8,
    },
    {
      id: 4,
      titulo: "¿Cómo puedo liberar los bloqueos energéticos?",
      foto: "img/capacitacion1.webp",
      precio: 4200,
      cantidad: 13,
    },
    {
      id: 5,
      titulo: "Para PERDONAR hay que COMPRENDER",
      foto: "img/capacitacion1.webp",
      precio: 4300,
      cantidad: 11,
    },
  ],
};

const shoppingCart = {
  //* carrito independiente de la db pero tiene como referencia la db
  items: [],
  metodos: {
    add: (id, cantidad) => {
      //* para saber qué elemento agregrar y cuantos
      const cartItem = shoppingCart.metodos.get(id);

      if (cartItem) {
        if (
          shoppingCart.metodos.hayInventario(id, cantidad + cartItem.cantidad)
        ) {
          cartItem.cantidad += cantidad;
        } else {
          alert("No hay stock suficiente");
        }
      } else {
        shoppingCart.items.push({ id, cantidad });
      }
    },
    remove: (id, cantidad) => {
      //* para saber qué elemento remover y cuantos
      const cartItem = shoppingCart.metodos.get(id);
      if (cartItem.cantidad - cantidad > 0) {
        cartItem.cantidad -= cantidad;
      } else {
        shoppingCart.items = shoppingCart.items.filter(
          (item) => item.id !== id
        );
      }
    },
    count: () => {
      return shoppingCart.items.reduce((acc, item) => acc + item.cantidad, 0);
    },
    get: (id) => {
      const index = shoppingCart.items.findIndex((item) => item.id === id);
      return index >= 0 ? shoppingCart.items[index] : null;
    },
    getTotal: () => {
      const total = shoppingCart.items.reduce((acc, item) => {
        const found = db.metodos.find(item.id);
        return acc + found.precio * item.cantidad;
      }, 0);
      return total;
    },
    hayInventario: (id, cantidad) => {
      //! eleiminar dsp ya que no manejare stock
      return db.items.find((item) => item.id === id).cantidad - cantidad >= 0;
    },
    comprar: () => {
      db.metodos.remove(shoppingCart.items);
      shoppingCart.items = [];
    },
  },
};

cargarTienda();

function cargarTienda() {
  const html = db.items.map((item) => {
    return `
        <div class="item">
            <div class="titulo">${item.titulo}</div>
            <div class="foto">${item.foto}</div>
            <div class="precio">${numberToCurrency(item.precio)}</div>
            <div class="cantidad">${item.cantidad} Unidades</div>

            <div class="actions">
                <button class="add" data-id="${item.id}">
                    Agregar al carrito
                </button>
            </div>
        </div>
        `;
  });

  document.querySelector("#store-container").innerHTML = html.join("");

  document.querySelectorAll(".item .actions .add").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = parseInt(button.getAttribute("data-id"));
      const item = db.metodos.find(id);

      if (item && item.cantidad - 1 > 0) {
        //añadir a shoppingcart
        shoppingCart.metodos.add(id, 1);
        // console.log(shoppingCart);
        renderCarrito();
      } else {
        console.log("Ya no hay stock");
      }
    });
  });
}

function renderCarrito() {
  const html = shoppingCart.items.map((item) => {
    const dbItem = db.metodos.find(item.id);
    return `
            <div class="item>
                <div class="titulo">${dbItem.titulo}</div>
                <div class="precio">${numberToCurrency(dbItem.precio)}</div>
                <div class="cantidad">${item.cantidad} Unidades</div>
                <div class="subtotal">
                    Subtotal:${numberToCurrency(item.cantidad * dbItem.precio)}
                </div>
                <div class="actions">
                    <button class="addOne" data-id="${item.id}">+</button>
                    <button class="removeOne" data-id="${item.id}">-</button>
                </div>
            </div>
        `;
  });

  const cerrarBoton = `
        <div class="cart-header">
            <button class="bClose">Close</button>
        </div>
    `;
  const comprarButton =
    shoppingCart.items.length > 0
      ? `
        <div class="cart-actions">
            <button id="bComprar">comprar</button>
        </div>
    `
      : "";

  const total = shoppingCart.metodos.getTotal();
  const totalContainer = `<div class="total">Total: ${numberToCurrency(
    total
  )}</div>`;

  const shoppingCartContainer = document.querySelector(
    "#shopping-cart-container"
  );

  shoppingCartContainer.classList.remove("hide");
  shoppingCartContainer.classList.add("show");
  shoppingCartContainer.innerHTML =
    cerrarBoton + html.join("") + totalContainer + comprarButton;

  document.querySelector(".bClose").addEventListener("click", (e) => {
    shoppingCartContainer.classList.remove("show");
    shoppingCartContainer.classList.add("hide");
  });

  const bComprar = document.querySelector("#bComprar");
  if (bComprar) {
    bComprar.addEventListener("click", (e) => {
      shoppingCart.metodos.comprar();
      cargarTienda();
      renderCarrito();
    });
  }
}

function numberToCurrency(n) {
  return new Intl.NumberFormat("de-DE", {
    //API interna de JS
    maximumSignificantDigits: 2,
    style: "currency",
    currency: "USD",
  }).format(n);
}
