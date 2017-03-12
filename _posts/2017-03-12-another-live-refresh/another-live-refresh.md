---
layout: post
title: Реализация Live Reload для Spring Boot - another-live-refresh
description: Установка и настройка drone.io в связке с Atlassian Stash
---
Проектом Spring Developer Tools уже реализована поддержка технологии [livereload.com](http://livereload.com), но есть пару проблем.

Ситуация: мы любим новые технологии и разрабатываем микросервисный проект. У нас есть клиентский интерфейс и административный интерфейс, они оба Spring Boot приложения и они оба запущены.
Мы  установили расширение [livereload.com](http://livereload.com) и оно успешно подключилось к "livereload серверу",но к какому?

На данный момент LiverReload Server из Spring Developer Tools биндит стандартный порт  35729 при запуске.Когда запускается второе приложение, порт уже занят и [запуск сервера невозможен](https://github.com/spring-projects/spring-boot/blob/634bb770b200711493887a11707693b2bcddbb68/spring-boot-devtools/src/main/java/org/springframework/boot/devtools/autoconfigure/OptionalLiveReloadServer.java#L62).
На практике мы получаем постоянную путаницу, куда подключено расширение, что создает эфект "нерабочего livereload".


Решением этой проблемы стала библиотека [another-live-refresh](https://github.com/akaGelo/another-live-refresh), оформленная в виде Spring Boot Starter.

<!--more-->

**Преимущества**:
 * легкая и понятная интеграция: в *develop* профиле включил, в *production* выключил,  других настроек не требует.
 * самостоятельно встраивает в html страницы необходимый js код
 * не требует расширений для браузера
 * работа изолирована внутри каждого приложения

{% include image.html
            img="images/2017-03/alr.png"
            align="left"
            size="origin"
            url="/images/2017-03/alr.png"
            title="схема работы"
            caption="рис. 1. Разница реализации"
             %}       




 **Недостатки**:
 * В версии 0.1 не работает на страницах ошибок, работа над этим ведется.


## Использование 



### Подключение зависимости
Все традиционно:
{% highlight xml %}
<dependency>
    <groupId>ru.vyukov</groupId>
    <artifactId>another-live-refresh-spring-boot-starter</artifactId>
    <version>0.1.1</version>
    <optional>true</optional>
</dependency>
{% endhighlight %}

Последняя версия в  [![Maven Central](https://maven-badges.herokuapp.com/maven-central/ru.vyukov/another-live-refresh/badge.svg)](https://maven-badges.herokuapp.com/maven-central/cz.jirutka.rsql/rsql-parser)




### Отключение в Production окружении
{% highlight yml %}

#liverefresh:
#    enable: включен поумолчанию
  
---
#production profile
 
spring:
  profiles: production

liverefresh:
    enable: false


{% endhighlight %}


Так же стоит упоминуть о необходимости отключения кэширования шаблонизаторов в окружении разработки, если это еще не сделано. 

{% highlight yml %}
# к примеру 
  thymeleaf:
    cache: false
{% endhighlight %}




### Демонстарция работы

{% include image.html
            img="images/2017-03/alr-demo.gif"
            align="center"
            size="origin"
            url="/images/2017-03/alr-demo.gif"
            title="Демонстрация работы"
            caption="рис. 2. Демонстрация работы"
             %}   
              