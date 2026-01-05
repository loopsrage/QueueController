import datetime
import hashlib
import io
from argparse import ArgumentError
from bson import Binary
from matplotlib.figure import Figure
from pandas import DataFrame
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor, RandomForestClassifier, \
    RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.multioutput import MultiOutputRegressor, MultiOutputClassifier
from sklearn.pipeline import make_pipeline

from pythonApp.lib.queue_controller.helpers import new_controller, link_pipeline
from pythonApp.lib.queue_controller.queueData import QueueData
from pythonApp.lib.skllib.metrics import hist_gradient_regression_metrics, hist_gradient_classifier_metrics
from pythonApp.lib.skllib.mongo import MongoPipelineStorage


def hist_param_grid():
    return {
        f'learning_rate': .1,
        f'max_iter': 100,
        f'max_depth': 8,
        f'min_samples_leaf': 20,
    }

def preprocessor(numeric_cols, categorical_cols):

    numeric_transformer = SimpleImputer(strategy='mean')
    categorical_transformer = SimpleImputer(strategy='most_frequent')

    return ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_cols),
            ('cat', categorical_transformer, categorical_cols)
        ])

def load_and_predict_model(storage: MongoPipelineStorage, model_name, data=None, selector=None, estimator=None, numeric_cols=None, categorical_cols=None):
    previous_model, metadata = storage.load_model(model_name)
    if previous_model is None:
        return make_pipeline(preprocessor(numeric_cols, categorical_cols), selector, estimator), None, None

    print("Found existing model. Loading for warm start.")
    fitted_estimator = previous_model.steps[-1][1]

    if hasattr(fitted_estimator, 'estimators_'):
        # MultiOutput: Iterate through the individual fitted models
        for sub_est in fitted_estimator.estimators_:
            sub_est.set_params(warm_start=True, **hist_param_grid())
    else:
        # Single Output: HistGradientBoosting
        fitted_estimator.set_params(warm_start=True, **hist_param_grid())

    rebuild_pipeline = make_pipeline(preprocessor(numeric_cols, categorical_cols), selector, fitted_estimator)
    return rebuild_pipeline, previous_model.predict(data), metadata


class HistGradientEstimator:

    estimator_type = None
    selector_model = None
    score_metric = None
    chart_function = None
    metric_function = None
    estimator = None
    target_mask = None

    def __init__(self, target_mask, is_classification=None):
        self.target_mask = target_mask
        if is_classification is None:
            is_classification = False

        if is_classification is True:
            self.estimator_type = "classifier"
            est = HistGradientBoostingClassifier(categorical_features="from_dtype")
            self.selector_model = RandomForestClassifier(n_estimators=100, n_jobs=-1)
            self.score_metric = 'balanced_accuracy'  # Optuna needs a single string metric to maximize
            self.estimator = MultiOutputClassifier(est) if len(target_mask) > 1 else est
        else:
            self.estimator_type = "regressor"
            est = HistGradientBoostingRegressor(categorical_features="from_dtype")
            self.selector_model = RandomForestRegressor(n_estimators=100, n_jobs=-1)
            self.score_metric = 'r2'
            self.estimator = MultiOutputRegressor(est) if len(target_mask) > 1 else est


def new_save_metadata_node(storage: MongoPipelineStorage, model_name):

    def hist_gradient_pipeline(queue_data: QueueData):
        data = queue_data.attribute("data")
        features, targets = queue_data.attribute("features"), queue_data.attribute("targets")

        if data is None:
            raise ArgumentError(argument=data, message="data is None")

        rebuilt_pipeline, predictions, metadata = load_and_predict_model(storage, model_name, data)
        rebuilt_pipeline.fit(features, targets)
        storage.save_model(rebuilt_pipeline, model_name, metadata)

        queue_data.set_attribute("metadata", {
            "rebuilt_pipeline": rebuilt_pipeline,
            "initial_predictions": predictions,
            "new_predictions": rebuilt_pipeline.predict(data),
            "metadata": metadata,
        })

    def save_metadata_node(queue_data: QueueData):
        metadata: dict = queue_data.attribute("metadata")
        data: DataFrame = queue_data.attribute("data")
        features, targets = queue_data.attribute("features"), queue_data.attribute("targets")

        (rebuilt_pipeline, initial_predictions, new_predictions, metad) = metadata

        # prediction derivatives
        residuals = targets - new_predictions
        initial_residuals = targets - initial_predictions

        result = permutation_importance(rebuilt_pipeline, features, targets, n_repeats=10, n_jobs=-1)
        sorted_idx = result.importances_mean.argsort()

        if metad["estimator_type"] == "classifier":
            mf = hist_gradient_classifier_metrics
        else:
            mf = hist_gradient_regression_metrics

        buffer = io.BytesIO()
        data.to_csv(buffer, index=False, compression="gzip")
        compressed_binary = buffer.getvalue()
        document = {
            "recorded": datetime.datetime.now(datetime.timezone.utc),
            "model_name": model_name,
            "target_mask": list(metad["target_mask"]),
            "chunk": Binary(compressed_binary),
            "md5":  hashlib.md5(compressed_binary).hexdigest(),
            "residuals": residuals.tolist(),
            "initial_residuals":  initial_residuals.tolist(),
            "sorted_idx": sorted_idx.tolist(),
            "created_at": datetime.datetime.now(datetime.timezone.utc),
            **mf(targets, initial_predictions, new_predictions, residuals=residuals),
        }
        result = storage.save_metadata(document)

        metadata = {
            "_id": result.inserted_id,
            **metadata,
            **document,
        }
        queue_data.set_attribute("metadata", metadata)

    pl = [new_controller(action=hist_gradient_pipeline), new_controller(action=save_metadata_node)]
    link_pipeline(pl)
    return pl

def save_model_charts(queue_data: QueueData):
    metadata: dict = queue_data.attribute("metadata")
    fig = Figure(figsize=(24, 6))
    estm = metadata["estm"]

    estm.chart_function()
