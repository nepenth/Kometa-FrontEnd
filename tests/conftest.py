import pytest
from fastapi.testclient import TestClient
from kometa import create_fastapi_app

@pytest.fixture(scope="module")
def client():
    app = create_fastapi_app()
    with TestClient(app) as c:
        yield c
