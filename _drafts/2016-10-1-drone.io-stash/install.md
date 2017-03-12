---
layout: post
title: Установка Drone.io 
description: Установка и настройка drone.io в связке с Atlassian Stash
---
Сервер непрерывной интеграции drone.io на мой взгляд очень перспективная штука. Особенно привлекательно выглядит версия для установки на свое железо.
             
Основные плюсы:
 * каждая сборка происходит внутри docker контейнера 
   
   *к примеру используя образ maven:3.3.3-jdk-8-onbuild мы соберем проект*
 
 * внешние зависимости (mongodb  или любой другой docker образ) запускается как отдельный контейнер использующий сетевой интерфейс сборочного. 
 
   *то есть mongo из контейнера mongodb доступна на localhost сборочного контейнера во время сборки. Это нетрадиционно для докер, но очень удобно, так как повторяет среду разработчика*
 
 * конфигурация через **.drone.yml**
 
   *внешние зависимости настраиваются в стиле docker-compose, да и вообще конфигурация сборки внутри репозитория проекта, а не отдельно, это намного удобнее. 
   Сборку можно отладить в любой момент на своём компьютере используя те же контейнеры, что будут использоваться во время сборки через Drone*



## Установка 

<!--more-->

### Генерация ключей
RSA Ключи понадобятся для доступа Drone в Stash.

{% highlight bash %}
~/drone$ mkdir keys
~/drone$ cd keys/
~/drone$ openssl genrsa -out private_key.pem 1024
~/drone$ openssl rsa -in private_key.pem -pubout -out public_key.pem
~/drone$ cat public_key.pem 
{% endhighlight %}

*public_key.pem* содержит публичный ключ используемый далее




###  Настройки Stash
В качестве git хостинга я использую Stash, ныне Bitbucket Server. 

Для работы заведем отдельную учетную запись **drone**

Сборки в drone будут запускаться после каждого push, для того что бы Drone мог настроить webhooks в Stash  нужно установить 
[ плагин ](https://marketplace.atlassian.com/plugins/com.atlassian.stash.plugin.stash-web-post-receive-hooks-plugin/server/overview){:target="_blank"}.
Кроме того, что-бы создавать webhooks пользователю drone понадобятся права администратора репозитория.

Для доступа Drone к репозиториям создаем Application Link в Stash.


{% include image.html
            img="images/2016-10/1.png"
            align="left"
            size="small"
            url="/images/2016-10/1.png"
            title="приложение"
            caption="рис. 1"
             %}   
             
{% include image.html
            img="images/2016-10/2.png"
            align="left"
            size="small"
            url="/images/2016-10/2.png"
            title="ключ"
            caption="рис. 2"
             %}       
             
{% include image.html
            img="images/2016-10/3.png"
            align="left"
            size="small"
            url="/images/2016-10/3.png"
            title="ключ"
            caption="рис. 3"
             %}  
             
{% include image.html
            img="images/2016-10/4.png"
            align="left"
            size="small"
            url="/images/2016-10/4.png"
            title="удаление "
            caption="рис. 4"
             %}                                             
             
{% include image.html
            img="images/2016-10/5.png"
            align="left"
            size="small"
            url="/images/2016-10/5.png"
            title="Правильный Callback URL"
            caption="рис. 5"
            clear="left"
             %}                             
                         

1. Создаем приложение
2. Вводим сгенерированный ранее ключ
3. Открываем редактирование созданной ссылки и видим что Callback URL не указан  -- авторизация работать не будет.
4. Удаляем текущую настройку 
4. Создаем, используя правильные настройки



### Запуск drone.io
Запускать будем версию 0.5, на данный момент не стабильную. 
Reverse Proxy использовать не будем, повесим его прямо на 80 порт, в приватной сети в этом нет ничего страшного, 
а через Nginx работа у этой версии не очень стабильна, постоянные обрывы WebSocket.

Drone состоит из:
* drone server
  * database
* drone agent (минимум 1 штука)
  * sftp сервер для кэширования сборочной директории (не обязательно) 

Для развертывания будем использовать docker, в статье все будет собрано в один docker-compose.yml конфиг с комментариями.

Структура файлов:

{% highlight bash %}
├── docker-compose.yml
├── storage
├── keys
│   ├── private_key.pem
│   └── public_key.pem
├── postgresql

{% endhighlight %}


docker-compose.yml


{% highlight yaml %}
version: '2'
services:
  drone-server:
    image: drone/drone:0.5
    ports:
      - "80:80"
    depends_on:
      - postgresql
    networks:
      - drone
    links:
    - "postgresql:postgresql"
    volumes:
      - ./keys/:/keys/
      - ./storage/:/var/lib/drone/ #сейчас этот каталог используется только для drone.sqlite, а у наc postgresql, но версия не релизная, так что оставим для надежности 
    environment: 
      DRONE_SERVER_ADDR: ":80"
      DRONE_DEBUG: "true"
      DRONE_SECRET: "RandomeSecretKey" # используется агентами для подключения
      DRONE_DATABASE_DRIVER: postgres
      DATABASE_CONFIG: "postgres://drone:drone@postgresql:5432/drone?sslmode=disable"
      DRONE_OPEN: "true" #открытая регистрация для новых пользователей
      DRONE_ADMIN_ALL: "true" #кажется опция сейчас не работает, но в документации есть
      DRONE_ADMIN: drone,gelo # администраторы могут делать сборку "доверенной"  (trusted), это нужно что бы пробросить /var/run/docker.sock в сборочный контейнер
      DRONE_STASH: "true" 
      DRONE_STASH_URL: http://stash.2a-lab.ru
      DRONE_STASH_GIT_USERNAME: drone
      DRONE_STASH_GIT_PASSWORD: PasswordDrone
      DRONE_STASH_CONSUMER_KEY: drone
      DRONE_STASH_CONSUMER_RSA: /keys/private_key.pem

  drone-agent:
    image: drone/drone:0.5
    privileged: true
    command: agent #запускается тот  же образ, но переопределена command
    depends_on:
      - drone-server
      - sftp
    networks:
      - drone
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock # мы же захотим собирать docker контейнеры внутри docker контейнера ? 
    environment: 
      DRONE_SERVER: http://drone.blur.ru # по этому url действительно должен быть доступен сервер
      DRONE_DEBUG: "true"
      DRONE_SECRET: "RandomeSecretKey"

  postgresql:
    image: "postgres:9.5"
    networks:
      - drone
    expose:
      - "5432"
    volumes:
      - ./postgresql:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: drone
      POSTGRES_PASSWORD: drone
      POSTGRES_DB: drone
      
  sftp:
    image: "atmoz/sftp" #простейший sftp сервер
    expose:
      - "22"
    ports:
      - "22222:22" # к сожалению прокинуть кэш в сборочный контейнер мы не можем, но т.к. это установка на одном хосте ип адрес мастер серверера будет совпадать с кэшем, и кэш тоже будет доступен по адресу drone.blur.ru
    networks:
      - drone
    command: cache:cache:::cache # эта магия описана у автора образа на гитхабе

networks:
  drone:
    driver: bridge 

{% endhighlight %}




Первая сборка  у меня длилась  6 минут, из них первые пять логи не отображались вообще, в это время стягивались образы для сборочных контейнеров.


## Drone CLI
Увы, но одним веб интерфейсом не обойтись никак. Для управления CI сервером понадобится консольный клиент. В статье мы используем разрабатываемую в данный момент версию 0.5, поэтому клиента скачиваем по ссылке

[http://downloads.drone.io/release/linux/amd64/drone.tar.gz](http://downloads.drone.io/release/linux/amd64/drone.tar.gz)

Скорее всего она уже изменится на момент прочтения, важно знать что версия 0.4 и 0.5 не совместимы совсем. 
deb пакетов пока нет. Поэтому способ установки достаточно хардкорный 


{% highlight bash %}
user$ cd /tmp/
user$ curl http://downloads.drone.io/release/linux/amd64/drone.tar.gz | tar zx
root# install -t /usr/local/bin drone
{% endhighlight %}


Клиент понадобится для установки приватных данных в сборку, к примеру паролей от docker registry или api токенов.

О практическом использовании в следующей [статье](/drone.io-stash-usage/)

