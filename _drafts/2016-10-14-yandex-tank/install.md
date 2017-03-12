---
layout: post
title: Яндекс такн
description: Установка яндекс танка побыстрому 
---
```
$ mkdir  loadtest && cd loadtest
$ vim load.ini

```


```


```
[phantom]
address=api.radio2.me
port=80
rps_schedule=const(10, 1m) line(1,200,1m)

```

$ docker run -v $(pwd):/var/loadtest -v $HOME/.ssh:/root/.ssh --net host -it direvius/yandex-tank
```

пробрасываем каталог с тестами
пробрасываем свои ssh  ключи


