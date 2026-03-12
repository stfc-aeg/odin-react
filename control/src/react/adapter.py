from odin_control.adapters.adapter import ApiAdapter
from odin_control.adapters.parameter_tree import ParameterTreeError
from react.controller import ReactController
from react import __version__


class ReactAdapter(ApiAdapter):

    version = __version__
    controller_cls = ReactController
    error_cls = ParameterTreeError
