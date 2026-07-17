import { db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// --- FUNCIÓN DE COMPRESIÓN ---
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Ancho óptimo para web
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
        };
    });
}

// --- LÓGICA DE ADMINISTRACIÓN ---
if(!localStorage.getItem('admin_password_master')) {
    localStorage.setItem('admin_password_master', '1234');
}

window.unlockAdminDashboard = function() {
    const user = document.getElementById('adm-user').value.toLowerCase();
    const pass = document.getElementById('adm-pass').value;
    const master = localStorage.getItem('admin_password_master');
    
    if((user === 'admin' || user === 'editor' || user === 'moderador') && pass === master) {
        document.getElementById('admin-login-guard').classList.add('hidden');
        document.getElementById('admin-main-view').classList.remove('hidden');
        document.getElementById('display-role').innerText = user;
        
        const staffView = document.getElementById('admin-staff-management');
        if(user !== 'admin') {
            staffView.classList.add('opacity-30', 'pointer-events-none');
        } else {
            staffView.classList.remove('opacity-30', 'pointer-events-none');
        }
        renderChart();
    } else {
        document.getElementById('adm-fail-msg').classList.remove('hidden');
    }
}

window.updateMasterPassword = function() {
    const newP = document.getElementById('new-master-pass').value;
    if(!newP) return alert("Por favor, escribe una contraseña válida.");
    localStorage.setItem('admin_password_master', newP);
    alert("Contraseña maestra actualizada.");
    document.getElementById('new-master-pass').value = '';
}

let base64MediaString = "";
window.previewMediaAsset = async function(event) {
    const file = event.target.files[0];
    const previewBox = document.getElementById('media-local-preview');
    
    if(!file) return;
    previewBox.innerHTML = 'Optimizando imagen...';
    
    base64MediaString = await compressImage(file);
    previewBox.innerHTML = `<img src="${base64MediaString}" class="w-full h-20 object-cover rounded-lg border border-slate-700">`;
}

// --- GUARDAR PRODUCTO ---
document.getElementById('form-product').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prod-name').value;
    const price = document.getElementById('prod-price').value;
    const desc = document.getElementById('prod-desc').value;
    
    try {
        const productosRef = collection(db, "productos");
        await addDoc(productosRef, {
            nombre: name,
            precio: parseFloat(price),
            desc: desc,
            img: base64MediaString || "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600",
            stock: 5
        });

        alert(`📦 ¡"${name}" subido con éxito!`);
        document.getElementById('form-product').reset();
        document.getElementById('media-local-preview').innerHTML = '';
        base64MediaString = "";
    } catch (error) {
        alert("Error: " + error.message);
    }
});

// --- OTRAS FUNCIONES ---
document.getElementById('form-staff').addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Usuario de personal creado.");
});

window.logoutAdmin = function() {
    window.location.href = 'index.html';
}

function renderChart() {
    console.log("Gráfico renderizado");
}
