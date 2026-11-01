"""
Dynamic In-App Notification Template System
Maps notification types to templates and injects payload data.
"""
from typing import Dict, Any

NOTIFICATION_TEMPLATES = {
    "REGISTRATION_CONFIRMED": {
        "title": "Registration Successful",
        "message": "You have successfully registered for {{event_name}}.",
        "action_url": "/events/{{event_id}}"
    },
    "TEAM_CREATED": {
        "title": "Team Created",
        "message": "{{team_name}} has been created successfully.",
        "action_url": "/teams/{{team_id}}"
    },
    "TEAM_JOIN_REQUEST": {
        "title": "New Join Request",
        "message": "{{participant_name}} requested to join your team.",
        "action_url": "/teams/{{team_id}}/requests"
    },
    "TEAM_JOIN_APPROVED": {
        "title": "Request Approved",
        "message": "You have joined {{team_name}}.",
        "action_url": "/teams/{{team_id}}"
    },
    "TEAM_JOIN_REJECTED": {
        "title": "Request Update",
        "message": "Your join request was not approved.",
        "action_url": "/teams"
    },
    "STAGE_UNLOCKED": {
        "title": "New Stage Available",
        "message": "{{stage_name}} is now available.",
        "action_url": "/events/{{event_id}}/stages/{{stage_id}}"
    },
    "SUBMISSION_RECEIVED": {
        "title": "Submission Received",
        "message": "Your submission was received successfully.",
        "action_url": "/submissions/{{submission_id}}"
    },
    "SUBMISSION_UPDATED": {
        "title": "Submission Updated",
        "message": "Your latest changes have been saved.",
        "action_url": "/submissions/{{submission_id}}"
    },
    "EVALUATION_COMPLETED": {
        "title": "Evaluation Completed",
        "message": "Your submission has been evaluated.",
        "action_url": "/evaluations/{{evaluation_id}}"
    },
    "SHORTLISTED": {
        "title": "Congratulations!",
        "message": "You have been shortlisted for the next round.",
        "action_url": "/events/{{event_id}}/stages/{{stage_id}}"
    },
    "WAITLISTED": {
        "title": "Status Updated",
        "message": "Your submission has been waitlisted.",
        "action_url": "/events/{{event_id}}"
    },
    "APPROVED": {
        "title": "Approved",
        "message": "You have been approved for the next stage.",
        "action_url": "/events/{{event_id}}/stages/{{stage_id}}"
    },
    "REJECTED": {
        "title": "Status Updated",
        "message": "Your submission was not selected.",
        "action_url": "/events/{{event_id}}"
    },
    "WINNER": {
        "title": "Congratulations Winner!",
        "message": "You secured Rank {{rank}}.",
        "action_url": "/results/{{result_id}}"
    },
    "CERTIFICATE_ISSUED": {
        "title": "Certificate Ready",
        "message": "Your certificate is available for download.",
        "action_url": "/certificates/{{certificate_id}}"
    },
    "FEEDBACK_REQUEST": {
        "title": "Share Your Feedback",
        "message": "Help us improve by sharing your experience.",
        "action_url": "/feedback/{{feedback_id}}"
    },
    "EVENT_PUBLISHED": {
        "title": "Event Live",
        "message": "Registration is now open.",
        "action_url": "/events/{{event_id}}"
    },
    "RESULTS_PUBLISHED": {
        "title": "Results Published",
        "message": "Results are now available.",
        "action_url": "/results/{{event_id}}"
    },
}

class NotificationTemplateEngine:
    @staticmethod
    def generate(notification_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        template = NOTIFICATION_TEMPLATES.get(notification_type)
        if not template:
            raise ValueError(f"Template not found for type: {notification_type}")

        title = template["title"]
        message = template["message"]
        action_url = template["action_url"]

        # Inject payload variables
        for key, value in payload.items():
            placeholder = f"{{{{{key}}}}}"
            value_str = str(value)
            title = title.replace(placeholder, value_str)
            message = message.replace(placeholder, value_str)
            action_url = action_url.replace(placeholder, value_str)

        return {
            "title": title,
            "message": message,
            "action_url": action_url
        }
