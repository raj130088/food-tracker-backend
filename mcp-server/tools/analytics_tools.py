# mcp-server/tools/analytics_tools.py
from typing import Optional
import httpx
from server import mcp, BACKEND_URL

@mcp.tool()
async def get_daily_nutrition_summary(user_id: int, session_cookie: str, date: Optional[str] = None) -> str:
    """
    Fetches the total calories, protein, carbohydrates, and fat consumed by a user on a given date.
    
    Args:
        user_id: The numerical ID of the authenticated user.
        session_cookie: The raw value of your auth cookie (e.g., 'token=abc123xyz' or just the token string).
        date: Optional string date in 'YYYY-MM-DD' format. Defaults to today.
    """
    url = f"{BACKEND_URL}/meals/summary"
    params = {"date": date} if date else {}
    
    # Format the cookie header exactly how a browser sends it
    # Replace 'token' with your actual cookie name (e.g., 'session', 'jwt', etc.) if it's named differently
    cookie_name = "token" 
    
    headers = {
        "Cookie": f"{cookie_name}={session_cookie}" if "=" not in session_cookie else session_cookie,
        "X-User-Id": str(user_id)
    } 
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, headers=headers)
            if response.status_code != 200:
                return f"Error from backend data layer: {response.text}"
                
            data = response.json()
            s = data.get("summary", {})
            return (
                f"Daily Summary for {data.get('date')}:\n"
                f"- Calories: {s.get('total_calories')} kcal\n"
                f"- Protein: {s.get('total_protein')}g\n"
                f"- Carbs: {s.get('total_carbs')}g\n"
                f"- Fat: {s.get('total_fat')}g\n"
                f"- Total Meals Logged: {s.get('meal_count')}"
            )
        except Exception as e:
            return f"Failed to reach analytics service: {str(e)}"