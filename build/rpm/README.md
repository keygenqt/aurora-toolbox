## Как собрать rpm пакет локально, на примере спецификации для ALT Linux (P11)

Подготовка окружения для сборки:

```shell
sudo apt-get install rpm-build meson libgjs-devel libgtk4-devel libadwaita-devel
```

Сборка из корня проекта:

```shell
chmod +x ./build/run.sh
./build/run.sh
```

Собранный пакет можно будет найти:

`./build/release/rpm/aurora-toolbox_{version}-{revision}_x86_64.rpm`

## Установка

Подготовка окружения для установки:

```shell
sudo apt-get install gnome-extensions-app libgjs libgtk4-gir libadwaita-gir libsoup-gir
```

Установка:

```shell
sudo rpm -i ./build/release/rpm/aurora-toolbox_*.rpm
```

Удаление:

```shell
sudo rpm -e aurora-toolbox
```
