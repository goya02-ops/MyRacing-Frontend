# MyRacing - Frontend

Este es el repositorio del frontend para el proyecto MyRacing, trabajo práctico para la materia Desarrollo de Software de la UTN FRRO Comisión 301.

## Integrantes

- Chiesa, Máximo
- Goya, Santiago
- Marini, Luciano
- Teglia, Lisandro

## 🛠️ Tecnologías Utilizadas

- **Framework:** React 19
- **Bundler:** Vite
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Componentes:** Tremor (para UI)
- **Routing:** React Router DOM
- **Gestor de Paquetes:** pnpm

---

## 🚀 Instalación y Ejecución

Pasos para instalar y ejecutar el proyecto frontend. **Asegurarse de que el Backend esté corriendo antes de iniciar el frontend.**

### 1. Requisitos Previos

- **Node.js:** v20 o superior.
- **pnpm:** Este proyecto utiliza `pnpm`.

### 2. Obtener el Código e Instalar Dependencias

1.  **Clonar y Acceder:**
    ```bash
    git clone [URL_DEL_REPOSITORIO_FRONTEND]
    cd myracing-frontend
    ```
2.  **Instalar Dependencias:**
    ```bash
    pnpm install
    ```

### 3. Configurar la URL de la API (Backend)

La aplicación necesita la dirección del backend.

1.  **Crear** un archivo llamado **`.env.local`** en la **raíz del proyecto** (al mismo nivel que `package.json`).
2.  Copiar la siguiente línea, adaptando la URL si el backend no corre en `http://localhost:3000`:
    ```ini
    VITE_API_BASE_URL=http://localhost:3000/api
    ```
    _(El código fuente utiliza esta variable de entorno para configurar `API_BASE_URL`.)_

### 4. Ejecutar el Proyecto

Utilizar el script de desarrollo para iniciar la aplicación:

```bash
pnpm dev
```
