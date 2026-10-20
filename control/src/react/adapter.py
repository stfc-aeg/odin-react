import logging

from odin_control.adapters.adapter import ApiAdapter
from odin_control.adapters.parameter_tree import ParameterTreeError
from odin_control.adapters.response import ApiAdapterResponse
from odin_control.adapters.util import request_types, require_controller
from tornado.httputil import HTTPServerRequest

from react import __version__
from react.controller import ReactController


class ReactAdapter(ApiAdapter):

    version = __version__
    controller_cls = ReactController
    error_cls = ParameterTreeError

    # Request Types decorator does not work with Multipart form data, due to additional bondary info in header.
    # Issue raised in Odin Control to fix in a future release
    # @request_types("application/json", "application/vnd.odin-native", "multipart/form-data")
    @require_controller
    def post(self, path: str, request: HTTPServerRequest):
        """Handle a HTTP Post request.
        
        This overwridden method includes custom handling for multipart/form-data MIME types.
        """
        accept_type = request.headers["Content-Type"].split(';')[0] if "Content-Type" in request.headers else "*/*"
        if accept_type ==  "multipart/form-data":
            try:
                files = [file for file_list in request.files.values() for file in file_list]
                for file in files:
                    self.controller.create(path, file)
                response = {"File(s) Uploaded": [file.filename for file in files]}
                status_code = 201
            except self.error_cls as error:
                response = {"error": str(error)}
                status_code = 400
            return ApiAdapterResponse(response, content_type="application/json", status_code=status_code)
        else:
            return super().post(path, request)