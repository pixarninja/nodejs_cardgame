from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

firefox = webdriver.Remote(
          command_executor='http://54.174.152.202:4444/wd/hub',
          desired_capabilities=DesiredCapabilities.FIREFOX) 

firefox.get('https://54.174.152.202/index.html')
#firefox.get('https://www.google.com/')
print(firefox.title)

firefox.quit()
