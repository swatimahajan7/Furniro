# Deploying Furniro on a VM (Podman)

Furniro runs on the VM as one **Podman pod** with three containers: PostgreSQL 16, the API, and nginx
serving the site. Only two VM ports are used:

| Port | What is there |
|---|---|
| **5180** | The site: `http://<VM>:5180` (it also serves the API at `/api` and API docs at `/docs`) |
| **8100** | The API directly: `http://<VM>:8100/docs` |

PostgreSQL, nginx's port 80 and the API's port 8000 stay inside the pod, so they cannot clash with anything
already running on the VM. Pod, container and volume names all start with `furniro`.

Everything is driven by [`podman/furniro.sh`](podman/furniro.sh). It works with Podman 3.x and 4.x.
`podman-compose` is not used, because on Podman 3.x it gives the containers no way to find each other by name.

## What the VM needs

- Podman (3.4 or newer) and git.
- Internet access while building: `docker.io`, `ghcr.io`, `pypi.org` and `registry.yarnpkg.com`.
- About 2 GB of free RAM for the build and 2 GB of disk for the images.
- Ports 5180 and 8100 open to your users (see "Firewall" below).

Run everything as a normal user (rootless Podman). Root works too.

## First deployment

```bash
git clone <your repo URL> furniro && cd furniro/deploy/podman

./furniro.sh init         # creates furniro.env with generated passwords
nano furniro.env          # set PUBLIC_URL=http://<VM address>:5180 (keep WEB_PORT=5180, API_PORT=8100)

./furniro.sh build        # builds both images from this checkout (~3–5 min the first time)
./furniro.sh up           # starts PostgreSQL, the API and the site; waits until each is ready
./furniro.sh autostart    # optional but recommended: start again automatically after a VM reboot
```

On first start the API creates the database tables and loads the demo data. Then open
`http://<VM address>:5180` and log in with `demo@furniro.test` / `Demo@1234`.

`furniro.env` holds the database password and the login-token secret. It is git-ignored and readable only by
you. Keep it: if you lose it, recreate the pod with a new one and the database cannot be opened.

## Everyday commands

| Command | What it does |
|---|---|
| `./furniro.sh status` | Pod and container state, and whether the API is healthy |
| `./furniro.sh logs [db\|backend\|frontend]` | Follow a container's logs (default: backend) |
| `./furniro.sh restart` | Recreate the containers (for example after editing `furniro.env`) |
| `./furniro.sh down` / `up` | Stop / start. The database is kept in the `furniro-db-data` volume |
| `./furniro.sh update` | `git pull`, rebuild, recreate. New database migrations run automatically on start |
| `./furniro.sh backup` | Write a compressed `pg_dump` to `deploy/podman/backups/` (owner-only) |
| `./furniro.sh autostart-off` | Remove the start-on-boot setup |

After `autostart`, systemd owns the pod: `up`, `down`, `restart` and `update` then go through systemd
automatically (`systemctl --user status pod-furniro.service` shows it). If you change `WEB_PORT`, `API_PORT` or
`NAME`, run `autostart-off`, `up`, and `autostart` again, because the ports are written into the systemd units.

To start over with fresh demo data: `./furniro.sh down && podman volume rm furniro-db-data && ./furniro.sh up`.
This deletes every order, account and review.

## Firewall

Open the two ports if the VM has a firewall (and in your cloud provider's security group, if any):

```bash
# firewalld (RHEL, Fedora, Rocky, Alma)
sudo firewall-cmd --permanent --add-port=5180/tcp --add-port=8100/tcp && sudo firewall-cmd --reload
# ufw (Ubuntu, Debian)
sudo ufw allow 5180/tcp && sudo ufw allow 8100/tcp
```

If only the site should be public, open 5180 alone. The API stays reachable through the site at
`http://<VM>:5180/api` and `/docs`.

## Troubleshooting

- **`up` says a port is already in use:** another program has taken 5180 or 8100 since. Check with
  `ss -ltnp | grep -E ':5180|:8100'`, or choose other ports in `furniro.env` and run `./furniro.sh restart`.
- **The API does not become ready:** `./furniro.sh logs backend`. On a fresh start it waits up to 60 seconds for
  PostgreSQL, then runs the migrations and loads the seed.
- **The site says "Could not reach the store":** the API is down or restarting. Check `./furniro.sh status` and
  `./furniro.sh logs backend`.
- **What `PUBLIC_URL` affects:** the site calls the API through its own address, so it works either way.
  `PUBLIC_URL` is what the script prints, and the one web origin (CORS) allowed to call port 8100 from a browser.
- **Warnings like `CNI config … firewall does not support config version`:** harmless Podman 3.x noise;
  the script hides them.
- **Nothing starts after a reboot:** check `systemctl --user status pod-furniro.service`. For a rootless setup
  `loginctl enable-linger $USER` must have succeeded (`autostart` runs it, but some systems need an admin).

## How it works (for maintainers)

- The images are the ones `docker-compose.yml` uses (`backend/Dockerfile`, `frontend/Dockerfile`). The script
  builds them with `--format docker` so their health checks are kept.
- The containers share the pod's network. `db` and `backend` are mapped to `127.0.0.1`, so the images need no
  changes to run here.
- Secrets are passed as an env file (`deploy/podman/.runtime.env`, generated on every start). They are not written
  into the systemd units.
- `autostart` uses `podman generate systemd --new`. On boot systemd recreates the pod and containers from the
  current `:latest` images. The API waits up to 60 s for PostgreSQL, so start order does not matter.
- The setup was tested on Podman 3.4: build, start, API and browser checks through the site, restart with data
  kept, start with the database still down, backup, and start/stop under systemd.
