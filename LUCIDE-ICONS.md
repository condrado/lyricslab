# Lucide Icons - Guía de Uso

## 📚 Librería Instalada

**Lucide Icons** está incluida en todas las páginas HTML del proyecto.

- **CDN:** `https://unpkg.com/lucide@latest`
- **Iconos disponibles:** 1000+
- **Documentación oficial:** https://lucide.dev/icons/

---

## 🎯 Cómo Usar

### 1. En HTML (Método simple)

Usa el atributo `data-lucide`:

```html
<!-- Icono de música -->
<i data-lucide="music"></i>

<!-- Icono de usuario -->
<i data-lucide="user"></i>

<!-- Icono con tamaño personalizado -->
<i data-lucide="heart" style="width: 32px; height: 32px;"></i>

<!-- Icono con clase CSS -->
<i data-lucide="star" class="mi-icono-personalizado"></i>
```

### 2. En JavaScript (Método dinámico)

```javascript
// Crear icono programáticamente
const iconElement = document.createElement('i');
iconElement.setAttribute('data-lucide', 'search');
document.body.appendChild(iconElement);

// Inicializar iconos después de añadir
lucide.createIcons();
```

---

## 🎨 Iconos Útiles para el Proyecto

### Música y Audio
```html
<i data-lucide="music"></i>          <!-- Nota musical -->
<i data-lucide="music-2"></i>        <!-- Notas musicales -->
<i data-lucide="mic"></i>            <!-- Micrófono -->
<i data-lucide="headphones"></i>     <!-- Auriculares -->
<i data-lucide="volume-2"></i>       <!-- Volumen -->
<i data-lucide="play"></i>           <!-- Play -->
<i data-lucide="pause"></i>          <!-- Pause -->
<i data-lucide="skip-forward"></i>   <!-- Siguiente -->
```

### Navegación
```html
<i data-lucide="home"></i>           <!-- Inicio -->
<i data-lucide="menu"></i>           <!-- Menú hamburguesa -->
<i data-lucide="search"></i>         <!-- Buscar -->
<i data-lucide="arrow-left"></i>     <!-- Flecha izquierda -->
<i data-lucide="arrow-right"></i>    <!-- Flecha derecha -->
<i data-lucide="chevron-down"></i>   <!-- Chevron abajo -->
```

### Acciones
```html
<i data-lucide="plus"></i>           <!-- Añadir -->
<i data-lucide="minus"></i>          <!-- Quitar -->
<i data-lucide="edit"></i>           <!-- Editar -->
<i data-lucide="trash"></i>          <!-- Eliminar -->
<i data-lucide="save"></i>           <!-- Guardar -->
<i data-lucide="x"></i>              <!-- Cerrar -->
<i data-lucide="check"></i>          <!-- Check/OK -->
<i data-lucide="copy"></i>           <!-- Copiar -->
```

### Educación
```html
<i data-lucide="book"></i>           <!-- Libro -->
<i data-lucide="book-open"></i>      <!-- Libro abierto -->
<i data-lucide="graduation-cap"></i> <!-- Graduación -->
<i data-lucide="languages"></i>      <!-- Idiomas -->
<i data-lucide="type"></i>           <!-- Texto/Tipografía -->
```

### Verbos y Gramática
```html
<i data-lucide="bookmark"></i>       <!-- Marcador -->
<i data-lucide="file-text"></i>      <!-- Documento -->
<i data-lucide="list"></i>           <!-- Lista -->
<i data-lucide="message-circle"></i> <!-- Mensaje/Chat -->
<i data-lucide="pen-tool"></i>       <!-- Herramienta escritura -->
```

### Estado
```html
<i data-lucide="alert-circle"></i>   <!-- Alerta -->
<i data-lucide="info"></i>           <!-- Información -->
<i data-lucide="help-circle"></i>    <!-- Ayuda -->
<i data-lucide="loader"></i>         <!-- Cargando -->
<i data-lucide="check-circle"></i>   <!-- Success -->
<i data-lucide="x-circle"></i>       <!-- Error -->
```

### Otros
```html
<i data-lucide="settings"></i>       <!-- Configuración -->
<i data-lucide="user"></i>           <!-- Usuario -->
<i data-lucide="heart"></i>          <!-- Corazón/Favorito -->
<i data-lucide="star"></i>           <!-- Estrella -->
<i data-lucide="external-link"></i>  <!-- Link externo -->
<i data-lucide="download"></i>       <!-- Descargar -->
<i data-lucide="upload"></i>         <!-- Subir -->
```

---

## 🎨 Estilos CSS

Los iconos heredan el color del texto y se pueden estilizar con CSS:

```css
/* Color personalizado */
i[data-lucide] {
  color: #6366f1;
}

/* Tamaño */
.icon-large {
  width: 32px;
  height: 32px;
}

/* Animación */
.icon-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* Color al hover */
i[data-lucide]:hover {
  color: #4f46e5;
}
```

---

## ⚡ Ejemplos Prácticos

### Reemplazar emojis por iconos

**Antes:**
```html
<button>🔍 Buscar</button>
```

**Después:**
```html
<button>
  <i data-lucide="search"></i>
  Buscar
</button>
```

### Botones con iconos
```html
<!-- Botón de añadir -->
<button class="btn-add">
  <i data-lucide="plus-circle"></i>
  Añadir Canción
</button>

<!-- Botón de eliminar -->
<button class="btn-delete">
  <i data-lucide="trash-2"></i>
  Eliminar
</button>
```

### Input con icono
```html
<div class="input-with-icon">
  <i data-lucide="search"></i>
  <input type="text" placeholder="Buscar verbo...">
</div>
```

---

## 🔄 Inicialización

Los iconos se inicializan automáticamente en:
- `js/script.js`
- `js/verbs.js`
- `js/manage-songs.js`

Si añades iconos dinámicamente, llama:
```javascript
lucide.createIcons();
```

---

## 📖 Más Información

- Ver todos los iconos: https://lucide.dev/icons/
- Buscar iconos por categoría
- Copiar SVG o código HTML directamente
- Todos los iconos son SVG (ligeros y escalables)
