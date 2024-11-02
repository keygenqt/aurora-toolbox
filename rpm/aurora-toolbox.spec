%define fullname com.keygenqt.aurora-toolbox

Name: aurora-toolbox
Version: 0.0.8
Release: alt1
Summary: An application that provides an easy start in the Aurora OS ecosystem.

License: Apache-2.0
Group: Development/Tools
Url: https://github.com/keygenqt/aurora-toolbox
# download from %{url}/releases/tag/%{version}.tar.gz
Source: %version.tar.gz

BuildRequires: meson
BuildRequires: libgjs-devel
BuildRequires: libgtk4-devel
BuildRequires: libadwaita-devel >= 1.5

Requires: sudo
Requires: gnome-extensions-app
Requires: libgjs
Requires: libgtk4-gir
Requires: libadwaita-gir
Requires: libsoup-gir

%description
%summary.

%prep
%setup

%build
%meson
%meson_build

%install
%meson_install
mkdir -p %{buildroot}%{_datadir}/applications
mkdir -p %{buildroot}%{_datadir}/icons
install ./files/package/%{fullname}.svg %{buildroot}%{_datadir}/icons/%{fullname}.svg
install ./files/package/%{fullname}.desktop %{buildroot}%{_datadir}/applications/%{fullname}.desktop

%post
ln -sf %{_bindir}/%{fullname} %{_bindir}/%{name}

%files
%doc CHANGELOG.md
%{_bindir}/%{fullname}
%{_datadir}/%{fullname}/%{fullname}.data.gresource
%{_datadir}/%{fullname}/%{fullname}.src.gresource
%{_datadir}/applications/%{fullname}.desktop
%{_datadir}/glib-2.0/schemas/%{fullname}.gschema.xml
%{_datadir}/icons/%{fullname}.svg
%{_datadir}/locale/ru/LC_MESSAGES/%{fullname}.mo

%changelog
* Fri Nov 01 2024 Vitaliy Zarubin 0.0.8
- Add check version Aurora Toolbox. (Vitaliy Zarubin)
- Add video about install Aurora Toolbox. (Vitaliy Zarubin)

* Thu Oct 31 2024 Vitaliy Zarubin 0.0.7
- Fix button open documentation. (Vitaliy Zarubin)
- Add symbolic link aurora-toolbox. (Vitaliy Zarubin)
- Video install Aurora SDK. (Vitaliy Zarubin)
- Video install Flutter SDK. (Vitaliy Zarubin)
- Tab videos for documentation. (Vitaliy Zarubin)