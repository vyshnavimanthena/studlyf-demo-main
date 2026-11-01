from fastapi import Depends, HTTPException, Request
from auth_utils import decode_access_token
from typing import List

def get_current_user(request: Request):
    """Get current authenticated user from request using JWT."""
    # Try to get user from Authorization header first
    authorization = request.headers.get("Authorization")
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ")[1]
            payload = decode_access_token(token)
            if payload and payload.get("user_id"):
                return payload
        except Exception:
            pass
    
    raise HTTPException(status_code=401, detail="Authentication required")

def require_role(allowed_roles: List[str]):
    """
    Restricts access to specific roles.
    """
    async def role_checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user
    return role_checker

