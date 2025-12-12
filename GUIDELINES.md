# Project Development Guidelines

## Table of Contents
1. [General Principles](#general-principles)
2. [Code Organization](#code-organization)
3. [TypeScript Standards](#typescript-standards)
4. [React Best Practices](#react-best-practices)
5. [API Design](#api-design)
6. [Database & Prisma](#database--prisma)
7. [Styling & UI](#styling--ui)
8. [Internationalization](#internationalization)
9. [Testing](#testing)
10. [Git Workflow](#git-workflow)
11. [Performance](#performance)
12. [Security](#security)

---

## General Principles

### DRY (Don't Repeat Yourself)
- Extract reusable logic into custom hooks
- Create shared components for common UI patterns
- Use utility functions for repeated operations
- Centralize configuration and constants

**Example:**
```typescript
// ❌ Bad: Repeated fetch logic
const fetchUsers = async () => {
  const res = await fetch("/api/users");
  const data = await res.json();
  return data;
};

const fetchClients = async () => {
  const res = await fetch("/api/clients");
  const data = await res.json();
  return data;
};

// ✅ Good: Reusable hook
const useApi = <T>(endpoint: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fetch = async () => {
    setLoading(true);
    const res = await fetch(endpoint);
    const json = await res.json();
    setData(json.data);
    setLoading(false);
  };
  
  return { data, loading, fetch };
};
```

### SOLID Principles

#### Single Responsibility Principle (SRP)
Each module, class, or function should have one reason to change.

```typescript
// ❌ Bad: Component doing too much
const UserProfile = () => {
  // Fetching data
  // Form validation
  // API calls
  // UI rendering
};

// ✅ Good: Separated concerns
const useUserProfile = () => { /* data fetching */ };
const useUserForm = () => { /* form logic */ };
const UserProfile = () => { /* UI only */ };
```

#### Open/Closed Principle (OCP)
Open for extension, closed for modification.

```typescript
// ✅ Good: Extensible dialog system
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

// Extend without modifying base
const AppointmentDialog = (props: DialogProps) => { /* ... */ };
const SaleDialog = (props: DialogProps) => { /* ... */ };
```

#### Liskov Substitution Principle (LSP)
Subtypes must be substitutable for their base types.

```typescript
// ✅ Good: Consistent interface
interface FormDialog {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// All form dialogs can be used interchangeably
```

#### Interface Segregation Principle (ISP)
Clients should not depend on interfaces they don't use.

```typescript
// ❌ Bad: Forcing unnecessary props
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;  // Not all dialogs need this
  editMode?: boolean; // Not all dialogs need this
}

// ✅ Good: Minimal interfaces
interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditDialogProps extends BaseDialogProps {
  initialData: any;
}
```

#### Dependency Inversion Principle (DIP)
Depend on abstractions, not concretions.

```typescript
// ✅ Good: Depend on abstractions
interface ApiClient {
  get<T>(endpoint: string): Promise<T>;
  post<T>(endpoint: string, data: any): Promise<T>;
}

const useData = (apiClient: ApiClient) => {
  // Implementation doesn't depend on specific fetch implementation
};
```

### KISS (Keep It Simple, Stupid)
- Write simple, readable code over clever code
- Avoid premature optimization
- Use clear variable and function names
- Limit function complexity (max ~20 lines)

### YAGNI (You Aren't Gonna Need It)
- Don't add functionality until it's necessary
- Remove unused code and imports
- Avoid over-engineering solutions

---

## Code Organization

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Grouped routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── dialogs/          # Dialog components
│   └── [feature]/        # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
├── i18n/                 # Internationalization
├── styles/              # Global styles
└── types/               # TypeScript type definitions
```

### File Naming Conventions
- **Components:** PascalCase (`UserDialog.tsx`, `AppointmentCalendar.tsx`)
- **Hooks:** camelCase with `use` prefix (`useTranslation.ts`, `useTickets.ts`)
- **Utilities:** camelCase (`formatDate.ts`, `apiClient.ts`)
- **Types:** PascalCase (`User.ts`, `Ticket.ts`)
- **Constants:** SCREAMING_SNAKE_CASE in `constants.ts`

### Import Order
1. External libraries (React, Next.js, etc.)
2. Internal components
3. Hooks
4. Utils/helpers
5. Types
6. Styles

```typescript
// ✅ Good import order
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";

import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { UserForm } from "@/components/users/UserForm";

import { useTranslation } from "@/hooks/useTranslation";
import { useUsers } from "@/hooks/useUsers";

import { cn } from "@/lib/utils";

import type { User } from "@/types/user";

import "@/styles/calendar.css";
```

---

## TypeScript Standards

### Type Safety
- **Always** define explicit types for function parameters and return values
- Use `interface` for object shapes, `type` for unions/intersections
- Avoid `any` - use `unknown` if type is truly unknown
- Enable strict mode in `tsconfig.json`

```typescript
// ❌ Bad
const fetchData = async (id) => {
  const data: any = await fetch(`/api/users/${id}`);
  return data;
};

// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data as User;
};
```

### Interfaces vs Types
- Use `interface` for object structures
- Use `type` for unions, intersections, and primitives
- Prefer `interface` for component props (better error messages)

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  role: "admin" | "user";
}

type UserRole = "admin" | "user" | "guest";
type Status = "active" | "inactive" | "pending";
```

### Generic Types
Use generics for reusable, type-safe code.

```typescript
// ✅ Good
interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

const fetchData = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
  // Implementation
};
```

---

## React Best Practices

### Component Structure
```typescript
// ✅ Good component structure
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export const UserCard = ({ user, onEdit }: UserCardProps) => {
  // 1. Hooks (order matters!)
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  
  // 2. Event handlers
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    onEdit(user);
  }, [user, onEdit]);
  
  // 3. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 4. Early returns
  if (!user) return null;
  
  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Hooks Rules
- Always use hooks at the top level (not in conditions/loops)
- Use `useCallback` for functions passed to child components
- Use `useMemo` for expensive calculations
- Use `useRef` for values that shouldn't trigger re-renders
- Create custom hooks for reusable logic

```typescript
// ✅ Good: Custom hook
export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      setTickets(data.data);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  
  return { tickets, loading, refetch: fetchTickets };
};
```

### State Management
- Keep state as local as possible
- Lift state up only when necessary
- Use context for deeply nested props
- Consider state management libraries for complex apps

### Conditional Rendering
```typescript
// ✅ Good
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ Bad
{isLoading ? <Spinner /> : null}
{error ? <ErrorMessage error={error} /> : null}
```

### Props Destructuring
```typescript
// ✅ Good: Destructure props
const UserCard = ({ name, email, role }: UserCardProps) => {
  return <div>{name}</div>;
};

// ❌ Bad: Using props object
const UserCard = (props: UserCardProps) => {
  return <div>{props.name}</div>;
};
```

---

## API Design

### REST Conventions
- Use proper HTTP methods (GET, POST, PUT/PATCH, DELETE)
- Return consistent response formats
- Use proper HTTP status codes
- Include error messages in responses

```typescript
// ✅ Good: Consistent API response
interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({
      data: users,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch users",
        success: false,
      },
      { status: 500 }
    );
  }
}
```

### Error Handling
```typescript
// ✅ Good: Comprehensive error handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.email) {
      return NextResponse.json(
        { error: "Email is required", success: false },
        { status: 400 }
      );
    }
    
    // Business logic
    const user = await prisma.user.create({ data: body });
    
    return NextResponse.json({ data: user, success: true });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
```

### Request Validation
- Always validate input data
- Use Zod or similar for schema validation
- Sanitize user input
- Check authentication/authorization

---

## Database & Prisma

### Schema Design
- Use meaningful model names (PascalCase)
- Add indexes for frequently queried fields
- Use `@map` to maintain database compatibility
- Add relations properly

```prisma
// ✅ Good schema
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      String   @default("user")
  position  String   @default("")
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tickets   Ticket[]
  
  @@index([email])
  @@map("users")
}
```

### Query Patterns
- Use `select` to limit returned fields
- Use `include` for relations
- Always handle null cases
- Use transactions for multiple operations

```typescript
// ✅ Good: Efficient query
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    tickets: {
      select: {
        id: true,
        status: true,
      },
      take: 10,
    },
  },
});
```

### Transactions
```typescript
// ✅ Good: Use transactions for related operations
const result = await prisma.$transaction(async (tx) => {
  const ticket = await tx.ticket.create({ data: ticketData });
  
  await tx.ticketItem.createMany({
    data: items.map((item) => ({
      ...item,
      ticketId: ticket.id,
    })),
  });
  
  return ticket;
});
```

---

## Styling & UI

### Tailwind CSS
- Use Tailwind utility classes
- Create custom components for repeated patterns
- Use `cn()` utility for conditional classes
- Follow mobile-first approach

```typescript
// ✅ Good: Conditional classes
import { cn } from "@/lib/utils";

const Button = ({ variant, className, ...props }) => {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md transition-colors",
        variant === "primary" && "bg-brand-500 text-white",
        variant === "secondary" && "bg-gray-200 text-gray-800",
        className
      )}
      {...props}
    />
  );
};
```

### Component Composition
- Use Shadcn UI as base
- Customize through props and className
- Keep components flexible and reusable

```typescript
// ✅ Good: Composable components
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

---

## Internationalization

### Translation Keys
- Use descriptive keys
- Organize by feature/domain
- Keep translations in sync
- Provide fallbacks

```typescript
// ✅ Good: Translation usage
const { t } = useTranslation("common");

<button>{t("save")}</button>
<h1>{t("welcomeMessage", { name: user.name })}</h1>
```

### Translation Files
```json
// en/common.json
{
  "save": "Save",
  "cancel": "Cancel",
  "welcomeMessage": "Welcome, {{name}}!",
  "itemCount": "{{count}} item",
  "itemCount_plural": "{{count}} items"
}
```

---

## Testing

### Unit Tests
- Test business logic
- Test custom hooks
- Test utilities
- Use Jest + React Testing Library

```typescript
// ✅ Good: Test custom hook
import { renderHook } from "@testing-library/react";
import { useTickets } from "./useTickets";

describe("useTickets", () => {
  it("should fetch tickets on mount", async () => {
    const { result } = renderHook(() => useTickets());
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.tickets).toHaveLength(5);
    });
  });
});
```

### Integration Tests
- Test API endpoints
- Test component interactions
- Test user flows

---

## Git Workflow

### Commit Messages
Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `style:` Formatting changes
- `docs:` Documentation
- `test:` Tests
- `chore:` Maintenance

```bash
# ✅ Good commit messages
feat: add appointment calendar date picker
fix: prevent dialog reopening on checkbox click
refactor: extract user form validation to custom hook
docs: update API documentation for tickets endpoint
```

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation

---

## Performance

### React Performance
- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` to prevent unnecessary re-renders
- Lazy load routes and components

```typescript
// ✅ Good: Optimized component
import { memo } from "react";

export const UserCard = memo(({ user }: UserCardProps) => {
  return <div>{user.name}</div>;
});
```

### Code Splitting
```typescript
// ✅ Good: Lazy loading
import dynamic from "next/dynamic";

const Calendar = dynamic(() => import("@/components/Calendar"), {
  loading: () => <Spinner />,
  ssr: false,
});
```

### Bundle Size
- Remove unused imports
- Use tree-shakeable libraries
- Analyze bundle with `next build --analyze`

---

## Security

### Input Validation
- Always validate user input
- Sanitize data before database operations
- Use Zod or similar for schema validation

### Authentication
- Use secure session management
- Implement proper RBAC (Role-Based Access Control)
- Never expose sensitive data in responses

### API Security
- Validate authentication on all protected routes
- Use HTTPS in production
- Implement rate limiting
- Sanitize error messages (don't expose internals)

```typescript
// ✅ Good: Protected API route
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // ... protected logic
}
```

---

## Code Review Checklist

Before submitting code:
- [ ] Code follows style guidelines
- [ ] No console.logs or commented code
- [ ] TypeScript types are defined
- [ ] Error handling is comprehensive
- [ ] Components are properly tested
- [ ] Translations are added
- [ ] Performance is considered
- [ ] Security best practices followed
- [ ] Documentation is updated
- [ ] No linter errors

---

## Resources

- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

## Questions?

If you have questions about these guidelines or need clarification, please reach out to the team lead or create a discussion in the project repository.

