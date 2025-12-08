def test_read_main(client):
    response = client.get("/api/v1/health")
    # Note: Health endpoint might not exist, checking auth or root instead
    # Based on previous implementation, we have auth, config, scheduler, logs
    # Let's check a known endpoint or 404 for root
    response = client.get("/api/v1/auth/login")
    assert response.status_code == 405 # Method Not Allowed for GET on login

def test_swagger_ui(client):
    response = client.get("/api/docs")
    assert response.status_code == 200
