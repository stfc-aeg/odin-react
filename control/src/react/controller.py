import logging
import random
from odin.adapters.parameter_tree import ParameterTree
from tornado.ioloop import PeriodicCallback
from react.event_logger import EventLogger


class ReactController():

    def __init__(self) -> None:

        self.deep_dict_val = "secret deep value"
        deep_dict = {"long": {"nested": {"dict": {"path": {"val": self.deep_dict_val}}}}}
        self.data_val = 10
        self.clip_data = [0, 100]

        self.string_val = "String Value Test"
        self.num_val = 10
        self.random_num = random.randint(0, 100)

        self.selection_list = ["item 1", "item 2", "item 3"]
        self.selected = "item 1"
        self.toggle = True

        self.logger = EventLogger(logging.getLogger())
        self.logger.info("System Starting Up")

        self.loop = PeriodicCallback(self.looping_update, 1000)
        self.loop.start()

        self.param_tree = ParameterTree({
            "string_val": (lambda: self.string_val, self.set_string),
            "num_val": (lambda: self.num_val, self.set_num_val,
                        {  # metadata
                            "min": 15,
                            "max": 76
                        }),
            "rand_num": (lambda: self.random_num, None),
            "select_list": (lambda: self.selection_list, None),
            "selected": (lambda: self.selected, self.set_selection),
            "toggle": (lambda: self.toggle, self.set_toggle),
            "trigger": (None, self.trigger_event),
            "deep": deep_dict,
            "data": {
                "set_data": (lambda: self.data_val, self.set_data_val),
                "dict": (self.get_data_dict, None),
                "clip_data": (lambda: self.clip_data, self.set_clip_data,)
            },
            "logging": (self.logger.events, None)
        })

    def looping_update(self):
        self.random_num = random.randint(0, 100)
        if self.random_num < 10:
            self.logger.critical("Random Number below 10: %d", self.random_num)
        elif self.random_num < 30:
            self.logger.error("Random Number below 30: %d", self.random_num)
        elif self.random_num < 50:
            self.logger.warning("Random Number below 50: %d", self.random_num)
        elif self.random_num < 60:
            self.logger.info("Random Number below 60: %d", self.random_num)
        else:
            self.logger.debug("Random Number: %d", self.random_num)

    def cleanup(self):
        self.loop.stop()

    def get_data_dict(self):
        return {
            "half": self.data_val / 2,
            "is_even": not (self.data_val % 2)
        }

    def set_data_val(self, val):
        self.data_val = val
    
    def set_clip_data(self, val):
        self.clip_data = val
    
    def set_string(self, val):
        self.string_val = val

    def set_num_val(self, val):
        self.num_val = val

    def set_selection(self, val):
        if val in self.selection_list:
            self.selected = val

    def set_toggle(self, val):
        self.toggle = val

    def trigger_event(self, val):
        self.logger.info("Event Triggered by API with value: %s", val)

    def get(self, path, kwargs=None):
        self.logger.debug("GETTING PATH: %s", path)
        logging.debug(kwargs)
        val = self.param_tree.get(path)

        # special Log Filtering with the query Args!
        if path == "logging" and kwargs:
            logging
            timestamp = kwargs.get("timestamp", [])[0]
            val = {"logging": self.logger.events(timestamp)}

        logging.debug(val)
        return val

    def set(self, path, data):
        self.param_tree.set(path, data)
        return self.param_tree.get(path)