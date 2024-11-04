## Как собрать rpm пакет локально, на примере спецификации для Ubuntu 24.04

Подготовка окружения для сборки:

```shell
sudo apt-get install gettext meson pkg-config libgjs-dev libgtk-4-dev libadwaita-1-dev
```

Сборка из корня проекта:

```shell
chmod +x ./build/run.sh
./build/run.sh
```

Собранный пакет можно будет найти:

`./build/release/debrpm/aurora-toolbox_{version}-{revision}_amd64_.deb`

## Установка

Подготовка окружения для установки:

```shell
sudo apt-get install gjs language-pack-gnome-ru language-pack-ru-base libadwaita-1-0
```

Установка:

```shell
sudo dpkg -i ./build/release/deb/aurora-toolbox_*.deb
```

Удаление:

```shell
sudo dpkg -r com.keygenqt.aurora-toolbox
```
