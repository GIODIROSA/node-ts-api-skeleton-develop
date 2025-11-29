# 📚 Libs - Integraciones Externas

Esta carpeta contiene **wrappers y clientes para servicios externos** e integraciones con APIs de terceros.

## 🎯 Propósito

Centralizar y encapsular la lógica de comunicación con servicios externos, proporcionando una interfaz limpia y consistente para el resto de la aplicación.

## 📋 Tipos de archivos que van aquí

### ✅ **Clientes de APIs externas**

- Wrappers de servicios de terceros
- Clientes HTTP configurados
- Integraciones con plataformas externas

### ✅ **Servicios de infraestructura**

- Clientes de almacenamiento (AWS S3, Google Cloud Storage)
- Servicios de mensajería (SendGrid, Twilio, AWS SES)
- Servicios de pago (Stripe, PayPal, MercadoPago)
- Servicios de autenticación (Auth0, Firebase Auth)

### ✅ **SDKs y librerías de terceros**

- Configuraciones de SDKs
- Adaptadores personalizados
- Helpers para librerías externas

## 🚫 Lo que NO va aquí

- ❌ Lógica de negocio (va en `services/`)
- ❌ Utilidades genéricas (van en `utils/`)
- ❌ Middlewares (van en `middlewares/`)
- ❌ Configuración de base de datos (va en `config/`)

## 📁 Estructura recomendada

```
libs/
├── email/
│   ├── sendgrid.lib.ts       # Cliente de SendGrid
│   └── email.types.ts        # Tipos para emails
├── storage/
│   ├── s3.lib.ts             # Cliente de AWS S3
│   └── storage.types.ts      # Tipos para storage
├── payment/
│   ├── stripe.lib.ts         # Cliente de Stripe
│   └── payment.types.ts      # Tipos para pagos
└── sms/
    ├── twilio.lib.ts         # Cliente de Twilio
    └── sms.types.ts          # Tipos para SMS
```

## 💡 Ejemplo

### Cliente de SendGrid para emails

```typescript
// libs/email/sendgrid.lib.ts
import sgMail from '@sendgrid/mail';
import { ENV } from '@config/constants';
import Logger from '@config/logger';

const logger = new Logger('sendgrid.lib');

/**
 * Cliente de SendGrid para envío de emails
 */
class SendGridClient {
  constructor() {
    sgMail.setApiKey(ENV.SENDGRID_API_KEY);
  }

  /**
   * Envía un email usando SendGrid
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await sgMail.send({
        to,
        from: ENV.EMAIL_FROM,
        subject,
        html,
      });
      logger.info(`Email enviado a ${to}`);
    } catch (error) {
      logger.error('Error enviando email:', error);
      throw error;
    }
  }

  /**
   * Envía email con template
   */
  async sendTemplateEmail(
    to: string,
    templateId: string,
    dynamicData: Record<string, any>
  ): Promise<void> {
    try {
      await sgMail.send({
        to,
        from: ENV.EMAIL_FROM,
        templateId,
        dynamicTemplateData: dynamicData,
      });
      logger.info(`Email con template ${templateId} enviado a ${to}`);
    } catch (error) {
      logger.error('Error enviando email con template:', error);
      throw error;
    }
  }
}

export const sendGridClient = new SendGridClient();
```

## Mejores prácticas

### DO - Hacer

1. **Encapsular la lógica de integración**

   ```typescript
   // ✅ Bueno: Encapsulado en una clase
   class PaymentClient {
     async processPayment(amount: number) {
       /* ... */
     }
   }
   ```

2. **Usar configuración desde variables de entorno**

   ```typescript
   // ✅ Bueno: Configuración centralizada
   constructor() {
     this.apiKey = ENV.EXTERNAL_API_KEY;
   }
   ```

3. **Implementar logging**

   ```typescript
   // ✅ Bueno: Logging de operaciones
   logger.info('Email enviado exitosamente');
   logger.error('Error en integración:', error);
   ```

4. **Manejar errores apropiadamente**

   ```typescript
   // ✅ Bueno: Manejo de errores
   try {
     await externalService.call();
   } catch (error) {
     logger.error('Error:', error);
     throw new ExternalServiceError('Servicio no disponible');
   }
   ```

5. **Exportar instancias singleton**
   ```typescript
   // ✅ Bueno: Una sola instancia
   export const emailClient = new EmailClient();
   ```

### ❌ **DON'T - No hacer**

1. **No mezclar lógica de negocio**

   ```typescript
   // ❌ Malo: Lógica de negocio en lib
   async sendWelcomeEmail(user: User) {
     if (user.isPremium) { /* lógica de negocio */ }
   }
   ```

2. **No hardcodear credenciales**

   ```typescript
   // ❌ Malo: Credenciales hardcodeadas
   const apiKey = 'sk_test_123456';
   ```

3. **No exponer detalles de implementación**
   ```typescript
   // ❌ Malo: Expone cliente interno
   export const stripeRawClient = new Stripe(key);
   ```

## 📦 Dependencias comunes

```json
{
  "dependencies": {
    "@sendgrid/mail": "^7.7.0",
    "@aws-sdk/client-s3": "^3.400.0",
    "stripe": "^13.0.0",
    "twilio": "^4.18.0",
    "axios": "^1.5.0"
  }
}
```

## 🔗 Referencias

- [SendGrid Docs](https://docs.sendgrid.com/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Stripe API](https://stripe.com/docs/api)
- [Twilio Docs](https://www.twilio.com/docs)

---

**Autor:** Claudio Navarrete / Líder Técnico  
**Última actualización:** 2025
