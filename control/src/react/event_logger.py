
import logging

from collections import deque
from dataclasses import dataclass
from datetime import datetime
from functools import partial
from dateutil.parser import parse


@dataclass
class LogEvent: 
    timestamp: datetime
    level: int
    message: str


class EventLogger():
   
    # TIMESTAMP_FORMAT = "%d/%m/%y %X.%f"
    TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%S.%f"

    def __init__(self, logger=None, maxlen=250):
        if not logger:
            logger = logging.getLogger()
        self.logger = logger

        # Set up the event queue and internal variables
        self._deque = deque(maxlen=maxlen)
        self._events = []
        self._last_timestamp = None
        self._events_since = None

        # Generate logging convenience methods (e.g. debug(), info(), ...) which mirror the
        # standard logger
        for level in (
            logging.DEBUG, logging.INFO, logging.WARNING, logging.ERROR, logging.CRITICAL
        ):
            setattr(self, logging.getLevelName(level).lower(), partial(self.log, level))

    def log(self, level, msg, *args, **kwargs):

        if self.logger.isEnabledFor(level):

            self.logger.log(level, msg, *args, **kwargs)

            timestamp = datetime.now()
            msg = str(msg)
            if args:
                msg = msg % args
            self._deque.append(LogEvent(timestamp, level, msg))

    def events(self, timestamp=None):
        if timestamp:
            timestamp = parse(timestamp)
        else:
            timestamp = datetime(1, 1, 1)
        return [
            {
                "timestamp": datetime.strftime(event.timestamp, self.TIMESTAMP_FORMAT),
                "level": logging.getLevelName(event.level),
                "message": event.message
            }
            for event in self._deque if event.timestamp > timestamp
        ]
    
    def eventsWithoutLevel(self, timestamp=None):
        if timestamp:
            timestamp = parse(timestamp)
        else:
            timestamp = datetime(1, 1, 1)
        return [
            {
                "timestamp": datetime.strftime(event.timestamp, self.TIMESTAMP_FORMAT),
                "message": event.message
            }
            for event in self._deque if event.timestamp > timestamp
        ]
