# 🛠️ Utils - Utilidades y Helpers

Esta carpeta contiene **funciones de utilidad reutilizables** y helpers genéricos que no dependen de la lógica de negocio.

## 🎯 Propósito

Proveer funciones auxiliares puras y reutilizables que resuelven problemas comunes en toda la aplicación, sin acoplarse a la lógica de negocio específica.

## 📋 Tipos de archivos que van aquí

### ✅ **Funciones de transformación de datos**

- Formateo de fechas
- Formateo de números y monedas
- Transformación de strings
- Parseo de datos

### ✅ **Funciones de validación**

- Validadores personalizados
- Helpers de validación
- Sanitización de datos

### ✅ **Funciones de generación**

- Generadores de IDs
- Generadores de tokens
- Generadores de códigos aleatorios

### ✅ **Helpers de arrays y objetos**

- Manipulación de arrays
- Transformación de objetos
- Funciones de agrupación y filtrado

### ✅ **Funciones de criptografía**

- Hashing
- Encriptación/Desencriptación
- Generación de tokens seguros

## 🚫 Lo que NO va aquí

- ❌ Lógica de negocio (va en `services/`)
- ❌ Integraciones externas (van en `libs/`)
- ❌ Middlewares (van en `middlewares/`)
- ❌ Configuración (va en `config/`)
- ❌ Validadores de Express (van en `validators/`)

## 📁 Estructura recomendada

```
utils/
├── date.util.ts           # Utilidades de fechas
├── string.util.ts         # Utilidades de strings
├── number.util.ts         # Utilidades de números
├── crypto.util.ts         # Utilidades de criptografía
├── array.util.ts          # Utilidades de arrays
├── object.util.ts         # Utilidades de objetos
├── validation.util.ts     # Validaciones personalizadas
└── generator.util.ts      # Generadores de IDs, tokens, etc.
```

## 💡 Ejemplo

### Utilidades de fechas

````typescript
// utils/date.util.ts
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha a formato legible en español
 */
export const formatDate = (
  date: Date | string,
  formatStr = 'dd/MM/yyyy'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: es });
};

/**
 * Formatea una fecha con hora
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm:ss');
};

/**
 * Obtiene la fecha de hace N días
 */
export const getDaysAgo = (days: number): Date => {
  return addDays(new Date(), -days);
};

/**
 * Calcula la diferencia en días entre dos fechas
 */
export const daysBetween = (
  date1: Date | string,
  date2: Date | string
): number => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(d2, d1);
};

/**
 * Verifica si una fecha es pasada
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj < new Date();
};

/**
 * Obtiene el inicio del día
 */
export const startOfDay = (date: Date = new Date()): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Obtiene el fin del día
 */
export const endOfDay = (date: Date = new Date()): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

## 🎨 Mejores prácticas

### ✅ **DO - Hacer**

1. **Funciones puras sin efectos secundarios**

   ```typescript
   // ✅ Bueno: Función pura
   export const double = (n: number): number => n * 2;
````

2. **Documentar con JSDoc**

   ```typescript
   /**
    * Formatea una fecha
    * @param date - Fecha a formatear
    * @returns Fecha formateada
    */
   export const formatDate = (date: Date): string => {
     /* ... */
   };
   ```

3. **Usar TypeScript con tipos genéricos**

   ```typescript
   // ✅ Bueno: Genéricos para reutilización
   export const unique = <T>(array: T[]): T[] => [...new Set(array)];
   ```

4. **Exportar funciones individuales**

   ```typescript
   // ✅ Bueno: Exportaciones nombradas
   export const formatDate = () => {
     /* ... */
   };
   export const parseDate = () => {
     /* ... */
   };
   ```

5. **Manejar casos edge**
   ```typescript
   // ✅ Bueno: Validación de entrada
   export const divide = (a: number, b: number): number => {
     if (b === 0) throw new Error('Division by zero');
     return a / b;
   };
   ```

### ❌ **DON'T - No hacer**

1. **No incluir lógica de negocio**

   ```typescript
   // ❌ Malo: Lógica de negocio
   export const calculateUserDiscount = (user: User) => {
     if (user.isPremium) {
       /* lógica específica */
     }
   };
   ```

2. **No usar estado mutable**

   ```typescript
   // ❌ Malo: Modifica el array original
   export const addItem = (array: any[], item: any) => {
     array.push(item);
     return array;
   };
   ```

3. **No hacer llamadas a APIs**
   ```typescript
   // ❌ Malo: Llamada a API
   export const fetchUser = async (id: string) => {
     return axios.get(`/users/${id}`);
   };
   ```

## 📦 Dependencias comunes

```json
{
  "dependencies": {
    "date-fns": "^2.30.0",
    "bcrypt": "^5.1.1",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.0",
    "@types/lodash": "^4.14.200"
  }
}
```

## 🔗 Referencias

- [date-fns Documentation](https://date-fns.org/)
- [Lodash Documentation](https://lodash.com/docs/)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

---

**Autor:** Claudio Navarrete / Líder Técnico  
**Última actualización:** 2025
