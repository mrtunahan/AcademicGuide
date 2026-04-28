from tests.conftest import auth_headers


def test_review_persists_to_project(client):
    headers = auth_headers(client, "stu@x.edu", "supersecret", "student", "Stu")
    project = client.post(
        "/api/projects",
        json={"title": "Proje Bir", "abstract": ""},
        headers=headers,
    ).json()

    res = client.post(
        "/api/analysis/review",
        json={
            "section": "ozgun_deger",
            "text": "Bu çalışmanın özgün değeri buradadır." * 3,
            "project_id": project["id"],
        },
        headers=headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body["score"] == 75
    assert body["section"] == "ozgun_deger"

    history = client.get(
        f"/api/analysis/projects/{project['id']}/reviews", headers=headers
    )
    assert history.status_code == 200
    assert len(history.json()) == 1


def test_lint_returns_issues(client):
    headers = auth_headers(client, "stu@x.edu", "supersecret", "student", "Stu")
    res = client.post(
        "/api/analysis/lint",
        json={"text": "Bu çalışmada deney yapıldı ve sonuçlar incelendi."},
        headers=headers,
    )
    assert res.status_code == 200
    assert isinstance(res.json()["issues"], list)
