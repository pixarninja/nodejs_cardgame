from time import sleep
sleep(5)

from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

firefox = webdriver.Remote(
          command_executor='http://54.174.152.202:4444/wd/hub',
          desired_capabilities=DesiredCapabilities.FIREFOX) 

firefox.get('https://www.google.com')
print(firefox.title)

firefox.quit()

def waitForResourceAvailable(response, timeout, timewait):
    timer = 0
    while response.status_code != 200:
        time.sleep(timewait)
        timer += timewait
        if timer > timeout:
            break
        if response.status_code == 200:
            break
