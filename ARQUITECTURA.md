# 🏗️ Arquitectura del Sistema

## 📁 Estructura de Archivos

```
ingles-con-musica/
├── index.html              # Página principal (reproducción)
├── manage-songs.html       # Página de gestión de canciones
├── README.md
├── ARQUITECTURA.md
├── README-LETRAS.md
├── VERSION.md
├── package.json
│
├── css/
│   └── styles.css          # Estilos globales (incluye menú y gestión)
│
├── js/
│   ├── script.js           # Lógica principal de reproducción
│   ├── lyricsAPI.js        # API para obtener letras
│   └── manage-songs.js     # Lógica de gestión de canciones
│
├── data/
│   └── songs.js            # Base de datos de canciones
│
└── server/
    └── save-songs-server.js  # Servidor Node.js (proxy + guardado)
```

## � Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    CARGA INICIAL (init())                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  1. loadSongsData()                                          │
│     ├── Lee data/songs.js                                    │
│     └── songsData = [...songs]                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. syncSongsWithLocalStorage()                              │
│     ├── Lee localStorage.getItem('customSongs')              │
│     ├── Compara: localStorage vs songsData                   │
│     │                                                         │
│     ├── SI localStorage tiene MÁS canciones:                 │
│     │   └── songsData = localStorage (tiene datos nuevos)    │
│     │                                                         │
│     └── SI songs.js tiene MÁS O IGUAL:                       │
│         └── localStorage = songsData (actualiza local)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. populateSongSelector()                                   │
│     └── Muestra TODAS las canciones en el dropdown          │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│              AÑADIR NUEVA CANCIÓN (user action)              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  1. handleFetchLyrics() o handleAddManualLyrics()            │
│     ├── Obtiene: artist, title, youtubeId, lyrics           │
│     └── Crea: newSong = { id, title, artist, youtubeId,     │
│                            lyrics }                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. songsData.push(newSong)                                  │
│     └── Añade la canción al array en memoria                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. saveCustomSongs()                                        │
│     ├── localStorage.setItem('customSongs', songsData)       │
│     ├── hasUnsavedChanges = true                             │
│     └── updateUnsavedIndicator() → Muestra (*)              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. populateSongSelector()                                   │
│     └── Actualiza dropdown con nueva canción                │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│         EXPORTAR/GUARDAR (Ctrl+S o botón Exportar)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  1. exportSongsToFile()                                      │
│     └── jsCode = generateSongsCode()                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. generateSongsCode()                                      │
│     ├── Itera sobre TODO songsData                           │
│     └── Genera: const songs = [...]                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Métodos de guardado (en cascada):                        │
│                                                              │
│     A. saveToServer() [PREFERIDO]                            │
│        ├── POST http://localhost:3001/save-songs             │
│        └── Guarda directamente en data/songs.js              │
│                                                              │
│     B. File System Access API [ALTERNATIVA]                  │
│        ├── showSaveFilePicker()                              │
│        └── Usuario elige ubicación                           │
│                                                              │
│     C. downloadFile() [FALLBACK]                             │
│        └── Descarga a carpeta de Descargas                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  4. hasUnsavedChanges = false                                │
│     └── updateUnsavedIndicator() → Oculta (*)               │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                 RECARGA DE PÁGINA (refresh)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  1. Lee data/songs.js (archivo actualizado)                  │
│  2. Compara con localStorage                                 │
│  3. Sincroniza (prevalece el que tenga más canciones)        │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Estados de Sincronización

### Estado 1: Primera Carga
```
songs.js (5 canciones) → localStorage (0 canciones)
Resultado: localStorage = songs.js (5 canciones)
```

### Estado 2: Añadir Canción
```
Usuario añade "Numb - Linkin Park"
songsData (6 canciones) → localStorage (6 canciones)
hasUnsavedChanges = true (*)
```

### Estado 3: Exportar
```
Exportar a songs.js
songs.js (6 canciones) ← songsData (6 canciones)
hasUnsavedChanges = false
```

### Estado 4: Recarga después de Exportar
```
songs.js (6 canciones) = localStorage (6 canciones)
✅ Sincronizados
```

### Estado 5: Cambios sin Guardar
```
songs.js (6 canciones) < localStorage (7 canciones)
⚠️ localStorage prevalece (tiene canción nueva sin guardar)
hasUnsavedChanges = true (*)
```

## 📝 Reglas de Sincronización

1. **Al cargar**: 
   - Si `localStorage.length > songs.js.length` → Usa localStorage
   - Si `localStorage.length <= songs.js.length` → Actualiza localStorage con songs.js

2. **Al añadir canción**:
   - Actualiza `songsData` en memoria
   - Guarda inmediatamente en localStorage
   - Marca `hasUnsavedChanges = true`

3. **Al exportar**:
   - Genera código completo de `songsData`
   - Guarda en `data/songs.js`
   - Marca `hasUnsavedChanges = false`

4. **Al cerrar pestaña**:
   - Si `hasUnsavedChanges = true` → Alerta al usuario

## 🎯 Ventajas del Sistema

✅ **No hay duplicados**: songs.js y localStorage siempre tienen el mismo contenido
✅ **No se pierden datos**: localStorage protege contra cierres accidentales
✅ **Sincronización inteligente**: Prevalece quien tenga más canciones
✅ **Feedback visual**: Indicador (*) muestra cambios sin guardar
✅ **Múltiples métodos**: 3 formas de exportar según disponibilidad

## 🛠️ Funciones Clave

| Función | Propósito |
|---------|-----------|
| `loadSongsData()` | Carga inicial desde songs.js |
| `syncSongsWithLocalStorage()` | Sincroniza al inicio |
| `saveCustomSongs()` | Guarda en localStorage después de añadir |

## 🗑️ Gestión de Canciones (Nueva Funcionalidad)

### Página: manage-songs.html

Esta página permite visualizar y eliminar canciones del sistema.

### Flujo de Eliminación

```
Usuario hace clic en "🗑️ Eliminar"
           ↓
Confirmación: "¿Estás seguro?"
           ↓
deleteSong(songId, songTitle)
           ↓
┌─────────────────────────────────────────┐
│ 1. Eliminar de songsData (array)        │
│    songsData.splice(index, 1)           │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 2. Actualizar localStorage               │
│    setItem('customSongs', songsData)    │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 3. Eliminar notas asociadas              │
│    delete notes[songId]                 │
│    setItem('notes', notes)              │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 4. Guardar en songs.js (servidor)       │
│    POST /save-songs                     │
│    → Actualiza data/songs.js            │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ 5. Re-renderizar vista                   │
│    renderSongs()                        │
└─────────────────────────────────────────┘
```

### Menú de Navegación

**Ubicación**: Esquina superior derecha (menú hamburguesa)

**Opciones**:
- 🎵 Reproducir Canciones (index.html)
- 📋 Gestionar Canciones (manage-songs.html)

**Funcionalidad**:
- Toggle al hacer clic en botón hamburguesa
- Cierre automático al hacer clic fuera
- Indicador visual de página activa

### Sincronización Bidireccional

```
index.html ←→ localStorage ←→ manage-songs.html
     ↓                              ↓
     └──── songs.js (servidor) ─────┘
```

**Escenario**: Usuario elimina canción en manage-songs.html
1. Se elimina de localStorage
2. Se actualiza songs.js vía servidor
3. Al volver a index.html, la canción no aparece (sincronización automática)

**Escenario**: Usuario añade canción en index.html
1. Se guarda en localStorage
2. Se actualiza songs.js vía servidor
3. Al abrir manage-songs.html, la canción aparece inmediatamente
| `exportSongsToFile()` | Exporta TODO a songs.js |
| `updateUnsavedIndicator()` | Muestra/oculta (*) |
| `setupBeforeUnloadHandler()` | Alerta al cerrar |

## 📦 Estructura de Datos

```javascript
// Estructura de una canción
{
  id: 'linkin-park-numb',
  title: 'Numb',
  artist: 'Linkin Park',
  youtubeId: 'kXYiU_JCYtU',
  lyrics: `I'm tired of being what you want me to be...`
}

// NO se incluye la propiedad "custom"
// Todas las canciones son iguales en estructura
```

## 🔒 Seguridad de Datos

1. **localStorage**: Persiste en navegador (no se pierde al cerrar)
2. **songs.js**: Archivo permanente del proyecto
3. **Doble protección**: Datos en ambos lugares
4. **Alerta preventiva**: Avisa antes de perder cambios
