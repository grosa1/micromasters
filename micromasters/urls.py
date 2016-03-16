"""project URL Configuration"""
from django.conf.urls import include, url
from django.contrib import admin
from rest_framework import routers

from courses.views import ProgramViewSet, CourseViewSet
from profiles.views import ProfileViewSet

router = routers.DefaultRouter()
router.register(r'programs', ProgramViewSet)
router.register(r'courses', CourseViewSet)
router.register(r'profiles', ProfileViewSet)

urlpatterns = [
    url(r'', include('ui.urls')),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/v0/', include(router.urls)),
    url(r'^status/', include('server_status.urls')),
]
