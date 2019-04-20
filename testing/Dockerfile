FROM selenium/node-firefox:3.14.0-gallium

# Create app directory
WORKDIR /usr/src/app

RUN sudo apt update
RUN sudo apt install python-pip -y
RUN pip install requests
RUN pip install selenium

COPY selenium_tests.py ./

# Run the node server on startup
CMD [ "python", "selenium_tests.py" ]
