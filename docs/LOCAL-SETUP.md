# Run GradTrail on your computer

## Before you start

- Install Docker Desktop on Windows or macOS, or Docker Engine with Docker Compose on Linux.
- Start Docker and make sure it is running before setup.
- The first build downloads dependencies and may take several minutes.
- Search can start with a no-key source. AI is optional.

## Start it

1. Clone or download the repository and open a terminal in its folder.
2. Run the setup script for your operating system:

   ```powershell
   .\scripts\setup.ps1
   ```

   On macOS or Linux:

   ```sh
   bash ./scripts/setup.sh
   ```

3. Choose and confirm a sign-in password when prompted. The script creates the database password and application secret and writes them to `.env`; you do not need to make a secrets folder.
4. When the script says setup is complete, open `http://localhost:3000` and sign in with the password you chose.
5. Choose **Settings → Job search** and select FreeHire, Remote OK, or Student and internship feeds to try search without an API key. You can skip AI setup.

## Stop and restart

From the repository folder:

```sh
docker compose stop
docker compose start
```

Your database remains in the Docker volume when you stop the app. Do not delete the volume unless you intend to erase your data.

## Common problems

### Docker is not running

Start Docker Desktop or the Docker service, wait until it is ready, then run the setup script again.

### Setup says the app did not become ready

Check the app and database logs:

```sh
docker compose logs --tail 80 app
docker compose logs --tail 80 db
```

If the database is still starting, wait briefly and check the app log again. The first build can take longer than later starts.

### Port 3000 is already in use

Edit `GRADTRAIL_PORT` in `.env` to an unused port, such as `3001`, then run `docker compose up -d` and open `http://localhost:3001`. Keep the existing `.env` values; do not regenerate secrets just to change the port.

### The setup script says an `.env` already exists

That file belongs to the existing installation. The script reuses its password and database rather than asking for a new password. To reset the local sign-in password on Windows, run `scripts/reset-password.ps1` in PowerShell. Back up `.env` securely; it contains secrets.

### Sign-in page opens but I cannot sign in

Use the password chosen during the first setup. If you forgot it, reset it as above. Do not delete the database volume to reset a password.

For source-specific setup and privacy/cost explanations, see [Job source coverage](JOB-SOURCES.md) and [Privacy and possible costs](PRIVACY-AND-COSTS.md). The README also links the full demo and installation steps.
