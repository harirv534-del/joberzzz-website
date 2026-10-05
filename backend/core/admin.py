from django.contrib import admin
from .models import *
for m in (User, Job, Resume, Application, Conversation, Message):
    admin.site.register(m)
