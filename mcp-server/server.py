# mcp-server/server.py
import os
import httpx
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP Server
mcp = FastMCP("Food Tracker Analytics & Actions")

# The base URL pointing back to your running Node.js Docker container
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000/api")

@mcp.resource("backend://status")
async def get_backend_status() -> str:
    """Checks if the core Node.js backend is accessible from the MCP server."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BACKEND_URL.replace('/api', '')}/health")
            if response.status_code == 200:
                return "Backend Status: HEALTHY"
            return f"Backend Status: UNHEALTHY (Status: {response.status_code})"
        except Exception as e:
            return f"Backend Status: UNREACHABLE (Error: {str(e)})"

# Explicitly import individual tools so they register with the server instance
from tools.analytics_tools import *
from tools.meal_tools import *

if __name__ == "__main__":
    # Start the FastMCP server over standard I/O (stdio) protocol
    mcp.run()