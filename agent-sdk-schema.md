# Agents Client SDK - API Schema Documentation

## Overview

The agents-client SDK is a modern HTTP-based Python client library for interacting with AI agents. It provides a clean, OpenAI-like interface with comprehensive error handling, real-time action streaming, and robust duplicate prevention mechanisms.

**Version**: 2.0.0  
**Client Type**: HTTP (replaced SQS-based architecture)  
**Python Compatibility**: 3.7+

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                       │
├─────────────────────────────────────────────────────────────┤
│                 Agents Client SDK (HTTP)                    │
│  ├── Agent Class (Main Interface)                          │
│  ├── HTTP Toolkit (client_http_toolkit.py)                 │
│  ├── Action Streaming & Polling                            │
│  ├── Duplicate Prevention System                           │
│  └── Error Handling & Retry Logic                          │
├─────────────────────────────────────────────────────────────┤
│                    Communication Layer                      │
│  ├── HTTP/REST (Direct Communication)                      │
│  ├── Real-time Action Polling                              │
│  └── WebSocket Support (Future)                            │
├─────────────────────────────────────────────────────────────┤
│                    Agent Services                           │
│  ├── Agent Server Instances (agent_server.py)              │
│  ├── Message Processing & Response Generation               │
│  └── Action Logging & Streaming                            │
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
# From source (recommended for development)
cd agents-client
pip install -e .

# With optional dependencies
pip install -e .[akash]  # For Akash deployment support
pip install -e .[dev]    # For development tools
```

## Quick Start

```python
from agent_client import Agent

# Initialize agent
agent = Agent(
    agent_id="your-agent-id",
    api_key="your-api-key",
    base_url="http://localhost:8100"
)

# Send message
response = agent.message("Hello, agent!")
print(response)
```

## Core Classes

### Agent Class

**Location**: `src/agent_client/client_http_toolkit.py`

The main interface for all agent interactions.

#### Constructor

```python
class Agent:
    def __init__(
        self,
        agent_id: str = None,
        api_key: str = None,
        base_url: str = None,
        stream_callback: Callable = None,
        timeout: int = 14400,  # 4 hours
        **kwargs  # SQS compatibility parameters (ignored)
    )
```

**Parameters**:
- `agent_id` (str, optional): Unique identifier for the agent. Auto-generated if not provided.
- `api_key` (str, optional): Authentication key for the agent service.
- `base_url` (str, optional): Base URL for the agent server (e.g., "http://localhost:8100").
- `stream_callback` (Callable, optional): Callback function for streaming responses.
- `timeout` (int, default=14400): Default timeout for requests in seconds.
- `**kwargs`: Additional parameters for SQS compatibility (ignored in HTTP mode).

**Returns**: Agent instance

**Raises**:
- `ValueError`: If required parameters are missing when methods are called.

#### Properties

```python
# Read-only properties
agent.agent_id: str          # Agent identifier
agent.api_key: str           # API key
agent.base_url: str          # Server base URL
agent.timeout: int           # Request timeout
agent.session: requests.Session  # HTTP session
```

## Core Methods

### message()

Send a synchronous message to the agent.

```python
def message(
    self,
    text: str,
    **kwargs  # Compatibility parameters (ignored)
) -> Dict[str, Any]
```

**Parameters**:
- `text` (str): The message content to send to the agent.
- `**kwargs`: Additional parameters for compatibility (ignored).

**Returns**:
```python
{
    "request_id": "uuid-string",
    "status": "sent" | "completed" | "error",
    "agent_id": "agent-identifier",
    "operation": "message"
}
```

**Raises**:
- `ValueError`: If `base_url` is not set.
- `RuntimeError`: If HTTP request fails.
- `requests.exceptions.Timeout`: If request times out.

**Example**:
```python
response = agent.message("Analyze this codebase")
print(f"Request ID: {response['request_id']}")
print(f"Status: {response['status']}")
```

### send_message_with_streaming()

Send a message with real-time action streaming.

```python
async def send_message_with_streaming(
    self,
    message: str,
    action_callback: Optional[Callable] = None,
    timeout: int = 14400
) -> str
```

**Parameters**:
- `message` (str): The message content to send.
- `action_callback` (Callable, optional): Function called for each action received.
  - Signature: `callback(action: Dict[str, Any], count: int) -> None`
- `timeout` (int, default=14400): Maximum time to wait for completion in seconds.

**Returns**: Final agent response as a string.

**Raises**:
- `ValueError`: If duplicate request detected or `base_url` not set.
- `TimeoutError`: If no response within timeout period.
- `RuntimeError`: If HTTP communication fails.

**Action Callback Format**:
```python
def action_callback(action: Dict[str, Any], count: int):
    """
    Called for each action received from the agent.
    
    Args:
        action: Action dictionary with structure:
        {
            "command": "chat" | "read_file" | "modify_file" | ...,
            "parameters": {...},  # Command-specific parameters
            "result": "...",      # Command result (if completed)
            "timestamp": 1234567890,
            "sequence_index": 1
        }
        count: Sequential action number (1, 2, 3, ...)
    """
    print(f"Action {count}: {action['command']}")
```

**Example**:
```python
import asyncio

def handle_action(action, count):
    cmd = action.get('command', 'unknown')
    print(f"[{count}] {cmd}: {action.get('result', 'Processing...')}")

async def main():
    response = await agent.send_message_with_streaming(
        "Write a Python function to calculate fibonacci",
        action_callback=handle_action,
        timeout=300
    )
    print(f"Final response: {response}")

asyncio.run(main())
```

### test_connection()

Test connectivity to the agent server.

```python
def test_connection(self) -> Dict[str, Any]
```

**Parameters**: None

**Returns**:
```python
# Success
{
    "status": "connected",
    "data": {
        "agent_name": "CodingAgent",
        "status": "healthy",
        "timestamp": "2025-06-29T15:08:37Z"
    }
}

# Error
{
    "status": "error",
    "error": "timeout" | "connection_failed",
    "code": 500  # HTTP status code (if applicable)
}
```

**Example**:
```python
status = agent.test_connection()
if status['status'] == 'connected':
    print(f"Connected to: {status['data']['agent_name']}")
else:
    print(f"Connection failed: {status.get('error')}")
```

### upload_file()

Upload a file to the agent.

```python
def upload_file(
    self,
    file_path: str,
    file_obj: BinaryIO
) -> Dict[str, Any]
```

**Parameters**:
- `file_path` (str): Destination path for the file on the agent.
- `file_obj` (BinaryIO): File object to upload (opened in binary mode).

**Returns**:
```python
{
    "status": "success" | "error",
    "file_path": "destination/path.txt",
    "message": "File uploaded successfully" | "Error message"
}
```

**Example**:
```python
with open("local_file.txt", "rb") as f:
    result = agent.upload_file("remote/file.txt", f)
    print(f"Upload status: {result['status']}")
```

### stop_agent()

Send a stop signal to the agent.

```python
def stop_agent(
    self,
    message: str = "User requested stop",
    reason: str = "User initiated stop request"
) -> Dict[str, Any]
```

**Parameters**:
- `message` (str): Short message displayed to the agent.
- `reason` (str): Detailed reason for the stop request.

**Returns**:
```python
{
    "status": "sent" | "error",
    "message": "Stop request sent" | "Error message"
}
```

### Streaming Methods

#### start_streaming()

```python
def start_streaming(self, callback: Callable = None) -> None
```

**Parameters**:
- `callback` (Callable, optional): Function to call with each response.

**Note**: Currently a placeholder for future Server-Sent Events implementation.

#### stop_streaming()

```python
def stop_streaming(self) -> None
```

Stop background streaming.

#### is_streaming()

```python
def is_streaming(self) -> bool
```

**Returns**: True if streaming is active, False otherwise.

### Utility Methods

#### set_base_url()

```python
def set_base_url(self, base_url: str) -> None
```

Update the agent server URL.

#### get_status()

```python
def get_status(self) -> Dict[str, Any]
```

Get current agent status.

#### list_files()

```python
def list_files(self) -> Dict[str, Any]
```

List files uploaded to the agent.

#### get_latest_acts()

```python
def get_latest_acts(
    self,
    timeout: float = 14400.0,
    max_messages: int = 10
) -> List[Dict[str, Any]]
```

Retrieve recent actions from the agent.

## Factory Functions

### create_http_agent()

```python
def create_http_agent(
    agent_id: str = None,
    api_key: str = None,
    base_url: str = None,
    **kwargs
) -> Agent
```

Explicitly create an HTTP-based agent client.

### create_agent()

```python
def create_agent(
    client_type: str = "http",
    **kwargs
) -> Agent
```

Factory function with client type specification.

## Data Structures

### Action Object

Actions represent individual operations performed by the agent:

```python
{
    "command": str,           # Action type ("chat", "read_file", "modify_file", etc.)
    "parameters": Dict[str, Any],  # Command-specific parameters
    "result": Any,            # Command result (if completed)
    "timestamp": float,       # Unix timestamp
    "sequence_index": int,    # Sequential action number
    "status": str            # "pending", "completed", "error"
}
```

**Common Action Types**:
- `"chat"`: Agent communication/response
- `"read_file"`: File reading operation
- `"modify_file"`: File modification operation
- `"create_file"`: File creation operation
- `"delete_file"`: File deletion operation
- `"list_directory"`: Directory listing operation
- `"search_project"`: Project search operation
- `"run_subprocess"`: Command execution
- `"feedback"`: Internal feedback operation
- `"complete"`: Task completion marker

### Chat Action Structure

```python
{
    "command": "chat",
    "parameters": {
        "message": "Agent response text"
    },
    "result": "Agent response text",
    "timestamp": 1719676117.123,
    "sequence_index": 5
}
```

### File Operation Action Structure

```python
{
    "command": "read_file",
    "parameters": {
        "file_path": "src/main.py",
        "start_line": 1,
        "end_line": 50
    },
    "result": "File content...",
    "timestamp": 1719676118.456,
    "sequence_index": 3
}
```

### Response Formats

#### ACT Endpoint Response

```python
{
    "act_json": [           # List of action objects
        {
            "command": "chat",
            "parameters": {...},
            "result": "...",
            "timestamp": 1234567890,
            "sequence_index": 1
        }
    ],
    "status": "processing" | "completed" | "error",
    "final_response": "Final agent response" | None,
    "request_id": "uuid-string"
}
```

#### Health Check Response

```python
{
    "status": "healthy",
    "agent_name": "CodingAgent",
    "timestamp": "2025-06-29T15:08:37Z",
    "version": "1.0.0"
}
```

## Error Handling

### Exception Hierarchy

```python
Exception
├── ValueError              # Invalid parameters
├── RuntimeError           # HTTP communication failures
├── TimeoutError          # Request/response timeouts
└── requests.exceptions.*  # HTTP-specific errors
    ├── Timeout
    ├── ConnectionError
    └── HTTPError
```

### Error Response Format

```python
{
    "error": "Error message",
    "status_code": 500,      # HTTP status code
    "details": {...}         # Additional error details
}
```

### Common Error Scenarios

1. **Connection Errors**:
   ```python
   try:
       response = agent.message("Hello")
   except requests.exceptions.ConnectionError:
       print("Agent server is not accessible")
   ```

2. **Timeout Errors**:
   ```python
   try:
       response = await agent.send_message_with_streaming(
           "Long task", timeout=30
       )
   except TimeoutError:
       print("Agent did not respond within 30 seconds")
   ```

3. **Invalid Configuration**:
   ```python
   try:
       agent = Agent()  # No base_url set
       agent.message("Hello")
   except ValueError as e:
       print(f"Configuration error: {e}")
   ```

## Duplicate Prevention System

The SDK implements a comprehensive 5-layer duplicate prevention system:

### Layer 1: Request Deduplication

- Prevents duplicate message requests within 1-minute windows
- Uses content-based fingerprinting with time windows
- Automatic cleanup of old request fingerprints

### Layer 2: Action Fingerprinting

- Content-based fingerprinting for robust action deduplication
- Tracks actions globally across requests
- Prevents stale actions from previous requests

### Layer 3: Response Content Deduplication

- Blocks duplicate response content
- Uses MD5 hashing of response text
- Maintains response fingerprint cache

### Layer 4: Session Response Tracking

- Prevents multiple returns for same request_id
- Caches responses per session
- Ensures single response per request

### Layer 5: Memory Management

- Automatic cleanup of old fingerprints
- Configurable cleanup intervals
- Prevents memory bloat in long-running applications

## Configuration

### Environment Variables

```bash
# Agent configuration
AGENT_API_KEY=your-api-key
AGENT_ID=your-agent-id
BASE_URL=http://localhost:8100

# SQS configuration (legacy compatibility)
AWS_REGION=us-east-1
SQS_ENDPOINT_URL=https://sqs.us-east-1.amazonaws.com
SQS_TRIGGER_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/agent-triggers
SQS_ACTIONS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789012/agent-actions
```

### Logging Configuration

```python
import logging

# Enable SDK logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('agent_client')

# Enable raw HTTP response logging
raw_logger = logging.getLogger('agent_client.client_http_toolkit.raw_data')
raw_logger.setLevel(logging.INFO)
```

## Performance Considerations

### Connection Pooling

The SDK uses `requests.Session` for connection pooling:

```python
# Automatic connection reuse
agent = Agent(base_url="http://localhost:8100")
# Multiple requests reuse the same connection
```

### Timeout Configuration

```python
# Configure timeouts
agent = Agent(
    base_url="http://localhost:8100",
    timeout=300  # 5 minutes
)

# Per-request timeout override
response = await agent.send_message_with_streaming(
    "Long task",
    timeout=600  # 10 minutes for this request
)
```

### Memory Management

```python
# The SDK automatically manages memory:
# - Cleans up old fingerprints every hour
# - Limits fingerprint cache sizes
# - Removes old request tracking data

# Manual cleanup (if needed)
agent._cleanup_old_data()
```

## Testing

### Basic Connection Test

```python
from agent_client import Agent

def test_agent_connection():
    agent = Agent(
        agent_id="test-agent",
        api_key="test-key",
        base_url="http://localhost:8100"
    )
    
    status = agent.test_connection()
    assert status['status'] == 'connected'
    print("✅ Agent connection successful")

test_agent_connection()
```

### Message Flow Test

```python
import asyncio

async def test_message_flow():
    agent = Agent(
        agent_id="test-agent",
        api_key="test-key",
        base_url="http://localhost:8100"
    )
    
    # Test synchronous message
    sync_response = agent.message("Hello, agent!")
    assert 'request_id' in sync_response
    print("✅ Synchronous message successful")
    
    # Test streaming message
    actions_received = []
    
    def action_handler(action, count):
        actions_received.append(action)
        print(f"Action {count}: {action.get('command')}")
    
    response = await agent.send_message_with_streaming(
        "Tell me about Python",
        action_callback=action_handler,
        timeout=60
    )
    
    assert len(actions_received) > 0
    assert isinstance(response, str)
    print("✅ Streaming message successful")

asyncio.run(test_message_flow())
```

## Migration Guide

### From SQS to HTTP

The SDK maintains API compatibility while switching from SQS to HTTP:

```python
# Old SQS approach (still works)
agent = Agent(
    agent_id="my-agent",
    api_key="my-key",
    # SQS parameters are ignored
    sqs_config={...}  # Ignored
)

# New HTTP approach (recommended)
agent = Agent(
    agent_id="my-agent",
    api_key="my-key",
    base_url="http://localhost:8100"  # Required for HTTP
)

# Same API for both
response = agent.message("Hello")
```

### Compatibility Methods

For seamless migration, these SQS methods are mapped to HTTP equivalents:

```python
# SQS compatibility methods
agent.start_sqs_consuming(callback)  # → start_streaming(callback)
agent.stop_sqs_consuming()           # → stop_streaming()
```

## Best Practices

### 1. Connection Management

```python
# Set base_url during initialization
agent = Agent(
    agent_id="my-agent",
    base_url="http://localhost:8100"  # Required
)

# Or set it later
agent.set_base_url("http://localhost:8100")
```

### 2. Error Handling

```python
import asyncio
from requests.exceptions import ConnectionError, Timeout

async def robust_agent_interaction():
    agent = Agent(
        agent_id="my-agent",
        base_url="http://localhost:8100",
        timeout=300
    )
    
    try:
        # Test connection first
        status = agent.test_connection()
        if status['status'] != 'connected':
            raise ConnectionError("Agent not accessible")
        
        # Send message with error handling
        response = await agent.send_message_with_streaming(
            "Analyze this codebase",
            timeout=600
        )
        return response
        
    except ConnectionError:
        print("❌ Agent server not accessible")
        return None
    except TimeoutError:
        print("❌ Agent response timeout")
        return None
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        return None
```

### 3. Action Monitoring

```python
import asyncio

async def monitor_agent_actions():
    agent = Agent(
        agent_id="my-agent",
        base_url="http://localhost:8100"
    )
    
    action_log = []
    
    def detailed_action_handler(action, count):
        """Comprehensive action monitoring"""
        action_info = {
            'count': count,
            'command': action.get('command', 'unknown'),
            'timestamp': action.get('timestamp'),
            'status': action.get('status', 'unknown'),
            'has_result': 'result' in action
        }
        
        action_log.append(action_info)
        
        # Log different action types
        if action['command'] == 'chat':
            message = action.get('parameters', {}).get('message', '')
            print(f"💬 [{count}] Agent says: {message[:100]}...")
        elif action['command'] in ['read_file', 'modify_file', 'create_file']:
            file_path = action.get('parameters', {}).get('file_path', 'unknown')
            print(f"📁 [{count}] File operation: {action['command']} on {file_path}")
        else:
            print(f"⚙️  [{count}] Action: {action['command']}")
    
    response = await agent.send_message_with_streaming(
        "Create a Python script to analyze log files",
        action_callback=detailed_action_handler,
        timeout=300
    )
    
    # Summary
    print(f"\n📊 Action Summary:")
    print(f"Total actions: {len(action_log)}")
    
    command_counts = {}
    for action in action_log:
        cmd = action['command']
        command_counts[cmd] = command_counts.get(cmd, 0) + 1
    
    for cmd, count in command_counts.items():
        print(f"  {cmd}: {count}")
    
    return response

# Run the monitoring example
asyncio.run(monitor_agent_actions())
```

### 4. File Operations

```python
def upload_project_files(agent, file_paths):
    """Upload multiple files to the agent"""
    results = []
    
    for local_path in file_paths:
        try:
            with open(local_path, 'rb') as f:
                # Use relative path for remote destination
                remote_path = local_path.replace('\\', '/')  # Normalize path
                result = agent.upload_file(remote_path, f)
                results.append({
                    'local_path': local_path,
                    'remote_path': remote_path,
                    'status': result['status'],
                    'message': result.get('message')
                })
                print(f"✅ Uploaded: {local_path} → {remote_path}")
        except Exception as e:
            results.append({
                'local_path': local_path,
                'status': 'error',
                'message': str(e)
            })
            print(f"❌ Failed to upload {local_path}: {e}")
    
    return results

# Usage
files_to_upload = ['src/main.py', 'config/settings.json', 'README.md']
upload_results = upload_project_files(agent, files_to_upload)
```

## Troubleshooting

### Common Issues

1. **"base_url must be provided" Error**
   ```python
   # ❌ Missing base_url
   agent = Agent(agent_id="test")
   agent.message("Hello")  # Raises ValueError
   
   # ✅ Correct initialization
   agent = Agent(
       agent_id="test",
       base_url="http://localhost:8100"
   )
   ```

2. **Connection Refused**
   ```python
   # Check if agent server is running
   status = agent.test_connection()
   if status['status'] == 'error':
       print(f"Connection failed: {status.get('error')}")
       # Check server status, port, firewall, etc.
   ```

3. **Timeout Issues**
   ```python
   # Increase timeout for long-running tasks
   response = await agent.send_message_with_streaming(
       "Complex analysis task",
       timeout=1800  # 30 minutes
   )
   ```

4. **Duplicate Request Errors**
   ```python
   # Wait before sending the same message again
   try:
       response = agent.message("Hello")
   except ValueError as e:
       if "duplicate request" in str(e).lower():
           time.sleep(60)  # Wait 1 minute
           response = agent.message("Hello")  # Retry
   ```

### Debug Logging

```python
import logging

# Enable comprehensive logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(name)s | %(levelname)s | %(message)s'
)

# SDK-specific loggers
sdk_logger = logging.getLogger('agent_client')
raw_logger = logging.getLogger('agent_client.client_http_toolkit.raw_data')

# Enable raw HTTP logging
raw_logger.setLevel(logging.INFO)

# This will show:
# - All HTTP requests and responses
# - Action processing details
# - Duplicate prevention actions
# - Error details and stack traces
```

## Version History

### v2.0.0 (Current)
- **HTTP-First Architecture**: Complete migration from SQS to HTTP
- **Enhanced Duplicate Prevention**: 5-layer protection system
- **Real-time Action Streaming**: Live action updates during processing
- **Improved Error Handling**: Comprehensive exception handling
- **Memory Management**: Automatic cleanup and optimization
- **OpenAI-like Interface**: Familiar and intuitive API design

### v1.x (Legacy)
- SQS-based communication
- Basic message sending
- Limited error handling
- Manual connection management

---

## Summary

The agents-client SDK provides a robust, modern interface for interacting with AI agents through HTTP communication. Key features include:

✅ **Simple API**: OpenAI-like interface for easy adoption  
✅ **Real-time Streaming**: Live action updates during agent processing  
✅ **Robust Error Handling**: Comprehensive exception management  
✅ **Duplicate Prevention**: Multi-layer protection against duplicate actions  
✅ **Memory Efficient**: Automatic cleanup and resource management  
✅ **HTTP-First**: Direct communication without complex message queuing  
✅ **Backward Compatible**: Seamless migration from SQS-based architecture  

For additional examples and advanced usage patterns, see the `examples/` directory and test files in the repository.