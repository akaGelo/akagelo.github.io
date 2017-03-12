---
layout: post
title: Java Web Start? - Не, не слышал
description: Java Web Start? - Не, не слышал
redirect_from:
  - /2012/07/java-web-start.html

---
Java Web Start по сути замечательная технология, избавляет от проблем с обновлениями клиентского софта, но вот в силу своей малой распространенности реализована с традиционным в таких местах подходом " на отъебись" . Дело в том что мой легковесный веб-сервер thttpd  не в состоянии отдавать MIME типы в заголовках, поэтому ни один браузер не смог понять что ж  за гадость с расширением jnlp ему суют.
Собственно после этого и родился следующий костыль на bash


#!/bin/bash

OLD_HASH=`cat ~/.guanoh`

NOW_HASH=`wget -O - -q http://example.com/md5.sum`
NOW_HASH=${NOW_HASH::32}

echo $NOW_HASH > ~/.guanoh
if [[ $OLD_HASH != $NOW_HASH || ! -a ~/.guano.jar ]]
then
 wget -O ~/.guano.jar http://example.com/guano/guano.jar
fi

java -jar ~/.guano.jar





Есть некий jar файл, в данном случае это guano.jar он лежит на сервере, рядом с ним лежит файл с хешем jar'ника под именем md5.sum.
Скрипт узнает хеш файла на сервере и сравнивает их. Если хеши различаются, jar'ник обновился и его надо перекачать.

Кроме того обрабатывается ситуация когда jar файл не скачан, (-a ~/.guano.jar)


Загрузка на сервер
И да для этой цели тоже написан bash скрипт, хотя эти две команды скриптом назвать трудно
 
#!/bin/bash
md5sum target/*jar-with-dependencies.jar > target/md5.sum
scp target/*jar-with-dependencies.jar example.com:~/www/dl/guano/guano.jar
scp target/md5.sum example.com:~/www/dl/guano/md5.sum


Для вычисления хеша используется команда md5sum с перенаправлением вывода в файл md5.sum
Затем jar'ник и файл с хешем копируются на сервер по ssh.
