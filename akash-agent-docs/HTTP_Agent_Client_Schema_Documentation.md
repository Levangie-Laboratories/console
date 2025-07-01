# HTTP Agent Client Schema Documentation

## Overview

This document provides comprehensive input/output schemas for the **stateless HTTP Agent client SDK** (`client_http_enhanced.py`). The client follows a "fire-and-poll" pattern for communicating with agent servers and is designed to be simple, reliable, and non-blocking.

## Core Architecture

- **Stateless Design**: No internal state management or long-running processes
- **Fire-and-Poll Pattern**: Send operations and poll for results separately
- **HTTP-based**: Uses `requests.Session()` for HTTP communication
- **Request ID Tracking**: Each operation requires a unique request_id for tracking

## Class Initialization Schema

### `Agent.__init__()`

**Input Schema:**
```python
{
    "agent_id": str | None,           # Optional: Agent identifier (auto-generated if None)
    "api_key": str | None,            # Optional: API key for authentication
    "base_url": str | None,           # Optional: Base URL of agent server
    "stream_callback": Callable | None, # Deprecated: No longer used
    "timeout": int,                   # Default: 30 seconds
    "enable_debug_logging": bool,     # Default: False
    "**kwargs": Any                   # Additional parameters (ignored)
}
```

**Output:** Returns initialized `Agent` instance

## Core Methods Schemas

### 1. `send_operation(operation, request_id, params=None)`

**Purpose:** Generic method to send any operation to the agent server (non-blocking)

**Input Schema:**
```python
{
    "operation": str,                    # Required: Operation name (e.g., 'message', 'stop_agent')
    "request_id": str,                  # Required: Unique ID to track this request
    "params": Dict[str, Any] | None     # Optional: Parameters for the operation
}
```

**Output Schema:**
```python
{
    "status": str,                      # e.g., 'processing_started', 'error'
    "message": str,                     # Status message
    "request_id": str,                  # Echo of the request ID
    "timestamp": str,                   # Server timestamp
    # Additional server-specific fields may be present
}
```

**Error Schema:**
```python
# Raises RuntimeError with message: "Failed to send HTTP operation '{operation}': {error}"
```

### 2. `message(text, request_id)`

**Purpose:** Send a text message to the agent

**Input Schema:**
```python
{
    "text": str,        # Required: The text message to send
    "request_id": str   # Required: Unique identifier for this message request
}
```

**Output Schema:** Same as `send_operation()` response

### 3. `get_actions(request_id, timeout=10.0)`

**Purpose:** Poll the agent server for latest actions for a specific request ID

**Input Schema:**
```python
{
    "request_id": str,    # Required: The ID of the request to poll for
    "timeout": float      # Optional: Timeout for this polling request (default: 10.0)
}
```

**Output Schema:**
```python
{
    "status": str,                    # 'completed', 'processing', 'error'
    "request_id": str,               # Echo of the request ID
    "act_json": List[Dict[str, Any]], # List of actions/responses
    "timestamp": str,                # Server timestamp
    "error": str | None              # Error message if status is 'error'
}
```

**Error Schema:**
```python
{
    "status": "error",
    "error": str,                     # Error description
    "act_json": [],                  # Empty list
    "request_id": str                # Echo of request ID
}
```

## Utility Methods Schemas

### 4. `test_connection()`

**Purpose:** Test if the agent server is accessible

**Input Schema:** No parameters

**Output Schema:**
```python
# Success:
{
    "status": "connected",
    "data": {
        "agent_name": str,
        "version": str,
        "health": str,
        # Additional server health data
    }
}

# Error:
{
    "status": "error",
    "error": str  # Error description
}
```

### 5. `upload_file(file_path, file_obj, request_id)`

**Purpose:** Upload a file to the agent via HTTP

**Input Schema:**
```python
{
    "file_path": str,      # Required: Path/name of the file
    "file_obj": BinaryIO,  # Required: File object to upload
    "request_id": str      # Required: Unique request identifier
}
```

**Output Schema:** Same as `send_operation()` response

**Internal Parameters Sent:**
```python
{
    "file_path": str,
    "content": str,        # Base64 encoded file content
    "content_type": str,   # MIME type
    "is_base64": True
}
```

### 6. `stop_agent(request_id, message="User requested stop", reason="User initiated stop request")`

**Purpose:** Send a stop signal to the agent

**Input Schema:**
```python
{
    "request_id": str,                           # Required: Unique request identifier
    "message": str,                              # Optional: Stop message
    "reason": str                               # Optional: Stop reason
}
```

**Output Schema:** Same as `send_operation()` response

## Configuration Methods

### 7. `set_base_url(base_url)`

**Input Schema:**
```python
{
    "base_url": str  # Required: New base URL for the agent server
}
```

**Output:** None (void method)

### 8. `get_enhanced_session_info()`

**Output Schema:**
```python
{
    "agent_id": str,
    "base_url": str | None,
    "client_type": "stateless",
    "debug_logging_enabled": bool,
    "timeout": int
}
```

## Factory Function Schema

### `create_enhanced_agent(**kwargs)`

**Input Schema:** Same as `Agent.__init__()`

**Output:** Returns initialized `Agent` instance

## Usage Patterns

### Basic Fire-and-Poll Pattern

```python
import uuid
import time
from agent_client.client_http_enhanced import create_enhanced_agent

# 1. Initialize client
agent = create_enhanced_agent(
    agent_id="my-agent",
    api_key="your-api-key",
    base_url="http://localhost:8000"
)

# 2. Test connection
status = agent.test_connection()
if status['status'] != 'connected':
    print("Connection failed")
    return

# 3. Send message (fire)
request_id = str(uuid.uuid4())
response = agent.message("Hello, agent!", request_id)

# 4. Poll for results
while True:
    actions = agent.get_actions(request_id)
    if actions['status'] == 'completed':
        break
    time.sleep(2)  # Wait before next poll
```

### File Upload Pattern

```python
import uuid

with open('document.pdf', 'rb') as f:
    request_id = str(uuid.uuid4())
    response = agent.upload_file('document.pdf', f, request_id)
    
    # Poll for upload completion
    actions = agent.get_actions(request_id)
```

### Generic Operation Pattern

```python
import uuid

# Send custom operation
request_id = str(uuid.uuid4())
response = agent.send_operation(
    operation="custom_task",
    request_id=request_id,
    params={"param1": "value1", "param2": "value2"}
)

# Poll for results
actions = agent.get_actions(request_id)
```

## Error Handling

### Common Exceptions

1. **ValueError**: When `base_url` is not set
   ```python
   # Raised by methods that require base_url when it's None
   raise ValueError("base_url must be provided. Set it during initialization or call set_base_url().")
   ```

2. **RuntimeError**: When HTTP operations fail
   ```python
   # Raised by send_operation and related methods
   raise RuntimeError(f"Failed to send HTTP operation '{operation}': {error}")
   ```

3. **requests.exceptions.RequestException**: For network/HTTP errors
   - Connection timeouts
   - Network unreachable
   - HTTP status errors (4xx, 5xx)

### Error Response Format

All polling methods (`get_actions`) return structured error responses rather than raising exceptions:

```python
{
    "status": "error",
    "error": "Error description",
    "request_id": "original-request-id",
    "act_json": []  # Empty for get_actions
}
```

### Error Handling Best Practices

```python
try:
    # Send operation
    response = agent.message("Hello", request_id)
    
    # Check immediate response
    if response.get('status') != 'processing_started':
        print(f"Failed to start processing: {response}")
        return
        
except ValueError as e:
    print(f"Configuration error: {e}")
except RuntimeError as e:
    print(f"HTTP operation failed: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")

# Poll with error handling
actions = agent.get_actions(request_id)
if actions['status'] == 'error':
    print(f"Polling error: {actions['error']}")
else:
    # Process successful response
    for action in actions.get('act_json', []):
        print(f"Action: {action}")
```

## Key Design Principles

1. **Stateless**: No internal state management
2. **Non-blocking**: Operations return immediately
3. **Request ID Tracking**: Every operation requires a unique request_id
4. **Polling-based**: Results retrieved via separate polling calls
5. **Error Resilient**: Structured error responses for graceful handling
6. **Simple Interface**: Minimal complexity, maximum reliability
7. **HTTP-first**: Pure HTTP communication, no WebSockets or persistent connections

## Deprecated Methods

The following methods are deprecated and should not be used:

- `send_message_with_streaming()` - Use `message()` + `get_actions()` instead
- `start_streaming()` / `stop_streaming()` - No longer applicable in stateless design
- `get_latest_acts()` - Use `get_actions(request_id)` instead
- Internal methods like `_simplified_polling()`, `_is_chat_action()`, etc.

## Migration from Stateful Client

If migrating from a stateful/streaming client:

1. Replace streaming callbacks with polling loops
2. Generate and track request IDs for each operation
3. Handle responses explicitly rather than relying on callbacks
4. Implement your own state management if needed

```python
# Old stateful approach (deprecated)
# agent.send_message_with_streaming("Hello", callback=my_callback)

# New stateless approach
request_id = str(uuid.uuid4())
agent.message("Hello", request_id)

# Implement your own polling loop
while True:
    actions = agent.get_actions(request_id)
    if actions['status'] == 'completed':
        break
    # Process new actions
    for action in actions.get('act_json', []):
        my_callback(action)  # Your callback logic
    time.sleep(2)
```

## Conclusion

This stateless HTTP Agent client provides a simple, reliable foundation for agent communication. By following the fire-and-poll pattern and using unique request IDs, applications can build robust agent interactions with full control over the request lifecycle.

For questions or issues, refer to the source code at `client_http_enhanced.py` or consult the example usage in the `__main__` section of the file.