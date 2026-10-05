import os
from django.contrib.auth import authenticate
from django.db.models import Q
from django.http import FileResponse, Http404
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import User, Job, Resume, Application, Conversation, Message

ALLOWED_EXT = {".pdf", ".doc", ".docx", ".txt"}
MAX_RESUME = 5 * 1024 * 1024

def user_json(u):
    return {"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role}

def err(msg, code=400): return Response({"error": msg}, status=code)

# ---------- Authorization (single source of truth) ----------
def apps_visible_to(user):
    """Applications this user may see. Everything else behaves as 'not found' (no IDOR leaks)."""
    if user.role == "admin": return Application.objects.all()
    if user.role == "recruiter": return Application.objects.filter(job__recruiter=user)
    return Application.objects.filter(candidate=user)

def get_app_or_404(user, pk):
    try: return apps_visible_to(user).select_related("job", "candidate", "resume").get(pk=pk)
    except Application.DoesNotExist: raise Http404

def require_recruiter_owner(user, app):
    # profile + resume: only the job's owning recruiter (or admin)
    if not (user.role == "admin" or (user.role == "recruiter" and app.job.recruiter_id == user.id)):
        raise Http404

# ---------- Auth ----------
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    d = request.data
    email, pw, role = (d.get("email") or "").lower().strip(), d.get("password") or "", d.get("role")
    if role not in ("job_seeker", "recruiter"): return err("Role must be job_seeker or recruiter.")
    if len(pw) < 8 or not email: return err("Valid email and 8+ char password required.")
    if User.objects.filter(email=email).exists(): return err("Email already registered.")
    u = User.objects.create_user(username=email, email=email, password=pw, role=role, full_name=d.get("full_name", ""))
    return Response({"token": Token.objects.create(user=u).key, "user": user_json(u)}, status=201)

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    u = authenticate(username=(request.data.get("email") or "").lower().strip(), password=request.data.get("password") or "")
    if not u or not u.is_active: return err("Invalid credentials.", 401)
    return Response({"token": Token.objects.get_or_create(user=u)[0].key, "user": user_json(u)})

@api_view(["GET"])
def me(request): return Response(user_json(request.user))

# ---------- Jobs ----------
def job_json(j): return {"id": str(j.id), "title": j.title, "description": j.description,
    "required_skills": j.required_skills, "location": j.location, "status": j.status, "recruiter_id": j.recruiter_id}

@api_view(["GET", "POST"])
def jobs(request):
    if request.method == "POST":
        if request.user.role != "recruiter": return err("Only recruiters can post jobs.", 403)
        d = request.data
        j = Job.objects.create(recruiter=request.user, title=d.get("title", ""), description=d.get("description", ""),
            required_skills=d.get("required_skills", []), location=d.get("location", ""))
        return Response(job_json(j), status=201)
    qs = Job.objects.filter(recruiter=request.user) if request.user.role == "recruiter" else Job.objects.filter(status="published")
    return Response([job_json(j) for j in qs])

# ---------- Resumes & applications ----------
@api_view(["POST"])
def upload_resume(request):
    if request.user.role != "job_seeker": return err("Only job seekers can upload resumes.", 403)
    f = request.FILES.get("file")
    if not f: return err("No file.")
    if os.path.splitext(f.name)[1].lower() not in ALLOWED_EXT or f.size > MAX_RESUME:
        return err("Allowed: PDF/DOC/DOCX/TXT up to 5 MB.")
    r = Resume.objects.create(user=request.user, file=f, file_name=os.path.basename(f.name)[:255])
    return Response({"id": str(r.id), "file_name": r.file_name}, status=201)

def app_json(a):
    return {"id": str(a.id), "job_id": str(a.job_id), "job_title": a.job.title, "candidate_id": a.candidate_id,
        "candidate_name": a.candidate.full_name, "recruiter_id": a.job.recruiter_id, "status": a.status,
        "match_percentage": a.match_percentage, "has_resume": bool(a.resume_id),
        "has_conversation": hasattr(a, "conversation"), "applied_at": a.created_at.isoformat()}

@api_view(["GET", "POST"])
def applications(request):
    if request.method == "POST":
        if request.user.role != "job_seeker": return err("Only job seekers can apply.", 403)
        try: job = Job.objects.get(pk=request.data.get("job_id"), status="published")
        except Exception: return err("Job not found.", 404)
        resume = None
        if request.data.get("resume_id"):
            resume = Resume.objects.filter(pk=request.data["resume_id"], user=request.user).first()  # own resumes only
            if not resume: return err("Resume not found.", 404)
        try: pct = max(0.0, min(100.0, float(request.data.get("match_percentage", 0))))
        except (TypeError, ValueError): pct = 0.0
        a, created = Application.objects.get_or_create(job=job, candidate=request.user,
            defaults={"resume": resume, "match_percentage": pct, "cover_letter": request.data.get("cover_letter", "")})
        if not created: return err("Already applied.", 409)
        return Response(app_json(a), status=201)
    qs = apps_visible_to(request.user).select_related("job", "candidate", "resume")
    return Response([app_json(a) for a in qs])

@api_view(["GET"])
def application_detail(request, pk): return Response(app_json(get_app_or_404(request.user, pk)))

@api_view(["GET"])
def application_profile(request, pk):
    a = get_app_or_404(request.user, pk); require_recruiter_owner(request.user, a)
    c = a.candidate
    # Only fields the applicant already provides to recruiters; no password/username/other contact leaks.
    return Response({**app_json(a), "cover_letter": a.cover_letter, "candidate": {"full_name": c.full_name,
        "email": c.email, "phone": c.phone, "location": c.location, "headline": c.headline, "bio": c.bio,
        "skills": c.skills, "experience_years": c.experience_years},
        "resume": {"file_name": a.resume.file_name} if a.resume else None})

@api_view(["GET"])
def application_resume(request, pk):
    a = get_app_or_404(request.user, pk); require_recruiter_owner(request.user, a)
    if not a.resume or not a.resume.file: raise Http404
    ext = os.path.splitext(a.resume.file_name)[1].lower()
    ctype = {".pdf": "application/pdf", ".txt": "text/plain"}.get(ext, "application/octet-stream")
    resp = FileResponse(a.resume.file.open("rb"), content_type=ctype)
    disp = "attachment" if request.query_params.get("download") == "1" or ext != ".pdf" else "inline"
    resp["Content-Disposition"] = f'{disp}; filename="{a.resume.file_name}"'
    resp["X-Content-Type-Options"] = "nosniff"; resp["Cache-Control"] = "private, no-store"
    return resp

# ---------- Messaging (only tied to a real application) ----------
def convs_for(user):
    return Conversation.objects.filter(Q(application__candidate=user) | Q(application__job__recruiter=user)) \
        .select_related("application__job", "application__candidate")

def conv_json(c, user):
    a = c.application; last = c.messages.last()
    other = a.candidate if user.id == a.job.recruiter_id else a.job.recruiter
    return {"id": str(c.id), "application_id": str(a.id), "job_title": a.job.title,
        "other_party": {"id": other.id, "name": other.full_name or other.email},
        "unread": c.messages.filter(receiver=user, is_read=False).count(),
        "last_message": last.body[:120] if last else None, "last_at": last.created_at.isoformat() if last else None}

def msg_json(m, user): return {"id": m.id, "body": m.body, "mine": m.sender_id == user.id,
    "is_read": m.is_read, "created_at": m.created_at.isoformat()}

@api_view(["GET", "POST"])
def conversations(request):
    if request.method == "POST":
        a = get_app_or_404(request.user, request.data.get("application_id"))  # must be a party to the application
        if request.user.role not in ("recruiter", "job_seeker") or \
           (request.user.id not in (a.candidate_id, a.job.recruiter_id)): raise Http404
        c, _ = Conversation.objects.get_or_create(application=a)
        return Response(conv_json(c, request.user), status=201)
    return Response([conv_json(c, request.user) for c in convs_for(request.user)])

def get_conv_or_404(user, pk):
    try: return convs_for(user).get(pk=pk)
    except Conversation.DoesNotExist: raise Http404

@api_view(["GET"])
def conversation_detail(request, pk):
    c = get_conv_or_404(request.user, pk)
    return Response({**conv_json(c, request.user), "messages": [msg_json(m, request.user) for m in c.messages.all()]})

@api_view(["GET", "POST"])
def conversation_messages(request, pk):
    c = get_conv_or_404(request.user, pk); a = c.application
    if request.method == "POST":
        body = (request.data.get("message") or "").strip()
        if not body or len(body) > 4000: return err("Message must be 1-4000 characters.")
        receiver = a.candidate if request.user.id == a.job.recruiter_id else a.job.recruiter
        m = Message.objects.create(conversation=c, sender=request.user, receiver=receiver, body=body)
        return Response(msg_json(m, request.user), status=201)
    c.messages.filter(receiver=request.user, is_read=False).update(is_read=True)  # read state
    return Response([msg_json(m, request.user) for m in c.messages.all()])
