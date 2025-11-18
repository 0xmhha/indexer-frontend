# System Prompt Additions for Code Quality

## Code Quality Standards

NEVER write production code that contains:

1. **Uncaught exceptions in normal operation paths** - always use proper error handling
   - **JavaScript/TypeScript**: Return `Result<T, E>` types or use try-catch with specific error handling
   - **Golang**: Always return `error` as second return value and check it
   - **Shell**: Use `set -e`, check exit codes with `$?`, and trap errors

2. **Resource leaks** - every resource allocation must have corresponding cleanup
   - **JavaScript/TypeScript**: Use `finally` blocks, async cleanup, or RAII patterns
   - **Golang**: Always `defer` resource cleanup (files, connections, locks)
   - **Shell**: Use trap handlers for cleanup on exit/error

3. **Data corruption potential** - all state transitions must preserve data integrity
   - All languages: Validate input, use transactions, implement rollback mechanisms

4. **Inconsistent error handling patterns** - establish and follow single pattern per project
   - Project-wide error handling strategy documented and enforced

ALWAYS:

1. **Write comprehensive tests BEFORE implementing features**
   - TDD approach: Red → Green → Refactor

2. **Include validation for data structures and business logic**
   - Input validation at API boundaries
   - Internal invariant checks with descriptive error messages

3. **Use proper type checking and conversion**
   - **TypeScript**: Strict mode enabled, no `any` types in production
   - **Golang**: Explicit type conversions, check for overflow
   - **JavaScript**: Runtime type validation for critical paths

4. **Document known bugs immediately and fix them before continuing**
   - No `TODO` or `FIXME` comments for critical bugs
   - Track in issue system, fix in same sprint

5. **Implement proper separation of concerns**
   - SOLID principles strictly enforced
   - Single Responsibility Principle (SRP) for all modules

6. **Use static analysis tools before considering code complete**
   - **JavaScript/TypeScript**: ESLint, Prettier, TypeScript compiler
   - **Golang**: `go vet`, `golangci-lint`, `staticcheck`
   - **Shell**: ShellCheck, bashate

## Development Process Guards

### TESTING REQUIREMENTS:

- **Write failing tests first, then implement to make them pass**
  - Red-Green-Refactor cycle strictly followed

- **Never commit code with skipped tests for bugs - fix the bugs**
  - No `test.skip()`, `it.todo()`, or `t.Skip()` for production bugs

- **Include property-based testing for data structures**
  - Use fast-check (JS/TS) or gopter (Go) for invariant testing

- **Test resource management patterns, not just functionality**
  - Memory leaks, connection pools, file handles

- **Validate all edge cases and boundary conditions**
  - Empty inputs, null/undefined, max values, concurrent access

### ARCHITECTURE REQUIREMENTS:

- **Explicit error handling - no hidden errors**
  - Every error path must be tested and documented

- **Resource safety - all resources must be properly managed**
  - RAII patterns, defer statements, finally blocks

- **Performance conscious - avoid unnecessary allocations**
  - **JavaScript**: Object pooling, avoid excessive closures
  - **Golang**: Reuse buffers, preallocate slices with capacity

- **API design - consistent patterns across all public interfaces**
  - Same naming conventions, error handling, and parameter ordering

### REVIEW CHECKPOINTS:

Before marking any code complete, verify:

1. **No compiler/linter warnings**
   - Zero warnings policy enforced

2. **All tests pass (including integration and stress tests)**
   - Minimum 80% code coverage for unit tests
   - Critical paths have 100% coverage

3. **Resource usage is bounded and predictable**
   - No unbounded growth, memory leaks, or connection exhaustion

4. **No data corruption potential in any code path**
   - Transactional updates, atomic operations verified

5. **Error handling is comprehensive and consistent**
   - All error paths tested, proper error propagation

6. **Code is modular and maintainable**
   - Low coupling, high cohesion, clear interfaces

7. **Documentation matches implementation**
   - JSDoc/GoDoc comments accurate and complete

8. **Performance benchmarks show acceptable results**
   - Regression tests prevent performance degradation

## Language-Specific Quality Standards

### JavaScript/TypeScript ERROR HANDLING:

```typescript
// ❌ NEVER DO THIS - silent error swallowing
try {
    riskyOperation();
} catch (e) {
    console.log(e); // Logging is not handling
}

// ❌ NEVER DO THIS - generic error handling
try {
    operation();
} catch (error) {
    throw error; // No context added
}

// ✅ DO THIS - explicit error types and handling
class ValidationError extends Error {
    constructor(message: string, public field: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

async function operation(): Promise<Result<Data, AppError>> {
    try {
        const result = await riskyOperation();
        return Ok(result);
    } catch (error) {
        if (error instanceof ValidationError) {
            return Err(new AppError('VALIDATION_FAILED', error.message, error));
        }
        return Err(new AppError('UNKNOWN_ERROR', 'Operation failed', error));
    }
}

// ✅ DO THIS - Result type pattern
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
    if (b === 0) {
        return { ok: false, error: 'Division by zero' };
    }
    return { ok: true, value: a / b };
}
```

### Golang ERROR HANDLING:

```go
// ❌ NEVER DO THIS - ignoring errors
result, _ := riskyOperation() // Silent error ignore

// ❌ NEVER DO THIS - panic in library code
if err != nil {
    panic(err) // Never panic in production
}

// ❌ NEVER DO THIS - generic error wrapping
if err != nil {
    return fmt.Errorf("error: %v", err) // Lost error context
}

// ✅ DO THIS - explicit error handling with context
import "github.com/pkg/errors"

func operation() (*Data, error) {
    result, err := riskyOperation()
    if err != nil {
        return nil, errors.Wrap(err, "failed to perform risky operation")
    }

    if err := validate(result); err != nil {
        return nil, errors.Wrap(err, "validation failed")
    }

    return result, nil
}

// ✅ DO THIS - custom error types
type ValidationError struct {
    Field   string
    Message string
    Err     error
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation error on field %s: %s", e.Field, e.Message)
}

func (e *ValidationError) Unwrap() error {
    return e.Err
}
```

### Shell Script ERROR HANDLING:

```bash
# ❌ NEVER DO THIS - no error checking
result=$(risky_command)
use_result "$result"

# ❌ NEVER DO THIS - continuing after errors
command_that_might_fail
important_command # Runs even if previous failed

# ✅ DO THIS - strict error handling
#!/bin/bash
set -euo pipefail  # Exit on error, undefined vars, pipe failures

# ✅ DO THIS - explicit error checking
if ! result=$(risky_command 2>&1); then
    echo "Error: risky_command failed: $result" >&2
    exit 1
fi

# ✅ DO THIS - trap handlers for cleanup
cleanup() {
    local exit_code=$?
    # Cleanup resources
    rm -f "$TEMP_FILE"
    kill $PID 2>/dev/null || true
    exit $exit_code
}
trap cleanup EXIT ERR INT TERM

# ✅ DO THIS - error reporting function
error_exit() {
    echo "Error: $1" >&2
    exit "${2:-1}"
}

command || error_exit "Command failed" 2
```

### RESOURCE MANAGEMENT:

#### JavaScript/TypeScript:
```typescript
// ❌ NEVER DO THIS - no cleanup
const file = await open('file.txt');
const data = await file.read();
// File never closed

// ✅ DO THIS - RAII pattern with try-finally
async function processFile(path: string): Promise<void> {
    const file = await open(path);
    try {
        const data = await file.read();
        await process(data);
    } finally {
        await file.close(); // Always executed
    }
}

// ✅ DO THIS - using statement pattern
class ResourceManager<T extends { dispose(): void }> {
    constructor(private resource: T) {}

    async use<R>(fn: (resource: T) => Promise<R>): Promise<R> {
        try {
            return await fn(this.resource);
        } finally {
            this.resource.dispose();
        }
    }
}
```

#### Golang:
```go
// ❌ NEVER DO THIS - missing defer
file, err := os.Open("file.txt")
if err != nil {
    return err
}
data, err := io.ReadAll(file)
// File never closed if error occurs

// ✅ DO THIS - immediate defer after allocation
func processFile(path string) error {
    file, err := os.Open(path)
    if err != nil {
        return errors.Wrap(err, "failed to open file")
    }
    defer file.Close() // Guaranteed cleanup

    data, err := io.ReadAll(file)
    if err != nil {
        return errors.Wrap(err, "failed to read file")
    }

    return process(data)
}

// ✅ DO THIS - cleanup function pattern
func withResource[T any](
    acquire func() (T, func(), error),
    use func(T) error,
) error {
    resource, cleanup, err := acquire()
    if err != nil {
        return err
    }
    defer cleanup()

    return use(resource)
}
```

#### Shell:
```bash
# ❌ NEVER DO THIS - no cleanup
temp_file=$(mktemp)
process_file "$temp_file"
# Temp file never cleaned up

# ✅ DO THIS - trap-based cleanup
#!/bin/bash
set -euo pipefail

TEMP_FILE=""
cleanup() {
    [[ -n "$TEMP_FILE" ]] && rm -f "$TEMP_FILE"
}
trap cleanup EXIT

TEMP_FILE=$(mktemp)
process_file "$TEMP_FILE"
```

## Critical Patterns to Avoid

### JavaScript/TypeScript DANGEROUS PATTERNS:

```typescript
// ❌ Unchecked type assertions
const data = JSON.parse(input) as UserData; // Runtime error risk

// ❌ Mutable shared state
let sharedCounter = 0;
export function increment() { sharedCounter++; } // Race conditions

// ❌ Callback hell
doAsync1((err1, res1) => {
    doAsync2(res1, (err2, res2) => {
        doAsync3(res2, (err3, res3) => {
            // Deeply nested, error handling duplicated
        });
    });
});

// ✅ Use validation
const result = UserDataSchema.safeParse(JSON.parse(input));
if (!result.success) {
    return Err(new ValidationError(result.error));
}

// ✅ Immutable patterns
export class Counter {
    constructor(private readonly value: number = 0) {}
    increment(): Counter {
        return new Counter(this.value + 1);
    }
}

// ✅ async/await with proper error handling
try {
    const res1 = await doAsync1();
    const res2 = await doAsync2(res1);
    const res3 = await doAsync3(res2);
} catch (error) {
    handleError(error);
}
```

### Golang DANGEROUS PATTERNS:

```go
// ❌ Unchecked type assertions
data := value.(UserData) // Panics if wrong type

// ❌ Goroutine leaks
go func() {
    for {
        select {
        case msg := <-ch:
            process(msg)
        // No way to stop this goroutine
        }
    }
}()

// ❌ Shared mutable state without synchronization
var counter int
func increment() { counter++ } // Race condition

// ✅ Safe type assertions
data, ok := value.(UserData)
if !ok {
    return errors.New("invalid type")
}

// ✅ Cancellable goroutines
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

go func() {
    for {
        select {
        case msg := <-ch:
            process(msg)
        case <-ctx.Done():
            return // Proper cleanup
        }
    }
}()

// ✅ Synchronized access
type Counter struct {
    mu    sync.Mutex
    value int
}

func (c *Counter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}
```

### Shell DANGEROUS PATTERNS:

```bash
# ❌ Unquoted variables
rm -rf $DIR/* # Catastrophic if DIR is empty

# ❌ Word splitting issues
file_list=$(ls *.txt)
for file in $file_list; do # Breaks on spaces
    process "$file"
done

# ❌ No input validation
user_input="$1"
eval "$user_input" # Command injection vulnerability

# ✅ Proper quoting
rm -rf "${DIR:?DIR is not set}"/*

# ✅ Proper iteration
while IFS= read -r file; do
    process "$file"
done < <(find . -name "*.txt")

# ✅ Never use eval with user input
# Use parameter validation instead
if [[ ! "$user_input" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    error_exit "Invalid input"
fi
```

## Testing Standards

### COMPREHENSIVE TEST COVERAGE:

#### JavaScript/TypeScript:
```typescript
describe('UserService', () => {
    // ✅ Unit tests for all public methods
    describe('createUser', () => {
        it('should create user with valid data', async () => {
            const user = await service.createUser(validData);
            expect(user).toMatchObject(validData);
        });

        it('should reject invalid email', async () => {
            await expect(
                service.createUser({ ...validData, email: 'invalid' })
            ).rejects.toThrow(ValidationError);
        });

        // ✅ Edge cases
        it('should handle duplicate email', async () => {
            await service.createUser(validData);
            await expect(
                service.createUser(validData)
            ).rejects.toThrow('Email already exists');
        });
    });

    // ✅ Property-based testing
    it('should maintain email uniqueness invariant', async () => {
        await fc.assert(
            fc.asyncProperty(fc.array(userArbitrary, { minLength: 2 }), async (users) => {
                const created = await Promise.all(users.map(u => service.createUser(u)));
                const emails = created.map(u => u.email);
                const uniqueEmails = new Set(emails);
                return emails.length === uniqueEmails.size;
            })
        );
    });
});
```

#### Golang:
```go
func TestUserService_CreateUser(t *testing.T) {
    tests := []struct {
        name    string
        input   UserInput
        want    *User
        wantErr bool
    }{
        {
            name:    "valid user",
            input:   validInput,
            want:    &expectedUser,
            wantErr: false,
        },
        {
            name:    "invalid email",
            input:   invalidEmailInput,
            want:    nil,
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := service.CreateUser(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("CreateUser() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if !reflect.DeepEqual(got, tt.want) {
                t.Errorf("CreateUser() = %v, want %v", got, tt.want)
            }
        })
    }
}
```

### RESOURCE LEAK TESTING:

#### JavaScript/TypeScript:
```typescript
describe('Database connection pool', () => {
    it('should not leak connections', async () => {
        const initialCount = pool.activeConnections();

        // Perform operations
        for (let i = 0; i < 1000; i++) {
            const conn = await pool.acquire();
            try {
                await conn.query('SELECT 1');
            } finally {
                await pool.release(conn);
            }
        }

        // Allow async cleanup
        await new Promise(resolve => setTimeout(resolve, 100));

        const finalCount = pool.activeConnections();
        expect(finalCount).toBe(initialCount);
    });
});
```

#### Golang:
```go
func TestNoGoroutineLeak(t *testing.T) {
    initialCount := runtime.NumGoroutine()

    // Start operations
    var wg sync.WaitGroup
    for i := 0; i < 100; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            operation()
        }()
    }

    wg.Wait()
    time.Sleep(100 * time.Millisecond) // Allow cleanup

    finalCount := runtime.NumGoroutine()
    if finalCount > initialCount+1 { // Allow 1 for test goroutine
        t.Errorf("Goroutine leak: %d -> %d", initialCount, finalCount)
    }
}
```

## Documentation Standards

### CODE DOCUMENTATION:

#### JavaScript/TypeScript JSDoc:
```typescript
/**
 * Creates a new user in the system.
 *
 * @param input - User creation parameters
 * @param input.email - User's email address (must be unique)
 * @param input.name - User's full name
 * @returns Promise resolving to created user
 * @throws {ValidationError} If input validation fails
 * @throws {DuplicateError} If email already exists
 *
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 * ```
 */
async function createUser(input: UserInput): Promise<User> {
    // Implementation
}
```

#### Golang GoDoc:
```go
// CreateUser creates a new user in the system.
//
// The email must be unique across all users. The function validates
// the input and returns an error if validation fails or if a user
// with the same email already exists.
//
// Example:
//
//     user, err := service.CreateUser(UserInput{
//         Email: "user@example.com",
//         Name:  "John Doe",
//     })
//     if err != nil {
//         return err
//     }
//
// Returns:
//   - *User: The created user
//   - error: ValidationError if input is invalid,
//            DuplicateError if email exists
func (s *UserService) CreateUser(input UserInput) (*User, error) {
    // Implementation
}
```

#### Shell Script Documentation:
```bash
#!/bin/bash
# setup_node.sh - Initialize and configure blockchain node
#
# Usage: setup_node.sh [OPTIONS]
#
# Options:
#   -n, --node-id ID        Node identifier (required)
#   -p, --port PORT         P2P port (default: 30303)
#   -h, --help              Show this help message
#
# Environment Variables:
#   NODE_DIR    Directory for node data (default: ./nodes)
#   NETWORK_ID  Network identifier (default: 111133)
#
# Exit Codes:
#   0  Success
#   1  Invalid arguments
#   2  Setup failed
#
# Examples:
#   setup_node.sh --node-id node1 --port 30303
#   NODE_DIR=/data setup_node.sh -n node2

set -euo pipefail
```

This system prompt addition should prevent critical issues by establishing clear quality standards, testing requirements, and architectural principles that must be followed for all code in JavaScript, TypeScript, Shell, and Golang.
