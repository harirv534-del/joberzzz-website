from django.urls import path
from . import views as v
urlpatterns = [
  path("auth/register/", v.register), path("auth/login/", v.login), path("auth/me/", v.me),
  path("jobs/", v.jobs), path("resumes/", v.upload_resume),
  path("applications/", v.applications),
  path("applications/<uuid:pk>/", v.application_detail),
  path("applications/<uuid:pk>/profile/", v.application_profile),
  path("applications/<uuid:pk>/resume/", v.application_resume),
  path("conversations/", v.conversations),
  path("conversations/<uuid:pk>/", v.conversation_detail),
  path("conversations/<uuid:pk>/messages/", v.conversation_messages),
]
