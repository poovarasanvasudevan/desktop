!include "MUI.nsh"

Name "Chatra"
BrandingText "chatra.io"

# define the resulting installer's name:
OutFile "ChatraSetup.exe"

# set the installation directory
InstallDir "$PROGRAMFILES\Chatra\"

# app dialogs
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

!define MUI_FINISHPAGE_RUN_TEXT "Start Chatra"
!define MUI_FINISHPAGE_RUN $INSTDIR\Chatra.exe

!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_LANGUAGE "English"

# default section start
Section

  # delete already installed files
  Delete "$INSTDIR\Uninstall Chatra.exe"
  Delete $INSTDIR\Chatra.exe
  Delete $INSTDIR\ffmpegsumo.dll
  Delete $INSTDIR\icudtl.dat
  Delete $INSTDIR\libEGL.dll
  Delete $INSTDIR\libGLESv2.dll
  Delete $INSTDIR\nw.pak
  Delete $INSTDIR\locales\*

  # define the path to which the installer should install
  SetOutPath $INSTDIR

  # specify the files to go in the output path
  File /r ..\build\Chatra\win32\*

  # create the uninstaller
  WriteUninstaller "$INSTDIR\Uninstall Chatra.exe"

  # create shortcuts in the start menu and on the desktop
  CreateShortCut "$SMPROGRAMS\Chatra.lnk" "$INSTDIR\Chatra.exe"
  CreateShortCut "$SMPROGRAMS\Uninstall Chatra.lnk" "$INSTDIR\Uninstall Chatra.exe"
  CreateShortCut "$DESKTOP\Chatra.lnk" "$INSTDIR\Chatra.exe"

SectionEnd

# create a section to define what the uninstaller does
Section "Uninstall"

  # delete the installed files
  Delete "$INSTDIR\Uninstall Chatra.exe"
  Delete $INSTDIR\Chatra.exe
  Delete $INSTDIR\ffmpegsumo.dll
  Delete $INSTDIR\icudtl.dat
  Delete $INSTDIR\libEGL.dll
  Delete $INSTDIR\libGLESv2.dll
  Delete $INSTDIR\nw.pak
  Delete $INSTDIR\locales\*

  # delete the shortcuts
  Delete "$SMPROGRAMS\Chatra.lnk"
  Delete "$SMPROGRAMS\Uninstall Chatra.lnk"
  Delete "$DESKTOP\Chatra.lnk"

SectionEnd
