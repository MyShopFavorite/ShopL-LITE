
/*
🔥 INFRAESTRUCTURA GRATUITA FIREBASE 🔥
Este módulo está listo y cableado estructuralmente. Descomenta para producción.*/

// Importar los módulos que tu proyecto necesita utilizando la versión exacta que elegiste
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Credenciales reales de DropShop
const firebaseConfig = {
  apiKey: "AIzaSyDpvA1u2Rr-vylerp3TseJkbqqLRZ2VH0I",
  authDomain: "dropshop-6cf30.firebaseapp.com",
  projectId: "dropshop-6cf30",
  storageBucket: "dropshop-6cf30.firebasestorage.app",
  messagingSenderId: "279953381138",
  appId: "1:279953381138:web:6743ec4f9133b1233f05cb",
  measurementId: "G-7HF30SW1N2"
};

// Inicializar la aplicación
const app = initializeApp(firebaseConfig);

// Exportar los servicios listos para usar en tus otros scripts
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("🔥 DropShop conectado con éxito a Firebase");
