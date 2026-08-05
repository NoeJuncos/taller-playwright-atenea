# Taller Playwright Atenea

Suite de pruebas end-to-end desarrollada con **Playwright + TypeScript**, con un pipeline de **CI/CD** en **GitHub Actions** que ejecuta automáticamente los tests en cada **push** y **pull request** sobre `main`, en **Chromium**, **Firefox** y **WebKit**, y publica el reporte HTML en **GitHub Pages**.

Este repositorio contiene la suite de automatización. La aplicación bajo prueba es **[redux-athena-bank](https://github.com/NoeJuncos/redux-athena-bank)**, una mini fintech desarrollada con Node.js, Express, MongoDB, React y Vite, que simula el registro de usuarios, autenticación y transferencias entre cuentas, desarrollada originalmente por **Atenea Conocimientos**.

---

## 📊 Último reporte

Cada ejecución del pipeline publica automáticamente un reporte HTML.

Podés acceder al más reciente desde la pestaña **Actions** de este repositorio, ingresando al último workflow ejecutado, o directamente mediante la URL:

`https://noejuncos.github.io/taller-playwright-atenea/report-<build-number>/`

El último número de build puede consultarse en la pestaña Actions de este repositorio.

---

## 🧰 Stack

- Playwright + TypeScript
- Page Object Model (POM)
- Node.js
- React + Vite
- MongoDB
- GitHub Actions (CI/CD)

---

## 📁 Estructura del proyecto

```text
.
├── .github/
│   └── workflows/
│       └── tests.yml
├── data/
│   └── testData.json
├── pages/
├── tests/
├── utils/
├── .gitignore
├── package.json
├── playwright.config.ts
└── README.md
```

---

## 🚀 Ejecutar los tests localmente

### Prerrequisitos

- Node.js 18 o superior
- La aplicación **redux-athena-bank** levantada localmente

Las instrucciones para instalar y ejecutar la aplicación bajo prueba se encuentran en el repositorio de **[redux-athena-bank](https://github.com/NoeJuncos/redux-athena-bank)**.

Una vez que el backend y el frontend estén en ejecución:

```bash
git clone https://github.com/NoeJuncos/taller-playwright-atenea.git
cd taller-playwright-atenea
npm install
npx playwright install --with-deps
npx playwright test
```

Para visualizar el reporte HTML generado localmente:

```bash
npx playwright show-report
```

---

## 🔄 Pipeline de CI/CD

En cada **push** o **pull request** sobre `main`, GitHub Actions:

1. Levanta un contenedor limpio de MongoDB.
2. Clona el repositorio `redux-athena-bank`.
3. Instala las dependencias y levanta el backend y el frontend de la aplicación.
4. Ejecuta la suite de Playwright.
5. Publica automáticamente el reporte HTML en GitHub Pages.

El proyecto **setup** (`registro.setup.ts`) se ejecuta antes del resto de la suite y crea automáticamente dos usuarios con cuentas bancarias utilizando correos electrónicos generados dinámicamente. Esto evita conflictos con datos existentes y permite que las ejecuciones sean reproducibles tanto en un entorno local como en CI.

Los tests de `transacciones.spec.ts` se ejecutan únicamente en **Chromium**, ya que reutilizan una única sesión autenticada compartida. Ejecutarlos simultáneamente en varios navegadores produciría condiciones de carrera sobre la misma cuenta.

---

## ✅ Cobertura

- Registro de usuarios (UI y API)
- Inicio de sesión
- Transferencias entre cuentas
- Validación de respuestas y códigos de estado de API
- Datos de prueba dinámicos
- Reutilización de autenticación mediante `storageState`

---

## ✍️ Autora

**Noelia Juncos**

- LinkedIn: [Noelia Juncos](https://linkedin.com/in/noelia-juncos-qa)
- GitHub: [NoeJuncos](https://github.com/NoeJuncos)
