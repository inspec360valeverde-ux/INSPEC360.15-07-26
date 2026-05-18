REM ═══════════════════════════════════════════════════════════════════════════
REM  INSPEC360 v2.2 - Executor Invisível
REM  Duplo clique e o sistema inicia sem mostrar janela de comando
REM ═══════════════════════════════════════════════════════════════════════════

Set objShell = CreateObject("WScript.Shell")
objShell.Run "EXECUTAR-INPEC360.bat", 0

REM Aguardar alguns segundos para mostrar mensagem final
WScript.Sleep 2000
objShell.Popup "✅ INSPEC360 iniciando...", 3, "Sistema", 64
