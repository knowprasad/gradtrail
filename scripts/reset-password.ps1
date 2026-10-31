#!/usr/bin/env pwsh
# Reset the single sign-in password for a local Docker Compose installation.
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

function Get-PlainText([Security.SecureString] $Value) {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

try {
  $envPath = Join-Path $repoRoot ".env"
  if (-not (Test-Path -LiteralPath $envPath)) {
    throw "No .env file was found. Run .\scripts\setup.ps1 first, or open the folder used for your GradTrail installation."
  }
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker was not found. Install Docker Desktop, start it, then retry."
  }
  & docker info *> $null
  if ($LASTEXITCODE -ne 0) { throw "Docker is not running. Start Docker Desktop, wait until its engine is ready, then retry." }

  do {
    $firstSecure = Read-Host "New sign-in password (12+ characters)" -AsSecureString
    $secondSecure = Read-Host "Enter it again" -AsSecureString
    $first = Get-PlainText $firstSecure
    $second = Get-PlainText $secondSecure
    if ($first.Length -lt 12) { Write-Host "Use at least 12 characters." -ForegroundColor Yellow }
    elseif ($first -cne $second) { Write-Host "Those passwords don't match. Try again." -ForegroundColor Yellow }
  } while ($first.Length -lt 12 -or $first -cne $second)

  Write-Host "Preparing the password hash…"
  & docker compose build app
  if ($LASTEXITCODE -ne 0) { throw "Docker could not build the app image, so the password was not changed." }

  $docker = (Get-Command docker).Source
  $start = [Diagnostics.ProcessStartInfo]::new()
  $start.FileName = $docker
  $start.Arguments = "compose run -T --rm --no-deps app yarn hash-password"
  $start.WorkingDirectory = $repoRoot
  $start.UseShellExecute = $false
  $start.RedirectStandardInput = $true
  $start.RedirectStandardOutput = $true
  $start.RedirectStandardError = $true
  $process = [Diagnostics.Process]::new()
  $process.StartInfo = $start
  [void]$process.Start()
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()
  $process.StandardInput.WriteLine($first)
  $process.StandardInput.Close()
  $process.WaitForExit()
  $hashOutput = $stdoutTask.GetAwaiter().GetResult()
  $hashErrors = $stderrTask.GetAwaiter().GetResult()
  if ($process.ExitCode -ne 0) { throw "Could not create the password hash. $hashErrors" }
  $passwordHash = [regex]::Match($hashOutput, "argon2id:m=[^\r\n]+").Value
  if (-not $passwordHash) { throw "The password command did not return a valid hash. $hashErrors" }

  $lines = [IO.File]::ReadAllLines($envPath)
  $passwordLine = -1
  for ($index = 0; $index -lt $lines.Length; $index++) {
    if ($lines[$index] -match '^\s*GRADTRAIL_PASSWORD\s*=') { $passwordLine = $index; break }
  }
  if ($passwordLine -lt 0) { throw "GRADTRAIL_PASSWORD was not found in .env. The password was not changed." }
  $lines[$passwordLine] = "GRADTRAIL_PASSWORD='$passwordHash'"
  $tempPath = "$envPath.tmp"
  [IO.File]::WriteAllLines($tempPath, $lines, [Text.UTF8Encoding]::new($false))
  Move-Item -LiteralPath $tempPath -Destination $envPath -Force

  & docker compose up -d --force-recreate app
  if ($LASTEXITCODE -ne 0) { throw "The password hash was updated, but Docker could not restart the app. Run 'docker compose up -d --force-recreate app' after fixing the error." }
  Write-Host "Password reset. Sign in to GradTrail with your new password. Your profile and applications were not changed."
} finally {
  $first = $null
  $second = $null
  $firstSecure = $null
  $secondSecure = $null
  Pop-Location
}
