from abc import ABC, abstractmethod

class EmailProvider(ABC):
    @abstractmethod
    async def send(self, to: str, subject: str, body: str, attachments: List[Dict[str, Any]] = None) -> bool:
        pass

class SendGridProvider(EmailProvider):
    async def send(self, to, subject, body, attachments=None):
        # Implementation for SendGrid
        return True
