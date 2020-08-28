FROM gitpod/workspace-full

USER root
RUN sudo apt-get update && \
    sudo apt-get install -y libnss3-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/*
