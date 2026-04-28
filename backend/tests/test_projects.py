from tests.conftest import auth_headers


def test_student_project_lifecycle(client):
    headers = auth_headers(client, "stu@x.edu", "supersecret", "student", "Stu")

    create = client.post(
        "/api/projects",
        json={"title": "Yapay zeka destekli mentor", "abstract": "ozet"},
        headers=headers,
    )
    assert create.status_code == 201
    project = create.json()
    assert project["status"] == "draft"

    listing = client.get("/api/projects", headers=headers)
    assert listing.status_code == 200
    assert len(listing.json()) == 1

    update = client.patch(
        f"/api/projects/{project['id']}",
        json={"status": "review"},
        headers=headers,
    )
    assert update.status_code == 200
    assert update.json()["status"] == "review"


def test_advisor_can_see_student_projects(client):
    student = auth_headers(client, "stu2@x.edu", "supersecret", "student", "Stu2")
    advisor = auth_headers(client, "adv@x.edu", "supersecret", "advisor", "Adv")

    client.post(
        "/api/projects",
        json={"title": "Bir proje", "abstract": ""},
        headers=student,
    )

    advisor_view = client.get("/api/projects", headers=advisor)
    assert advisor_view.status_code == 200
    assert len(advisor_view.json()) == 1


def test_advisor_cannot_create_project(client):
    advisor = auth_headers(client, "adv2@x.edu", "supersecret", "advisor", "Adv2")
    res = client.post(
        "/api/projects",
        json={"title": "Olmaz", "abstract": ""},
        headers=advisor,
    )
    assert res.status_code == 403
