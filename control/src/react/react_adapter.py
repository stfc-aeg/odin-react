import random
from odin.adapters.adapter import (ApiAdapter, ApiAdapterRequest, ApiAdapterResponse,
                                    request_types, response_types)
from odin.adapters.parameter_tree import ParameterTree, ParameterTreeError
from odin.util import decode_request_body
from tornado.ioloop import PeriodicCallback
import logging

# stuff added for live image sim? might not want to be kept
import numpy as np
import cv2


class ReactAdapter(ApiAdapter):

    def __init__(self, **kwargs):
        super(ReactAdapter, self).__init__(**kwargs)
        self.client = ReactClient()
        self.deep_dict_val = "secret deep value"
        deep_dict = {"long":{"nested": {"dict":{"path": {"val": self.deep_dict_val}}}}}
        self.data_val = 10
        self.clip_data = [0, 100]
        self.param_tree = ParameterTree({
            "string_val": (lambda: self.client.string_val, self.client.set_string),
            "num_val": (lambda: self.client.num_val, self.client.set_num_val),
            "rand_num": (lambda: self.client.random_num, None),
            "select_list": (lambda: self.client.selection_list, None),
            "selected":(lambda: self.client.selected, self.client.set_selection),
            "toggle": (lambda: self.client.toggle, self.client.set_toggle),
            "trigger": (None, self.client.trigger_event),
            "deep": deep_dict,
            "data": {
                "set_data": (lambda: self.data_val, self.set_data_val),
                "dict": (self.get_data_dict, None),
                "clip_data": (lambda: self.clip_data, self.set_clip_data)
            }
            # "image": (lambda: self.client.rendered_image, None)
        })

    def get_data_dict(self):
        return {
            "half": self.data_val / 2,
            "is_even": not (self.data_val % 2)
        }
    
    def set_data_val(self, val):
        self.data_val = val

    def set_clip_data(self, val):
        self.clip_data = val

    @response_types('application/json', "image/*", default='application/json')
    def get(self, path, request):
        try:
            if path == "image":
                response = self.client.rendered_image
                content_type = 'image/png'
                status = 200
            else:
                response = self.param_tree.get(path)
                content_type = 'application/json'
                status = 200
        except ParameterTreeError as param_error:
            response = {'response': 'ZeroRPC GET error: {}'.format(param_error)}
            content_type = 'application/json'
            status = 400

        return ApiAdapterResponse(response, content_type=content_type, status_code=status)

    @response_types('application/json', default='application/json')
    def put(self, path, request):
        try:
            data = decode_request_body(request)
            self.param_tree.set(path, data)

            response = self.param_tree.get(path)
            content_type = 'application/json'
            status = 200

        except ParameterTreeError as param_error:
            response = {'response': 'Cryostat PUT error: {}'.format(param_error)}
            content_type = 'application/json'
            status = 400

        return ApiAdapterResponse(response, content_type=content_type, status_code=status)


class ReactClient:

    def __init__(self):
        pass
        self.string_val = "String Value Test"
        self.num_val = 10
        self.random_num = random.randint(0, 100)

        self.loop = PeriodicCallback(self.looping_update, 500)

        self.selection_list = ["item 1", "item 2", "item 3"]
        self.selected = "item 1"
        self.toggle = True

        self.img_data = np.random.randint(255, size=(255, 255))

        self.rendered_image = self.render_image(self.img_data)

        self.loop.start()

    def looping_update(self):
        # logging.debug("Loop Called")
        self.random_num = random.randint(0, 100)
        self.img_data = np.random.randint(255, size=(255, 255))

        self.rendered_image = self.render_image(self.img_data)

    def set_string(self, val):
        self.string_val = val

    def set_num_val(self, val):
        self.num_val = val

    def set_selection(self, val):
        if val in self.selection_list:
            self.selected = val

    def set_toggle(self, val):
        self.toggle = val

    def set_string(self, val):
        self.string_val = val

    def trigger_event(self, val):
        logging.info("Event Triggered by API with value: %s", val)

    def render_image(self, data):

        image = cv2.imencode(
            ".png", data, params=[cv2.IMWRITE_PNG_COMPRESSION, 0])[1].tostring()
        return image
        


