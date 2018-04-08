FROM ros:indigo-ros-base

# install ros tutorials packages
RUN apt-get update -qq && apt-get install -qqy --no-install-recommends \
  ros-indigo-ros-tutorials \
  ros-indigo-common-tutorials \
  ros-indigo-rosbridge-suite && \
  # clean up APT
  apt-get autoremove --purge -qqy && apt-get clean -qqy && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
