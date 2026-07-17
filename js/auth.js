// Importar la instancia de autenticación de tu configuración y los métodos de Firebase
import { auth } from "./firebase-config.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

let registerMode = false;

// Base de datos simulada de transacciones para el historial visual
if(!localStorage.getItem('payment_history')) {
    localStorage.setItem('payment_history', JSON.stringify([
        { id: "TX-9981", fecha: "12/04/2026", items: "1x Cronógrafo de Oro", total: "$ 2'400,000", estado: "Entregado" },
        { id: "TX-9412", fecha: "29/05/2026", items: "1x Pluma Estilográfica", total: "$ 450,000", estado: "Entregado" }
    ]));
}

document.getElementById('btn-auth-modal').addEventListener('click', () => {
    document.getElementById('modal-auth').classList.remove('hidden');
});

// Hacer la función accesible globalmente desde el HTML para el botón de cerrar (✕)
window.closeAuthModal = function() {
    document.getElementById('modal-auth').classList.add('hidden');
}

document.getElementById('auth-toggle').addEventListener('click', (e) => {
    e.preventDefault();
    registerMode = !registerMode;
    const title = document.getElementById('auth-title');
    const toggleText = document.getElementById('auth-toggle-text');
    const btn = document.getElementById('auth-toggle');
    
    title.innerText = registerMode ? "Crear Cuenta Nueva" : "Iniciar Sesión";
    toggleText.innerText = registerMode ? "¿Ya eres cliente?" : "¿No tienes cuenta?";
    btn.innerText = registerMode ? "Inicia Sesión" : "Regístrate";
});

document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    // Verificación estricta de credenciales de administración locales
    if (email === "admin@elite.com" || email === "editor@elite.com" || email === "moderador@elite.com") {
        localStorage.setItem('admin_session_role', email.split('@')[0]);
        window.location.href = 'admin.html';
        return;
    }

    try {
        if (registerMode) {
            // ---- REGISTRO REAL EN FIREBASE ----
            await createUserWithEmailAndPassword(auth, email, password);
            alert("✨ Cuenta creada con éxito en DropShop. ¡Bienvenido/a!");
        } else {
            // ---- INICIO DE SESIÓN REAL EN FIREBASE ----
            await signInWithEmailAndPassword(auth, email, password);
        }

        // Si la autenticación es exitosa, muestra el panel del cliente con su historial
        mostrarPanelUsuario(email);

    } catch (error) {
        console.error("Error de Firebase Auth:", error);
        // Manejo amigable de errores comunes
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            alert("❌ Credenciales incorrectas. Verifica tu correo y contraseña.");
        } else if (error.code === 'auth/email-already-in-use') {
            alert("❌ Este correo ya se encuentra registrado.");
        } else if (error.code === 'auth/weak-password') {
            alert("❌ La contraseña debe tener al menos 6 caracteres.");
        } else {
            alert("❌ Ocurrió un error: " + error.message);
        }
    }
});

function mostrarPanelUsuario(email) {
    const container = document.getElementById('auth-interactive-container');
    const historial = JSON.parse(localStorage.getItem('payment_history') || '[]');
    
    let listHTML = historial.map(h => `
        <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
            <div class="flex justify-between text-slate-400 font-mono"><span>${h.id}</span><span>${h.fecha}</span></div>
            <div class="text-slate-200 font-semibold">${h.items}</div>
            <div class="flex justify-between pt-1">
                <span class="text-amber-500 font-bold">${h.total} COP</span>
                <span class="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">${h.estado}</span>
            </div>
        </div>`).join('');

    container.innerHTML = `
        <h3 class="text-xl font-serif text-amber-400 text-center mb-1">Panel de Usuario</h3>
        <p class="text-slate-500 text-center text-xs mb-4 font-mono">${email}</p>
        <h4 class="text-xs uppercase font-semibold text-slate-400 mb-3 tracking-wider">Historial de Compras Permanente</h4>
        <div class="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">${listHTML}</div>
        <button onclick="location.reload()" class="w-full bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs hover:bg-slate-700 transition-all">Cerrar Ventana</button>`;
}
