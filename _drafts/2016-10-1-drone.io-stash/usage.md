---
layout: post
title: Сборка java проекта с помощью drone.io
description: Сборка java проекта с помощью drone.io
tags: [github, github-pages, jekyll]
---

В прошлой [статье](/drone.io-stash-install/) мы поставили CI сервер Drone.io на свое железо и прицепили к git хостингу. 
Сейчас на практическом примере соберем и задеплоим java проект. 






== Установка клиента
Девелоп версия тут 
http://downloads.drone.io/release/linux/amd64/drone.tar.gz





== Использование 
Вынеси в отдельную статью

для работы maven будем использовать секреты. Секреты с версии 0.5 добавляются как переменные среды. устанавливаются они серез cli клиент

--insecure отключает проверку .drone.yml.sig, нам она не нужна. у нас свои контейнеры

drone secret add   --image akagelo/debian-jessie-maven3-java-8 octocat/hello-world SLACK_TOKEN f1d2d2f924e986a


