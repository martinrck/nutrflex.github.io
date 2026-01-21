// --- CONFIGURACIÓN ---
const WHATSAPP_NUMBER = "5491100000000"; 

// --- BASE DE DATOS ---
const productsDB = [
    { id: 1, name: "Whey Isolate Pro", price: 45000, category: "Proteínas", img: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=600" },
    { id: 2, name: "Creatine Monohydrate", price: 32000, category: "Fuerza", img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=600" },
    { id: 3, name: "Pre-Workout Ignition", price: 38500, category: "Energía", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=600" },
    { id: 4, name: "BCAA Recovery 4:1:1", price: 28000, category: "Recuperación", img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=600" },
    { id: 5, name: "Multivitamínico Alpha", price: 18000, category: "Salud", img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600" },
    { id: 6, name: "Omega 3 Gold", price: 22000, category: "Salud", img: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=600" },
    { id: 7, name: "Shaker Nutrflex Pro", price: 8500, category: "Accesorios", img: "https://images.unsplash.com/photo-1570155308259-f40381e77f0d?auto=format&fit=crop&q=80&w=600" },
    { id: 8, name: "Mass Gainer Extreme", price: 42000, category: "Masa Muscular", img: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=600" },
    { id: 9, name: "ZMA Night Recovery", price: 25000, category: "Sueño", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600" },
];

let cart = [];

// --- INICIALIZACIÓN SEGURA ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Quitar Loader
    setTimeout(() => {
        const loader = document.getElementById('loader-wrapper');
        if(loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }
    }, 800);

    // 2. Cargar Productos y Tema
    renderProducts();
    initTheme();

    // 3. ACTIVAR BOTÓN DE COMPRA (Corrección del error)
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processCheckout);
    }
});

// --- LÓGICA DE NAVEGACIÓN ---
function navigate(viewName, activeNavId) {
    const homeView = document.getElementById('view-home');
    const storeView = document.getElementById('view-store');
    const navLinks = document.getElementById('nav-links');

    // Cerrar menú móvil si está abierto
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }

    // Scroll arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cambiar Vista
    if (viewName === 'store') {
        homeView.classList.add('hidden');
        storeView.classList.remove('hidden');
    } else {
        storeView.classList.add('hidden');
        homeView.classList.remove('hidden');
    }

    // Actualizar Botones Navbar
    const allLinks = document.querySelectorAll('.nav-links a');
    allLinks.forEach(link => link.classList.remove('active'));

    if (activeNavId) {
        const activeLink = document.getElementById(activeNavId);
        if (activeLink) activeLink.classList.add('active');
    }
}

function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}

// --- LÓGICA DE PRODUCTOS ---
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return; // Protección

    container.innerHTML = productsDB.map(product => `
        <div class="card">
            <div class="card-img">
                <img src="${product.img}" alt="${product.name}" loading="lazy">
            </div>
            <div class="card-body">
                <span class="category">${product.category}</span>
                <h3>${product.name}</h3>
                <span class="price">$${formatPrice(product.price)}</span>
                <button class="btn-primary btn-block" onclick="addToCart(${product.id})">
                    Agregar +
                </button>
            </div>
        </div>
    `).join('');
}

// --- LÓGICA DEL CARRITO ---
function addToCart(id) {
    const product = productsDB.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    updateCartUI();
    showToast(`¡${product.name} agregado!`);
    openCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function changeQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) removeFromCart(id);
        else updateCartUI();
    }
}

function updateCartUI() {
    // Calcular Total Items
    const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
    
    // Actualizar Contadores (Con protección por si no existen en alguna vista)
    const desktopCount = document.getElementById('cart-count');
    const mobileCount = document.getElementById('mobile-cart-count');
    
    if (desktopCount) desktopCount.innerText = totalCount;
    if (mobileCount) mobileCount.innerText = totalCount;

    // Actualizar Lista y Precio
    const container = document.getElementById('cart-items-container');
    const totalPriceElement = document.getElementById('cart-total-price');
    
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">Aún no has elegido suplementos.</p>';
    } else {
        container.innerHTML = cart.map(item => {
            total += item.price * item.qty;
            return `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <img src="${item.img}" alt="${item.name}">
                    </div>
                    <div style="flex-grow:1;">
                        <h4 style="font-size:0.95rem; margin-bottom:5px;">${item.name}</h4>
                        <div style="color:var(--primary); font-weight:bold;">$${formatPrice(item.price)}</div>
                        <div style="display:flex; align-items:center; gap:10px; margin-top:5px;">
                            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                            <span style="font-weight:bold;">${item.qty}</span>
                            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="close-cart" style="font-size:1.2rem; color:var(--danger);" onclick="removeFromCart(${item.id})">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    if(totalPriceElement) totalPriceElement.innerText = `$${formatPrice(total)}`;
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
    document.getElementById('cart-overlay').classList.toggle('active');
}

function openCart() {
    const sidebar = document.getElementById('cart-sidebar');
    if (!sidebar.classList.contains('active')) {
        toggleCart();
    }
}

// --- CHECKOUT (WHATSAPP) ---
function processCheckout() {
    if (cart.length === 0) {
        showToast("Tu carrito está vacío 😔");
        return;
    }

    let message = "Hola *Nutrflex*, quiero potenciar mi entrenamiento con este pedido:%0A%0A";
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        message += `✅ ${item.qty}x ${item.name} - $${formatPrice(subtotal)}%0A`;
    });

    message += `%0A💰 *Total Final: $${formatPrice(total)}*`;
    message += `%0A%0A¿Cómo procedemos con el pago y envío?`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');
}

// --- UTILIDADES ---
function formatPrice(price) {
    return new Intl.NumberFormat('es-AR').format(price);
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#4ade80;"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return; // Protección

    const icon = toggleBtn.querySelector('i');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme) {
        body.setAttribute('data-theme', currentTheme);
        updateIcon(currentTheme, icon);
    }

    toggleBtn.addEventListener('click', () => {
        const isDark = body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme, icon);
    });
}

function updateIcon(theme, icon) {
    if (theme === 'dark') {
        icon.classList.remove('ph-moon');
        icon.classList.add('ph-sun');
    } else {
        icon.classList.remove('ph-sun');
        icon.classList.add('ph-moon');
    }
}
