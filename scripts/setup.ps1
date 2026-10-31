#!/usr/bin/env pwsh
# First run for students using Docker Desktop on Windows.
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

function Get-PlainText([Security.SecureString] $Value) {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

function New-RandomHex([int] $ByteCount) {
  $bytes = New-Object byte[] $ByteCount
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) }
  finally { $rng.Dispose() }
  ([BitConverter]::ToString($bytes)).Replace("-", "").ToLowerInvariant()
}

function Get-AppPort([string] $Path) {
  $port = 3000
  if (Test-Path -LiteralPath $Path) {
    $entry = Get-Content -LiteralPath $Path | Where-Object { $_ -match '^\s*GRADTRAIL_PORT\s*=' } | Select-Object -First 1
    if ($entry) {
      $configured = ($entry -split '=', 2)[1].Trim().Trim("'").Trim('"')
      if ($configured -match '^\d{1,5}$' -and [int]$configured -ge 1 -and [int]$configured -le 65535) { $port = [int]$configured }
    }
  }
  return $port
}

function Wait-ForApp([int] $Port) {
  $url = "http://localhost:$Port/login"
  Write-Host "Waiting for GradTrail at http://localhost:$Port …"
  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri $url -TimeoutSec 3 -UseBasicParsing
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { return }
    } catch {
      # The development server may need a little while to start or compile.
    }
    Start-Sleep -Seconds 2
  }
  throw "GradTrail didn't become ready at http://localhost:$Port. Check the app startup with 'docker compose logs --tail 80 app'."
}

try {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker was not found. Install Docker Desktop, start it, then run this script again."
  }
  & docker info *> $null
  if ($LASTEXITCODE -ne 0) { throw "Docker is not running. Start Docker Desktop, wait until it says Engine running, then retry." }

  $envPath = Join-Path $repoRoot ".env"
  if (Test-Path -LiteralPath $envPath) {
    $port = Get-AppPort $envPath
    Write-Host "Found an existing .env. Reusing its password and database; setup won't ask you to choose a new password."
    & docker compose up -d --build
    if ($LASTEXITCODE -ne 0) { throw "Docker Compose could not start the app." }
    Wait-ForApp $port
    Write-Host "GradTrail is ready at http://localhost:$port. Sign in with the password you chose previously."
  } else {
    Write-Host "Choose the password you'll use to sign in to GradTrail. It won't be saved as plain text."
    do {
      $firstSecure = Read-Host "Sign-in password (12+ characters)" -AsSecureString
      $secondSecure = Read-Host "Enter it again" -AsSecureString
      $first = Get-PlainText $firstSecure
      $second = Get-PlainText $secondSecure
      if ($first.Length -lt 12) { Write-Host "Use at least 12 characters." -ForegroundColor Yellow }
      elseif ($first -cne $second) { Write-Host "Those passwords don't match. Try again." -ForegroundColor Yellow }
    } while ($first.Length -lt 12 -or $first -cne $second)

    Write-Host "Preparing the app. The first build downloads its dependencies and may take a few minutes."
    & docker compose build app
    if ($LASTEXITCODE -ne 0) { throw "Docker could not build the app image." }

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
    if ($process.ExitCode -ne 0) { throw "Could not prepare the sign-in password. $hashErrors" }
    $passwordHash = [regex]::Match($hashOutput, "argon2id:m=[^\r\n]+").Value
    if (-not $passwordHash) { throw "The password hashing command did not return a valid hash. $hashErrors" }

    $postgresPassword = New-RandomHex 32
    $secretBytes = New-Object byte[] 32
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($secretBytes) }
    finally { $rng.Dispose() }
    $secret = [Convert]::ToBase64String($secretBytes)
    $lines = @(
      "POSTGRES_PASSWORD='$postgresPassword'",
      "GRADTRAIL_PASSWORD='$passwordHash'",
      "GRADTRAIL_SECRET='$secret'",
      "GRADTRAIL_PORT=3000",
      "POSTGRES_PORT=5433"
    )
    [IO.File]::WriteAllLines($envPath, $lines, [Text.UTF8Encoding]::new($false))

    & docker compose up -d
    if ($LASTEXITCODE -ne 0) { throw "Docker Compose could not start the app." }
    Wait-ForApp 3000
    $first = $null
    $second = $null
    $firstSecure = $null
    $secondSecure = $null
    Write-Host "Setup is complete. Sign in at http://localhost:3000 with the password you just chose."
  }
} finally {
  $first = $null
  $second = $null
  Pop-Location
}
