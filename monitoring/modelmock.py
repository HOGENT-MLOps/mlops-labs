#!/usr/bin/env python3

# https://github.com/prometheus/client_python

INTERVAL_SECONDS = 5
PROMETHEUS_PORT = 9000

import prometheus_client
import random
import time
import datetime


def generate_result():
    return random.random()


prometheus_client.start_http_server(PROMETHEUS_PORT)

model_result_gauge = prometheus_client.Gauge("model_result", "Result of the model")

while True:
    model_result = generate_result()
    print(f"Result of the model at {datetime.datetime.now()}: {model_result}")
    model_result_gauge.set(model_result)
    time.sleep(INTERVAL_SECONDS)
