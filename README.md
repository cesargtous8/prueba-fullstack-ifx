# VM Management Platform

> Plataforma de gestión de máquinas virtuales desarrollada con **Angular 17+ (Standalone)** y **ASP.NET Core 8 Web API**, con actualización en tiempo real mediante **SignalR**.

---

## Tabla de Contenidos

1. [Guía de Ejecución Local](#1-guía-de-ejecución-local)
2. [Credenciales de Prueba](#2-credenciales-de-prueba)
3. [Arquitectura Base](#3-arquitectura-base)
4. [Estructura Técnica del Frontend](#4-estructura-técnica-del-frontend)
5. [Bitácora de IA (Prompts Profesionales)](#5-bitácora-de-ia-prompts-profesionales)

---

## 1. Guía de Ejecución Local

### 1.1 Prerrequisitos

| Herramienta | Versión mínima |
|---|---|
| .NET SDK | 8.0 |
| Node.js | 18.x |
| npm | 9.x |
| Angular CLI | 17.x |

---

### 1.2 Clonar repositorio

```bash
git clone <url-del-repositorio>
cd prueba-fullstack-ifx
```

---

### 1.3 Levantar Backend (.NET 8)

```powershell
cd backend/VmManager.Api
dotnet restore
dotnet run
```

Backend disponible en:
- `http://localhost:5000`

---

### 1.4 Levantar Frontend (Angular)

```powershell
cd frontend/vm-manager-web
npm install
ng serve
```

Frontend disponible en:
- `http://localhost:4200`

---

### 1.5 Configuración de entorno Frontend

Verificar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  wsUrl: 'http://localhost:5000/hubs/vms',
  wsEvents: {
    vmStatusChanged: 'vmStatusChanged'
  }
};
```

---

## 2. Credenciales de Prueba

Usuarios precargados por seed en backend:

| Rol | Email | Contraseña | Alcance |
|---|---|---|---|
| Administrador | `admin@ifx.com` | `Admin123` | CRUD completo de VMs |
| Cliente | `cliente@ifx.com` | `Cliente123` | Consulta de VMs según política del sistema |

> Uso exclusivo para entorno local/de evaluación.

---

## 3. Arquitectura Base

```text
[Angular SPA]
    │  HTTP (REST, cookies)
    ▼
[ASP.NET Core 8 API]
    │
    ├── Auth + RBAC
    ├── VMs CRUD
    ├── SignalR Hub (/hubs/vms)
    ▼
[SQLite / EF Core]
```

Flujo de tiempo real:
1. Admin actualiza una VM.
2. API persiste cambios.
3. Hub SignalR emite evento.
4. Frontend sincroniza estado sin recargar.

---

## 4. Estructura Técnica del Frontend

```text
src/app/
├── core/
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
│       ├── auth.service.ts
│       ├── vm.service.ts
│       ├── vm-store.service.ts
│       └── realtime.service.ts
├── features/
│   ├── auth/
│   ├── dashboard/
│   └── vms/
├── shared/
├── app.config.ts
└── app.routes.ts
```

---

## 5. Bitácora de IA (Prompts Profesionales)

### Prompt profesional — Corrección de errores Frontend

```text
Actúa como arquitecto Angular senior.
Revisa mi frontend Angular standalone (TypeScript estricto) y corrige los errores de compilación y tipado sin romper la arquitectura.
Objetivos:
1) Corregir incompatibilidades de tipos entre DTOs del backend y modelos de UI.
2) Estandarizar status y campos de VM con mapeadores explícitos (UI ↔ API).
3) Asegurar manejo correcto de sesión por cookies HttpOnly con withCredentials.
4) Validar guards, interceptores, servicios y rutas protegidas por rol.
5) Entregar cambios por archivo con código final listo para compilar.
```

### Prompt profesional — Corrección de errores Backend (.NET)

```text
Actúa como arquitecto .NET 8 senior.
Analiza mi API ASP.NET Core para corregir errores funcionales y de seguridad en autenticación, autorización y endpoints de VMs.
Objetivos:
1) Verificar login con cookie HttpOnly/Secure/SameSite y sin exponer JWT en response body.
2) Validar middleware de autenticación y autorización por roles (Administrador/Cliente).
3) Corregir rutas y contratos para que coincidan con el frontend (/api/auth/*, /api/vms, /hubs/vms).
4) Asegurar CORS con credenciales para http://localhost:4200.
5) Entregar versión final estable con manejo de errores y estructura profesional.
```
