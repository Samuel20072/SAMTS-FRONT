# FASE 3.4 — QA de Google Analytics 4 (GA4)

**Repositorio:** `~/SAMTS/SAMTS-FRONT`
**Rama:** `feat/admin-operations-hub`
**Fecha:** 2026-11-12
**Objetivo:** Resolver los 4 tests fallidos de GA4 sin debilitar expectativas ni alterar la lógica de Consent Mode v2.

---

## 1. Estado inicial

`npm test` reportaba **9/13 tests aprobados**. Los 4 fallos pertenecían a
`src/app/services/analytics.service.spec.ts` (tests 5, 7, 8 y 9) y se manifestaban como
`Number of calls: 0` / `expected ... to be called`.

## 2. Investigación individual (causa raíz)

Los tests verifican que, con un `gaId` válido, el servicio:
- inicializa `window.gtag` y `window._gaInitialized`,
- inyecta el script de GA4,
- dispara `gtag('config', ...)`.

El servicio `analytics.service.ts` implementa `initGA()` con **retorno temprano correcto**
cuando `gaId` está vacío:

```ts
if (!environment.gaId) return;          // comportamiento correcto
if (typeof window === 'undefined') return;
```

El problema **no estaba en el servicio ni en el código de consentimiento**, sino en la
**configuración del entorno de pruebas**:

- El builder `@angular/build:unit-test` (Angular 21, runner Vitest + jsdom) compila usando
  por defecto el build target en configuración `development`.
- La configuración `development` de `angular.json` aplica `fileReplacements`
  `environment.ts → environment.development.ts`.
- `environment.development.ts` define `gaId: ''` (a propósito, para no contaminar analítica
  real desde desarrollo).
- Por tanto, en tiempo de test `environment.gaId` era `''` → `initGA()` retornaba temprano →
  `gtag` nunca se creaba → los tests fallaban con "0 llamadas".

Los 9 tests que sí pasaban no dependían de `gaId`.

## 3. Corrección aplicada

**Archivo:** `angular.json` (único cambio).

1. Se añadió una configuración de build `test` **sin** `fileReplacements`, de modo que los
   tests resuelven el `environment.ts` real (con `gaId: 'G-1X6X4SCFH7'`):

```jsonc
"configurations": {
  "production": { ... },
  "development": { ... },
  "test": {
    "optimization": false,
    "extractLicenses": false,
    "sourceMap": true
  }
}
```

2. Se apuntó el target de tests a esa configuración:

```jsonc
"test": {
  "builder": "@angular/build:unit-test",
  "options": { "buildTarget": "samts-front:build:test" }
}
```

## 4. Verificación

```
 Test Files  2 passed (2)
      Tests  13 passed (13)   ← analytics.service.spec.ts: 11, app.spec.ts: 2
```

- GA4 funciona correctamente **cuando existe** identificador (los 11 tests de analítica,
  incluyendo inicialización de `gtag`, disparo de eventos y gating por consentimiento,
  pasan con `gaId` real).
- Con `gaId` vacío (escenario de desarrollo) el servicio **no genera errores** (retorno
  temprano verificado por los tests existentes de "sin ID").

## 5. Cumplimiento de condiciones de la fase

| Condición | Estado |
|---|---|
| No inventar un GA4 ID | ✅ Se usó el valor real ya existente en `environment.ts`. |
| No reemplazar el identificador real `G-1X6X4SCFH7` | ✅ Intacto. |
| No habilitar tracking sin consentimiento | ✅ Consent Mode v2 sin cambios. |
| No modificar Consent Mode v2 para pasar los tests | ✅ Sin cambios en la lógica de consentimiento. |
| No eliminar pruebas | ✅ 13/13 pruebas presentes y aprobadas. |
| No debilitar expectativas de los tests | ✅ Sin cambios en los `*.spec.ts`. |

## 6. Conclusión

Los 4 fallos eran un **defecto de configuración del entorno de testing** (build target
apuntando a `development` con `fileReplacements`), no un bug del servicio ni del
consentimiento. La corrección es aislada (`angular.json`) y no altera comportamiento de
producción. **Resultado: 13/13 tests aprobados.**
