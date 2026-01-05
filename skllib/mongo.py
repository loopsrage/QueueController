import io
import re
from pathlib import Path
import gridfs
import joblib
import pandas as pd
from pymongo import MongoClient

def _aggregate_last_version(db, fs, filename=None):
    if filename:
        match_filter = {"filename": {"$regex": f"{re.escape(filename)}"}}
    else:
        match_filter = {"filename": {"$exists": 1}}

    pipeline = [
        {'$match': match_filter}, {'$sort': {'filename': 1, 'uploadDate': -1}},
        {'$group': {'_id': '$filename', 'latest_id': {'$first': '$_id'}}}
    ]
    latest_files_cursor = db["fs.files"].aggregate(pipeline)
    for entry in latest_files_cursor:
        yield fs.get(entry['latest_id'])


class MongoPipelineStorage:
    _client = None

    def __init__(self, dsn: str):
        self._client = MongoClient(dsn)

    @property
    def client(self):
        return self._client

    def ml_images_fs(self):
        return gridfs.GridFS(self.client["ml_images_db"])

    def ml_metadata_col(self):
        meta = self.client["ml_metadata_db"]
        return meta["metadata"]

    def ml_models_db(self):
        return self.client["ml_models_db"]

    def ml_images_db(self):
        return self.client["ml_images_db"]

    def ml_clean_files_db(self):
        return self.client["ml_clean_files_db"]

    def ml_models_fs(self):
        return gridfs.GridFS(self.client["ml_models_db"])

    def ml_raw_files_fs(self):
        return gridfs.GridFS(self.client["ml_raw_files_db"])

    def ml_clean_files_fs(self):
        return gridfs.GridFS(self.client["ml_clean_files_db"])

    def load_clean_files(self, pattern=None):
        db = self.ml_clean_files_db()
        fs = self.ml_clean_files_fs()

        for i in _aggregate_last_version(db, fs, pattern):
            yield i

    def save_clean_files(self, dataset_name, data):
        fs = self.ml_raw_files_fs()

        file_buffer = io.BytesIO()
        data.to_csv(file_buffer, index=False, compression='gzip')
        file_buffer.seek(0)

        file_id = fs.put(file_buffer, filename=dataset_name, content_type="gzip")
        return file_id

    def save_dataset(self, data, dataset_name):
        fs = self.ml_raw_files_fs()

        file_buffer = io.BytesIO()
        data.to_csv(file_buffer, index=False, compression='gzip')
        file_buffer.seek(0)

        file_id = fs.put(file_buffer, filename=dataset_name, content_type="gzip")
        return file_id

    def load_dataset(self, dataset_name):
        fs = self.ml_raw_files_fs()
        grid_out = fs.get_last_version(filename=dataset_name)
        return pd.read_csv(grid_out, compression='gzip')

    def save_metadata(self, document):
        return self.ml_metadata_col().insert_one(document)

    def load_metadata(self, model_name):
        return self.ml_metadata_col().find_one({"filename": model_name})

    def load_model(self, model_name):
        try:
            grid_out =  self.ml_models_fs().get_last_version(filename=model_name)
            model = joblib.load(io.BytesIO(grid_out.read()))
            return model, self.ml_metadata_col().find_one({"filename": model_name}) or {}
        except gridfs.errors.NoFile:
            print("Model not found in database.")
            return None, {}

    def save_model(self, pipeline, model_name, metadata):
        fs = self.ml_models_fs()

        model = pipeline.steps[-1][1]
        model_buffer = io.BytesIO()
        joblib.dump(model, model_buffer)
        model_buffer.seek(0)

        file_id = fs.put(model_buffer, filename=model_name)
        metadata["fs_id"] = file_id
        return self.ml_metadata_col().update_one({'filename': model_name}, {"$set": metadata}, upsert=True)

    def save_image(self, file_name, model_name, figure):
        img_buffer = io.BytesIO()
        figure.savefig(img_buffer, format='png')
        img_buffer.seek(0)
        return self.ml_images_fs().put(img_buffer, model_name=model_name, filename=file_name, content_type="image/png")

    def transfer_to_drive(self, pattern=None, target_directory=None):
        if target_directory is None:
            raise AttributeError("target_directory cannot be None")

        db = self.ml_images_db()
        fs = self.ml_images_fs()

        dir_path = Path(target_directory)
        dir_path.mkdir(parents=True, exist_ok=True)

        for i in _aggregate_last_version(db, fs, pattern):
            file_path = dir_path / i.filename
            with file_path.open(mode='wb') as f:
                f.write(i.read())

    def load_images(self, filename=None):
        return self.ml_images_fs().get_last_version(filename=filename)
