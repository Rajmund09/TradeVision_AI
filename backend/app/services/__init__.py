"""Service layer package.  Import individual modules for convenient access.

Example usage::

    from app.services import user_service
    user_service.create_user(...)
"""

from . import (
    allocation_service,
    alert_service,
    advisor_service,
    education_service,
    ml_service,
    news_service,
    prediction_service,
    portfolio_service,
    user_service,
)
