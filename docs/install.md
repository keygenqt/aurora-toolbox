---
hide:
    - navigation
---

Приложение открыто, а значит каждый может собрать его под свой дистрибутив.
Я разрабатывал приложения под Ubuntu, и тестировал его там.
Приложение доступно в `deb` пакете на странице [релизов](https://github.com/keygenqt/aurora-toolbox/releases) GitHub.

Приложение [Aurora CLI](https://keygenqt.github.io/aurora-cli), от которого зависит Aurora Toolbox устанавливается стандартным способом для него: 
[Install](https://keygenqt.github.io/aurora-cli/install/).

#### Install

```shell
sudo dpkg -i aurora-toolbox_0.0.7-1_amd64.deb
```

#### Update/Install dependency

```shell
sudo apt update
sudo apt install -f
```

#### Remove

```shell
sudo dpkg -r com.keygenqt.aurora-toolbox
```

!!! warning

    <div class="Ubuntu-Logo">![picture](images/ubuntu_logo.png)</div>

    Aurora Toolbox зависит от `libadwaita-1-0 (>= 1.5)`, такая версия доступна с Ubuntu 24.04.

#### Build

Установите зависимости:

```shell
sudo apt install clang gettext libadwaita-1-dev language-pack-ru-base language-pack-gnome-ru
```

Соберите и запустите проект:

```shell
./scripts/run.sh
```
