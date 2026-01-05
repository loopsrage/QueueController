import asyncio
import threading
from typing import Callable, Awaitable, Coroutine

from aiohttp import ClientSession, ClientResponse

from lib.tslist import TsList

type JSON = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None

class Api:

    _lock: threading.Lock
    _base_url: str
    _responses: TsList
    _client_args: dict
    _request_args: dict

    def __init__(self, base_url: str, default_client_args: dict = None, default_request_args: dict = None):
        self._base_url = base_url
        self._lock = threading.Lock()
        self._responses = TsList()
        self._client_args = default_client_args
        self._request_args = default_request_args

    @property
    def base_url(self) -> str:
        with self._lock:
            return self._base_url

    @property
    def client_args(self) -> dict:
        with self._lock:
            return (self._client_args or {}).copy()

    @property
    def request_args(self) -> dict:
        with self._lock:
            return (self._request_args or {}).copy()

    def endpoint(self, endpoint: str):
        return "/".join([self.base_url, endpoint])

    async def _client_session(self, request_handler: Callable[[ClientSession], Awaitable[None]], client_args: dict = None):
        client_args = {**(self.client_args or {}), **(client_args or {})}
        async with ClientSession(**client_args) as session:
            await request_handler(session)

    async def client_request(self, response_handler: Callable[[ClientResponse], Awaitable[None]], client_args: dict = None, request_args: dict = None):
        request_args = {**(self._request_args or {}), **(request_args or {})}

        async def request_callback(session: ClientSession):

            try:
                request_args["url"]
            except KeyError:
                request_args["url"] = self.base_url

            try:
                request_args["method"]
            except KeyError:
                request_args["method"] = "GET"

            await response_handler(await session.request(**(request_args or {})))

        client_args = {**(self.client_args or {}), **(client_args or {})}
        await self._client_session(request_callback, client_args)

    async def gather_json_results(self):
        responses: list[Coroutine] = [i.json() for i in self._responses.all()]
        return await asyncio.gather(*responses)

    async def gather_text_results(self):
        responses: list[Coroutine] = [i.text() for i in self._responses.all()]
        return await asyncio.gather(*responses)

    async def json_results(self):
        return await self.gather_json_results()

    async def text_results(self):
        return await self.gather_text_results()

    async def api_request(self, method: str, to: str, data: JSON | dict = None, request_args: dict = None):

        async def _handle_response(response: ClientResponse) -> None:
            self._responses.add(response)

        args = {
            "url": self.endpoint(to),
            "json": data,
            "method": method,
            **(request_args or {})
        }

        await self.client_request(_handle_response, request_args=args)
