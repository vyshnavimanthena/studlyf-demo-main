from bson import ObjectId
from db import participants_col, events_col

class EventWorkflowService:
    """
    Handles the internal business logic for different event phases.
    Rules are looked up from the event's stage config, not hardcoded names.
    """

    @staticmethod
    async def process_phase_transition(event_id: str, participant_ids: list, next_stage: str):
        """
        Enforces phase-specific rules before advancing participants.
        Reads stage config from the event to determine what rules to apply.
        """
        event = await events_col.find_one({"_id": ObjectId(event_id)})
        if not event:
            return True

        # Look up the next stage config to check its type
        stages = event.get("stages", [])
        stage_config = None
        if isinstance(stages, list):
            stage_config = next((s for s in stages if s.get("name") == next_stage), None)

        stage_type = (stage_config or {}).get("type", "").upper() if stage_config else ""

        # Check quiz pass mark if advancing to a QUIZ-type stage
        if stage_type == "QUIZ":
            quiz_id = (stage_config.get("config") or {}).get("quiz_id")
            if quiz_id:
                pass  # In a real app, verify quiz results here

        # Check team size if advancing to a TEAM_FORMATION-type stage
        if stage_type == "TEAM_FORMATION":
            for pid in participant_ids:
                participant = await participants_col.find_one({"_id": ObjectId(pid)})
                if participant and participant.get("team_id"):
                    from db import teams_col
                    team = await teams_col.find_one({"_id": ObjectId(participant["team_id"])})
                    if team:
                        members = team.get("members", [])
                        min_size = stage_config.get("min_team_size") if stage_config else None
                        if min_size is None:
                            min_size = event.get("min_team_size")
                        max_size = stage_config.get("max_team_size") if stage_config else None
                        if max_size is None:
                            max_size = event.get("max_team_size")
                        if min_size is None or max_size is None:
                            raise Exception("Team size is not configured for this event")
                        min_size = int(min_size)
                        max_size = int(max_size)
                        if len(members) < min_size or len(members) > max_size:
                            raise Exception(f"Team size ({len(members)}) out of range ({min_size}-{max_size})")

        # Check team requirement if advancing FROM a TEAM_FORMATION-type stage
        for pid in participant_ids:
            participant = await participants_col.find_one({"_id": ObjectId(pid)})
            if not participant:
                continue
            current_stage_name = participant.get("current_stage")
            if not current_stage_name:
                continue
            current_stage_config = next((s for s in stages if s.get("name") == current_stage_name), None)
            current_type = (current_stage_config or {}).get("type", "").upper() if current_stage_config else ""
            if current_type == "TEAM_FORMATION":
                if not participant.get("team_id"):
                    p_name = participant.get("name", "Unknown")
                    raise Exception(
                        f"{p_name} must be in a team before advancing from {current_stage_name}. "
                        f"Please ensure they have created or joined a team."
                    )

        # Stage rules passed - the route handler manages per-participant
        # current_stage update + completed_stages push
        return True

workflow_service = EventWorkflowService()
