## Как собрать rpm пакет локально, на примере спецификации для ALT Linux (P11)

#### Подготовка окружения для сборки
* `# apt-get install rpm-build`
* `$ mkdir -p ~/RPM/SPECS && mkdir -p ~/RPM/SOURCES`
* `$ cd ~/RPM/SOURCES && wget https://github.com/keygenqt/aurora-toolbox/archive/refs/tags/0.0.8.tar.gz`
* Скопировать файл `aurora-toolbox.spec` в `~/RPM/SPECS` и перейти туда

#### Сборка rpm
* `$ rpmbuild -bb aurora-toolbox.spec`
* При необходимости доустановить зависимости, необходимые для сборки
* Пакет соберется под ахритектуру вашей машины
* Собранный rpm-пакет будет находиться в `~/RPM/RPMS`

#### Установка
* `# rpm -iv aurora-toolbox-0.0.8-alt1.x86_64.rpm`
* При необходимости доустановить зависимости, необходимые для работы приложения