# Local dev stack: `tilt up`.
#
# Backing services (postgres, mongodb, redis) run in Docker via docker-compose.yml.
# The apps run on the host through pnpm, same as `pnpm dev`.
#
# No port is hardcoded. scripts/tilt-ports.mjs probes upward from each service's
# default until it finds a free one, so an unrelated Postgres on 5432 or Redis on
# 6379 elsewhere on this machine is simply stepped over. The chosen ports flow into
# compose (via .env.tilt) and into the app processes (via serve_env), which is why
# DATABASE_URL and friends are computed here rather than read from .env.

ports = decode_json(local(
    ['node', 'scripts/tilt-ports.mjs'],
    quiet = True,
    echo_off = True,
))

print('ports → postgres {POSTGRES_PORT}  mongo {MONGODB_PORT}  redis {REDIS_PORT}  frontend {FRONTEND_PORT}  backend {PORT}'.format(**ports))

# --- backing services -------------------------------------------------------

docker_compose('docker-compose.yml', env_file = '.env.tilt')

dc_resource('postgres', labels = ['services'])
dc_resource('mongodb', labels = ['services'])
dc_resource('redis', labels = ['services'])

# --- database ---------------------------------------------------------------

local_resource(
    'db-migrate',
    cmd = 'pnpm db:migrate',
    env = ports,
    deps = ['packages/db/src', 'packages/db/drizzle'],
    resource_deps = ['postgres'],
    labels = ['db'],
)

# --- apps -------------------------------------------------------------------

# PORT is the backend's (Nest reads it directly), but `next dev` also honours PORT
# and would otherwise bind the backend's port. The frontend gets its own view of
# the env where PORT is its port.
frontend_env = dict(**ports)
frontend_env['PORT'] = ports['FRONTEND_PORT']

local_resource(
    'backend',
    serve_cmd = 'pnpm --filter @pandorlabs/backend dev',
    serve_env = ports,
    resource_deps = ['mongodb', 'redis'],
    readiness_probe = probe(
        period_secs = 5,
        initial_delay_secs = 10,
        http_get = http_get_action(port = int(ports['PORT']), path = '/health'),
    ),
    links = [link('http://localhost:' + ports['PORT'] + '/health', 'health')],
    labels = ['apps'],
)

local_resource(
    'frontend',
    serve_cmd = 'pnpm --filter @pandorlabs/frontend dev',
    serve_env = frontend_env,
    resource_deps = ['db-migrate'],
    readiness_probe = probe(
        period_secs = 5,
        initial_delay_secs = 10,
        http_get = http_get_action(port = int(ports['FRONTEND_PORT']), path = '/'),
    ),
    links = [link('http://localhost:' + ports['FRONTEND_PORT'], 'app')],
    labels = ['apps'],
)

# --- manual triggers --------------------------------------------------------

local_resource(
    'db-seed-admin',
    cmd = 'pnpm db:seed-admin',
    env = ports,
    resource_deps = ['db-migrate'],
    trigger_mode = TRIGGER_MODE_MANUAL,
    auto_init = False,
    labels = ['db'],
)

local_resource(
    'db-studio',
    serve_cmd = 'pnpm db:studio',
    serve_env = ports,
    resource_deps = ['postgres'],
    trigger_mode = TRIGGER_MODE_MANUAL,
    auto_init = False,
    labels = ['db'],
)
