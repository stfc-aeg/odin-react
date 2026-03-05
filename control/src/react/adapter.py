from odin_control._version import __version__
from odin_control.adapters.adapter import ApiAdapter
from odin_control.adapters.parameter_tree import ParameterTreeError
from react.controller import ReactController


class ReactAdapter(ApiAdapter):

    version = __version__
    controller_cls = ReactController
    error_cls = ParameterTreeError