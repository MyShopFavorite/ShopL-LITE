import { db } from "./firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

let cart = [];
const numeroWhatsApp = "573127180989";
let baseProducts = [];

// Escuchar la base de datos de Firebase en tiempo real
function escucharProductos() {
    const productosRef = collection(db, "productos");
    
    // onSnapshot se ejecuta automáticamente cada vez que cambie algo en Firebase
    onSnapshot(productosRef, (snapshot) => {
        baseProducts = [];
        snapshot.forEach((doc) => {
            baseProducts.push({ id: doc.id, ...doc.data() });
        });
        renderizarTienda();
    });
}

function renderizarTienda() {
    const grid = document.getElementById('grid-productos');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (baseProducts.length === 0) {
        grid.innerHTML = '<p class="text-slate-500 text-center col-span-full">No hay piezas disponibles en el catálogo en este momento.</p>';
        return;
    }

    baseProducts.forEach(prod => {
        grid.innerHTML += `
            <div class="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 relative">
                <img src="${prod.img}" alt="${prod.nombre}" class="w-full h-72 object-cover opacity-90">
                <div class="p-6 space-y-3">
                    <h3 class="font-serif text-xl tracking-wide">${prod.nombre}</h3>
                    <p class="text-xs text-slate-400 line-clamp-2">${prod.desc}</p>
                    <div class="flex justify-between items-center pt-4">
                        <span class="text-amber-400 font-bold text-sm">$ ${Number(prod.precio).toLocaleString()} COP</span>
                        <button id="view-btn-${prod.id}" class="text-xs tracking-wider border-b border-amber-500/50 hover:text-amber-400 pb-0.5 transition-colors">DETALLES</button>
                    </div>
                </div>
            </div>`;
    });

    // Asignar eventos de clic de forma segura para módulos
    baseProducts.forEach(prod => {
        document.getElementById(`view-btn-${prod.id}`).addEventListener('click', () => viewProduct(prod.id));
    });
}

function viewProduct(id) {
    const prod = baseProducts.find(p => p.id == id);
    const modal = document.getElementById('modal-product');
    const content = document.getElementById('modal-content');

    let escasezMsg = prod.stock <= 5 ? `<p class="text-xs text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">🔥 Exclusividad: Solo quedan ${prod.stock} unidades en stock inmediato.</p>` : '';
    let tiempoMsg = `<p class="text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">✈️ Garantía Élite: Paga hoy y recibe en menos de 72 horas con envío asegurado.</p>`;

    let mediaHTML = (prod.img.startsWith('data:video') || prod.img.endsWith('.mp4'))
        ? `<video src="${prod.img}" controls autoplay muted loop class="w-full h-[75vh] object-cover rounded-2xl shadow-2xl"></video>`
        : `<img src="${prod.img}" class="w-full h-[75vh] object-cover rounded-2xl shadow-2xl">`;

    content.innerHTML = `
        <div>${mediaHTML}</div>
        <div class="space-y-6 flex flex-col justify-between">
            <div class="space-y-4">
                <h3 class="font-serif text-4xl text-amber-400">${prod.nombre}</h3>
                <p class="text-slate-300 text-sm leading-relaxed">${prod.desc}</p>
                <div class="space-y-2">${escasezMsg}${tiempoMsg}</div>
                <div class="text-3xl font-bold text-amber-500 pt-2">$ ${Number(prod.precio).toLocaleString()} COP</div>
            </div>
            <div class="border-t border-slate-800 pt-4">
                <button id="add-to-cart-btn" class="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-4 rounded-xl text-sm tracking-wider transition-all">AÑADIR AL CARRITO</button>
            </div>
        </div>`;
        
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    document.getElementById('add-to-cart-btn').addEventListener('click', function() {
        addToCart(prod.id, this);
    });
}

window.closeProductModal = function() {
    document.getElementById('modal-product').classList.add('hidden');
}

function addToCart(id, buttonEl) {
    const prod = baseProducts.find(p => p.id == id);
    const itemEnCarrito = cart.find(item => item.id == id);
    if (itemEnCarrito) itemEnCarrito.cantidad++;
    else cart.push({ ...prod, cantidad: 1 });
    
    updateCart();
    
    if(buttonEl) {
        const initialText = buttonEl.innerText;
        buttonEl.innerText = "✓ PIEZA AÑADIDA";
        buttonEl.style.background = "#10b981"; 
        setTimeout(() => {
            buttonEl.innerText = initialText;
            buttonEl.style.background = "#d97706";
        }, 1200);
    }
}

function updateCart() {
    const count = document.getElementById('cart-count');
    const itemsContainer = document.getElementById('cart-items');
    const totalContainer = document.getElementById('cart-total');
    
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
    const totalMoney = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    
    count.innerText = totalItems;
    totalContainer.innerText = `$ ${totalMoney.toLocaleString()} COP`;
    
    itemsContainer.innerHTML = '';
    cart.forEach(item => {
        itemsContainer.innerHTML += `
            <div class="flex justify-between items-center border-b border-slate-800/50 pb-3">
                <div>
                    <h4 class="text-sm font-semibold text-slate-300">${item.nombre}</h4>
                    <span class="text-xs text-amber-500">${item.cantidad}x $ ${Number(item.precio).toLocaleString()}</span>
                </div>
                <button id="remove-btn-${item.id}" class="text-xs text-rose-400">Eliminar</button>
            </div>`;
    });

    cart.forEach(item => {
        document.getElementById(`remove-btn-${item.id}`).addEventListener('click', () => removeFromCart(item.id));
    });
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id != id);
    updateCart();
}

window.toggleCart = function() {
    document.getElementById('cart-sidebar').classList.toggle('translate-x-full');
}

window.enviarPedidoWhatsApp = function() {
    if (cart.length === 0) return alert("Tu carrito está vacío");
    let mensaje = "👑 *NUEVO PEDIDO DE L'ÉLITE* 👑\n\n*Detalle de la orden:*\n";
    cart.forEach(item => {
        mensaje += `• ${item.cantidad}x ${item.nombre} (Sub: $ ${(item.precio * item.cantidad).toLocaleString()} COP)\n`;
    });
    const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    mensaje += `\n💰 *Total Estimado: $ ${total.toLocaleString()} COP*\n\nQuiero coordinar la entrega y el pago por favor.`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

document.getElementById('btn-cart').addEventListener('click', () => toggleCart());
escucharProductos();
