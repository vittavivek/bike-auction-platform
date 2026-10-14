
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_home_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "message": "Bike Auction Platform API"
    }


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_unknown_endpoint_returns_404():
    response = client.get("/this-route-does-not-exist")
    assert response.status_code == 404


def test_auctions_endpoint_returns_list():
    response = client.get("/auctions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_bid_requires_authentication():
    response = client.post(
        "/auctions/1/bids",
        json={"amount": 999999999},
    )
    assert response.status_code == 401


def test_bid_rejects_zero_amount():
    response = client.post(
        "/auctions/1/bids",
        json={"amount": 0},
    )
    assert response.status_code == 401 or response.status_code == 422
