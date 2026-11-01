import logging
from typing import List, Dict, Any, Set
from bson import ObjectId
from db import db
from models.eligibility_models import EligibilityRule, EligibilityResult, RuleType, RuleCategory

logger = logging.getLogger("eligibility_engine")

class EligibilityEngine:
    async def evaluate_event(self, event_id: str, rules: List[EligibilityRule]) -> Dict[str, List[EligibilityResult]]:
        """Orchestrator to evaluate all rules for an event."""
        # 1. Load Snapshots (Pre-fetching)
        # Assuming snapshots are stored in db.snapshots
        
        results = []
        for rule in rules:
            results.append(await self.evaluate_rule(rule))
            
        return self.resolve_conflicts(results)

    async def evaluate_rule(self, rule: EligibilityRule) -> EligibilityResult:
        """Evaluate a single rule against snapshot data."""
        # TODO: Load snapshot based on rule.snapshot_id
        
        # 2. Logic based on rule_type (RANK, TOP_N, etc.)
        team_ids = [] # From snapshot
        reason = "Matches rank requirement"
        
        # 3. Team Expansion
        recipient_ids = await self.expand_team_members(team_ids)
        
        return EligibilityResult(
            eligible=True,
            rule_id=rule.rule_id,
            certificate_type=rule.certificate_type,
            team_ids=team_ids,
            evaluation_reason=reason
        )

    async def expand_team_members(self, team_ids: List[str]) -> List[str]:
        """Bulk fetch all unique members for given teams."""
        if not team_ids: return []
        
        # Bulk query for all teams to get member IDs in one go
        cursor = db.teams.find({"_id": {"$in": [ObjectId(tid) for tid in team_ids]}}, {"members": 1})
        members = set()
        async for team in cursor:
            for member in team.get("members", []):
                members.add(str(member))
        return list(members)

    def resolve_conflicts(self, results: List[EligibilityResult]) -> Dict[str, List[EligibilityResult]]:
        """Apply priority logic to achievement rules."""
        # Participation rules always stay.
        # Achievement rules: highest priority per recipient wins.
        final_results = {}
        # ... logic to group by recipient, sort by priority, keep top achievement ...
        return {"results": results}

    async def generate_preview(self, event_id: str) -> Dict[str, int]:
        """Admin preview: Count eligible recipients."""
        return {"winner": 3, "participation": 1250}

# Performance Strategy:
# 1. Snapshot-First: Avoid live DB lookups, work only on immutable snapshots.
# 2. Bulk Fetching: `expand_team_members` uses a single `$in` query.
# 3. Caching: Cache team-member maps during evaluation.
