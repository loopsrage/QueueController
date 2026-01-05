import io
import gzip

def gz_bytes(data) -> bytes:
    if isinstance(data, str):
        data = data.encode('utf-8')

    stream = io.BytesIO()
    with gzip.GzipFile(fileobj=stream, mode='wb') as f:
        f.write(data)

    value = stream.getvalue()
    stream.close()
    return value

def check_gz(data: bytes):
    return data[:2] == b'\x1f\x8b'

def ensure_gunzip(data: bytes) -> bytes:
    depth = 0
    max_depth = 3
    while depth < max_depth and check_gz(data):
        try:
            data = gzip.decompress(data)
            depth += 1
        except (gzip.BadGzipFile, OSError):
            break
    return data