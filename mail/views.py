"""
Views for email REST APIs
"""
import logging

from rest_framework import (
    authentication,
    permissions,
    status,
)
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework.response import Response

from courses.models import Course
from financialaid.models import FinancialAid
from financialaid.permissions import UserCanEditFinancialAid
from mail.api import MailgunClient
from mail.permissions import UserCanMessageLearnersPermission, UserCanMessageCourseTeamPermission
from mail.serializers import GenericMailSerializer
from mail.utils import generate_mailgun_response_json
from search.api import (
    prepare_and_execute_search,
    get_all_query_matching_emails
)
from profiles.util import full_name

log = logging.getLogger(__name__)


class SearchResultMailView(APIView):
    """
    View class that handles HTTP requests to search results mail API
    """
    authentication_classes = (
        authentication.SessionAuthentication,
        authentication.TokenAuthentication,
    )
    permission_classes = (permissions.IsAuthenticated, UserCanMessageLearnersPermission, )

    def post(self, request, *args, **kargs):  # pylint: disable=unused-argument, no-self-use
        """
        POST method handler
        """
        emails = prepare_and_execute_search(
            request.user,
            search_param_dict=request.data.get('search_request'),
            search_func=get_all_query_matching_emails,
            filter_on_email_optin=True
        )
        mailgun_responses = MailgunClient.send_batch(
            subject=request.data['email_subject'],
            body=request.data['email_body'],
            recipients=emails,
            sender_name=full_name(request.user)
        )
        return Response(
            status=status.HTTP_200_OK,
            data={
                "batch_{}".format(batch_num): {
                    "status_code": resp.status_code,
                    "data": generate_mailgun_response_json(resp)
                } for batch_num, resp in enumerate(mailgun_responses)
            }
        )


class CourseTeamMailView(GenericAPIView):
    """
    View class that handles HTTP requests to course team mail API
    """
    serializer_class = GenericMailSerializer
    authentication_classes = (
        authentication.SessionAuthentication,
        authentication.TokenAuthentication,
    )
    permission_classes = (permissions.IsAuthenticated, UserCanMessageCourseTeamPermission)
    lookup_field = "id"
    lookup_url_kwarg = "course_id"
    queryset = Course.objects.all()

    def post(self, request, *args, **kargs):  # pylint: disable=unused-argument, no-self-use
        """
        POST method handler
        """
        user = request.user
        course = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mailgun_response = MailgunClient.send_course_team_email(
            user=user,
            course=course,
            subject=serializer.data['email_subject'],
            body=serializer.data['email_body'],
        )
        return Response(
            status=mailgun_response.status_code,
            data=generate_mailgun_response_json(mailgun_response)
        )


class FinancialAidMailView(GenericAPIView):
    """
    View for sending financial aid emails to individual learners
    """
    serializer_class = GenericMailSerializer
    authentication_classes = (
        authentication.SessionAuthentication,
        authentication.TokenAuthentication,
    )
    permission_classes = (permissions.IsAuthenticated, UserCanMessageLearnersPermission, UserCanEditFinancialAid)
    lookup_field = "id"
    lookup_url_kwarg = "financial_aid_id"
    queryset = FinancialAid.objects.all()

    def post(self, request, *args, **kwargs):
        """
        Post request to send emails to an individual learner
        """
        financial_aid = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mailgun_response = MailgunClient.send_financial_aid_email(
            body=serializer.data['email_body'],
            acting_user=request.user,
            subject=serializer.data['email_subject'],
            financial_aid=financial_aid
        )
        return Response(
            status=mailgun_response.status_code,
            data=generate_mailgun_response_json(mailgun_response)
        )
