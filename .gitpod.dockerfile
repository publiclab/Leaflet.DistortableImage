FROM gitpod/workspace-full

USER root
RUN sudo apt-get update && \
    sudo apt-get install -y zsh neovim google-chrome-stable && \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/*
