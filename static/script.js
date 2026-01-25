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

    let cart = JSON.parse(localStorage.getItem('happyBitesCart')) || [];

    // Initialize cart
    updateCartUI();

    // Toggle Cart
    function toggleCart() {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('open');
    }

    if (cartBtn) cartBtn.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    // Add to Cart
    const addBtns = document.querySelectorAll('.btn-add');

    addBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.menu-card');
            const itemName = card.querySelector('h3').innerText;
            const priceStr = card.querySelector('.price').innerText;
            const price = parseFloat(priceStr.replace('$', ''));

            const item = {
                id: Date.now(),
                name: itemName,
                price: price
            };

            cart.push(item);
            saveCart();
            updateCartUI();

            // Feedback
            const originalText = this.innerText;
            this.innerText = 'Added! ✓';
            this.style.backgroundColor = '#27ae60';

            // Open cart briefly or just update count
            // toggleCart(); // Optional: auto-open cart

            setTimeout(() => {
                this.innerText = originalText;
                this.style.backgroundColor = '';
            }, 1500);
        });
    });

    // Remove from Cart
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const id = parseInt(e.target.dataset.id);
            cart = cart.filter(item => item.id !== id);
            saveCart();
            updateCartUI();
        }
    });

    // Save to LocalStorage
    function saveCart() {
        localStorage.setItem('happyBitesCart', JSON.stringify(cart));
    }

    // Update UI
    function updateCartUI() {
        // Update Count
        if (cartCountElement) cartCountElement.innerText = cart.length;

        // Update Items List
        if (cartItemsContainer) cartItemsContainer.innerHTML = '';
        let total = 0;

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty.</div>';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            cart.forEach(item => {
                total += item.price;
                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item-card');
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                    </div>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
            if (checkoutBtn) checkoutBtn.disabled = false;
        }

        // Update Total
        if (cartTotalElement) cartTotalElement.innerText = '$' + total.toFixed(2);
    }

    // Checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;

            const nameInput = document.getElementById('cart-name');
            const phoneInput = document.getElementById('cart-phone');

            if (!nameInput.value.trim() || !phoneInput.value.trim()) {
                alert('Please enter your Name and Phone Number to complete the order.');
                nameInput.focus();
                return;
            }

            // Send order to backend
            fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cart,
                    total: cartTotalElement.innerText,
                    customer: {
                        name: nameInput.value.trim(),
                        phone: phoneInput.value.trim()
                    }
                }),
            })
                .then(response => response.json())
                .then(data => {
                    // Show Success Modal instead of alert
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
                    } else {
                        // Fallback
                        alert('Order placed successfully! Thank you for choosing Happy Bites.');
                    }

                    cart = [];
                    saveCart();
                    updateCartUI();
                    toggleCart();
                    // Clear inputs
                    nameInput.value = '';
                    phoneInput.value = '';
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Something went wrong. Please try again.');
                });
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
                    alert('Thank you for your feedback!');
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
