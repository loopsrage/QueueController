import threading
import uuid
from typing import Any

from pythonApp.lib.queue_controller.index import Index
from pythonApp.lib.queue_controller.tslist import TsList

ERRORS_KEY = "error"

class QueueData:
    _derivative: str = ""
    _index: Index = None
    _trace: TsList = None
    _lock: threading.Lock = None
    _uuid: uuid.UUID = None

    def __init__(self):
        self._index = Index().new("")
        self._trace = TsList()
        self._lock = threading.Lock()
        self._uuid = uuid.uuid4()


    def set_error(self, error: Exception) -> None:
        self._index.store_in_index(self.derivative, ERRORS_KEY, error)

    def set_attribute(self, attribute: Any, value: Any) -> None:
        self._index.store_in_index(self.derivative, attribute, value)

    def all_attributes(self):
        all_output = []
        for i in self._index.list_indexes():
            for key, value in self._index.range_index(i):
                all_output.append((key, value))
                
        return all_output

    def attribute(self, attribute: str) -> Any:
        return self._index.load_from_index(self.derivative, attribute)

    def attribute_from_derivative(self, attribute: str, derivative: str) -> Any:
        return self._index.load_from_index(derivative, attribute)

    def append_trace(self, identity: str) -> None:
        self._trace.add(identity)

    def trace(self) -> list[str]:
        return self._trace.all()

    @property
    def derivative(self) -> str:
        with self._lock:
            return self._derivative or ""

    def copy_derivative(self, derivative: str) -> 'QueueData':
        new_queue_data = QueueData()
        with self._lock:
            new_queue_data._index = self._index
            current_trace = self._trace.all()
            new_queue_data._derivative = derivative

        new_queue_data._trace.add(*current_trace)
        return new_queue_data
