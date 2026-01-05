import time
from typing import Sequence

from ollama import Client, Image

from pythonApp.lib.queue_controller.tslist import TsList


class Message:

    created = None
    message_context = None

    def __init__(self, message, context):
        self.created = time.time()
        self.message_context = (message, context)

class Messages(TsList):
    message_history = TsList()

    def add(self, *messages: Message):
        self.message_history.add(*messages)

class OllamaClient:

    client = None

    def __init__(self, host: str):
        self.client = Client(host=host)

    def generate(self, model: str, prompt: str, images: Sequence[str | bytes | Image | None] = None,
               messages: Messages = None):
        response = self.client.generate(model=model, prompt=prompt, images=images)

        if messages is not None:
            messages.message_history.add(Message(message=prompt, context=response.context))

        return response


