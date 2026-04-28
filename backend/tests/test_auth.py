def test_register_and_login(client):
    res = client.post(
        "/api/auth/register",
        json={
            "email": "ayse@uni.edu.tr",
            "full_name": "Ayşe Yılmaz",
            "password": "supersecret",
            "role": "student",
        },
    )
    assert res.status_code == 201
    body = res.json()
    assert body["access_token"]
    assert body["user"]["email"] == "ayse@uni.edu.tr"
    assert body["user"]["role"] == "student"

    duplicate = client.post(
        "/api/auth/register",
        json={
            "email": "ayse@uni.edu.tr",
            "full_name": "Aye",
            "password": "supersecret",
            "role": "student",
        },
    )
    assert duplicate.status_code == 409

    login = client.post(
        "/api/auth/login",
        json={"email": "ayse@uni.edu.tr", "password": "supersecret"},
    )
    assert login.status_code == 200
    assert login.json()["user"]["email"] == "ayse@uni.edu.tr"

    bad = client.post(
        "/api/auth/login",
        json={"email": "ayse@uni.edu.tr", "password": "wrong"},
    )
    assert bad.status_code == 401


def test_me_requires_token(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401
