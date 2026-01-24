# App de BI con IA (React + Tailwind + Gemini 3 + Supabase/Postgres + MCP)

Quiero que generes una aplicación web de **Business Intelligence con IA** que permita:

- Consultar y explotar información de forma dinámica usando **lenguaje natural**.
- Usar **Gemini 3 de Google** (tengo API key) para interpretar las peticiones en lenguaje natural y generar análisis.[web:12][web:22]
- Conectarse a **PostgreSQL en Supabase** (ya tengo proyecto y API key) usando **MCP (Model Context Protocol)** para ejecutar consultas de forma segura y controlada.[web:8][web:5][web:23]

---

## Frontend

- Framework: **React 18+** con **Vite** o **Next.js** (elige el más adecuado para una app tipo dashboard de BI).
- Lenguaje: **TypeScript**.
- Estilos: **Tailwind CSS** para un diseño moderno, **responsive** (desktop/tablet/móvil) y con soporte de modo oscuro.[web:16][web:26]
- Arquitectura:
  - Layout principal con:
    - Barra lateral con un **menú fijo** con las opciones: **“Compras”, “Mermas”, “Producción”, “Ventas”**.
    - Topbar con buscador, usuario y acciones (exportar/compartir).
    - Área de contenido principal para mostrar gráficos, tablas y análisis.
  - Componentes reutilizables:
    - `NaturalLanguageQueryInput`: caja de texto tipo chat para que el usuario escriba la pregunta en lenguaje natural (incluye botón de enviar y sugerencias de ejemplos).
    - `ResultsView`: que pueda mostrar resultados en:
      - **Gráficos dinámicos** (seleccionando automáticamente el tipo de gráfica más adecuado: barras, líneas, pastel, tabla, etc., según la estructura de los datos devueltos).[web:7][web:10][web:13]
      - **Tabla** cuando no tenga sentido un gráfico.
    - `SummaryPanel`: muestra siempre un **análisis resumido** en texto de la información mostrada (resumen ejecutivo).
    - `ReportHistory`: lista de reportes generados (histórico), con:
      - Nombre del reporte.
      - Prompt en lenguaje natural.
      - SQL generado.
      - Fecha/hora.
      - Indicador si está “fijado”.
    - `PinnedReports`: sección que muestra reportes fijados (favoritos/frecuentes).
  - State management: **Context API o Zustand/Redux Toolkit** para manejar:
    - Estado de sesión de usuario (aunque puede ser simple).
    - Estado del menú (compras, mermas, etc.).
    - Estado de consultas actuales, resultados, histórico y fijados.
  - UX:
    - Manejo de **loading** y **errores**.
    - Cuando la IA no entienda la petición, mostrar un mensaje claro pidiendo refinamiento y sugerir ejemplos de prompts.
    - No mostrar datos dummy: solo se debe mostrar información real proveniente de la base de datos.
  - Exportaciones:
    - Botones para **exportar** el resultado actual a **CSV** y **PDF**.
    - Opción para **compartir por link**, generando una URL única que permita abrir el reporte (solo lectura).

---

## Backend

- Tecnología: **Node.js** con **TypeScript** usando **NestJS o Express** (elige una y justifica brevemente).
- Arquitectura:
  - Capas: controllers, services, repositories, DTOs, middleware.
  - API REST con prefijo `/api/v1`.
- Conexión a base de datos:
  - **PostgreSQL en Supabase**, usando **MCP** para la interacción con la base (no conexión directa cruda, sino a través de un servidor MCP que respete permisos y políticas de Supabase).[web:8][web:5][web:23]
  - Explica cómo configurar el MCP para poder ejecutar consultas SQL a la base de datos de Supabase (incluyendo manejo de credenciales y seguridad básica).
- Integración con Gemini:
  - Usa el **SDK oficial de Gemini** para Node.js (Google Generative AI / Gemini API) para consumir el modelo Gemini 3.[web:12][web:22]
  - Endpoints clave:
    - `POST /natural-query`:
      - Recibe: texto de la consulta del usuario + contexto (ej. módulo activo: compras, mermas, etc.).
      - Llamar a Gemini para:
        1. Interpretar la intención.
        2. Generar una consulta SQL segura y optimizada sobre la base de datos Supabase, considerando la estructura del esquema (usa información del MCP).
        3. Validar que la consulta no haga operaciones de escritura/destructivas (solo lectura).
      - Ejecutar el SQL resultante contra Postgres vía MCP.
      - Devolver al frontend:
        - Datos en formato tabular (rows, columns).
        - Metadatos que ayuden a elegir el tipo de gráfica (ej. columnas numéricas, categóricas, fechas, etc.).
        - Un **resumen ejecutivo** generado por Gemini en base a los resultados.
    - `POST /refine-query`:
      - Cuando la intención del usuario no sea clara, la IA debe devolver una respuesta indicando que necesita más detalles y sugerir preguntas aclaratorias.
    - `GET /report-history`:
      - Devuelve el histórico de reportes (con paginación).
    - `POST /reports`:
      - Guarda en una tabla de historial:
        - Prompt original del usuario.
        - SQL generado.
        - Tipo de vista (gráfico/tabla).
        - Módulo (compras, mermas, producción, ventas).
        - Marcador de si está fijado o no.
    - `PATCH /reports/:id/pin`:
      - Permite fijar o desfijar un reporte.
    - `GET /reports/:id`:
      - Permite volver a ejecutar un reporte guardado usando el mismo SQL (sin regenerar con la IA, salvo que se indique lo contrario).
    - `POST /share-report`:
      - Genera un **link único** (token) para compartir un reporte en modo solo lectura.
- Reglas importantes:
  - **No inventar información** ni generar datos ficticios: solo ejecutar consultas contra la base de datos real.
  - Validar que cualquier SQL autogenerado sea solo de lectura (SELECT).
  - Cuando la petición del usuario no sea clara, **no ejecutar SQL**, sino pedir refinamiento vía mensaje y devolver sugerencias de reformulación.
  - Loguear las consultas y respuestas de la IA para auditoría (sin exponer datos sensibles como contraseñas).

---

## Base de datos (PostgreSQL / Supabase)

- Usa mi proyecto de **Supabase** (asume que se puede configurar via variables de entorno).
- Implementa tablas de soporte para el sistema de BI (no inventes datos, pero define estructura), por ejemplo:
  - `reports_history`:
    - `id`, `user_id`, `module` (compras/mermas/produccion/ventas), `prompt_text`, `sql_text`, `created_at`, `updated_at`, `is_pinned`, `shared_token` (nullable).
  - Puedes asumir que las tablas de negocio (`compras`, `ventas`, etc.) ya existen y solo necesitas consultarlas.
- Usa migraciones o esquema SQL claro.

---

## Integración MCP + Supabase

- Explica cómo se configura un **servidor MCP de Supabase** que provea acceso a la base de datos PostgreSQL del proyecto y cómo el backend lo utilizaría para:
  - Recibir el SQL generado por Gemini.
  - Ejecutarlo de forma segura y controlada.
  - Devolver resultados al backend.[web:8][web:5][web:23]
- Si es posible, incluye ejemplo de configuración básica (archivo de configuración MCP + ejemplo de llamada desde Node.js).

---

## Exportación y compartición

- Implementa endpoints y lógica para:
  - Exportar resultados actuales a **CSV** y **PDF**.
  - Generar un **link compartible** para un reporte, que cuando se abra:
    - Consulte por `shared_token`.
    - Ejecute el SQL guardado.
    - Muestre la misma vista (gráfico/tabla) sin permitir modificar el reporte.

---

## Requisitos de comportamiento de la IA

- La IA con Gemini debe:
  - Interpretar correctamente el contexto del módulo seleccionado (Compras, Mermas, Producción, Ventas).
  - Detectar cuando una consulta es ambigua y pedir refinamiento (con mensajes claros).
  - Generar siempre un **análisis resumido** (texto corto) de los datos visualizados.
  - Nunca inventar datos ni “simular resultados”; si no hay datos, decirlo claramente.

---

## Entregables

- Estructura de carpetas completa del **frontend** y **backend**.
- Ejemplos de código para:
  - Componentes principales de React (layout, menú, entrada de lenguaje natural, vista de resultados, historial, fijados).
  - Endpoints clave del backend (`/natural-query`, `/reports`, `/report-history`, etc.).
  - Integración con Gemini 3 y ejemplo de prompt interno para generar SQL.
  - Integración con MCP + Supabase.
- Instrucciones para:
  - Configurar variables de entorno (Gemini API key, Supabase, MCP).
  - Levantar el entorno en desarrollo (scripts npm/yarn).
  - Opcional: archivos de configuración para **Docker / docker-compose** para frontend, backend y base de datos, si aplica.
- Aplica buenas prácticas de seguridad, manejo de errores y separación de responsabilidades.
