/**
 * Punto de entrada principal de la aplicación
 * Sistema de Gestión Inmobiliaria
 */
import Server from './models/Server';

// Crear instancia del servidor
const app = new Server();

// Iniciar servidor
app.start();
