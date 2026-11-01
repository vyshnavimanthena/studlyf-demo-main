from __future__ import annotations
"""
Security utilities for file upload validation and security checks.
"""
import os
import uuid
import magic
from typing import Optional
from fastapi import UploadFile, HTTPException

# Allowed file types and their MIME types
ALLOWED_FILE_TYPES = {
    'pdf': ['application/pdf'],
    'doc': ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'txt': ['text/plain'],
    'jpg': ['image/jpeg'],
    'jpeg': ['image/jpeg'],
    'png': ['image/png'],
    'gif': ['image/gif'],
    'zip': ['application/zip', 'application/x-zip-compressed'],
    'py': ['text/x-python', 'text/plain'],
    'js': ['application/javascript', 'text/javascript'],
    'html': ['text/html'],
    'css': ['text/css']
}

# Maximum file size (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes

# Dangerous file extensions to block
DANGEROUS_EXTENSIONS = {
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'sh', 
    'ps1', 'php', 'asp', 'aspx', 'jsp', 'rb', 'py', 'pl', 'cgi', 'msi',
    'deb', 'rpm', 'dmg', 'app', 'pkg', 'torrent'
}

def validate_file_upload(file: UploadFile) -> dict:
    """
    Validate uploaded file for security threats.
    
    Args:
        file: UploadFile object from FastAPI
        
    Returns:
        dict: Validation result with file info
        
    Raises:
        HTTPException: If validation fails
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file size
    if hasattr(file, 'size') and file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Get file extension
    file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    
    # Check for dangerous extensions
    if file_extension in DANGEROUS_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type .{file_extension} is not allowed for security reasons"
        )
    
    # Read file content for MIME type detection
    try:
        file_content = file.file.read(1024)  # Read first 1KB for MIME detection
        file.file.seek(0)  # Reset file pointer
        
        # Detect MIME type using python-magic
        mime_type = magic.from_buffer(file_content, mime=True)
        
        # Validate MIME type
        if file_extension in ALLOWED_FILE_TYPES:
            allowed_mimes = ALLOWED_FILE_TYPES[file_extension]
            if mime_type not in allowed_mimes:
                raise HTTPException(
                    status_code=400,
                    detail=f"File content type {mime_type} doesn't match expected type for .{file_extension}"
                )
        else:
            # If extension not in allowed list, check if it's a common safe type
            safe_mimes = ['text/plain', 'application/pdf', 'image/jpeg', 'image/png', 'image/gif']
            if mime_type not in safe_mimes:
                raise HTTPException(
                    status_code=400,
                    detail=f"File type .{file_extension} is not supported"
                )
                
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail="Failed to validate file content")
    
    return {
        "filename": file.filename,
        "extension": file_extension,
        "mime_type": mime_type,
        "size": getattr(file, 'size', 0)
    }

def generate_secure_filename(original_filename: str) -> str:
    """
    Generate a secure filename using UUID while preserving extension.
    
    Args:
        original_filename: Original file name
        
    Returns:
        str: Secure filename
    """
    file_extension = original_filename.split('.')[-1] if '.' in original_filename else ''
    secure_name = str(uuid.uuid4())
    return f"{secure_name}.{file_extension}" if file_extension else secure_name

def create_secure_upload_directory(base_path: str = "uploads") -> str:
    """
    Create a secure upload directory with proper permissions.
    
    Args:
        base_path: Base directory path
        
    Returns:
        str: Created directory path
    """
    # Create directory if it doesn't exist
    os.makedirs(base_path, exist_ok=True)
    
    # Set secure permissions (owner read/write/execute only)
    try:
        os.chmod(base_path, 0o700)
    except OSError:
        # In Windows, chmod behavior is different
        pass
    
    return base_path
