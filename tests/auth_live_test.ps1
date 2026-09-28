$ErrorActionPreference = 'Continue'
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$log = Join-Path $PSScriptRoot 'auth_live_test.log'
$serverLog = Join-Path $PSScriptRoot 'auth_server.log'
$serverErr = Join-Path $PSScriptRoot 'auth_server.err'

function Out($msg) { $msg | Tee-Object -FilePath $log -Append }

Remove-Item $log -ErrorAction SilentlyContinue
Remove-Item $serverLog -ErrorAction SilentlyContinue

Out "=== STARTING SERVER ==="
$p = Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList (Join-Path $root 'node_modules\tsx\dist\cli.mjs'), (Join-Path $root 'server.ts') -WorkingDirectory $root -PassThru -WindowStyle Hidden -RedirectStandardOutput $serverLog -RedirectStandardError "$serverLog.err"
try {
    $ok = $false
    for ($i = 0; $i -lt 90; $i++) {
        Start-Sleep -Seconds 1
        try { Invoke-WebRequest -Uri 'http://localhost:3000/api/health' -UseBasicParsing -TimeoutSec 2 | Out-Null; $ok = $true; break } catch {}
        try { Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing -TimeoutSec 2 | Out-Null; $ok = $true; break } catch {}
        if ($p.HasExited) { Out "SERVER EXITED EARLY code=$($p.ExitCode)"; break }
    }
    if (-not $ok) { Out "FAIL: server never came up. Server log tail:"; Get-Content $serverLog -Tail 30 | ForEach-Object { Out $_ }; Get-Content "$serverLog.err" -Tail 30 -ErrorAction SilentlyContinue | ForEach-Object { Out $_ }; exit 1 }
    Out "SERVER IS UP (after $i s)"

    # 1. Login
    $loginBody = '{"email":"admin@aurelia.com","password":"AureliaAdmin2026!"}'
    $loginResp = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body $loginBody -ContentType 'application/json' -SessionVariable session -UseBasicParsing
    Out "LOGIN STATUS: $($loginResp.StatusCode)"
    Out "LOGIN BODY: $($loginResp.Content)"
    Out "COOKIES FROM LOGIN:"
    $session.Cookies.GetCookies('http://localhost:3000') | ForEach-Object { Out "  Name=$($_.Name) HttpOnly=$($_.HttpOnly) Secure=$($_.Secure) Path=$($_.Path) Domain=[$($_.Domain)] ValueLen=$($_.Value.Length)" }

    # 2. /api/auth/me with cookie
    $meResp = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/me' -Method GET -WebSession $session -UseBasicParsing
    Out "ME STATUS (authenticated): $($meResp.StatusCode)"
    Out "ME BODY: $($meResp.Content)"

    # 3. /api/auth/me without cookie (should be 401)
    try {
        Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/me' -Method GET -UseBasicParsing | Out-Null
        Out "ME STATUS (unauthenticated): 2xx -- UNEXPECTED"
    } catch {
        Out "ME STATUS (unauthenticated): $($_.Exception.Response.StatusCode.value__) (expected 401)"
    }

    # 4. Wrong credentials
    try {
        $bad = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/login' -Method POST -Body '{"email":"admin@aurelia.com","password":"wrong"}' -ContentType 'application/json' -UseBasicParsing
        Out "WRONG CREDS STATUS: $($bad.StatusCode) -- UNEXPECTED"
    } catch {
        Out "WRONG CREDS STATUS: $($_.Exception.Response.StatusCode.value__) (expected 4xx rejection)"
    }
    Out "=== TEST COMPLETE ==="
} finally {
    if ($p -and -not $p.HasExited) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }
    Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*nodejs*' } | ForEach-Object { try { $_.Kill() } catch {} }
    Out "SERVER STOPPED"
}
