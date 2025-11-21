# 🎵 Sistema de Búsqueda de Letras

## Cómo Funciona

El sistema utiliza un **servidor Node.js como proxy** para evitar problemas de CORS al buscar letras en APIs públicas.

### Arquitectura

```
Usuario → Navegador → Servidor Node.js (puerto 3001) → APIs Públicas
                                ↓
                        Devuelve letra sin CORS
```

### APIs Utilizadas (en orden de prioridad)

1. **Lyrics.ovh** - API principal, gratis y sin autenticación
   - Endpoint: `https://api.lyrics.ovh/v1/{artist}/{title}`
   - Funciona bien para canciones populares

2. **ChartLyrics** - API de respaldo, formato XML
   - Endpoint: `http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect`
   - Base de datos amplia pero respuesta más lenta

## Por Qué Algunas Canciones No Se Encuentran

### 🚫 Limitaciones de las APIs Públicas

- **Derechos de autor**: Muchas canciones populares tienen restricciones legales
- **Base de datos limitada**: Las APIs gratuitas no tienen todas las canciones
- **Nombres exactos**: El artista y título deben coincidir exactamente
- **Rate limiting**: Las APIs pueden limitar el número de peticiones

### 💡 Solución: Añadir Manualmente

Cuando una letra no se encuentra automáticamente, el sistema permite añadirla manualmente desde sitios como:

- **Genius.com** - Letras con anotaciones y traducciones
- **AZLyrics.com** - Base de datos extensa
- **Letras.com** - Incluye traducciones al español
- **Google** - Buscar "{artista} {canción} lyrics"

## Ejemplos de Uso

### Canciones que Suelen Funcionar Bien

✅ Coldplay - Yellow
✅ The Beatles - Yesterday  
✅ Queen - Bohemian Rhapsody
✅ Imagine Dragons - Believer

### Canciones que Pueden Fallar

❌ Linkin Park - Numb (restricciones de derechos)
❌ Canciones muy nuevas (aún no en las APIs)
❌ Canciones muy antiguas u oscuras

## Consejos

1. **Verifica ortografía**: El nombre del artista y canción deben ser exactos
2. **Prueba variaciones**: "feat.", "ft.", "&" pueden afectar la búsqueda
3. **Modo manual siempre disponible**: Si falla la búsqueda automática
4. **Servidor activo**: Asegúrate de ejecutar `npm start` primero

## Código Relevante

### Cliente (`js/lyricsAPI.js`)
```javascript
// Primero intenta con el proxy (evita CORS)
await this.fetchFromProxy(artist, title)
```

### Servidor (`server/save-songs-server.js`)
```javascript
// El servidor hace la petición HTTP desde Node.js (sin CORS)
GET /api/lyrics?artist=X&title=Y
```

## Futuras Mejoras

- [ ] Agregar más APIs de respaldo
- [ ] Implementar búsqueda fuzzy (aproximada)
- [ ] Cache de letras ya buscadas
- [ ] Integración con Spotify/Apple Music APIs
