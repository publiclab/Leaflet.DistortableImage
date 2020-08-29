FROM gitpod/workspace-full

USER root
RUN sudo apt-get update \
    && sudo apt-get install -y \
    libnss3-dev \
    libxrandr2 \
    libatk1.0-0 \
    gconf-service \
    libasound2 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    lsb-release \
    xdg-utils \
    wget \
    libgbm1 \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/*
RUN cd node_modules/puppeteer/.local_chromium/linux-782078/chrome-linux/ \
    && sudo chown root:root chrome_sandbox \
    && sudo chmod 4755 chrome_sandbox \
    && sudo cp -p chrome_sandbox /usr/local/sbin/chrome-devel-sandbox \
    && export CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox
