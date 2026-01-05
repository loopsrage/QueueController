# --- STAGE 1: Build Environment ---
# Use a specific, pinned version of python-slim with its SHA256 hash for immutability
FROM python:3.12-slim@sha256:sha256:7b68a5fa7cf0d20b4cedb1dc9a134fdd394fe27edbc4c2519756c91d21df2313 AS builder

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1

WORKDIR /build

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# --- STAGE 2: Runtime Environment ---
FROM python:3.12-slim@sha256:sha256:7b68a5fa7cf0d20b4cedb1dc9a134fdd394fe27edbc4c2519756c91d21df2313 AS runtime

# Create a dedicated non-root user with no home directory for security
RUN groupadd -r appuser && useradd -r -g appuser -s /sbin/nologin -d /app appuser

WORKDIR /app

# Copy the pre-built virtual environment from the builder stage
# This ensures build tools (compilers, headers) never exist in production
COPY --from=builder --chown=appuser:appuser /build/.venv /app/.venv
COPY --chown=appuser:appuser . .

# Set the path to use the virtualenv's python directly
ENV PATH="/app/.venv/bin:$PATH"

# Switch to the unprivileged user before starting the app
USER appuser

COPY ./static /app/static
# Use the exec form for proper signal handling (PID 1)
CMD ["/opt/venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
