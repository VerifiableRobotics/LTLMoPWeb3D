#!/usr/bin/env python

from sys import stdin
import rospy
from std_msgs.msg import String

def sensor_string_publisher():
  pub = rospy.Publisher('sensors', String, queue_size=10)
  rospy.init_node('sensor_string', anonymous=True)
  while not rospy.is_shutdown():
    rospy.sleep(5.)
    pub.publish('person')

if __name__ == '__main__':
  try:
    sensor_string_publisher()
  except rospy.ROSInterruptException:
    pass
