# MEMORIA DEL PROYECTO - Ocampo Demoliciones

## Información General
- **Cliente:** Ocampo Demoliciones
- **Sitio Web:** https://ocampo.cl
- **Repositorio:** https://github.com/matiasgenosur/ocampo
- **Hosting:** Vercel

---

## Contacto
- **Teléfono/WhatsApp:** +56 9 5901 8142
- **Email público:** contacto@ocampo.cl
- **Email formulario (destino):** ricardo@ocampo.cl

---

## Stack Tecnológico
- **HTML5** - Estructura semántica
- **Tailwind CSS** (CDN) - Estilos y responsive design
- **JavaScript** (Vanilla) - Interacciones
- **EmailJS** - Envío de formularios

---

## Configuración EmailJS
- **Service ID:** `service_jt61vpd`
- **Public Key:** `ZZh3xYaDiDCM8EggD`
- **Template Ricardo:** `template_h71lsx4` (envía a ricardo@ocampo.cl)
- **Template Cliente:** `template_tag9nse` (copia de confirmación al cliente)

---

## Estructura del Proyecto
```
ocampo/
├── index.html              # Página principal (single page)
├── css/
│   └── styles.css          # Estilos personalizados
├── js/
│   └── main.js             # JavaScript (menú, formulario, animaciones)
└── images/
    ├── logo.png            # Logo header
    ├── logo-white.png      # Logo footer
    ├── favicon.ico         # Favicon
    ├── favicon-16.png      # Favicon 16x16
    ├── favicon-32.png      # Favicon 32x32
    ├── apple-touch-icon.png # Icon iOS 180x180
    ├── hero-demolition.jpg # Imagen hero (placeholder)
    ├── about-team.jpg      # Foto equipo
    ├── project-1.jpg       # Demolición Residencial - Casa Las Condes
    ├── project-2.jpg       # Retiro de Asbesto
    ├── project-3.jpg       # Excavación Masiva - Sitio Edificio Santiago Centro
    ├── project-4.jpg       # Estructura Metálica
    ├── project-5.jpg       # Corte Diamantado
    └── project-6.jpg       # Demolición Comercial
```

---

## Secciones del Sitio

### 1. Header
- Logo (h-28 móvil, h-40 desktop)
- Navegación: Inicio, Servicios, Proceso, Proyectos, Nosotros, Cotizar
- Menú hamburguesa en móvil
- Header fijo con backdrop blur

### 2. Hero
- Título: "Expertos en Demolición Industrial y Comercial"
- Badge: "+20 Años de Experiencia"
- CTAs: "Solicitar Cotización" y "Ver Servicios"

### 3. Estadísticas
- +500 Proyectos Realizados
- +20 Años de Experiencia
- 100% Clientes Satisfechos
- 0 Accidentes Laborales

### 4. Servicios (6 cards)
1. Demoliciones de Pequeña y Gran Envergadura
2. Demolición de Estructuras Metálicas
3. Movimientos de Tierra y Excavación
4. Cortes con Hilo y Disco Diamantado
5. Gestión y Retiro de Asbesto
6. Cierres Perimetrales

### 5. Proceso (5 pasos)
1. Contacto Inicial
2. Inspección Técnica
3. Cotización y Permisos
4. Ejecución
5. Limpieza y Entrega

### 6. Proyectos (6 cards)
1. **Demolición Residencial** - Casa en Las Condes, Santiago
2. **Retiro de Asbesto** - Hospital Regional, Valparaíso
3. **Excavación Masiva** - Sitio para Edificio, Santiago Centro
4. **Estructura Metálica** - Galpón Logístico, Pudahuel
5. **Corte Diamantado** - Centro Comercial, Las Condes
6. **Demolición Comercial** - Edificio Corporativo, Providencia

### 7. Nosotros
- Historia de la empresa
- Valores: Seguridad, Eficiencia, Profesionalismo, Sustentabilidad
- Foto del equipo

### 8. Contacto
- Info: Teléfono, Email, Dirección
- Formulario: Nombre, Empresa, Email, Teléfono, Servicio, Mensaje
- Redes sociales (placeholders)

### 9. Footer
- Logo blanco
- Enlaces rápidos
- Lista de servicios
- Copyright 2025

### 10. WhatsApp Flotante
- Botón verde fijo en esquina inferior derecha
- Link directo a chat con mensaje predefinido

---

## Colores (Tailwind Config)
- **ocampo-red:** #C41E3A
- **ocampo-red-dark:** #9B1B30
- **ocampo-black:** #1A1A1A
- **ocampo-gray:** #2D2D2D

## Tipografías
- **Headings:** Montserrat (400, 600, 700, 800)
- **Body:** Open Sans (400, 500, 600)

---

## Funcionalidades JavaScript
- Menú móvil toggle
- Smooth scroll
- Header scroll effect (shadow al hacer scroll)
- Scroll reveal animations
- Process steps animation
- Contact form con EmailJS
- Form validation
- Notifications
- Counter animation
- WhatsApp click tracking (Google Analytics ready)

---

## SEO
- Meta description optimizada
- Keywords: demoliciones, empresa demolición, retiro asbesto, demolición industrial, corte diamantado, excavación, demolición Chile
- Open Graph tags
- Estructura semántica HTML5
- Favicon múltiples tamaños

---

## Campos del Formulario (para EmailJS)
Los templates de EmailJS deben usar estas variables exactas:
- `{{nombre}}` - Nombre del cliente
- `{{empresa}}` - Nombre de la empresa
- `{{email}}` - Email del cliente
- `{{telefono}}` - Teléfono del cliente
- `{{servicio}}` - Servicio seleccionado
- `{{mensaje}}` - Descripción del proyecto

---

## Clases Tailwind del Logo (Header)
```html
<!-- Header container -->
<div class="flex items-center justify-between h-32 md:h-44">

<!-- Logo imagen -->
<img src="images/logo.png" alt="Ocampo Demoliciones" class="h-28 md:h-40 py-2">
```

---

## URLs de Imágenes Originales (Google Drive)
Por si necesitan descargarse de nuevo:

- **Logo:** `1N-6eWBEsru9igcdeWR-I93VSui8kl831`
- **Foto equipo:** `1OXi-AeseoLJP2WeSkGbKLWK8jpZP1LL1`
- **Project 1 (Residencial Las Condes):** `18svsUTlYCJrHzMVLo5yyWijjEmk84eIY`
- **Project 2 (Retiro Asbesto):** `1FcVLfWzjwSChy1YCkn6BUJdyGhhKYe6G`
- **Project 3 (Excavación):** `1pBzUD7M90pvYYy8VCxEOKmBnFRs1EZLM`
- **Project 4 (Estructura Metálica):** `192CWOA__bkFjnPjYm3RJRbfj924lrzFn`
- **Project 5 (Corte Diamantado):** `18kwi2OMDLooeLtGmtfu13WprEdXJ9vPL`
- **Project 6 (Demolición Comercial):** `11wt79TQGNPich1jYQK9zBf4lTAKsMkY0`

Para descargar: `curl -L "https://drive.google.com/uc?export=download&id=ID_AQUI" -o archivo.jpg`

---

## Usuarios Objetivo (del PRD)
- Empresas constructoras
- Inmobiliarias
- Entidades públicas / municipalidades
- Concesionarias y autopistas
- Arquitectos e ingenieros
- Empresas mineras
- Propietarios de terrenos particulares

---

## Pendientes / Mejoras Futuras
- [ ] Agregar foto hero real (actualmente placeholder)
- [ ] Configurar Google Analytics
- [ ] Configurar Google Search Console
- [ ] Actualizar proyectos 2, 4, 6 con información real
- [ ] Agregar links reales a redes sociales
- [ ] Crear página de política de privacidad
- [ ] Crear página de términos de servicio

---

## Historial de Cambios Importantes
1. Sitio inicial creado con todas las secciones
2. Logo oficial integrado
3. Teléfono/WhatsApp: +56 9 5901 8142
4. Email: contacto@ocampo.cl
5. EmailJS configurado para formulario
6. Favicon creado desde logo
7. Fotos actualizadas: equipo, proyectos (1-6)
