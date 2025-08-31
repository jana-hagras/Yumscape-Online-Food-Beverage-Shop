class CartManager {
    constructor() {
        this.cartLists = JSON.parse(localStorage.getItem('cartLists')) || [];
        this.cartContainer = document.getElementById('row_cart');
        this.bindEvents();
        this.updateCart();
        this.initFilterSystem();
    }

    bindEvents() {
        const cartOpenBtn = document.getElementById('cartOpenBtn');
        if (cartOpenBtn) cartOpenBtn.addEventListener('click', () => this.openCart());

        const exitCart = document.querySelector('.exitCart');
        if (exitCart) exitCart.addEventListener('click', () => this.closeCart());

        document.querySelectorAll('.btn-purple').forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.hasAttribute('data-filter')) return;
                e.preventDefault();
                const card = button.closest('.card');
                if (!card) return;

                const image = card.querySelector('img').src;
                const name = card.querySelector('.card-title').innerText;
                const priceText = card.querySelector('.card-text.fw-bold').innerText;
                const price = parseFloat(priceText.replace('$', '').trim());

                this.addToCart(image, name, price);
            });
        });

        const scrollBtn = document.getElementById('scrollToTop');
        if (scrollBtn) scrollBtn.addEventListener('click', () => this.scrollToTop());

        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    initFilterSystem() {
        const buttons = document.querySelectorAll("[data-filter]");
        const cards = document.querySelectorAll(".product-card");

        if (buttons.length > 0 && cards.length > 0) {
            buttons.forEach(btn => {
                btn.addEventListener("click", () => {
                    buttons.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");

                    const filter = btn.getAttribute("data-filter").toLowerCase();
                    cards.forEach(card => {
                        const category = card.getAttribute("data-category").toLowerCase();
                        card.style.display = (filter === "all" || category === filter) ? "" : "none";
                    });
                });
            });
        }
    }

    openCart() {
        this.cartContainer.classList.add('active');
    }

    closeCart() {
        this.cartContainer.classList.remove('active');
    }

    addToCart(image, name, price) {
        const existingProduct = this.cartLists.find(item => item.name === name && item.image === image);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            this.cartLists.push({ id: Date.now(), image, name, price, quantity: 1 });
        }
        this.saveCart();
        this.updateCart();
        showNotification(`🛒 ${name} has been added to the cart!`, "cart");
    }

    changeQuantity(index, quantity) {
        if (quantity <= 0) {
            this.removeItem(index);
        } else {
            this.cartLists[index].quantity = quantity;
            this.saveCart();
            this.updateCart();
        }
    }

    removeItem(index) {
        const removedItem = this.cartLists[index];
        this.cartLists.splice(index, 1);
        this.saveCart();
        this.updateCart();
        showNotification(`❌ ${removedItem.name} removed from cart`, "error");
    }

    clearCart() {
        this.cartLists = [];
        this.saveCart();
        this.updateCart();
        showNotification('🗑️ Cart has been cleared', "error");
    }

    updateCart() {
        const cartList = document.querySelector('.cart-list');
        if (!cartList) return;

        cartList.innerHTML = '';

        if (this.cartLists.length === 0) {
            this.displayEmptyCart(cartList);
            return;
        }

        const { totalPrice, tax, total } = this.calculateTotals();
        this.cartLists.forEach((item, index) => {
            cartList.appendChild(this.createCartItemElement(item, index));
        });

        this.updatePriceDisplay(totalPrice, tax, total);
    }

    displayEmptyCart(cartList) {
        cartList.innerHTML = '<p class="text-center">Your cart is empty.</p>';
        this.updatePriceDisplay(0, 0, 0);
    }

    createCartItemElement(item, index) {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.innerHTML = `
            <div class="row align-items-center">
                <div class="col-2">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" style="width: 50px; height: 50px; object-fit: cover;">
                </div>
                <div class="col-4">
                    <h6 class="name">${item.name}</h6>
                    <p class="price">${item.price.toFixed(2)} $</p>
                </div>
                <div class="col-3 text-center">
                    <div class="quantity-controls">
                        <button data-action="decrease">-</button>
                        <span class="quan">${item.quantity}</span>
                        <button data-action="increase">+</button>
                    </div>
                </div>
                <div class="col-3 text-right">
                    <button class="btn btn-danger btn-lg remove-btn">&times;</button>
                </div>
            </div>`;

        const decreaseBtn = listItem.querySelector('[data-action="decrease"]');
        const increaseBtn = listItem.querySelector('[data-action="increase"]');
        const removeBtn = listItem.querySelector('.remove-btn');

        decreaseBtn.addEventListener('click', () => this.changeQuantity(index, item.quantity - 1));
        increaseBtn.addEventListener('click', () => this.changeQuantity(index, item.quantity + 1));
        removeBtn.addEventListener('click', () => this.removeItem(index));

        return listItem;
    }

    calculateTotals() {
        const totalPrice = this.cartLists.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = totalPrice * 0.14;
        const total = totalPrice + tax;
        return { totalPrice, tax, total };
    }

    updatePriceDisplay(totalPrice, tax, total) {
        const subtotalElem = document.querySelector('.subtotal');
        const taxElem = document.querySelector('.tax');
        const totalElem = document.querySelector('.total');
        if (subtotalElem && taxElem && totalElem) {
            subtotalElem.innerText = `${totalPrice.toFixed(2)} $`;
            taxElem.innerText = `${tax.toFixed(2)} $`;
            totalElem.innerText = `${total.toFixed(2)} $`;
        }
    }

    saveCart() {
        localStorage.setItem('cartLists', JSON.stringify(this.cartLists));
    }

    checkout() {
        if (this.cartLists.length === 0) {
            showNotification('⚠️ Your cart is empty!', "error");
            return;
        }
        showNotification('✅ Your order has been placed. Thank you!', "success");
        setTimeout(() => {
            this.clearCart();
            this.closeCart();
        }, 2000);
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleScroll() {
        const scrollToTopButton = document.getElementById('scrollToTop');
        if (scrollToTopButton) {
            scrollToTopButton.style.display = window.scrollY > 200 ? 'flex' : 'none';
        }
    }
}

const cart = new CartManager();
window.clearCart = () => cart.clearCart();
window.CheckOut = () => cart.checkout();

/* 🔔 Universal notification system */
function showNotification(text, type = "info") {
    const msg = document.createElement("div");
    msg.className = `app-message ${type}`;
    msg.innerHTML = `
        <div class="msg-top">
            <span>${text}</span>
            <span class="close-btn">&times;</span>
        </div>
        <div class="timer-bar"></div>
    `;

    document.body.appendChild(msg);

    setTimeout(() => msg.classList.add("show"), 10);

    const timer = setTimeout(() => {
        msg.classList.remove("show");
        setTimeout(() => msg.remove(), 300);
    }, 4000);

    msg.querySelector(".close-btn").addEventListener("click", () => {
        clearTimeout(timer);
        msg.remove();
    });
}

/* 📩 Contact form */
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector(".contact-form form");

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = this.querySelector("input[placeholder='Your full name']").value.trim();
            const email = this.querySelector("input[type='email']").value.trim();
            const subject = this.querySelector("input[placeholder='How can we help you?']").value.trim();
            const message = this.querySelector("textarea").value.trim();

            if (name && email && subject && message) {
                showNotification(`✅ Thank you, ${name}! Your message has been sent.`, "success");
                this.reset();
            } else {
                showNotification("⚠️ Please fill out all fields before submitting.", "error");
            }
        });
    }
});
