from fastapi import HTTPException


DB_CONNECTION_ERROR_MESSAGE = (
    "No se pudo conectar con la base de datos. "
    "Revisa backend, .env y permisos remotos de MySQL."
)


def database_unavailable_exception() -> HTTPException:
    return HTTPException(status_code=503, detail=DB_CONNECTION_ERROR_MESSAGE)
