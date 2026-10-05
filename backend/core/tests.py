from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from .models import User, Job

class SecurityTests(APITestCase):
    def mk(self, email, role):
        r = self.client.post("/api/auth/register/", {"email": email, "password": "password123", "role": role, "full_name": email}, format="json")
        return r.data["token"], r.data["user"]["id"]
    def auth(self, t): self.client.credentials(HTTP_AUTHORIZATION=f"Token {t}")
    def setUp(self):
        self.rt, _ = self.mk("r1@x.com", "recruiter"); self.r2t, _ = self.mk("r2@x.com", "recruiter")
        self.st, _ = self.mk("s1@x.com", "job_seeker"); self.s2t, _ = self.mk("s2@x.com", "job_seeker")
        self.auth(self.rt); self.job = self.client.post("/api/jobs/", {"title": "FE Dev"}, format="json").data["id"]
        self.auth(self.st)
        rid = self.client.post("/api/resumes/", {"file": SimpleUploadedFile("cv.pdf", b"%PDF-1.4 x")}).data["id"]
        self.app = self.client.post("/api/applications/", {"job_id": self.job, "resume_id": rid, "match_percentage": 72}, format="json").data["id"]
    def test_owner_gets_profile_and_resume(self):
        self.auth(self.rt)
        self.assertEqual(self.client.get(f"/api/applications/{self.app}/profile/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/applications/{self.app}/resume/").status_code, 200)
    def test_other_recruiter_and_seekers_blocked(self):
        for t in (self.r2t, self.s2t, self.st):
            self.auth(t)
            self.assertEqual(self.client.get(f"/api/applications/{self.app}/resume/").status_code, 404 if t != self.st else 404)
        self.client.credentials()
        self.assertEqual(self.client.get(f"/api/applications/{self.app}/resume/").status_code, 401)
    def test_messaging_only_for_application_parties(self):
        self.auth(self.r2t)
        self.assertEqual(self.client.post("/api/conversations/", {"application_id": self.app}, format="json").status_code, 404)
        self.auth(self.s2t)
        self.assertEqual(self.client.post("/api/conversations/", {"application_id": self.app}, format="json").status_code, 404)
        self.auth(self.rt)
        cid = self.client.post("/api/conversations/", {"application_id": self.app}, format="json").data["id"]
        self.client.post(f"/api/conversations/{cid}/messages/", {"message": "Hi"}, format="json")
        self.auth(self.s2t); self.assertEqual(self.client.get(f"/api/conversations/{cid}/").status_code, 404)
        self.auth(self.st)
        self.assertEqual(self.client.get("/api/conversations/").data[0]["unread"], 1)
        self.client.get(f"/api/conversations/{cid}/messages/")
        self.assertEqual(self.client.get("/api/conversations/").data[0]["unread"], 0)
