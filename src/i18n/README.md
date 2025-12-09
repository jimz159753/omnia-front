# i18n Implementation Guide

## Overview
This application uses `i18next` and `react-i18next` for internationalization (i18n). Currently supported languages: **English (en)** and **Spanish (es)**.

## File Structure
```
src/i18n/
├── config.ts           # Language configuration
├── index.ts            # i18next initialization  
├── locales/
│   ├── en/             # English translations
│   │   ├── common.json
│   │   ├── sales.json
│   │   ├── products.json
│   │   ├── services.json
│   │   ├── clients.json
│   │   ├── settings.json
│   │   ├── analytics.json
│   │   └── status.json
│   └── es/             # Spanish translations
│       ├── common.json
│       ├── sales.json
│       ├── products.json
│       ├── services.json
│       ├── clients.json
│       ├── settings.json
│       ├── analytics.json
│       └── status.json
```

## Usage in Components

### 1. Import the hook
```typescript
import { useTranslation } from "@/hooks/useTranslation";
```

### 2. Use in your component
```typescript
function MyComponent() {
  const { t } = useTranslation("namespace"); // Use specific namespace
  // or
  const { t } = useTranslation(); // Defaults to "common"
  
  return (
    <div>
      <h1>{t("title")}</h1>
      <button>{t("save")}</button>
    </div>
  );
}
```

## Translation Namespaces

- **common**: General UI terms (save, cancel, edit, delete, etc.)
- **sales**: Sales page specific terms
- **products**: Products page specific terms
- **services**: Services page specific terms
- **clients**: Clients page specific terms
- **settings**: Settings page specific terms
- **analytics**: Analytics page specific terms
- **status**: Ticket status translations

## Examples

### Sales Page
```typescript
const { t } = useTranslation("sales");

<h1>{t("title")}</h1> // "Sales" or "Ventas"
<button>{t("createSale")}</button> // "Create Sale" or "Crear Venta"
```

### Data Table
```typescript
const { t } = useTranslation(); // Uses "common"

<p>{t("showing")} 1 {t("to")} 5 {t("of")} 20 {t("results")}</p>
// English: "Showing 1 to 5 of 20 results"
// Spanish: "Mostrando 1 a 5 de 20 resultados"
```

### Status Badges
```typescript
const { t } = useTranslation("status");

<Badge>{t("Pending")}</Badge> // "Pending" or "Pendiente"
```

## Adding New Translations

1. Add the key-value pair to both `en` and `es` JSON files:

**en/sales.json**
```json
{
  "newKey": "New Value"
}
```

**es/sales.json**
```json
{
  "newKey": "Nuevo Valor"
}
```

2. Use in component:
```typescript
const { t } = useTranslation("sales");
{t("newKey")}
```

## Language Switching

Users can change language in the Settings page:
- Navigate to `/dashboard/settings`
- Click on EN or ES buttons
- Language preference applies immediately across the entire app

## Best Practices

1. **Always use translation keys** instead of hardcoded strings
2. **Use descriptive keys**: `createSale` instead of `btn1`
3. **Organize by namespace**: Keep related translations in the same namespace
4. **Keep translations synchronized**: Always add translations to both language files
5. **Use common namespace** for frequently used terms (save, cancel, edit, etc.)
6. **Use specific namespaces** for page-specific content

## Translation Keys Reference

### Common (most frequently used)
- Buttons: `save`, `cancel`, `delete`, `edit`, `add`, `update`, `create`, `close`
- Navigation: `previous`, `next`, `page`, `of`
- Data: `showing`, `to`, `results`, `noResults`
- Forms: `name`, `email`, `phone`, `address`, `description`
- Status: `success`, `error`, `loading`
- Fields: `price`, `cost`, `stock`, `quantity`, `total`, `date`, `time`
- Labels: `required`, `optional`

See individual JSON files for complete listings.

