const apiUrl = 'https://www.themealdb.com/api/json/v1/1/filter.php?c=Dessert';

let products = [];
let originalProducts = [];
let currentSort = '';
let currentKeyword = '';
let currentPage = 1;
const itemsPerPage = 10;
let cart = [];

function isLoggedIn() {
    const loginStatus = getCookie('userLogin');
    return loginStatus === true || loginStatus === "true";
}


function setCookie(name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const cookieArr = document.cookie.split('; ');
    for (let cookie of cookieArr) {
        const [key, val] = cookie.split('=');
        if (key === name) {
            try {
                return JSON.parse(decodeURIComponent(val));
            } catch {
                return null;
            }
        }
    }
    return null;
}


function formatRupiah(angka) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(angka);
}

async function fetchProducts() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        products = data.meals.map(meal => ({
            title: meal.strMeal,
            thumbnail: meal.strMealThumb,
            price: Math.floor(Math.random() * 50000) + 10000,
            bahan: 'Tepung, Gula, Mentega',
            tanggal: new Date().toISOString().split('T')[0],
            stock: Math.floor(Math.random() * 10) + 1
        }));
        originalProducts = [...products];
        displayProducts();
    } catch (error) {
        console.error('Gagal mengambil produk:', error);
    }
}

function displayProducts() {
    const kontainerProduk = document.getElementById('kontainer-produk');
    kontainerProduk.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = products.slice(start, end);

    paginatedProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('produk-item');
        productElement.innerHTML = `
        <img src="${product.thumbnail}" alt="${product.title}" />
        <h4>${product.title}</h4>
        <div class="info-produk">
            <div class="harga-produk">${formatRupiah(product.price)}</div>
            <div class="row">
                <span class="label">Bahan</span>
                <span class="value">${product.bahan}</span>
            </div>
            <div class="row">
                <span class="label">Made</span>
                <span class="value">${product.tanggal}</span>
            </div>
            <div class="stok-info" id="stock-${encodeURIComponent(product.title)}">
            Stok: ${product.stock}
            </div>
        <button class="add-to-cart" id="add-${encodeURIComponent(product.title)}"
            onclick="addToCart('${encodeURIComponent(product.title)}', ${product.price}, '${product.thumbnail}')">
            ${product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
        </button>
    `;    

        kontainerProduk.appendChild(productElement);
        updateProductButtonState(product.title, product.stock);

    });
}

function updateProductButtonState(title, stock) {
    const encodedTitle = encodeURIComponent(title);
    const addToCartBtn = document.getElementById(`add-${encodedTitle}`);
    const stockElement = document.getElementById(`stock-${encodedTitle}`);
    if (!addToCartBtn || !stockElement) return;

    stockElement.innerText = `Stok: ${stock}`;

    const isInCart = cart.some(item => item.title === title);

    if (stock === 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.classList.add('disabled');
        addToCartBtn.innerText = 'Stok Habis';
    } else if (isInCart) {
        addToCartBtn.disabled = false;
        addToCartBtn.classList.remove('disabled');
        addToCartBtn.innerText = 'Sudah ada di Keranjang';
    } else {
        addToCartBtn.disabled = false;
        addToCartBtn.classList.remove('disabled');
        addToCartBtn.innerText = 'Tambah ke Keranjang';
    }
}

function addToCart(title, price, thumbnail) {
    title = decodeURIComponent(title);

    const product = products.find(p => p.title === title);
    if (!product || product.stock <= 0) {
        alert("Stok tidak mencukupi.");
        return;
    }

    const existingProduct = cart.find(item => item.title === title);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ title, price, thumbnail, quantity: 1 });
    }

    product.stock -= 1;
    updateCartDisplay();
    updateProductButtonState(title, product.stock);

    const button = document.getElementById(`add-${title}`);
    if (button && product.stock > 0) {
        button.innerText = 'Sudah ada di Keranjang';
    }

    // ✅ Simpan ke cookie setelah perubahan keranjang
    setCookie('cartData', cart);
}

function updateCartDisplay() {
    const cartCount = document.getElementById("cart-count");
    let totalQuantity = 0;
    let totalPrice = 0;
    cart.forEach(item => {
        totalQuantity += item.quantity;
        totalPrice += item.price * item.quantity;
    });
    cartCount.innerText = totalQuantity;

    const cartItemsContainer = document.getElementById("cart-items");
    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
        <img src="${item.thumbnail}" alt="${item.title}">
        <div class="cart-item-details">
        <h4>${item.title}</h4>
        <p>Rp ${item.price.toLocaleString()} x ${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString()}</p>
        </div>
        <button class="remove-btn" onclick="removeItem('${item.title}')">Hapus</button>
    `;

        cartItemsContainer.appendChild(cartItemElement);
    });

    const totalElement = document.getElementById("cart-total");
    if (!totalElement) {
        const newTotalElement = document.createElement('div');
        newTotalElement.id = "cart-total";
        newTotalElement.innerHTML = `<h3>Total: ${formatRupiah(totalPrice)}</h3>`;
        cartItemsContainer.appendChild(newTotalElement);
    } else {
        totalElement.innerHTML = `<h3>Total: ${formatRupiah(totalPrice)}</h3>`;
    }
}

function removeItem(title) {
    const existingProduct = cart.find(item => item.title === title);
    const product = products.find(p => p.title === title);
    if (!existingProduct || !product) return;

    if (existingProduct.quantity > 1) {
        existingProduct.quantity -= 1;
    } else {
        cart = cart.filter(item => item.title !== title);
    }

    product.stock += 1;
    updateCartDisplay();
    updateProductButtonState(title, product.stock);

    // ✅ Simpan ke cookie setelah perubahan keranjang
    setCookie('cartData', cart);
}

function tampilkanStruk() {
    if (!isLoggedIn()) {
        alert("Anda belum login. Silakan login terlebih dahulu untuk checkout.");
        window.location.href = "login.html"; // arahkan ke login
        return;
    }

    if (cart.length < 3) {
        alert("Minimal 3 item di keranjang untuk mencetak struk.");
        return;
    }

    alert("Transaksi berhasil!");

    const userId = getCookie('userId');
    const userName = getCookie(`userName_${userId}`);

    const strukItemsContainer = document.getElementById('struk-items');
    const totalHargaEl = document.getElementById('struk-total-harga');
    const namaUserEl = document.getElementById('struk-nama-user');

    strukItemsContainer.innerHTML = '';
    let total = 0;

    if (namaUserEl) {
        namaUserEl.innerHTML = `<strong>Nama Pelanggan:</strong> ${userName || "Tidak diketahui"}`;
    }

    cart.forEach(item => {
        const totalPerItem = item.price * item.quantity;
        total += totalPerItem;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.quantity}</td>
            <td>${formatRupiah(item.price)}</td>
            <td>${formatRupiah(totalPerItem)}</td>
        `;
        strukItemsContainer.appendChild(row);
    });

    totalHargaEl.innerHTML = `<strong>Total:</strong> ${formatRupiah(total)}`;
    document.getElementById('struk-belanja').style.display = 'block';
    document.getElementById('struk-overlay').style.display = 'block';

    const today = new Date().toISOString().split("T")[0];
    const riwayat = JSON.parse(localStorage.getItem('riwayatStruk')) || [];
    riwayat.push({
        tanggal: today,
        items: [...cart]
    });
    localStorage.setItem('riwayatStruk', JSON.stringify(riwayat));
}

function tutupStruk() {
    const strukBelanja = document.getElementById('struk-belanja');
    const overlay = document.getElementById('struk-overlay');

    if (strukBelanja) strukBelanja.style.display = 'none';
    if (overlay) overlay.style.display = 'none';

    kosongkanKeranjang(); // Sudah ada di JS kamu
}


function tampilkanModalLogin() {
    const modal = document.getElementById("loginModal");
    modal.style.display = "block";

    const span = modal.querySelector(".close");
    span.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}


function kosongkanKeranjang() {
    cart = [];
    updateCartDisplay();
    setCookie('cartData', []); // kosongkan cookie juga
}

function filterAndSort() {
    products = [...originalProducts];
    if (currentKeyword) {
        products = products.filter(product =>
            product.title.toLowerCase().includes(currentKeyword)
        );
    }
    if (currentSort === 'harga-asc') {
        products.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'harga-desc') {
        products.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'bahan') {
        products.sort((a, b) => a.bahan.localeCompare(b.bahan));
    } else if (currentSort === 'tanggal') {
        products.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    }
    displayProducts();
}

function searchProducts() {
    currentKeyword = document.getElementById('searchInput').value.toLowerCase();
    currentPage = 1;
    filterAndSort();
}

document.getElementById('searchInput').addEventListener('input', searchProducts);
document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    filterAndSort();
});

function nextPage() {
    if (currentPage * itemsPerPage < products.length) {
        currentPage++;
        displayProducts();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayProducts();
    }
}

document.getElementById('next').addEventListener('click', nextPage);
document.getElementById('prev').addEventListener('click', prevPage);

function toggleCart() {
    const cartContainer = document.getElementById("cart-container");
    cartContainer.style.display = (cartContainer.style.display === "block") ? "none" : "block";
}

fetchProducts().then(() => {
    const savedCart = getCookie('cartData');
    if (savedCart && Array.isArray(savedCart)) {
        cart = savedCart;

        // Kurangi stok produk berdasarkan isi cart
        cart.forEach(item => {
            const product = products.find(p => p.title === item.title);
            if (product) {
                product.stock -= item.quantity;
            }
        });

        updateCartDisplay();
    }

    // ❌ HAPUS baris ini karena menyebabkan keranjang kosong setelah reload:
    // setCookie('cartData', cart);
});

