# mcp-server/tools/meal_tools.py
import httpx
from server import mcp, BACKEND_URL

@mcp.tool()
async def add_user_meal(user_id: int, meal_type: str, items: list) -> str:
    """
    Logs a new meal for the user with a specific type (e.g., Breakfast, Lunch, Snack) and items.
    Use this tool when the user explicitly requests to record or log what they ate.

    Args:
        user_id: The numerical ID of the authenticated user.
        meal_type: The type of meal (e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack').
        items: A list of dicts, where each dict has 'food_id' or 'name', and 'quantity'.
    """
    url = f"{BACKEND_URL}/meals"
    payload = {
        "meal_type": meal_type,
        "items": items
    }
    headers = {"X-User-Id": str(user_id)}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code in [200, 201]:
                return f"Successfully logged {meal_type} with {len(items)} items."
            return f"Failed to log meal. Backend responded with: {response.text}"
        except Exception as e:
            return f"Failed to connect to meal action service: {str(e)}"