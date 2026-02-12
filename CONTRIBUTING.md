# Guía de Contribución

## Configuración Local

### Requisitos
- Node.js >= 18.0.0
- npm o yarn
- Git

### Pasos

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/alienbcn/openclaw-railway-bot.git
   cd openclaw-railway-bot
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Crear archivo .env**
   ```bash
   cp .env.example .env
   # Edita .env y agrega tus tokens
   ```

4. **Verificar configuración**
   ```bash
   npm run typecheck
   ```

## Desarrollo

### Iniciar en desarrollo

```bash
# Terminal 1: Compilar TypeScript en watch mode
npm run build && npm run dev

# O usar tsx directamente
npm run dev
```

### Testing

```bash
# Por implementar
npm test
```

### Estructura de código

```
src/
├── index.ts                 # Entrada principal (desarrollo)
├── worker.ts               # Entrada para Railway (producción)
├── config.ts               # Configuración centralizada
├── types.ts                # Tipos TypeScript
│
├── telegram/               # Módulo Telegram
│   ├── bot.ts             # Instancia del bot
│   └── handlers.ts        # Manejadores de comandos
│
├── llm/                    # Módulo de LLM
│   └── openrouter.ts      # Cliente OpenRouter
│
├── mcp/                    # Integración MCP
│   └── playwright.ts      # Herramientas de navegación
│
└── api/                    # API y webhooks
    └── webhooks.ts        # Manejador de webhooks
```

## Cambios y Pull Requests

1. **Crear rama**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Hacer cambios**
   - Mantén commits atómicos
   - Usa mensajes descriptivos

3. **Testing local**
   ```bash
   npm run typecheck
   npm run build
   npm run dev  # Prueba con tu token
   ```

4. **Push y PR**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

## Guía de Estilo

- **TypeScript**: Tipado estricto
- **Naming**: `camelCase` para variables/funciones, `PascalCase` para clases
- **Imports**: Usa `import` de ES6, siempre con extensión `.js`
- **Async/Await**: Preferido sobre `.then()`

## Áreas de Desarrollo Activo

### Implementación Completa (TODO)

- [ ] MCP Playwright completamente funcional
- [ ] Soporte para imágenes/documentos
- [ ] Persistencia de datos (DB)
- [ ] Webhooks HTTP server
- [ ] Tests unitarios
- [ ] Monitoring y alertas

### Mejoras Sugeridas

- Caché de respuestas
- Rate limiting
- Análisis de sentimientos
- Múltiples idiomas
- Comandos administrativos
- Estadísticas de uso

## Reporte de Bugs

Abre un issue con:
- Descripción clara
- Pasos para reproducir
- Comportamiento esperado vs actual
- Logs relevantes

## Preguntas

Para preguntas sobre arquitectura o diseño, abre una discussion o contacta al mantenedor.
