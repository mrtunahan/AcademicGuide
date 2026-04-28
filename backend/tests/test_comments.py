from tests.conftest import auth_headers


def test_comments_lifecycle(client):
    student = auth_headers(client, "stu@x.edu", "supersecret", "student", "Stu")
    advisor = auth_headers(client, "adv@x.edu", "supersecret", "advisor", "Adv")

    project = client.post(
        "/api/projects",
        json={"title": "Proje Bir", "abstract": ""},
        headers=student,
    ).json()

    create = client.post(
        f"/api/projects/{project['id']}/comments",
        json={"body": "Lütfen yöntemi netleştir."},
        headers=advisor,
    )
    assert create.status_code == 201
    assert create.json()["body"] == "Lütfen yöntemi netleştir."

    listing = client.get(
        f"/api/projects/{project['id']}/comments", headers=student
    )
    assert listing.status_code == 200
    assert len(listing.json()) == 1


def test_comments_require_access(client):
    owner = auth_headers(client, "owner@x.edu", "supersecret", "student", "Owner")
    other = auth_headers(client, "other@x.edu", "supersecret", "student", "Other")

    project = client.post(
        "/api/projects",
        json={"title": "Mine", "abstract": ""},
        headers=owner,
    ).json()

    res = client.get(
        f"/api/projects/{project['id']}/comments", headers=other
    )
    assert res.status_code == 403
