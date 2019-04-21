# Use the production image as base image
FROM python:latest

# Create test directory
WORKDIR /usr/src/test

# Install the Fake UserAgent module
RUN pip install fake-useragent && \
    pip install requests

# Run the python tests
CMD ["python", "python_tests.py"]
