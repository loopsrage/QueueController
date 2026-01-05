from typing import Callable, Union, Any

from pythonApp.lib.queue_controller.controller.controller import Controller
from pythonApp.lib.queue_controller.queueController import QueueController
from pythonApp.lib.queue_controller.queueData import QueueData


class PeriodicProducer:
    _controller: Controller
    _queue: QueueController
    _action: Callable[[], Union[list[Any]|None]]

    def __init__(self,action: Callable[[], Union[list[Any]|None]],  queue: QueueController, interval: int, start_now: bool):
        self._controller = Controller(interval, start_now)
        self._queue = queue
        self._action = action

    def action(self):
        try:
            while True:
                self._controller.wait()
                self._controller.clear()
                result = self._action()
                if result is None:
                    continue

                for r in result:
                    data = QueueData()
                    data.set_attribute("result", r)
                    self._queue.enqueue(data)
        finally:
            self._controller.close()


def get_producer_result(queue_data: QueueData) -> Any:
    return queue_data.attribute("result")