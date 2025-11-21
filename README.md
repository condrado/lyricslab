# Aprende Inglés con Música

Aplicación web interactiva para aprender inglés mediante canciones con videos de YouTube, letras y notas personalizadas.

## 📁 Estructura del Proyecto

```
ingles-con-musica/
├── index.html              # Página principal (reproducción)
├── manage-songs.html       # Gestión de canciones
├── README.md              # Documentación
│
├── css/                   # Estilos
│   └── styles.css        # Estilos principales
│
├── js/                    # JavaScript
│   ├── script.js         # Lógica principal de la aplicación
│   ├── lyricsAPI.js      # API para obtener letras automáticamente
│   └── manage-songs.js   # Lógica de gestión de canciones
│
├── data/                  # Datos
│   └── songs.js          # Base de datos de canciones
│
└── server/                # Servidor Node.js
    └── save-songs-server.js  # Servidor para guardar canciones automáticamente
```

## 🚀 Características

- ✅ **Reproduce videos de YouTube** integrados
- ✅ **Añade canciones automáticamente** con letras desde API
- ✅ **Gestiona canciones** con página dedicada para eliminar
- ✅ **Toma notas** sobre cualquier línea de la letra
- ✅ **Guarda traducción, conjugaciones o enlaces** en cada nota
- ✅ **Persistencia automática** con localStorage
- ✅ **Auto-guarda en songs.js** al añadir canciones
- ✅ **Menú de navegación** entre reproducción y gestión
- ✅ **Diseño responsive** de 2 columnas
- ✅ **Resalta líneas con notas** existentes

## 📋 Cómo Usar

### Opción 1: npm start (Recomendado - Todo en uno)

**Inicia ambos servidores con un solo comando:**

```bash
npm install  # Solo la primera vez
npm start
```

Esto iniciará automáticamente:
- 🚀 Servidor de guardado y proxy de letras en `http://localhost:3001`
- 🌐 Servidor web en `http://localhost:8080`

Abre tu navegador en **http://localhost:8080**

> 💡 **Nota**: El servidor Node.js actúa como proxy para evitar problemas de CORS al buscar letras. Ver [README-LETRAS.md](./README-LETRAS.md) para más detalles.

### Opción 2: Live Server (VS Code)

1. Abre el proyecto en VS Code
2. Instala la extensión "Live Server"
3. Haz clic derecho en `index.html` → "Open with Live Server"
4. La aplicación se abrirá en `http://127.0.0.1:5500`
5. **(Opcional)** En otra terminal: `npm run server:save` para habilitar guardado automático

### Opción 3: Servidores Manuales

```bash
# Terminal 1: Servidor de guardado
node server/save-songs-server.js

# Terminal 2: Servidor web
python3 -m http.server 8080
# Abre http://localhost:8080
```

## 🎵 Añadir Canciones

### Método Automático (Recomendado):
1. Haz clic en **"+ Añadir Nueva Canción"**
2. Completa:
   - **Artista**: Ej: Linkin Park
   - **Título**: Ej: Numb
   - **URL YouTube**: La URL completa del video
3. Clic en **"Obtener Letra Automáticamente"**
4. La canción se añade con su letra desde la API

### Método Manual:
1. Edita `data/songs.js`
2. Añade un objeto con este formato:
```javascript
{
    id: 'identificador-unico',
    title: 'Título de la Canción',
    artist: 'Nombre del Artista',
    youtubeId: 'ID_del_video',
    lyrics: `Primera línea
Segunda línea

Tercera línea...`
}
```

## �️ Gestionar Canciones

Accede a la página de gestión desde el **menú hamburguesa** (esquina superior derecha) o directamente en `manage-songs.html`.

### Funcionalidades:
- 📋 **Ver todas las canciones** en tarjetas organizadas
- 🗑️ **Eliminar canciones** con confirmación
- 🔄 **Sincronización automática** con localStorage y songs.js
- 📊 **Contador de canciones** en tiempo real

### Proceso de Eliminación:
1. Haz clic en **"🗑️ Eliminar"** en la canción deseada
2. Confirma la eliminación
3. La canción se elimina de:
   - Array `songsData` en memoria
   - `localStorage`
   - Notas asociadas
   - Archivo `songs.js` (si servidor activo)

> ⚠️ **Nota**: La eliminación es permanente y no se puede deshacer.

## �💾 Guardar Canciones Permanentemente

### Con Servidor de Guardado (Automático):
1. Inicia el servidor Node.js:
```bash
cd server
node save-songs-server.js
```
2. El servidor se ejecutará en `http://localhost:3001`
3. Añade canciones desde la interfaz
4. Haz clic en **"📥 Exportar Canciones"**
5. ¡El archivo `data/songs.js` se actualiza automáticamente!

### Sin Servidor (Manual):
- Haz clic en **"📥 Exportar Canciones"**
- Se descargará el archivo `songs.js`
- Reemplaza `data/songs.js` con el descargado

## 🔌 APIs de Letras

La aplicación intenta obtener letras de múltiples APIs en cascada:
1. **Lyrics.ovh** - Primera opción
2. **ChartLyrics** - Segunda opción

Si ninguna API tiene la canción, deberás añadir la letra manualmente.

> 📖 **¿Problemas para encontrar letras?** Lee la [Guía del Sistema de Letras](./README-LETRAS.md) para entender cómo funciona, limitaciones de las APIs públicas, y qué hacer cuando una canción no se encuentra automáticamente.

## 🛠️ Tecnologías

- **HTML5** - Estructura
- **CSS3** - Estilos (Variables CSS, Grid, Flexbox)
- **JavaScript Vanilla** - Lógica
- **Node.js** - Servidor de guardado (opcional)
- **YouTube IFrame API** - Videos embebidos
- **LocalStorage** - Persistencia de datos

## 📝 Notas de Desarrollo

- Las notas se guardan en `localStorage` del navegador
- Las canciones personalizadas también se guardan en `localStorage`
- El servidor Node.js es opcional, solo para desarrollo
- Compatible con todos los navegadores modernos

## ⚖️ Derechos de Autor

Esta aplicación es para uso educativo personal. Las letras de canciones están protegidas por derechos de autor. El usuario es responsable de obtener las letras de fuentes legales y respetar los derechos de autor correspondientes.

---

**Desarrollado para aprender inglés de forma interactiva** 🎵📚
