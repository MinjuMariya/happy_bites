document.addEventListener('DOMContentLoaded', () => {

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');

    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
    });




    // Close menu when link is clicked
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            mobileBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.menu-card, .section-title, .about-content, .img-1, .img-2');

    animateElements.forEach(el => {
        // Set initial state
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';

        observer.observe(el);
    });

    // Cart Logic
    const cartBtn = document.querySelector('.cart-btn');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElement = document.querySelector('.total-amount');
    const cartCountElement = document.querySelector('.cart-count');
    const checkoutBtn = document.querySelector('.checkout-btn');

    let cart = [];
    try {
        const storedCart = localStorage.getItem('happyBitesCart');
        cart = storedCart ? JSON.parse(storedCart) : [];
        if (!Array.isArray(cart)) cart = [];

        // migration/safety: ensure all items have a number price
        cart = cart.map(item => {
            let price = item.price;
            if (typeof price === 'string') {
                price = parseFloat(price.replace(/[^\d.-]/g, ''));
            }
            return {
                ...item,
                price: isNaN(price) ? 0 : price
            };
        });
    } catch (e) {
        console.error("Cart loading error:", e);
        cart = [];
    }

    // Initialize cart
    updateCartUI();
    fetchStockData(); // Real-time stock fetch

    // Global Cart Sync (Cross-tab)
    window.addEventListener('storage', (e) => {
        if (e.key === 'happyBitesCart') {
            try {
                const stored = localStorage.getItem('happyBitesCart');
                cart = stored ? JSON.parse(stored) : [];
                updateCartUI();
                fetchStockData(); // Refresh stock view too
            } catch (err) { console.error(err); }
        }
    });

    // Generic Warning Modal
    function showStockWarning(max) {
        const modal = document.getElementById('stock-warning-modal');
        const msg = document.getElementById('stock-warning-msg');
        if (modal && msg) {
            msg.innerText = `Only ${max} items left in stock.`;
            modal.classList.add('show');
        } else {
            alert(`Only ${max} items left in stock.`);
        }
    }

    // Fetch Stock Data Function
    async function fetchStockData() {
        try {
            const res = await fetch('/api/products');
            if (!res.ok) return;
            const products = await res.json();

            const cards = document.querySelectorAll('.menu-card');
            cards.forEach(card => {
                const nameEl = card.querySelector('h3');
                if (!nameEl) return;
                const name = nameEl.innerText.trim();
                const product = products.find(p => p.name === name);

                if (product) {
                    // Update Stock Display
                    const stockInfo = card.querySelector('.stock-info');
                    if (stockInfo) {
                        stockInfo.innerText = `Stock left: ${product.remaining_stock}`;
                        if (product.remaining_stock === 0) {
                            stockInfo.style.color = 'red';
                        } else {
                            stockInfo.style.color = '#e67e22';
                        }
                    }

                    // Update Input Limits
                    const qtyInput = card.querySelector('.qty-input');
                    const qtyMinus = card.querySelector('.qty-btn.minus');
                    const qtyPlus = card.querySelector('.qty-btn.plus');

                    if (qtyInput) {
                        qtyInput.setAttribute('max', product.remaining_stock);
                        // If current input value exceeds new stock, clamp it
                        if (parseInt(qtyInput.value) > product.remaining_stock) {
                            qtyInput.value = Math.max(1, product.remaining_stock);
                        }

                        if (product.remaining_stock === 0) {
                            qtyInput.value = 0;
                            qtyInput.disabled = true;
                            if (qtyMinus) qtyMinus.disabled = true;
                            if (qtyPlus) qtyPlus.disabled = true;
                        } else {
                            qtyInput.disabled = false;
                            if (qtyMinus) qtyMinus.disabled = false;
                            if (qtyPlus) qtyPlus.disabled = false;
                            // Ensure at least 1 if available
                            if (qtyInput.value == 0) qtyInput.value = 1;
                        }
                    }

                    // Update Cart Item Max Stock if exists
                    const cartItem = cart.find(c => c.name === name);
                    if (cartItem) {
                        cartItem.maxStock = product.remaining_stock;
                        // Clamp quantity if it exceeds new stock
                        if (cartItem.qty > product.remaining_stock) {
                            cartItem.qty = Math.max(0, product.remaining_stock);
                            // If stock is 0, remove item? Or keep as 0? 
                            // Existing logic in updateCartUI handles 0 qty? No, it reduces.
                            // Better remove if 0 to avoid confusion 
                            if (cartItem.qty === 0) {
                                cart = cart.filter(c => c.name !== name);
                            }
                        }
                        saveCart(); // persist limit update
                    }

                    // Handle Out of Stock / Low Stock Visuals
                    const imgContainer = card.querySelector('.card-image');
                    const addBtn = card.querySelector('.btn-add');
                    let overlay = imgContainer.querySelector('.stock-overlay');

                    // Reset button state first
                    if (addBtn) {
                        addBtn.classList.remove('disabled');
                        addBtn.style.background = ''; // reset
                        addBtn.style.cursor = '';
                        addBtn.disabled = false;
                        addBtn.innerText = "Add +";
                    }

                    if (product.remaining_stock === 0) {
                        // Out of Stock
                        if (!overlay) {
                            overlay = document.createElement('div');
                            overlay.className = 'stock-overlay out-of-stock';
                            imgContainer.appendChild(overlay);
                        }
                        overlay.className = 'stock-overlay out-of-stock';
                        overlay.innerText = 'OUT OF STOCK';

                        // Disable Button
                        if (addBtn) {
                            addBtn.classList.add('disabled');
                            addBtn.style.background = '#ccc';
                            addBtn.style.cursor = 'not-allowed';
                            addBtn.disabled = true;
                            addBtn.innerText = "Out of Stock";
                        }
                    } else if (product.remaining_stock < 5) {
                        // Low Stock
                        if (!overlay || overlay.classList.contains('out-of-stock')) {
                            if (overlay) overlay.remove();
                            overlay = document.createElement('div');
                            imgContainer.appendChild(overlay);
                        }
                        overlay.className = 'stock-overlay few-left';
                        overlay.innerText = 'FEW LEFT!';
                    } else {
                        // Plenty Stock
                        if (overlay) overlay.remove();
                    }
                }
            });
            updateCartUI(); // Refresh cart UI with new limits
        } catch (e) {
            console.error("Error fetching stock:", e);
        }
    }

    // Toggle Cart
    function toggleCart() {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('open');
    }

    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    // Quantity Controls Logic (Menu + Cart)
    document.addEventListener('click', (e) => {
        // Menu item qty selection
        if (e.target.classList.contains('qty-btn')) {
            const control = e.target.closest('.qty-control');
            if (!control) return;
            const input = control.querySelector('.qty-input');
            if (!input) return;
            let val = parseInt(input.value) || 1;
            const max = parseInt(input.getAttribute('max')) || 9999;

            if (e.target.classList.contains('plus')) {
                if (val < max) {
                    val++;
                } else {
                    showStockWarning(max);
                }
            } else if (e.target.classList.contains('minus')) {
                if (val > 1) val--;
            }

            input.value = val;
            e.preventDefault();
        }

        // Cart quantity adjustment
        if (e.target.classList.contains('cart-qty-btn')) {
            const id = parseFloat(e.target.dataset.id);
            let item = cart.find(it => it.id === id);
            if (!item) return;

            if (e.target.classList.contains('plus')) {
                const max = item.maxStock || 9999;
                if (item.qty < max) {
                    item.qty++;
                } else {
                    showStockWarning(max);
                }
            } else if (e.target.classList.contains('minus')) {
                if (item.qty > 1) {
                    item.qty--;
                } else {
                    // Remove the item from the cart
                    cart = cart.filter(it => it.id !== id);
                }
            }
            saveCart();
            updateCartUI();
        }
    });

    // Add to Cart Logic
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add')) {
            const btn = e.target;
            const card = btn.closest('.menu-card');
            if (!card) return;

            const itemNameEl = card.querySelector('h3');
            const priceEl = card.querySelector('.price');
            const qtyInput = card.querySelector('.qty-input');

            if (!itemNameEl || !priceEl) return;

            const itemName = itemNameEl.innerText;
            const quantity = parseInt(qtyInput ? qtyInput.value : 1) || 1;
            // Get max stock from the input attribute
            const maxStock = parseInt(qtyInput ? qtyInput.getAttribute('max') : 9999) || 9999;

            // Safer parsing: Use data-price attribute if available, else strip symbols
            let price = 0;
            if (priceEl.dataset.price) {
                price = parseFloat(priceEl.dataset.price);
            } else {
                price = parseFloat(priceEl.innerText.replace(/[^\d.]/g, ''));
            }

            if (isNaN(price)) price = 0;

            // Group by name: Check if item already exists in cart
            const existingItem = (cart || []).find(it => it.name === itemName);

            if (existingItem) {
                const newTotal = (existingItem.qty || 0) + quantity;
                if (newTotal > maxStock) {
                    showStockWarning(maxStock);
                    return;
                }
                existingItem.qty = newTotal;
                // Update stored maxStock just in case
                existingItem.maxStock = maxStock;
                console.log('Existing item updated:', existingItem);
            } else {
                if (quantity > maxStock) {
                    showStockWarning(maxStock);
                    return;
                }
                const newItem = {
                    id: Date.now() + Math.random(),
                    name: itemName,
                    price: price,
                    qty: quantity,
                    maxStock: maxStock
                };
                cart.push(newItem);
                console.log('New item added to cart:', newItem);
            }

            saveCart();
            updateCartUI();

            // Feedback
            const originalText = btn.innerText;
            btn.innerText = 'Added! ✓';
            btn.style.backgroundColor = '#27ae60';

            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.backgroundColor = '';
                if (qtyInput) qtyInput.value = 1; // Reset qty after adding
                fetchStockData(); // Refresh stock data to prevent stale display
            }, 1500);
        }
    });

    // Remove from Cart
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const id = parseFloat(e.target.dataset.id);
                cart = cart.filter(item => item.id !== id);
                saveCart();
                updateCartUI();
            }
        });
    }

    // Save to LocalStorage
    function saveCart() {
        localStorage.setItem('happyBitesCart', JSON.stringify(cart));
    }

    // Update UI
    function updateCartUI() {
        // Update Count
        const totalItems = (cart || []).reduce((acc, item) => acc + (parseInt(item.qty) || 1), 0);
        if (cartCountElement) cartCountElement.innerText = totalItems;

        // Update Items List
        if (cartItemsContainer) cartItemsContainer.innerHTML = '';
        let total = 0;

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty.</div>';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            cart.forEach(item => {
                const itemPrice = parseFloat(item.price) || 0;
                const itemQty = parseInt(item.qty) || 1;
                const itemTotal = itemPrice * itemQty;
                total += itemTotal;

                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item-card');
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-details">
                            <div class="cart-qty-controls">
                                <button class="cart-qty-btn minus" data-id="${item.id}">-</button>
                                <span class="cart-item-qty">${itemQty}</span>
                                <button class="cart-qty-btn plus" data-id="${item.id}">+</button>
                            </div>
                            <span class="cart-item-price">Rs.${itemTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
            if (checkoutBtn) checkoutBtn.disabled = false;
        }

        // Update Total
        if (cartTotalElement) {
            console.log('Updating total display to:', total);
            cartTotalElement.innerText = 'Rs.' + (isNaN(total) ? 0 : total).toFixed(2);
        }
    }

    // Checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;

            const addressInput = document.getElementById('cart-address');

            if (!addressInput) {
                // User is not logged in
                alert('Please login to place an order.');
                window.location.href = '/login';
                return;
            }

            if (!addressInput.value.trim()) {
                alert('Please enter your Delivery Address to complete the order.');
                addressInput.focus();
                return;
            }

            // Show Confirmation Modal
            const confirmModal = document.getElementById('checkout-confirm-modal');
            const confirmAddressSpan = document.getElementById('confirm-address');
            const confirmTotalSpan = document.getElementById('confirm-total');
            const confirmBtn = document.getElementById('confirm-checkout-btn');
            const cancelBtn = document.getElementById('cancel-checkout-btn');

            if (confirmModal) {
                confirmAddressSpan.innerText = addressInput.value.trim();
                confirmTotalSpan.innerText = cartTotalElement.innerText;
                confirmModal.classList.add('show');

                // Handle Cancel
                cancelBtn.onclick = () => {
                    confirmModal.classList.remove('show');
                };

                // Confirm and Proceed
                confirmBtn.onclick = () => {
                    confirmBtn.disabled = true;
                    confirmBtn.innerText = 'Processing...';

                    performCheckout(addressInput.value.trim(), confirmModal, confirmBtn);
                };
            } else {
                // Fallback if modal missing
                performCheckout(addressInput.value.trim(), null, null);
            }
        });
    }

    function performCheckout(address, modal, btn) {
        fetch('/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cart,
                total: cartTotalElement.innerText,
                customer: {
                    address: address
                }
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (modal) modal.classList.remove('show');
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = 'Confirm Order';
                }

                // Show Success Modal
                const successModal = document.getElementById('order-success-modal');
                if (successModal) {
                    successModal.classList.add('show');

                    // Close modal handlers
                    const closeBtns = successModal.querySelectorAll('button');
                    closeBtns.forEach(btn => {
                        btn.addEventListener('click', () => {
                            successModal.classList.remove('show');
                        });
                    });

                    // Close on click outside
                    successModal.addEventListener('click', (e) => {
                        if (e.target === successModal) {
                            successModal.classList.remove('show');
                        }
                    });
                }

                cart = [];
                saveCart();
                updateCartUI();
                toggleCart();

                // Immediately update stock on page
                fetchStockData();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Checkout failed: ' + (error.message || 'Server error. Please check if you are logged in and have items in cart.'));
                if (modal) modal.classList.remove('show');
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = 'Confirm Order';
                }
            });
    }

    // Feedback Submission
    const feedbackForms = document.querySelectorAll('.feedback-form');
    feedbackForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const ratingInput = form.querySelector('input[name="rating"]:checked');
            const messageInput = form.querySelector('input[type="text"]');

            if (!ratingInput) {
                alert("Please select a star rating!");
                return;
            }

            const rating = ratingInput.value;
            const message = messageInput.value;

            fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating: rating, message: message }),
            })
                .then(response => response.json())
                .then(data => {
                    // Show Thank You Modal
                    const feedbackModal = document.getElementById('feedback-success-modal');
                    if (feedbackModal) {
                        feedbackModal.classList.add('show');

                        // Close handlers
                        const closeBtn = document.getElementById('close-feedback-modal');
                        if (closeBtn) {
                            closeBtn.onclick = () => feedbackModal.classList.remove('show');
                        }

                        feedbackModal.onclick = (e) => {
                            if (e.target === feedbackModal) feedbackModal.classList.remove('show');
                        }
                    } else {
                        alert('Thank you for your feedback!');
                    }
                    form.reset();
                })
                .catch(error => console.error('Error:', error));
        });
    });

    // Smooth Scroll for Anchors (handled by CSS, but JS fallback/enhancement if needed)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

});
