"""
Định nghĩa các Exception nghiệp vụ cho hệ thống.
"""
from fastapi import HTTPException, status


class EntityNotFoundException(HTTPException):
    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy {entity_name} với id={entity_id}",
        )


class ModelNotReadyException(HTTPException):
    def __init__(self, detail: str = "Hệ thống AI chưa sẵn sàng. Vui lòng thử lại sau."):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail,
        )


class PermissionDeniedException(HTTPException):
    def __init__(self, detail: str = "Bạn không có quyền thực hiện chức năng này."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class BadRequestException(HTTPException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )
