from __future__ import annotations
"""
Evaluation Criteria Management Service
Handles creation, updating, and management of evaluation criteria for events
"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from db import events_col, institutions_col, users_col, notifications_col
from notification_helpers import notify_institution

class EvaluationCriteriaService:
    """Service for managing evaluation criteria"""
    
    async def create_evaluation_criteria(self, event_id: str, criteria_data: List[dict], user: dict):
        """Create evaluation criteria for an event"""
        
        # Validate user has institution access
        from auth_institution import assert_institution_owns_event
        event = await assert_institution_owns_event(event_id, user)
        
        # Validate criteria data
        if not criteria_data:
            raise ValueError("At least one criterion is required")
        
        validated_criteria = []
        total_points = 0
        
        for i, criterion in enumerate(criteria_data):
            # Validate required fields
            if not criterion.get("name"):
                raise ValueError(f"Criterion {i+1}: name is required")
            
            max_points = criterion.get("max_points", 0)
            if not isinstance(max_points, (int, float)) or max_points <= 0:
                raise ValueError(f"Criterion {i+1}: max_points must be a positive number")
            
            # Validate criterion type
            criterion_type = criterion.get("type", "score").lower()
            if criterion_type not in ["score", "rating", "binary", "text"]:
                raise ValueError(f"Criterion {i+1}: invalid type. Must be score, rating, binary, or text")
            
            # Build validated criterion
            validated_criterion = {
                "id": str(ObjectId()),
                "name": criterion["name"].strip(),
                "description": criterion.get("description", "").strip(),
                "type": criterion_type,
                "max_points": float(max_points),
                "weight": criterion.get("weight", 1.0),
                "required": criterion.get("required", False),
                "options": criterion.get("options", []),  # For multiple choice criteria
                "order": i + 1,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Add validation rules based on type
            if criterion_type == "rating":
                validated_criterion["scale"] = criterion.get("scale", 5)  # 1-5 scale by default
            elif criterion_type == "binary":
                validated_criterion["options"] = ["Yes", "No"]
                validated_criterion["max_points"] = 1.0
            elif criterion_type == "text":
                validated_criterion["max_length"] = criterion.get("max_length", 1000)
            
            validated_criteria.append(validated_criterion)
            total_points += validated_criterion["max_points"]
        
        # Update event with criteria
        await events_col.update_one(
            {"_id": ObjectId(event_id)},
            {
                "$set": {
                    "judging_criteria": validated_criteria,
                    "total_criteria_points": total_points,
                    "criteria_updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Create notification
        await notify_institution(
            user.get("institution_id"),
            f"Created {len(validated_criteria)} evaluation criteria for event",
            ntype="evaluation_criteria_created",
            title="Evaluation Criteria Created",
            meta={
                "event_id": event_id,
                "criteria_count": len(validated_criteria),
                "total_points": total_points
            }
        )
        
        return {
            "status": "success",
            "criteria_count": len(validated_criteria),
            "total_points": total_points
        }
    
    async def update_evaluation_criteria(self, event_id: str, criteria_updates: List[dict], user: dict):
        """Update existing evaluation criteria"""
        
        # Validate user has institution access
        from auth_institution import assert_institution_owns_event
        event = await assert_institution_owns_event(event_id, user)
        
        # Get existing criteria
        existing_criteria = event.get("judging_criteria", [])
        criteria_map = {c["id"]: c for c in existing_criteria}
        
        updated_criteria = []
        total_points = 0
        
        for update in criteria_updates:
            criterion_id = update.get("id")
            
            if criterion_id and criterion_id in criteria_map:
                # Update existing criterion
                existing = criteria_map[criterion_id]
                
                # Update fields
                if "name" in update:
                    existing["name"] = update["name"].strip()
                if "description" in update:
                    existing["description"] = update["description"].strip()
                if "max_points" in update:
                    new_points = update["max_points"]
                    if not isinstance(new_points, (int, float)) or new_points <= 0:
                        raise ValueError(f"Criterion {criterion_id}: max_points must be positive")
                    existing["max_points"] = float(new_points)
                if "weight" in update:
                    existing["weight"] = float(update["weight"])
                if "required" in update:
                    existing["required"] = bool(update["required"])
                if "options" in update:
                    existing["options"] = update["options"]
                
                existing["updated_at"] = datetime.now(timezone.utc).isoformat()
                updated_criteria.append(existing)
                total_points += existing["max_points"]
            
            elif not criterion_id:
                # Add new criterion
                validated_criterion = {
                    "id": str(ObjectId()),
                    "name": update.get("name", "").strip(),
                    "description": update.get("description", "").strip(),
                    "type": update.get("type", "score").lower(),
                    "max_points": float(update.get("max_points", 10)),
                    "weight": update.get("weight", 1.0),
                    "required": update.get("required", False),
                    "options": update.get("options", []),
                    "order": len(updated_criteria) + 1,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                
                if not validated_criterion["name"]:
                    raise ValueError("New criterion: name is required")
                
                updated_criteria.append(validated_criterion)
                total_points += validated_criterion["max_points"]
        
        # Update event
        await events_col.update_one(
            {"_id": ObjectId(event_id)},
            {
                "$set": {
                    "judging_criteria": updated_criteria,
                    "total_criteria_points": total_points,
                    "criteria_updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Create notification
        await notify_institution(
            user.get("institution_id"),
            f"Updated evaluation criteria for event",
            ntype="evaluation_criteria_updated",
            title="Evaluation Criteria Updated",
            meta={
                "event_id": event_id,
                "criteria_count": len(updated_criteria),
                "total_points": total_points
            }
        )
        
        return {
            "status": "success",
            "criteria_count": len(updated_criteria),
            "total_points": total_points
        }
    
    async def delete_evaluation_criterion(self, event_id: str, criterion_id: str, user: dict):
        """Delete a specific evaluation criterion"""
        
        # Validate user has institution access
        from auth_institution import assert_institution_owns_event
        event = await assert_institution_owns_event(event_id, user)
        
        # Get existing criteria
        existing_criteria = event.get("judging_criteria", [])
        
        # Find and remove criterion
        updated_criteria = []
        found = False
        total_points = 0
        
        for criterion in existing_criteria:
            if criterion["id"] == criterion_id:
                found = True
                continue  # Skip this criterion (delete it)
            
            updated_criteria.append(criterion)
            total_points += criterion["max_points"]
        
        if not found:
            raise ValueError("Criterion not found")
        
        # Update event
        await events_col.update_one(
            {"_id": ObjectId(event_id)},
            {
                "$set": {
                    "judging_criteria": updated_criteria,
                    "total_criteria_points": total_points,
                    "criteria_updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Create notification
        await notify_institution(
            user.get("institution_id"),
            f"Deleted evaluation criterion from event",
            ntype="evaluation_criteria_deleted",
            title="Evaluation Criterion Deleted",
            meta={
                "event_id": event_id,
                "criteria_count": len(updated_criteria),
                "total_points": total_points
            }
        )
        
        return {
            "status": "success",
            "criteria_count": len(updated_criteria),
            "total_points": total_points
        }
    
    async def get_evaluation_criteria(self, event_id: str, user: dict = None):
        """Get evaluation criteria for an event"""
        
        event = await events_col.find_one({"_id": ObjectId(event_id)})
        if not event:
            raise ValueError("Event not found")
        
        criteria = event.get("judging_criteria", [])
        
        # Sort by order
        criteria.sort(key=lambda x: x.get("order", 0))
        
        return {
            "event_id": event_id,
            "event_name": event.get("name", "Unknown Event"),
            "criteria": criteria,
            "total_points": event.get("total_criteria_points", 0),
            "criteria_updated_at": event.get("criteria_updated_at", "")
        }
    
    async def get_criteria_templates(self, institution_id: str, user: dict):
        """Get predefined criteria templates for the institution"""
        
        # Validate institution access
        from auth_institution import assert_institution_scope
        assert_institution_scope(institution_id, user)
        
        # Common criteria templates
        templates = {
            "hackathon": [
                {
                    "name": "Innovation & Creativity",
                    "description": "Originality and uniqueness of the solution",
                    "type": "rating",
                    "max_points": 20,
                    "weight": 1.5,
                    "scale": 5
                },
                {
                    "name": "Technical Implementation",
                    "description": "Quality of code, architecture, and technical execution",
                    "type": "rating",
                    "max_points": 25,
                    "weight": 2.0,
                    "scale": 5
                },
                {
                    "name": "Functionality & Features",
                    "description": "Completeness and working features of the solution",
                    "type": "rating",
                    "max_points": 20,
                    "weight": 1.5,
                    "scale": 5
                },
                {
                    "name": "Presentation & Demo",
                    "description": "Clarity of presentation and demo effectiveness",
                    "type": "rating",
                    "max_points": 15,
                    "weight": 1.0,
                    "scale": 5
                },
                {
                    "name": "Market Viability",
                    "description": "Potential real-world application and market fit",
                    "type": "rating",
                    "max_points": 20,
                    "weight": 1.5,
                    "scale": 5
                }
            ],
            "coding_challenge": [
                {
                    "name": "Code Quality",
                    "description": "Cleanliness, readability, and best practices",
                    "type": "rating",
                    "max_points": 25,
                    "weight": 2.0,
                    "scale": 5
                },
                {
                    "name": "Algorithm Efficiency",
                    "description": "Time and space complexity optimization",
                    "type": "rating",
                    "max_points": 30,
                    "weight": 2.5,
                    "scale": 5
                },
                {
                    "name": "Correctness",
                    "description": "Accuracy and completeness of solution",
                    "type": "rating",
                    "max_points": 25,
                    "weight": 2.0,
                    "scale": 5
                },
                {
                    "name": "Problem Solving Approach",
                    "description": "Logical thinking and problem decomposition",
                    "type": "rating",
                    "max_points": 20,
                    "weight": 1.5,
                    "scale": 5
                }
            ],
            "design_competition": [
                {
                    "name": "Visual Appeal",
                    "description": "Aesthetics and visual impact",
                    "type": "rating",
                    "max_points": 20,
                    "weight": 1.5,
                    "scale": 5
                },
                {
                    "name": "User Experience",
                    "description": "Usability and user-centered design",
                    "type": "rating",
                    "max_points": 25,
                    "weight": 2.0,
                    "scale": 5
                },
                {
                    "name": "Creativity",
                    "description": "Originality and innovative design elements",
                    "type": "rating",
                    "max_points": 20,
                    "weight": 1.5,
                    "scale": 5
                },
                {
                    "name": "Technical Execution",
                    "description": "Implementation quality and technical skills",
                    "type": "rating",
                    "max_points": 20,
                    "weight": 1.5,
                    "scale": 5
                },
                {
                    "name": "Presentation",
                    "description": "Design documentation and presentation quality",
                    "type": "rating",
                    "max_points": 15,
                    "weight": 1.0,
                    "scale": 5
                }
            ],
            "pitch_competition": [
                {
                    "name": "Business Model",
                    "description": "Viability and scalability of business model",
                    "type": "rating",
                    "max_points": 25,
                    "weight": 2.0,
                    "scale": 5
                },
                {
                    "name": "Market Analysis",
                    "description": "Understanding of target market and competition",
                    "type": "rating",
                    "max_points": 20,
                    "weight": 1.5,
                    "scale": 5
                },
                {
                    "name": "Presentation Skills",
                    "description": "Clarity, confidence, and communication",
                    "type": "rating",
                    "max_points": 20,
                    "weight": 1.5,
                    "scale": 5
                },
                {
                    "name": "Innovation",
                    "description": "Novelty and uniqueness of the idea",
                    "type": "rating",
                    "max_points": 20,
                    "weight": 1.5,
                    "scale": 5
                },
                {
                    "name": "Team & Execution",
                    "description": "Team capability and implementation plan",
                    "type": "rating",
                    "max_points": 15,
                    "weight": 1.0,
                    "scale": 5
                }
            ]
        }
        
        return templates
    
    async def clone_criteria_from_template(self, event_id: str, template_name: str, user: dict):
        """Clone criteria from a template to an event"""
        
        templates = await self.get_criteria_templates(user.get("institution_id"), user)
        
        if template_name not in templates:
            raise ValueError(f"Template '{template_name}' not found")
        
        template_criteria = templates[template_name]
        
        # Add IDs and timestamps to template criteria
        for i, criterion in enumerate(template_criteria):
            criterion["id"] = str(ObjectId())
            criterion["order"] = i + 1
            criterion["created_at"] = datetime.now(timezone.utc).isoformat()
        
        # Create criteria for event
        result = await self.create_evaluation_criteria(event_id, template_criteria, user)
        
        return {
            "status": "success",
            "template_used": template_name,
            "criteria_count": result["criteria_count"],
            "total_points": result["total_points"]
        }

# Global instance
evaluation_criteria_service = EvaluationCriteriaService()
