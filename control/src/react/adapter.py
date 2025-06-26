import logging

from odin.adapters.adapter import (ApiAdapter, ApiAdapterResponse,
                                   request_types, response_types, wants_metadata)
from odin.adapters.parameter_tree import ParameterTreeError
from odin.util import decode_request_body

from react.controller import ReactController


class ReactAdapter(ApiAdapter):

    def __init__(self, **kwargs):

        super().__init__(**kwargs)

        self.controller = ReactController()

        logging.debug("React Adapter Loaded")

    @response_types('application/json', default='application/json')
    def get(self, path, request):
        """Handle an HTTP GET request.

        This method handles an HTTP GET request, returning a JSON response.

        :param path: URI path of request
        :param request: HTTP request object
        :return: an ApiAdapterResponse object containing the appropriate response
        """
        logging.debug(request.query_arguments)
        metadata = wants_metadata(request)
        try:
            query = {k: [val.decode("utf-8") for val in v] for (k, v) in request.query_arguments.items()}
            response = self.controller.get(path, metadata, query)
            status_code = 200
        except (ParameterTreeError) as e:
            response = {'error': str(e)}
            status_code = 400

        content_type = 'application/json'

        return ApiAdapterResponse(response, content_type=content_type,
                                  status_code=status_code)

    @request_types('application/json', 'application/vnd.odin-native')
    @response_types('application/json', default='application/json')
    def put(self, path, request):
        """Handle an HTTP PUT request.

        This method handles an HTTP PUT request, decoding the request and attempting to set values
        in the asynchronous parameter tree as appropriate.
        :param path: URI path of request
        :param request: HTTP request object
        :return: an ApiAdapterResponse object containing the appropriate response
        """
        content_type = 'application/json'

        try:
            data = decode_request_body(request)
            response = self.controller.set(path, data)
            status_code = 200
        except (ParameterTreeError) as e:
            response = {'error': str(e)}
            status_code = 400

        return ApiAdapterResponse(
            response, content_type=content_type, status_code=status_code
        )

    def cleanup(self):
        """Clean up the adapter.

        This method stops the background tasks, allowing the adapter state to be cleaned up
        correctly.
        """
        logging.debug("Cleanup called")
        self.controller.cleanup()